"""
VillageAPI MDDS Data Import Pipeline
=====================================
ETL (Extract, Transform, Load) pipeline for importing India's MDDS
(Ministry of Drinking Water & Sanitation) village dataset into PostgreSQL.

Scale: ~600,000 villages across 36 states/UTs, ~741 districts, ~6,081 sub-districts.

Design decisions (all interview-explainable):
- Chunked batch inserts (5,000 rows): prevents memory overflow + allows progress tracking.
- In-memory dedup maps for states/districts/sub-districts: Avoids N+1 queries. Reduces DB calls by ~1.8M.
- INSERT ON CONFLICT DO NOTHING: makes entire pipeline idempotent.
- psycopg2 over pandas.to_sql: more control over batch size, error handling, and conflict resolution.
- Transaction per chunk: if chunk fails, only 5,000 rows roll back, not the entire import.
- colorama for terminal output: professional-looking summary impresses in demos.
"""

import os
import glob
import argparse
import time
from uuid import uuid4
import pandas as pd
import psycopg2
import psycopg2.extras
from tqdm import tqdm
from dotenv import load_dotenv
from colorama import init, Fore, Style

init(autoreset=True)

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

def load_data(f):
    try:
        # Use odf engine for .ods files
        engine = 'odf' if f.endswith('.ods') else None
        df = pd.read_excel(f, dtype=str, engine=engine)
        df.columns = df.columns.str.strip()
        
        missing_cols = set(COLUMN_MAP.keys()) - set(df.columns)
        if missing_cols:
            print(f"{Fore.RED}Missing required columns in {f}: {missing_cols}.{Style.RESET_ALL}")
            return pd.DataFrame()
            
        df = df.rename(columns=COLUMN_MAP)
        df = df.apply(lambda x: x.str.strip() if x.dtype == "object" else x)
        
        # Normalize codes with zero-padding (Essential for cross-state consistency)
        df['state_code'] = df['state_code'].str.zfill(2)
        df['district_code'] = df['district_code'].str.zfill(3)
        df['sub_district_code'] = df['sub_district_code'].str.zfill(5)
        df['village_code'] = df['village_code'].str.zfill(6)
        
        return df
    except Exception as e:
        print(f"{Fore.RED}Failed to read {f}: {e}{Style.RESET_ALL}")
        return pd.DataFrame()

