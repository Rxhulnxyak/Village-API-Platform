import os
import glob
import subprocess
import sys

dataset_dir = r"d:\Villages API platform\all-india-villages-master-list-excel\dataset"
files = glob.glob(os.path.join(dataset_dir, '*.xls*')) + glob.glob(os.path.join(dataset_dir, '*.ods'))

# Sort files to maintain consistency
files.sort()

print(f"Found {len(files)} files to import.")

for f in files:
    print(f"\n=============================================")
    print(f"Starting import for: {os.path.basename(f)}")
    print(f"=============================================")
    
    # Run the import script as a separate process to avoid memory leaks
    # and to ensure a fresh database connection per state file.
    result = subprocess.run([sys.executable, "scripts/import_mdds.py", "--file", f])
    
    if result.returncode != 0:
        print(f"\nERROR: Import failed for {os.path.basename(f)} with return code {result.returncode}")
        # We can either stop or continue. Let's continue so one bad file doesn't block the rest.
    else:
        print(f"\nSUCCESS: Import finished for {os.path.basename(f)}")

print("\nAll files processed.")
