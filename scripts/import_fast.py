"""
Fast bulk importer for India Villages dataset into NeonDB.
Uses psycopg2.extras.execute_values for batch inserts (100x faster than individual INSERTs).
Handles both standard MDDS format and the special Madhya Pradesh format.
"""
import os, glob, sys, time
from uuid import uuid4
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

# === Standard MDDS column mapping ===
COLUMN_MAP = {
    'MDDS STC': 'state_code',
    'STATE NAME': 'state_name',
    'MDDS DTC': 'district_code',
    'DISTRICT NAME': 'district_name',
    'MDDS Sub_DT': 'sub_district_code',
    'SUB-DISTRICT NAME': 'sub_district_name',
    'MDDS PLCN': 'village_code',
    'Area Name': 'village_name'
}

def load_standard(f):
    """Load a standard MDDS-format Excel/ODS file, trying multiple sheet names."""
    engine = 'odf' if f.endswith('.ods') else None
    
    # List of possible sheet names
    possible_sheets = [None, 'Village Directory', 'Sheet1', 'Data']
    
    for sheet in possible_sheets:
        try:
            df = pd.read_excel(f, dtype=str, engine=engine, sheet_name=sheet)
            df.columns = df.columns.astype(str).str.strip()
            
            # Check if headers are in the first row instead of the header
            if 'MDDS STC' not in df.columns and len(df) > 0:
                first_row = df.iloc[0].astype(str).str.strip()
                if 'MDDS STC' in first_row.values:
                    df.columns = first_row
                    df = df.iloc[1:].reset_index(drop=True)

            missing = set(COLUMN_MAP.keys()) - set(df.columns)
            if not missing:
                df = df.rename(columns=COLUMN_MAP)
                # Cleanup: remove rows where critical codes are missing or NaN
                df = df.dropna(subset=['state_code', 'village_code'])
                df = df[df['state_code'].notna() & (df['state_code'] != 'nan')]
                df = df[df['village_code'].notna() & (df['village_code'] != 'nan')]
                df = df.apply(lambda x: x.str.strip() if hasattr(x, 'str') else x)
                return df
        except Exception:
            continue
    return None

def load_file(f):
    """Try standard format first, fall back to MP format."""
    basename = os.path.basename(f)
    try:
        df = load_standard(f)
        if df is not None:
            return df
        
        # If standard fails, try the special MP loader if it's the MP file
        if 'MADHYA_PRADESH' in basename.upper():
            df = load_madhya_pradesh(f)
            if df is not None:
                return df
        return None
    except Exception as e:
        print(f"  ERROR reading {basename}: {e}")
        return None

def batch_upsert(cursor, table, columns, conflict_cols, values, batch_size=500):
    """Batch upsert using execute_values for speed."""
    if not values:
        return
    cols_str = ', '.join(f'"{c}"' for c in columns)
    conflict_str = ', '.join(f'"{c}"' for c in conflict_cols)
    # Build the update set for non-conflict columns
    update_cols = [c for c in columns if c not in conflict_cols and c != 'id' and c != 'createdAt']
    if update_cols:
        update_str = ', '.join(f'"{c}"=EXCLUDED."{c}"' for c in update_cols)
        sql = f'INSERT INTO "{table}" ({cols_str}) VALUES %s ON CONFLICT ({conflict_str}) DO UPDATE SET {update_str}'
    else:
        sql = f'INSERT INTO "{table}" ({cols_str}) VALUES %s ON CONFLICT ({conflict_str}) DO NOTHING'
    
    for i in range(0, len(values), batch_size):
        batch = values[i:i+batch_size]
        execute_values(cursor, sql, batch, page_size=batch_size)

