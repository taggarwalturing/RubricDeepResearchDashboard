"""
Manual data sync script
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.data_sync_service import DataSyncService
from app.services.db_service import get_db_service

def main():
    print("=" * 80)
    print("MANUAL DATA SYNC")
    print("=" * 80)
    
    # Initialize database service
    db_service = get_db_service()
    db_service.initialize()
    print("✓ Database initialized\n")
    
    # Create sync service
    sync_service = DataSyncService()
    
    # Initialize BigQuery client
    print("Initializing BigQuery client...")
    sync_service.initialize_bigquery_client()
    print("✓ BigQuery client initialized\n")
    
    # Sync all tables
    print("Starting sync...\n")
    results = sync_service.sync_all_tables(sync_type='manual')
    
    print("\n" + "=" * 80)
    print("SYNC RESULTS")
    print("=" * 80)
    
    all_success = True
    for table, success in results.items():
        status = '✓' if success else '✗'
        print(f'{status} {table}: {"Success" if success else "Failed"}')
        if not success:
            all_success = False
    
    print("=" * 80)
    
    if all_success:
        print("\n✅ All tables synced successfully!")
    else:
        print("\n⚠️  Some tables failed to sync. Check logs above.")
    
    # Close database
    db_service.close()

if __name__ == "__main__":
    main()