def main():
    parser = argparse.ArgumentParser(description="Import MDDS villages data into PostgreSQL")
    parser.add_argument("--file", required=True, help="Path to Excel file or directory containing Excel files")
    parser.add_argument("--chunk-size", type=int, default=5000, help="Batch insert chunk size")
    parser.add_argument("--dry-run", action="store_true", help="Validate data without writing to DB")
    args = parser.parse_args()

    load_dotenv()
    db_url = os.environ.get("DIRECT_URL") or os.environ.get("DATABASE_URL")
    if not db_url:
        print(f"{Fore.RED}DATABASE_URL or DIRECT_URL environment variable required.{Style.RESET_ALL}")
        return

    files = []
    if os.path.isdir(args.file):
        files = glob.glob(os.path.join(args.file, '*.xls*')) + glob.glob(os.path.join(args.file, '*.ods'))
    else:
        files = [args.file]

    if not files:
        print(f"{Fore.RED}No files found.{Style.RESET_ALL}")
        return

    start_time = time.time()
    
    # In-memory maps to prevent N+1 queries
    states_map = {}
    districts_map = {}
    subdistricts_map = {}
    
    errors = 0
    total_villages = 0

    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()

    try:
        # Phase 1: Country
        cursor.execute("""
            INSERT INTO "Country" (id, name, code, "callingCode", "createdAt")
            VALUES (%s, 'India', 'IN', '+91', NOW())
            ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name
            RETURNING id
        """, (str(uuid4()),))
        country_id = cursor.fetchone()[0]
        if not args.dry_run: conn.commit()

        for f in files:
            print(f"\n{Fore.CYAN}Processing file: {os.path.basename(f)}{Style.RESET_ALL}")
            df = load_data(f)
            if df.empty: continue

            # Phase 2: States
            unique_states = df[~df['state_code'].str.match('^0+$')][['state_code', 'state_name']].drop_duplicates()
            for _, row in unique_states.iterrows():
                cursor.execute("""
                    INSERT INTO "State" (id, "mddsCode", name, "countryId", "createdAt")
                    VALUES (%s, %s, %s, %s, NOW())
                    ON CONFLICT ("mddsCode") DO UPDATE SET name=EXCLUDED.name
                    RETURNING id
                """, (str(uuid4()), row.state_code, row.state_name, country_id))
                states_map[row.state_code] = cursor.fetchone()[0]
            if not args.dry_run: conn.commit()

            # Phase 3: Districts
            unique_districts = df[~df['district_code'].str.match('^0+$')][['district_code', 'district_name', 'state_code']].drop_duplicates()
            for _, row in unique_districts.iterrows():
                state_id = states_map.get(row.state_code)
                if not state_id: continue
                cursor.execute("""
                    INSERT INTO "District" (id, "mddsCode", name, "stateId", "createdAt")
                    VALUES (%s, %s, %s, %s, NOW())
                    ON CONFLICT ("mddsCode", "stateId") DO UPDATE SET name=EXCLUDED.name
                    RETURNING id
                """, (str(uuid4()), row.district_code, row.district_name, state_id))
                districts_map[f"{row.state_code}_{row.district_code}"] = cursor.fetchone()[0]
            if not args.dry_run: conn.commit()

            # Phase 4: SubDistricts
            unique_subdistricts = df[~df['sub_district_code'].str.match('^0+$')][['sub_district_code', 'sub_district_name', 'district_code', 'state_code']].drop_duplicates()
            for _, row in unique_subdistricts.iterrows():
                dist_key = f"{row.state_code}_{row.district_code}"
                district_id = districts_map.get(dist_key)
                if not district_id: continue
                cursor.execute("""
                    INSERT INTO "SubDistrict" (id, "mddsCode", name, "districtId", "createdAt")
                    VALUES (%s, %s, %s, %s, NOW())
                    ON CONFLICT ("mddsCode", "districtId") DO UPDATE SET name=EXCLUDED.name
                    RETURNING id
                """, (str(uuid4()), row.sub_district_code, row.sub_district_name, district_id))
                subdistricts_map[f"{dist_key}_{row.sub_district_code}"] = cursor.fetchone()[0]
            if not args.dry_run: conn.commit()

            # Phase 5: Villages
            df_villages = df[~df['village_code'].str.match('^0+$')].drop_duplicates(subset=['village_code'])
            chunks = [df_villages[i:i+args.chunk_size] for i in range(0, len(df_villages), args.chunk_size)]
            
            for chunk in tqdm(chunks, desc=f"Villages ({os.path.basename(f)})"):
                records = []
                for _, row in chunk.iterrows():
                    subdist_key = f"{row.state_code}_{row.district_code}_{row.sub_district_code}"
                    sub_district_id = subdistricts_map.get(subdist_key)
                    if not sub_district_id:
                        errors += 1
                        continue
                    records.append((str(uuid4()), row.village_code, row.village_name, sub_district_id))
                
                if records:
                    psycopg2.extras.execute_batch(cursor, """
                        INSERT INTO "Village" (id, "mddsPlcn", name, "subDistrictId", "createdAt")
                        VALUES (%s, %s, %s, %s, NOW())
                        ON CONFLICT ("mddsPlcn") DO NOTHING
                    """, records)
                    total_villages += len(records)
                    if not args.dry_run: conn.commit()

        if args.dry_run:
            conn.rollback()
            print(f"{Fore.YELLOW}Dry run completed. Transactions rolled back.{Style.RESET_ALL}")

        elapsed = time.time() - start_time
        mins, secs = divmod(elapsed, 60)
        
        print(f"\n{Fore.GREEN}╔══════════════════════════════════╗")
        print(f"║  VILLAGEAPI IMPORT COMPLETE      ║")
        print(f"╠══════════════════════════════════╣")
        print(f"║  Country: India          ✓       ║")
        print(f"║  States processed:    {len(states_map):<10} ║")
        print(f"║  Districts processed: {len(districts_map):<10} ║")
        print(f"║  Sub-districts:       {len(subdistricts_map):<10} ║")
        print(f"║  Villages processed:  {total_villages:<10} ║")
        print(f"║  Errors logged:       {errors:<10} ║")
        print(f"║  Time elapsed:        {int(mins)}m {int(secs)}s     ║")
        print(f"╚══════════════════════════════════╝{Style.RESET_ALL}")

    except Exception as e:
        print(f"{Fore.RED}Fatal error during import: {e}{Style.RESET_ALL}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()
