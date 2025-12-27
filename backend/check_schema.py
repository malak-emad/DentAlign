import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

def check_table_schema():
    cursor = connection.cursor()
    
    # Get all tables in the database
    print("=" * 80)
    print("ALL DATABASE TABLES AND COLUMNS")
    print("=" * 80)
    
    # Get all table names
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    """)
    tables = [row[0] for row in cursor.fetchall()]
    
    for table_name in tables:
        print(f"\n{'=' * 80}")
        print(f"TABLE: {table_name}")
        print(f"{'=' * 80}")
        
        # Get columns for this table
        cursor.execute("""
            SELECT 
                column_name,
                data_type,
                character_maximum_length,
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_name = %s
            ORDER BY ordinal_position
        """, [table_name])
        
        columns = cursor.fetchall()
        if columns:
            print(f"{'Column Name':<30} {'Type':<20} {'Nullable':<10} {'Default'}")
            print("-" * 80)
            for col in columns:
                col_name, data_type, max_length, nullable, default = col
                type_str = f"{data_type}"
                if max_length:
                    type_str += f"({max_length})"
                default_str = str(default) if default else ""
                print(f"{col_name:<30} {type_str:<20} {nullable:<10} {default_str}")
        else:
            print("No columns found")
        
        # Get foreign keys for this table
        cursor.execute("""
            SELECT
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_name = %s
        """, [table_name])
        
        fks = cursor.fetchall()
        if fks:
            print("\nForeign Keys:")
            for fk in fks:
                col, ref_table, ref_col = fk
                print(f"  {col} -> {ref_table}.{ref_col}")
    
    cursor.close()
    print("\n" + "=" * 80)

if __name__ == "__main__":
    check_table_schema()