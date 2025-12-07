"""
Script to add new words and definitions to the existing database.
Usage: python add_words_to_db.py <input_file.csv>

This script will:
- Add words to the words table (or update if exists)
- Add definitions to csv_definitions table, allowing multiple definitions per word
- Skip duplicate definitions (same word + same definition)
"""

import sqlite3
import csv
import sys
from pathlib import Path

DB_PATH = "crossword_db.sqlite"

def ensure_schema_supports_multiple_definitions(conn, cursor):
    """Ensure the database schema supports multiple definitions per word."""
    # Check if csv_definitions table exists and has the old schema
    cursor.execute("""
        SELECT sql FROM sqlite_master 
        WHERE type='table' AND name='csv_definitions'
    """)
    result = cursor.fetchone()
    
    if result and 'PRIMARY KEY' in result[0] and 'id' not in result[0]:
        # Old schema detected - need to migrate
        print("Migrating csv_definitions table to support multiple definitions...")
        
        # Create new table with id column
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS csv_definitions_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                word TEXT NOT NULL,
                definition TEXT NOT NULL,
                UNIQUE(word, definition)
            )
        """)
        
        # Copy existing data
        cursor.execute("""
            INSERT INTO csv_definitions_new (word, definition)
            SELECT word, definition FROM csv_definitions
        """)
        
        # Drop old table
        cursor.execute("DROP TABLE csv_definitions")
        
        # Rename new table
        cursor.execute("ALTER TABLE csv_definitions_new RENAME TO csv_definitions")
        
        # Recreate index
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_csv_word ON csv_definitions(word)")
        
        conn.commit()
        print("✓ Migration complete")
    elif result is None:
        # Table doesn't exist - create with new schema
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS csv_definitions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                word TEXT NOT NULL,
                definition TEXT NOT NULL,
                UNIQUE(word, definition)
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_csv_word ON csv_definitions(word)")
        conn.commit()

def add_words_from_csv(csv_path: str):
    """Add words and definitions from CSV file to database."""
    if not Path(DB_PATH).exists():
        print(f"Error: Database {DB_PATH} not found. Please run build_database.py first.")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Ensure schema supports multiple definitions
    ensure_schema_supports_multiple_definitions(conn, cursor)
    
    csv_path_obj = Path(csv_path)
    if not csv_path_obj.exists():
        print(f"Error: File {csv_path} not found.")
        conn.close()
        return
    
    word_count = 0
    definition_count = 0
    skipped_duplicates = 0
    batch_words = []
    batch_defs = []
    batch_size = 1000
    
    # Track definitions we've seen in this CSV to avoid duplicates within the file
    seen_in_csv = set()
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            # Check if required columns exist
            if reader.fieldnames is None:
                print("Error: CSV file appears to be empty or invalid.")
                conn.close()
                return
            
            # Determine word column (accept multiple formats)
            if 'word' in reader.fieldnames:
                word_column = 'word'
            elif 'Spanish Word' in reader.fieldnames:
                word_column = 'Spanish Word'
            else:
                print("Error: CSV must have a 'word' or 'Spanish Word' column.")
                print(f"Found columns: {', '.join(reader.fieldnames)}")
                conn.close()
                return
            
            # Determine definition column (only use 'definition', not 'Translation')
            # Translation column will be ignored - only words will be added
            if 'definition' in reader.fieldnames:
                definition_column = 'definition'
            else:
                definition_column = None  # No definition column - words-only mode
            
            print(f"Processing {csv_path}...")
            print(f"Columns found: {', '.join(reader.fieldnames)}")
            if definition_column:
                print(f"Using '{word_column}' for words and '{definition_column}' for definitions")
            else:
                print(f"Using '{word_column}' for words only (no 'definition' column - words will be added without definitions)")
                if 'Translation' in reader.fieldnames:
                    print("  Note: 'Translation' column found but will be ignored (use 'definition' column if you want definitions)")
            
            for row in reader:
                word = row.get(word_column, '').strip().lower()
                definition = row.get(definition_column, '').strip() if definition_column else ''
                
                if word and len(word) > 2 and word.isalpha():
                    # Add to words table
                    batch_words.append((word, len(word)))
                    word_count += 1
                    
                    # Add to definitions if provided
                    if definition:
                        # Check if this exact word+definition combination already exists in database
                        cursor.execute("""
                            SELECT COUNT(*) FROM csv_definitions 
                            WHERE word = ? AND definition = ?
                        """, (word, definition))
                        exists_in_db = cursor.fetchone()[0] > 0
                        
                        # Check if we've seen this in the current CSV
                        definition_key = (word, definition)
                        seen_in_current_csv = definition_key in seen_in_csv
                        
                        if not exists_in_db and not seen_in_current_csv:
                            batch_defs.append((word, definition))
                            definition_count += 1
                            seen_in_csv.add(definition_key)
                        elif exists_in_db:
                            skipped_duplicates += 1
                        # If seen in current CSV, silently skip (already counted)
                    
                    # Batch insert words
                    if len(batch_words) >= batch_size:
                        cursor.executemany(
                            "INSERT OR REPLACE INTO words (word, length) VALUES (?, ?)",
                            batch_words
                        )
                        batch_words = []
                    
                    # Batch insert definitions
                    if len(batch_defs) >= batch_size:
                        cursor.executemany(
                            "INSERT OR REPLACE INTO csv_definitions (word, definition) VALUES (?, ?)",
                            batch_defs
                        )
                        batch_defs = []
                    
                    # Progress indicator
                    if (word_count + definition_count) % 5000 == 0:
                        print(f"  Processed {word_count} words, {definition_count} definitions...")
        
        # Insert remaining batches
        if batch_words:
            cursor.executemany(
                "INSERT OR REPLACE INTO words (word, length) VALUES (?, ?)",
                batch_words
            )
        
        if batch_defs:
            # Use INSERT OR IGNORE to avoid errors if somehow a duplicate slipped through
            cursor.executemany(
                "INSERT OR IGNORE INTO csv_definitions (word, definition) VALUES (?, ?)",
                batch_defs
            )
        
        conn.commit()
        
        print("\n" + "=" * 60)
        print("✓ Successfully added:")
        print(f"  - {word_count} words to 'words' table")
        if definition_count > 0:
            print(f"  - {definition_count} new definitions to 'csv_definitions' table")
        if skipped_duplicates > 0:
            print(f"  - {skipped_duplicates} duplicate definitions skipped (already exist)")
        print("=" * 60)
        if definition_count > 0:
            print("\nNote: Multiple definitions per word are now supported.")
            print("      If a word has multiple definitions, all will be stored and retrieved.")
        
    except csv.Error as e:
        print(f"CSV parsing error: {e}")
        print("Make sure your file is properly formatted as CSV.")
        print("Accepted column formats: 'word'/'Spanish Word' and 'definition'/'Translation'")
        conn.rollback()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python add_words_to_db.py <input_file.csv>")
        print("\nCSV format can be:")
        print("  Option 1: word,definition (with definitions)")
        print("  Option 2: Spanish Word,Translation (with translations as definitions)")
        print("  Option 3: word (words only, no definitions)")
        print("  Option 4: Spanish Word (words only, no definitions)")
        print("\nExample (with definitions):")
        print("word,definition")
        print("casa,Lugar donde vives")
        print("perro,Animal doméstico")
        print("\nExample (words only):")
        print("word")
        print("casa")
        print("perro")
        print("\nNote: The file can be in any order - alphabetical sorting is not required.")
        print("      Definitions are optional - words will be added even without definitions.")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    add_words_from_csv(csv_file)