def main():
    load_dotenv()
    db_url = os.environ.get("DIRECT_URL") or os.environ.get("DATABASE_URL")
    dataset_dir = sys.argv[1] if len(sys.argv) > 1 else r"d:\Villages API platform\all-india-villages-master-list-excel\dataset"
    
    if os.path.isfile(dataset_dir):
        files = [dataset_dir]
    else:
        files = glob.glob(os.path.join(dataset_dir, '*.xls*')) + glob.glob(os.path.join(dataset_dir, '*.ods'))
    
    files = [f for f in files if not os.path.basename(f).startswith('._')]
    files.sort()

    print(f"=== VillageAPI Bulk Import ===")
    print(f"Target: {dataset_dir}")
    print(f"Found {len(files)} dataset files\n")

    # Phase 1: Read all files into memory
    all_dfs = []
    total_rows = 0
    for i, f in enumerate(files):
        df = load_file(f)
        if df is None:
            print(f"  [{i+1}/{len(files)}] SKIPPED: {os.path.basename(f)}")
            continue
        rows = len(df)
        total_rows += rows
        all_dfs.append(df)
        print(f"  [{i+1}/{len(files)}] OK: {os.path.basename(f)} ({rows:,} rows)")
    
    print(f"\nTotal raw rows loaded: {total_rows:,}")
    
    if not all_dfs:
        print("ERROR: No data loaded!")
        return

    # Concatenate and deduplicate
    print("Deduplicating...")
    combined = pd.concat(all_dfs, ignore_index=True)
    
    required_cols = ['state_code', 'state_name', 'district_code', 'district_name', 
                     'sub_district_code', 'sub_district_name', 'village_code', 'village_name']
    for col in required_cols:
        if col not in combined.columns:
            combined[col] = ''
    
    combined = combined.dropna(subset=['state_code', 'village_code'])
    combined = combined[combined['state_code'] != '0']
    combined = combined[combined['village_code'] != '0']
    
    states = combined[['state_code', 'state_name']].drop_duplicates(subset=['state_code'])
    districts = combined[['state_code', 'district_code', 'district_name']].drop_duplicates(subset=['state_code', 'district_code'])
    districts = districts[districts['district_code'] != '0']
    subdistricts = combined[['state_code', 'district_code', 'sub_district_code', 'sub_district_name']].drop_duplicates(subset=['state_code', 'district_code', 'sub_district_code'])
    subdistricts = subdistricts[subdistricts['sub_district_code'] != '0']
    villages = combined[['state_code', 'district_code', 'sub_district_code', 'village_code', 'village_name']].drop_duplicates(subset=['village_code'])

    print(f"  States: {len(states)}, Districts: {len(districts)}, SubDistricts: {len(subdistricts)}, Villages: {len(villages)}")

    # Phase 2: Connect and insert
    print("\nConnecting to NeonDB...")
    conn = psycopg2.connect(db_url, keepalives=1, keepalives_idle=30, keepalives_interval=10, keepalives_count=5)
    conn.autocommit = False
    cursor = conn.cursor()

    try:
        # Country
        cursor.execute("""
            INSERT INTO "Country" (id, name, code, "callingCode", "createdAt")
            VALUES (%s, 'India', 'IN', '+91', NOW())
            ON CONFLICT (code) DO NOTHING RETURNING id
        """, (str(uuid4()),))
        res = cursor.fetchone()
        if res:
            country_id = res[0]
        else:
            cursor.execute('SELECT id FROM "Country" WHERE code=\'IN\'')
            country_id = cursor.fetchone()[0]
        conn.commit()
        print(f"Country: India ({country_id[:8]}...)")

        # States (batch)
        t0 = time.time()
        state_values = []
        states_map = {}
        for _, r in states.iterrows():
            uid = str(uuid4())
            states_map[r.state_code] = uid
            state_values.append((uid, r.state_code, r.state_name, country_id))
        
        batch_upsert(cursor, 'State', ['id', 'mddsCode', 'name', 'countryId'], ['mddsCode'], state_values)
        conn.commit()
        
        # Fetch actual IDs (in case of conflicts)
        cursor.execute('SELECT id, "mddsCode" FROM "State"')
        for row in cursor.fetchall():
            states_map[row[1]] = row[0]
        print(f"States: {len(states_map)} inserted/updated ({time.time()-t0:.1f}s)")

        # Districts (batch)
        t0 = time.time()
        district_values = []
        districts_map = {}
        for _, r in districts.iterrows():
            state_id = states_map.get(r.state_code)
            if not state_id: continue
            uid = str(uuid4())
            key = f"{r.state_code}_{r.district_code}"
            districts_map[key] = uid
            district_values.append((uid, r.district_code, r.district_name, state_id))
        
        batch_upsert(cursor, 'District', ['id', 'mddsCode', 'name', 'stateId'], ['mddsCode', 'stateId'], district_values)
        conn.commit()
        
        # Fetch actual IDs
        cursor.execute('SELECT d.id, d."mddsCode", s."mddsCode" FROM "District" d JOIN "State" s ON d."stateId" = s.id')
        for row in cursor.fetchall():
            districts_map[f"{row[2]}_{row[1]}"] = row[0]
        print(f"Districts: {len(districts_map)} inserted/updated ({time.time()-t0:.1f}s)")

        # SubDistricts (batch)
        t0 = time.time()
        sd_values = []
        sd_map = {}
        for _, r in subdistricts.iterrows():
            dist_key = f"{r.state_code}_{r.district_code}"
            district_id = districts_map.get(dist_key)
            if not district_id: continue
            uid = str(uuid4())
            key = f"{dist_key}_{r.sub_district_code}"
            sd_map[key] = uid
            sd_values.append((uid, r.sub_district_code, r.sub_district_name, district_id))
        
        batch_upsert(cursor, 'SubDistrict', ['id', 'mddsCode', 'name', 'districtId'], ['mddsCode', 'districtId'], sd_values)
        conn.commit()

        # Fetch actual IDs
        cursor.execute('''
            SELECT sd.id, sd."mddsCode", d."mddsCode", s."mddsCode" 
            FROM "SubDistrict" sd 
            JOIN "District" d ON sd."districtId" = d.id 
            JOIN "State" s ON d."stateId" = s.id
        ''')
        for row in cursor.fetchall():
            sd_map[f"{row[3]}_{row[2]}_{row[1]}"] = row[0]
        print(f"SubDistricts: {len(sd_map)} inserted/updated ({time.time()-t0:.1f}s)")

        # Villages (batch — the big one)
        # Fetch actual SD IDs from DB to ensure they exist
        print("Verifying SubDistrict IDs in database...")
        cursor.execute('SELECT id FROM "SubDistrict"')
        valid_sd_ids = {row[0] for row in cursor.fetchall()}
        
        village_values = []
        skipped_orphans = 0
        skipped_missing_db = 0
        
        for _, r in villages.iterrows():
            sd_key = f"{r.state_code}_{r.district_code}_{r.sub_district_code}"
            sd_id = sd_map.get(sd_key)
            if not sd_id:
                skipped_orphans += 1
                continue
            
            if sd_id not in valid_sd_ids:
                skipped_missing_db += 1
                continue
                
            village_values.append((str(uuid4()), r.village_code, r.village_name, sd_id))
        
        print(f"Villages: inserting {len(village_values):,} rows...")
        if skipped_orphans > 0: print(f"  Skipped {skipped_orphans:,} orphans (not in file map)")
        if skipped_missing_db > 0: print(f"  Skipped {skipped_missing_db:,} missing from DB (FK safety)")
        
        # Insert in larger batches for speed
        batch_upsert(cursor, 'Village', ['id', 'mddsPlcn', 'name', 'subDistrictId'], ['mddsPlcn'], village_values, batch_size=2000)
        conn.commit()
        print(f"Villages: {len(village_values):,} inserted/updated ({time.time()-t0:.1f}s)")

        # Final verification
        cursor.execute('SELECT COUNT(*) FROM "Village"')
        total = cursor.fetchone()[0]
        cursor.execute('SELECT COUNT(DISTINCT s.id) FROM "State" s')
        state_count = cursor.fetchone()[0]
        print(f"\n=== IMPORT COMPLETE ===")
        print(f"Total villages in database: {total:,}")
        print(f"Total states: {state_count}")
        
    except Exception as e:
        conn.rollback()
        print(f"\nERROR: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    main()
