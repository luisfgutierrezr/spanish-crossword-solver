import re
from typing import List, Dict, Tuple
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

MAX_CANDIDATES = 20  # máximo de palabras a analizar por patrón

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
    def search(pattern: str, max_results: int = MAX_CANDIDATES) -> List[str]:
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

class WordMatcher:
    def __init__(self, word_list: List[str]):
        self.word_list = word_list

    def match_pattern(self, pattern: str) -> List[str]:
        regex_pattern = pattern.replace('_', '.')
        regex = re.compile(f'^{regex_pattern}$')
        matches = [word for word in self.word_list if regex.match(word) and len(word) > 2 and word.isalpha()]
        return matches[:MAX_CANDIDATES]  # limitar candidatos

class ClueAnalyzer:
    def __init__(self):
        self.nlp = spacy.load('es_core_news_md')
        self.web_searcher = WebSearcher()
        self.rae_dict = self.load_rae_definitions('diccionario_rae')
        self.def_dict = self.load_definitions_csv('spanish_dictionary.csv')

    def load_rae_definitions(self, rae_dir):
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

    def has_vector(self, word: str) -> bool:
        token = self.nlp.vocab[word]
        return token.has_vector and token.vector_norm > 0

    def get_best_definition(self, word: str):
        # Prioridad: RAE > CSV > None
        if word in self.rae_dict:
            return self.rae_dict[word]
        elif word in self.def_dict:
            return self.def_dict[word]
        else:
            return None

    def calculate_similarity(self, clue: str, word: str) -> tuple:
        definicion = self.get_best_definition(word)
        clue_segments = [seg.strip() for seg in clue.split(',') if seg.strip()]
        if not clue_segments:
            clue_segments = [clue.strip()]
        best_score = 0.0
        best_segment = clue.strip()
        best_def = definicion if definicion else ''
        word_doc = self.nlp(word)
        if definicion:
            for segment in clue_segments:
                segment_doc = self.nlp(segment)
                def_doc = self.nlp(definicion)
                if not segment_doc.vector_norm or not def_doc.vector_norm:
                    continue
                score = segment_doc.similarity(def_doc)
                if score > best_score:
                    best_score = score
                    best_segment = segment
                    best_def = definicion
            clue_doc = self.nlp(clue)
            if clue_doc.vector_norm and def_doc.vector_norm:
                score = clue_doc.similarity(def_doc)
                if score > best_score:
                    best_score = score
                    best_segment = clue
                    best_def = definicion
        else:
            for segment in clue_segments:
                segment_doc = self.nlp(segment)
                if not segment_doc.vector_norm or not word_doc.vector_norm:
                    continue
                score = segment_doc.similarity(word_doc)
                if score > best_score:
                    best_score = score
                    best_segment = segment
            clue_doc = self.nlp(clue)
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
        if word_list_path and Path(word_list_path).exists():
            with open(word_list_path, 'r', encoding='latin-1') as f:
                self.word_list = [line.strip().lower() for line in f if line.strip()]
        else:
            nlp = spacy.load('es_core_news_md')
            self.word_list = [word.text.lower() for word in nlp.vocab if word.is_alpha]
        self.word_matcher = WordMatcher(self.word_list)
        self.clue_analyzer = ClueAnalyzer()

    def solve_entry(self, entry: Entry) -> list:
        pattern_matches = self.word_matcher.match_pattern(entry.pattern)
        if len(pattern_matches) == MAX_CANDIDATES:
            print(f"Advertencia: Se encontraron más de {MAX_CANDIDATES} coincidencias para el patrón. Solo se analizarán las primeras {MAX_CANDIDATES}.")
        results = []
        for word in pattern_matches:
            if not self.clue_analyzer.has_vector(word):
                continue
            similarity, best_segment, definicion = self.clue_analyzer.calculate_similarity(entry.clue, word)
            context = self.clue_analyzer.get_web_context(entry.clue, word)
            results.append((word, similarity, best_segment, definicion, context, 'local'))
        if not results:
            datamuse_words = DatamuseSearcher.search(entry.pattern)
            if len(datamuse_words) == MAX_CANDIDATES:
                print(f"Advertencia: Se encontraron más de {MAX_CANDIDATES} coincidencias en Datamuse. Solo se analizarán las primeras {MAX_CANDIDATES}.")
            for word in datamuse_words:
                if not self.clue_analyzer.has_vector(word):
                    continue
                similarity, best_segment, definicion = self.clue_analyzer.calculate_similarity(entry.clue, word)
                context = self.clue_analyzer.get_web_context(entry.clue, word)
                results.append((word, similarity, best_segment, definicion, context, 'datamuse'))
        results.sort(key=lambda x: x[1], reverse=True)
        return results

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