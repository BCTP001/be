import pandas as pd
import faiss
import os
import numpy as np
import cohere # Import Cohere library
import time # Import time for delays

# --- Configuration ---
CSV_FILE_PATH = '../booktemp.csv'
FAISS_INDEX_FILE_PATH = 'book_faiss_index.bin'
BOOK_DATA_FILE_PATH = 'book_data.json'

# Cohere Configuration
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
if not COHERE_API_KEY:
    print("Error: COHERE_API_KEY environment variable not set.")
    print("Please set your Cohere API key (from cohere.com) before running the script.")
    exit()

COHERE_EMBEDDING_MODEL = "embed-multilingual-v3.0"
BATCH_SIZE = 50 # Number of texts to send in each API call (Cohere limit is 96 for this model)
DELAY_BETWEEN_BATCHES = 0.5 # Delay in seconds between API calls to avoid rate limits

# --- Load Data ---
try:
    booktemp = pd.read_csv(CSV_FILE_PATH, sep=',', usecols=[1, 3, 5, 9, 11])
    booktemp.columns = ['title', 'description', 'categoryname', 'author', 'cover']
    print("Original DataFrame head:")
    print(booktemp.head())
    print("\nDataFrame info:")
    booktemp.info()
except FileNotFoundError:
    print(f"Error: The file '{CSV_FILE_PATH}' was not found.")
    print("Please make sure 'booktemp.csv' is in the same directory as your script.")
    exit()
except Exception as e:
    print(f"An error occurred while reading the CSV: {e}")
    exit()

# --- Preprocessing ---
booktemp['description'] = booktemp['description'].fillna('').astype(str).str.strip()
booktemp['title'] = booktemp['title'].fillna('').astype(str).str.strip()

booktemp['combined_text'] = booktemp['title'] + ". " + booktemp['description']
booktemp['combined_text'] = booktemp['combined_text'].str.strip()

# --- Filter out empty texts BEFORE sending to embedding model ---
non_empty_mask = booktemp['combined_text'].astype(bool)
filtered_booktemp = booktemp[non_empty_mask].copy()

print(f"\nOriginal number of books: {len(booktemp)}")
print(f"Number of books after filtering empty combined_text: {len(filtered_booktemp)}")

if len(filtered_booktemp) == 0:
    print("Error: No non-empty book descriptions found after filtering. Cannot generate embeddings.")
    exit()

# --- Diagnostic: Sample combined_text to check content ---
print("\n--- Sample of combined_text being embedded (first 5 non-empty entries) ---")
for i, text in enumerate(filtered_booktemp['combined_text'].head(5).tolist()):
    print(f"Entry {i+1}: '{text[:200]}...'")
print("------------------------------------------------------------------")

# --- Configure Cohere Client ---
print(f"\nConfiguring Cohere client with model: {COHERE_EMBEDDING_MODEL}...")
try:
    co = cohere.Client(COHERE_API_KEY)
    print("Cohere client configured successfully.")
except Exception as e:
    print(f"Error configuring Cohere client: {e}")
    exit()

# --- Generate Embeddings using Cohere with Batching and Delay ---
print("\nGenerating embeddings for book descriptions using Cohere with batching...")

def get_cohere_embeddings_batched(texts: list[str], model_name: str, batch_size: int, delay: float):
    all_embeddings = []
    total_texts = len(texts)
    for i in range(0, total_texts, batch_size):
        batch_texts = texts[i:i + batch_size]
        try:
            print(f"Processing batch {i // batch_size + 1}/{(total_texts + batch_size - 1) // batch_size} ({len(batch_texts)} texts)...")
            response = co.embed(
                texts=batch_texts,
                model=model_name,
                input_type="search_document",
                embedding_types=["float"]
            )
            all_embeddings.extend(response.embeddings.float)
            if i + batch_size < total_texts: # Don't delay after the last batch
                time.sleep(delay) # Pause to respect rate limits
        except Exception as e:
            print(f"An unexpected error occurred during embedding generation for batch {i // batch_size + 1}: {e}")
            return None
    return all_embeddings

try:
    corpus_embeddings_list = get_cohere_embeddings_batched(
        filtered_booktemp['combined_text'].tolist(),
        COHERE_EMBEDDING_MODEL,
        BATCH_SIZE,
        DELAY_BETWEEN_BATCHES
    )

    if corpus_embeddings_list is None or len(corpus_embeddings_list) == 0:
        print("Failed to generate embeddings or generated an empty list. Exiting.")
        exit()

    corpus_embeddings_np = np.array(corpus_embeddings_list)
    dimension = corpus_embeddings_np.shape[1]

    # --- Build FAISS Index ---
    print(f"Building FAISS index (dimension: {dimension})...")
    index = faiss.IndexFlatIP(dimension)
    index.add(corpus_embeddings_np)
    print(f"FAISS index built with {index.ntotal} vectors.")

    # --- Save FAISS Index and DataFrame ---
    filtered_booktemp.to_json('book_data.json', orient='records', force_ascii=False, indent=2)
    filtered_booktemp.to_parquet('book_data.parquet')
    faiss.write_index(index, FAISS_INDEX_FILE_PATH)
    print(f"FAISS index saved to {FAISS_INDEX_FILE_PATH}")
    print(f"Book data saved to {BOOK_DATA_FILE_PATH}")

except Exception as e:
    print(f"Error during embedding generation, FAISS index creation, or saving: {e}")
    exit()

print("\nEmbedding and FAISS index preparation complete. You can now run the FastAPI application.")
