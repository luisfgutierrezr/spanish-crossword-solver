import re
from typing import List, Dict, Tuple, Optional
import spacy
from dataclasses import dataclass
from pathlib import Path
import requests
import wikipedia
import json
from urllib.parse import quote_plus
import time
from bs4 import BeautifulSoup
import csv
import os
import sqlite3
from functools import lru_cache
import unicodedata

import config

MAX_CANDIDATES = config.MAX_CANDIDATES

def normalize_text(text: str, remove_accents: bool = False) -> str:
    """Normalize text for matching.
    
    Args:
        text: Input text to normalize
        remove_accents: If True, remove accents for flexible matching
    
    Returns:
        Normalized text in lowercase
    """
    text = text.lower()
    if remove_accents:
        # Normalize to NFD (decomposed form) and remove combining marks
        nfd = unicodedata.normalize('NFD', text)
        text = ''.join(c for c in nfd if unicodedata.category(c) != 'Mn')
    return text

@dataclass
class Entry:
    clue: str
    pattern: str

class WebSearcher:
    def __init__(self):
        self.wikipedia = wikipedia
        self.wikipedia.set_lang("es")
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
    
    def search_wikipedia(self, word: str) -> str:
        try:
            return self.wikipedia.summary(word, sentences=2, auto_suggest=False, timeout=5)
        except Exception:
            return ""

    def search_rae(self, word: str) -> Dict:
        try:
            url = f"https://dle.rae.es/{quote_plus(word)}"
            response = self.session.get(url, timeout=5)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser', features="html.parser")
                definitions = []
                for def_item in soup.select('.j'):
                    definitions.append(def_item.text.strip())
                return {
                    "definitions": definitions[:3],
                    "url": url
                }
            return {"definitions": [], "url": url}
        except Exception:
            return {"definitions": [], "url": ""}

    def search_wordreference(self, word: str) -> Dict:
        try:
            url = f"https://www.wordreference.com/es/en/translation.asp?spen={quote_plus(word)}"
            response = self.session.get(url, timeout=5)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser', features="html.parser")
                examples = []
                for example in soup.select('.ex'):
                    examples.append(example.text.strip())
                return {
                    "examples": examples[:3],
                    "url": url
                }
            return {"examples": [], "url": url}
        except Exception:
            return {"examples": [], "url": ""}

    def search_linguee(self, word: str) -> Dict:
        try:
            url = f"https://www.linguee.com/spanish-english/search?source=auto&query={quote_plus(word)}"
            response = self.session.get(url, timeout=5)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser', features="html.parser")
                examples = []
                for example in soup.select('.example'):
                    examples.append(example.text.strip())
                return {
                    "examples": examples[:3],
                    "url": url
                }
            return {"examples": [], "url": url}
        except Exception:
            return {"examples": [], "url": ""}

    def get_all_context(self, word: str, clue: str) -> Dict:
        context = {
            "wikipedia": self.search_wikipedia(word),
            "rae": self.search_rae(word),
            "wordreference": self.search_wordreference(word),
            "linguee": self.search_linguee(word)
        }
        return context

