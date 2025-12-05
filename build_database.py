"""
Database builder script for Spanish Crossword Solver.
Converts RAE dictionary files, CSV dictionary, and word list to SQLite database.

Usage:
    python build_database.py

This script creates crossword_db.sqlite with optimized indexes for fast lookups.
"""

import sqlite3
import os
import csv
from pathlib import Path
from typing import Optional

DB_PATH = "crossword_db.sqlite"

def create_database():
    """Create SQLite database with schema and indexes."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS words (
            word TEXT PRIMARY KEY,
            length INTEGER NOT NULL
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS rae_definitions (
            word TEXT PRIMARY KEY,
            definition TEXT NOT NULL
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS csv_definitions (
            word TEXT PRIMARY KEY,
            definition TEXT NOT NULL
        )
    """)
    
    # Create indexes for fast lookups
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_words_length ON words(length)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_rae_word ON rae_definitions(word)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_csv_word ON csv_definitions(word)")
    
    conn.commit()
    return conn, cursor

def load_rae_definitions(conn, cursor, rae_dir: str):
    """Load RAE definitions from individual files into database."""
    print(f"Loading RAE definitions from {rae_dir}...")
    rae_dir_path = Path(rae_dir)
    
    if not rae_dir_path.exists():
        print(f"Warning: RAE directory {rae_dir} not found. Skipping.")
        return 0
    
    count = 0
    batch = []
    batch_size = 1000
    
    try:
        for letra_dir in sorted(rae_dir_path.iterdir()):
            if not letra_dir.is_dir():
                continue
            
            for fpath in letra_dir.iterdir():
                if not fpath.is_file():
                    continue
                
                try:
                    with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
                        definicion = f.read().strip()
                        palabra = fpath.stem.strip().lower()
                        
                        if palabra and definicion:
                            batch.append((palabra, definicion))
                            count += 1
                            
                            if len(batch) >= batch_size:
                                cursor.executemany(
                                    "INSERT OR REPLACE INTO rae_definitions (word, definition) VALUES (?, ?)",
                                    batch
                                )
                                conn.commit()
                                batch = []
                                if count % 10000 == 0:
                                    print(f"  Loaded {count} RAE definitions...")
                except Exception as e:
                    print(f"  Error reading {fpath}: {e}")
                    continue
        
        # Insert remaining batch
        if batch:
            cursor.executemany(
                "INSERT OR REPLACE INTO rae_definitions (word, definition) VALUES (?, ?)",
                batch
            )
            conn.commit()
        
        print(f"✓ Loaded {count} RAE definitions")
        return count
    except Exception as e:
        print(f"Error loading RAE definitions: {e}")
        return count

def load_csv_definitions(conn, cursor, csv_path: str):
    """Load CSV definitions into database."""
    print(f"Loading CSV definitions from {csv_path}...")
    csv_path_obj = Path(csv_path)
    
    if not csv_path_obj.exists():
        print(f"Warning: CSV file {csv_path} not found. Skipping.")
        return 0
    
    count = 0
    batch = []
    batch_size = 1000
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                palabra = row.get('word', '').strip().lower()
                definicion = row.get('definition', '').strip()
                
                if palabra and definicion:
                    batch.append((palabra, definicion))
                    count += 1
                    
                    if len(batch) >= batch_size:
                        cursor.executemany(
                            "INSERT OR REPLACE INTO csv_definitions (word, definition) VALUES (?, ?)",
                            batch
                        )
                        conn.commit()
                        batch = []
                        if count % 10000 == 0:
                            print(f"  Loaded {count} CSV definitions...")
        
        # Insert remaining batch
        if batch:
            cursor.executemany(
                "INSERT OR REPLACE INTO csv_definitions (word, definition) VALUES (?, ?)",
                batch
            )
            conn.commit()
        
        print(f"✓ Loaded {count} CSV definitions")
        return count
    except Exception as e:
        print(f"Error loading CSV definitions: {e}")
        return count

def load_word_list(conn, cursor, word_list_path: str):
    """Load word list into database."""
    print(f"Loading word list from {word_list_path}...")
    word_list_path_obj = Path(word_list_path)
    
    if not word_list_path_obj.exists():
        print(f"Warning: Word list file {word_list_path} not found. Skipping.")
        return 0
    
    count = 0
    batch = []
    batch_size = 1000
    
    try:
        with open(word_list_path, 'r', encoding='latin-1') as f:
            for line in f:
                word = line.strip().lower()
                if word and len(word) > 2 and word.isalpha():
                    batch.append((word, len(word)))
                    count += 1
                    
                    if len(batch) >= batch_size:
                        cursor.executemany(
                            "INSERT OR REPLACE INTO words (word, length) VALUES (?, ?)",
                            batch
                        )
                        conn.commit()
                        batch = []
                        if count % 50000 == 0:
                            print(f"  Loaded {count} words...")
        
        # Insert remaining batch
        if batch:
            cursor.executemany(
                "INSERT OR REPLACE INTO words (word, length) VALUES (?, ?)",
                batch
            )
            conn.commit()
        
        print(f"✓ Loaded {count} words")
        return count
    except Exception as e:
        print(f"Error loading word list: {e}")
        return count

def main():
    """Main function to build the database."""
    print("=" * 60)
    print("Building SQLite database for Spanish Crossword Solver")
    print("=" * 60)
    
    # Remove existing database if it exists
    if Path(DB_PATH).exists():
        response = input(f"Database {DB_PATH} already exists. Overwrite? (y/n): ").lower()
        if response != 'y':
            print("Aborted.")
            return
        os.remove(DB_PATH)
        print(f"Removed existing database.")
    
    # Create database
    conn, cursor = create_database()
    print(f"Created database: {DB_PATH}\n")
    
    try:
        # Load data
        word_count = load_word_list(conn, cursor, "spanish_words.txt")
        rae_count = load_rae_definitions(conn, cursor, "diccionario_rae")
        csv_count = load_csv_definitions(conn, cursor, "spanish_dictionary.csv")
        
        # Analyze database for query optimization
        print("\nOptimizing database...")
        cursor.execute("ANALYZE")
        conn.commit()
        
        # Get database statistics
        cursor.execute("SELECT COUNT(*) FROM words")
        total_words = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM rae_definitions")
        total_rae = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM csv_definitions")
        total_csv = cursor.fetchone()[0]
        
        print("\n" + "=" * 60)
        print("Database build complete!")
        print("=" * 60)
        print(f"Total words: {total_words:,}")
        print(f"RAE definitions: {total_rae:,}")
        print(f"CSV definitions: {total_csv:,}")
        print(f"\nDatabase file: {DB_PATH}")
        print(f"File size: {Path(DB_PATH).stat().st_size / (1024*1024):.2f} MB")
        print("\nYou can now use the optimized crossword solver!")
        
    except Exception as e:
        print(f"\nError building database: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    main()