class DatamuseSearcher:
    @staticmethod
    def search(pattern: str, max_results: Optional[int] = None) -> List[str]:
        if max_results is None:
            max_results = MAX_CANDIDATES
        dm_pattern = pattern.replace('_', '?')
        url = f"https://api.datamuse.com/words?sp={dm_pattern}&v=es&max={max_results}"
        try:
            resp = requests.get(url, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                return [item['word'] for item in data if 'word' in item]
            return []
        except Exception:
            return []

class DatabaseManager:
    """Manages SQLite database connections and queries."""
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.conn = None
        self._connect()
    
    def _connect(self):
        """Create database connection."""
        if Path(self.db_path).exists():
            self.conn = sqlite3.connect(self.db_path)
            self.conn.row_factory = sqlite3.Row
        else:
            self.conn = None
    
    def get_connection(self):
        """Get database connection."""
        if self.conn is None:
            self._connect()
        return self.conn
    
    def match_pattern(self, pattern: str) -> List[str]:
        """Match pattern using SQLite LIKE queries for better performance."""
        if self.conn is None:
            return []
        
        # Normalize wildcards: convert * to _ for internal consistency
        pattern = pattern.replace('*', '_')
        
        # Convert to lowercase to match database storage
        pattern = pattern.lower()
        
        # Convert pattern to SQL LIKE pattern
        # Our pattern uses _ for unknown letters, SQL LIKE uses _ for single char
        # We need to escape SQL special chars (% and literal _) first
        # Since our _ means "any single char", it maps directly to SQL _
        # But we need to escape any literal % characters
        sql_pattern = pattern.replace('%', '\\%')
        # Our _ already means single char, so it maps to SQL _ directly
        # No need to escape it since we want it to be a wildcard
        
        # Get word length from pattern
        pattern_length = len(pattern)
        
        cursor = self.conn.cursor()
        # Use LIKE with ESCAPE for pattern matching (in case pattern contains %)
        # Use LOWER() to ensure case-insensitive matching
        cursor.execute("""
            SELECT word FROM words 
            WHERE length = ? AND LOWER(word) LIKE ? ESCAPE '\\'
            LIMIT ?
        """, (pattern_length, sql_pattern, MAX_CANDIDATES))
        
        results = [row[0] for row in cursor.fetchall()]
        return results
    
    def get_rae_definition(self, word: str) -> Optional[str]:
        """Get RAE definition from database."""
        if self.conn is None:
            return None
        
        cursor = self.conn.cursor()
        cursor.execute("SELECT definition FROM rae_definitions WHERE word = ?", (word.lower(),))
        row = cursor.fetchone()
        return row[0] if row else None
    
    def get_csv_definition(self, word: str) -> Optional[str]:
        """Get CSV definition from database. Returns all definitions combined if multiple exist."""
        if self.conn is None:
            return None
        
        cursor = self.conn.cursor()
        cursor.execute("SELECT definition FROM csv_definitions WHERE word = ?", (word.lower(),))
        rows = cursor.fetchall()
        
        if not rows:
            return None
        
        # If multiple definitions, combine them with semicolon separator
        definitions = [row[0] for row in rows]
        if len(definitions) == 1:
            return definitions[0]
        else:
            # Combine multiple definitions with " | " separator
            return " | ".join(definitions)
    
    def close(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()
            self.conn = None

class WordMatcher:
    def __init__(self, word_list: Optional[List[str]] = None, db_manager: Optional[DatabaseManager] = None):
        self.word_list = word_list
        self.db_manager = db_manager
        self.use_database = db_manager is not None and db_manager.conn is not None

    def match_pattern(self, pattern: str) -> List[str]:
        """Match pattern using database if available, otherwise use regex."""
        # Normalize wildcards: convert * to _ for internal consistency
        pattern = pattern.replace('*', '_')
        
        # Convert to lowercase to match database storage
        pattern = pattern.lower()
        
        if self.use_database:
            return self.db_manager.match_pattern(pattern)
        else:
            # Fallback to regex matching
            if self.word_list is None:
                return []
            regex_pattern = pattern.replace('_', '.')
            regex = re.compile(f'^{regex_pattern}$', re.IGNORECASE)
            matches = [word for word in self.word_list if regex.match(word) and len(word) > 2 and word.isalpha()]
            return matches[:MAX_CANDIDATES]

class ClueAnalyzer:
    def __init__(self, db_manager: Optional[DatabaseManager] = None):
        print("Loading spaCy model...")
        self.nlp = spacy.load('es_core_news_md')
        self.web_searcher = WebSearcher()
        self.db_manager = db_manager
        self.use_database = db_manager is not None and db_manager.conn is not None
        
        # Vector cache for spaCy documents
        self._vector_cache = {} if config.CACHE_VECTORS else None
        
        # Load dictionaries (fallback if database not available)
        if not self.use_database:
            print("Database not found. Loading dictionaries from files (this may take a while)...")
            self.rae_dict = self.load_rae_definitions('diccionario_rae')
            self.def_dict = self.load_definitions_csv('spanish_dictionary.csv')
        else:
            print("Using SQLite database for definitions.")
            self.rae_dict = {}
            self.def_dict = {}

    def load_rae_definitions(self, rae_dir):
        """Fallback: Load RAE definitions from files."""
        rae_dict = {}
        try:
            for letra in os.listdir(rae_dir):
                subdir = os.path.join(rae_dir, letra)
                if os.path.isdir(subdir):
                    for fname in os.listdir(subdir):
                        fpath = os.path.join(subdir, fname)
                        if os.path.isfile(fpath):
                            try:
                                with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
                                    definicion = f.read().strip()
                                    palabra = fname.strip().lower()
                                    if palabra and definicion:
                                        rae_dict[palabra] = definicion
                            except Exception as e:
                                print(f"Error leyendo {fpath}: {e}")
        except Exception as e:
            print(f"No se pudo cargar el diccionario RAE: {e}")
        return rae_dict

    def load_definitions_csv(self, csv_path):
        """Fallback: Load CSV definitions from file."""
        def_dict = {}
        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    palabra = row['word'].strip().lower()
                    definicion = row['definition'].strip()
                    if palabra and definicion:
                        def_dict[palabra] = definicion
        except Exception as e:
            print(f"No se pudo cargar el diccionario de definiciones CSV: {e}")
        return def_dict

    def _get_cached_doc(self, text: str):
        """Get or create cached spaCy document."""
        if self._vector_cache is None:
            return self.nlp(text)
        
        if text not in self._vector_cache:
            self._vector_cache[text] = self.nlp(text)
        return self._vector_cache[text]

    def has_vector(self, word: str) -> bool:
        token = self.nlp.vocab[word]
        return token.has_vector and token.vector_norm > 0

    def get_best_definition(self, word: str):
        """Get best definition with priority: RAE > CSV > None."""
        if self.use_database:
            # Try RAE first
            rae_def = self.db_manager.get_rae_definition(word)
            if rae_def:
                return rae_def
            # Try CSV
            csv_def = self.db_manager.get_csv_definition(word)
            if csv_def:
                return csv_def
            return None
        else:
            # Fallback to in-memory dictionaries
            if word in self.rae_dict:
                return self.rae_dict[word]
            elif word in self.def_dict:
                return self.def_dict[word]
            else:
                return None

    def calculate_similarity(self, clue: str, word: str) -> tuple:
        """Calculate similarity with cached vectors."""
        definicion = self.get_best_definition(word)
        clue_segments = [seg.strip() for seg in clue.split(',') if seg.strip()]
        if not clue_segments:
            clue_segments = [clue.strip()]
        best_score = 0.0
        best_segment = clue.strip()
        best_def = definicion if definicion else ''
        
        # Use cached documents
        word_doc = self._get_cached_doc(word)
        
        if definicion:
            def_doc = self._get_cached_doc(definicion)
            for segment in clue_segments:
                segment_doc = self._get_cached_doc(segment)
                if not segment_doc.vector_norm or not def_doc.vector_norm:
                    continue
                score = segment_doc.similarity(def_doc)
                if score > best_score:
                    best_score = score
                    best_segment = segment
                    best_def = definicion
            clue_doc = self._get_cached_doc(clue)
            if clue_doc.vector_norm and def_doc.vector_norm:
                score = clue_doc.similarity(def_doc)
                if score > best_score:
                    best_score = score
                    best_segment = clue
                    best_def = definicion
        else:
            for segment in clue_segments:
                segment_doc = self._get_cached_doc(segment)
                if not segment_doc.vector_norm or not word_doc.vector_norm:
                    continue
                score = segment_doc.similarity(word_doc)
                if score > best_score:
                    best_score = score
                    best_segment = segment
            clue_doc = self._get_cached_doc(clue)
            if clue_doc.vector_norm and word_doc.vector_norm:
                score = clue_doc.similarity(word_doc)
                if score > best_score:
                    best_score = score
                    best_segment = clue
        return best_score, best_segment, best_def

    def get_web_context(self, clue: str, word: str) -> Dict:
        return self.web_searcher.get_all_context(word, clue)

class CrosswordSolver:
    def __init__(self, word_list_path: str = "spanish_words.txt"):
        # Initialize database manager
        self.db_manager = DatabaseManager(config.DB_PATH) if config.USE_DATABASE else None
        
        # Initialize word list (fallback if no database)
        if self.db_manager is None or self.db_manager.conn is None:
            print("Loading word list from file...")
            if word_list_path and Path(word_list_path).exists():
                with open(word_list_path, 'r', encoding='latin-1') as f:
                    self.word_list = [line.strip().lower() for line in f if line.strip()]
            else:
                nlp = spacy.load('es_core_news_md')
                self.word_list = [word.text.lower() for word in nlp.vocab if word.is_alpha]
        else:
            self.word_list = None
        
        self.word_matcher = WordMatcher(self.word_list, self.db_manager)
        self.clue_analyzer = ClueAnalyzer(self.db_manager)

    def solve_entry(self, entry: Entry) -> list:
        pattern_matches = self.word_matcher.match_pattern(entry.pattern)
        if len(pattern_matches) == MAX_CANDIDATES:
            print(f"Advertencia: Se encontraron más de {MAX_CANDIDATES} coincidencias para el patrón. Solo se analizarán las primeras {MAX_CANDIDATES}.")
        results = []
        
        # Process pattern matches without web searches first
        for word in pattern_matches:
            if not self.clue_analyzer.has_vector(word):
                continue
            similarity, best_segment, definicion = self.clue_analyzer.calculate_similarity(entry.clue, word)
            # Don't fetch web context yet - we'll do it for top results only
            results.append((word, similarity, best_segment, definicion, None, 'local'))
        
        # If no results, try Datamuse
        if not results:
            datamuse_words = DatamuseSearcher.search(entry.pattern)
            if len(datamuse_words) == MAX_CANDIDATES:
                print(f"Advertencia: Se encontraron más de {MAX_CANDIDATES} coincidencias en Datamuse. Solo se analizarán las primeras {MAX_CANDIDATES}.")
            for word in datamuse_words:
                if not self.clue_analyzer.has_vector(word):
                    continue
                similarity, best_segment, definicion = self.clue_analyzer.calculate_similarity(entry.clue, word)
                results.append((word, similarity, best_segment, definicion, None, 'datamuse'))
        
        # Sort by similarity
        results.sort(key=lambda x: x[1], reverse=True)
        
        # Fetch web context only for top N results if enabled
        if config.ENABLE_WEB_SEARCHES:
            top_n = min(config.WEB_SEARCH_TOP_N, len(results))
            for i in range(top_n):
                word, similarity, best_segment, definicion, _, fuente = results[i]
                context = self.clue_analyzer.get_web_context(entry.clue, word)
                results[i] = (word, similarity, best_segment, definicion, context, fuente)
        
        return results
    
    def _detect_input_type(self, input_text: str) -> str:
        """Auto-detect if input is a pattern or definition.
        
        Returns:
            'pattern' if input looks like a pattern (letters/wildcards, no spaces)
            'definition' if input looks like natural language (contains spaces)
        """
        input_text = input_text.strip()
        if not input_text:
            return 'pattern'
        
        # If contains spaces, treat as definition
        if ' ' in input_text:
            return 'definition'
        
        # If contains only letters, underscores, asterisks, and no spaces, treat as pattern
        if all(c.isalpha() or c in '_*' for c in input_text):
            return 'pattern'
        
        # Default to definition for natural language
        return 'definition'
    
    def solve_by_definition_only(self, clue: str, max_length: Optional[int] = None) -> list:
        """Search words by definition only, without pattern constraint.
        
        Args:
            clue: Definition or clue text to search for
            max_length: Optional maximum word length to limit search
        
        Returns:
            List of tuples: (word, similarity_score, best_segment, definition, context, source)
        """
        if not clue or not clue.strip():
            return []
        
        clue = clue.strip().lower()
        results = []
        
        # Query database for words
        if self.db_manager and self.db_manager.conn:
            cursor = self.db_manager.conn.cursor()
            
            # First, try to find words whose definitions contain the clue word
            # This gives us direct matches (e.g., words whose definitions mention "reptil")
            priority_candidates = []
            max_word_length = max_length if max_length and max_length > 0 else getattr(config, 'DEFINITION_SEARCH_MAX_LENGTH', 15)
            
            # Search for words whose definitions contain the clue
            clue_words = clue.split()
            for clue_word in clue_words:
                if len(clue_word) < 3:  # Skip very short words
                    continue
                # Search in RAE definitions
                query = """
                    SELECT DISTINCT w.word FROM words w
                    JOIN rae_definitions r ON w.word = r.word
                    WHERE w.length >= 3 AND w.length <= ? 
                    AND LOWER(r.definition) LIKE ?
                    LIMIT ?
                """
                cursor.execute(query, (max_word_length, f'%{clue_word}%', config.MAX_CANDIDATES * 5))
                priority_candidates.extend([row[0] for row in cursor.fetchall()])
                
                # Search in CSV definitions
                query = """
                    SELECT DISTINCT w.word FROM words w
                    JOIN csv_definitions c ON w.word = c.word
                    WHERE w.length >= 3 AND w.length <= ? 
                    AND LOWER(c.definition) LIKE ?
                    LIMIT ?
                """
                cursor.execute(query, (max_word_length, f'%{clue_word}%', config.MAX_CANDIDATES * 5))
                priority_candidates.extend([row[0] for row in cursor.fetchall()])
            
            # Remove duplicates while preserving order
            seen = set()
            priority_candidates = [w for w in priority_candidates if not (w in seen or seen.add(w))]
            
            # Get a diverse sample of other words across different lengths
            candidate_words = []
            words_per_length_range = (config.MAX_CANDIDATES * 10) // 5  # Distribute across ~5 length ranges
            
            for length_range_start in range(3, min(max_word_length + 1, 18), 3):
                length_range_end = min(length_range_start + 2, max_word_length)
                query = "SELECT word FROM words WHERE length >= ? AND length <= ? ORDER BY RANDOM() LIMIT ?"
                cursor.execute(query, (length_range_start, length_range_end, words_per_length_range))
                candidate_words.extend([row[0] for row in cursor.fetchall()])
            
            # If we didn't get enough words, fill with random words
            if len(candidate_words) < config.MAX_CANDIDATES * 10:
                remaining = (config.MAX_CANDIDATES * 10) - len(candidate_words)
                query = "SELECT word FROM words WHERE length >= 3 AND length <= ? ORDER BY RANDOM() LIMIT ?"
                cursor.execute(query, (max_word_length, remaining))
                candidate_words.extend([row[0] for row in cursor.fetchall()])
            
            # Combine priority candidates first, then other candidates
            all_candidates = priority_candidates + [w for w in candidate_words if w not in priority_candidates]
            candidate_words = all_candidates[:config.MAX_CANDIDATES * 10]
        else:
            # Fallback: use word_list if available
            if self.word_list is None:
                return []
            
            # Filter by length if specified
            max_word_length = max_length if max_length and max_length > 0 else getattr(config, 'DEFINITION_SEARCH_MAX_LENGTH', 15)
            all_candidates = [w for w in self.word_list if 3 <= len(w) <= max_word_length]
            
            # Sample diverse words across different lengths
            import random
            # Group by length
            words_by_length = {}
            for word in all_candidates:
                length = len(word)
                if length not in words_by_length:
                    words_by_length[length] = []
                words_by_length[length].append(word)
            
            # Sample from each length group
            candidate_words = []
            words_per_length = (config.MAX_CANDIDATES * 10) // max(len(words_by_length), 1)
            for length_group in words_by_length.values():
                sample = random.sample(length_group, min(words_per_length, len(length_group)))
                candidate_words.extend(sample)
            
            # If still not enough, add random words
            if len(candidate_words) < config.MAX_CANDIDATES * 10:
                remaining = (config.MAX_CANDIDATES * 10) - len(candidate_words)
                additional = random.sample(all_candidates, min(remaining, len(all_candidates)))
                candidate_words.extend(additional)
        
        # Score each word against the clue
        for word in candidate_words:
            if not self.clue_analyzer.has_vector(word):
                continue
            similarity, best_segment, definicion = self.clue_analyzer.calculate_similarity(clue, word)
            
            # Boost score if clue word appears in definition
            boost = 0.0
            if definicion:
                definicion_lower = definicion.lower()
                for clue_word in clue.split():
                    if len(clue_word) >= 3 and clue_word in definicion_lower:
                        boost += 0.2  # Significant boost for direct matches
                        break
            
            # Boost score if word contains clue or vice versa
            if clue in word.lower() or word.lower() in clue:
                boost += 0.15
            
            final_score = similarity + boost
            results.append((word, final_score, best_segment, definicion, None, 'definition_search'))
        
        # Sort by similarity score
        results.sort(key=lambda x: x[1], reverse=True)
        
        # Limit to top N results
        results = results[:config.MAX_CANDIDATES]
        
        # Fetch web context for top results if enabled
        if config.ENABLE_WEB_SEARCHES:
            top_n = min(config.WEB_SEARCH_TOP_N, len(results))
            for i in range(top_n):
                word, similarity, best_segment, definicion, _, fuente = results[i]
                context = self.clue_analyzer.get_web_context(clue, word)
                results[i] = (word, similarity, best_segment, definicion, context, fuente)
        
        return results
    
    def __del__(self):
        """Clean up database connection."""
        if self.db_manager:
            self.db_manager.close()

    def solve_entries(self, entries: List[Entry]) -> Dict[str, List[Tuple[str, float, str, str, Dict, str]]]:
        results = {}
        for entry in entries:
            results[entry.pattern] = self.solve_entry(entry)
        return results

def get_user_input() -> Entry:
    print("\nIngrese los datos del crucigrama:")
    clue = input("Pista (definición): ").strip()
    pattern = input("Patrón (use _ para letras faltantes, ej: _a__n): ").strip()
    return Entry(clue, pattern)

def print_context(context: Dict):
    if context["wikipedia"]:
        print("\nWikipedia:")
        print(f"- {context['wikipedia']}")
    if context["rae"]["definitions"]:
        print("\nDefiniciones RAE:")
        for defn in context["rae"]["definitions"]:
            print(f"- {defn}")
        print(f"URL: {context['rae']['url']}")
    if context["wordreference"]["examples"]:
        print("\nEjemplos WordReference:")
        for example in context["wordreference"]["examples"]:
            print(f"- {example}")
        print(f"URL: {context['wordreference']['url']}")
    if context["linguee"]["examples"]:
        print("\nEjemplos Linguee:")
        for example in context["linguee"]["examples"]:
            print(f"- {example}")
        print(f"URL: {context['linguee']['url']}")

def main():
    solver = CrosswordSolver()
    while True:
        try:
            entry = get_user_input()
            print("\nBuscando resultados...")
            results = solver.solve_entries([entry])
            print("\nResultados encontrados:")
            for pattern, matches in results.items():
                print(f"\nPatrón: {pattern}")
                if not matches:
                    print("No se encontraron coincidencias relevantes.")
                for word, score, best_segment, definicion, context, fuente in matches[:5]:
                    print(f"\nPalabra: {word} (fuente: {fuente})")
                    print(f"Puntuación de similitud: {score:.3f}")
                    print(f"Mejor coincidencia con segmento: '{best_segment}'")
                    if definicion:
                        print(f"Definición: {definicion}")
                    print("\nContexto:")
                    if context is not None and any([
                        context.get("wikipedia"),
                        context.get("rae", {}).get("definitions"),
                        context.get("wordreference", {}).get("examples"),
                        context.get("linguee", {}).get("examples")
                    ]):
                        print_context(context)
                    else:
                        print("Sin contexto relevante encontrado.")
            continue_solving = input("\n¿Desea resolver otro crucigrama? (s/n): ").lower()
            if continue_solving != 's':
                break
        except KeyboardInterrupt:
            print("\nPrograma terminado por el usuario.")
            break
        except Exception as e:
            print(f"\nError: {e}")
            continue

if __name__ == "__main__":
    main() 