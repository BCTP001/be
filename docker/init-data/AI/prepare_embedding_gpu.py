import pandas as pd
from sentence_transformers import SentenceTransformer, util
import torch
import os
import faiss

# --- Configuration ---
CSV_FILE_PATH = 'booktemp.csv'
FAISS_INDEX_FILE_PATH = 'book_faiss_index.bin'
BOOK_DATA_FILE_PATH = 'book_data.parquet'
MODEL_NAME = 'all-mpnet-base-v2'

# --- Determine Device ---
# This will automatically use 'cuda' if a GPU is available, otherwise 'cpu'
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"Using device: {device}")

# --- Load Data ---
try:
    booktemp = pd.read_csv(CSV_FILE_PATH, sep=',', usecols=[1, 5, 11])
    booktemp.columns = ['title', 'description', 'categoryname']
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
booktemp['description'] = booktemp['description'].fillna('')
booktemp['title'] = booktemp['title'].fillna('')
booktemp['combined_text'] = booktemp['title'] + ". " + booktemp['title'] + ". " + booktemp['description']

# --- Model Loading ---
print(f"\nLoading Sentence Transformer model: {MODEL_NAME} to {device}...")
try:
    # --- CHANGED: Pass device to the model ---
    model = SentenceTransformer(MODEL_NAME, device=device)
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model '{MODEL_NAME}': {e}")
    print("Please ensure you have an internet connection or the model is cached locally.")
    print("You might need to install sentence-transformers: pip install sentence-transformers")
    exit()

# --- Generate Embeddings ---
print("\nGenerating embeddings for book titles and descriptions...")
try:
    corpus_embeddings = model.encode(
        booktemp['combined_text'].tolist(),
        convert_to_tensor=True,
        show_progress_bar=True,
        normalize_embeddings=True,
        batch_size=32, # Consider increasing this if you have more GPU memory
        # --- CHANGED: Pass device to encode method (though model already has it) ---
        device=device
    )
    print(f"Embeddings generated for {len(corpus_embeddings)} books.")

    # Convert embeddings to NumPy array for FAISS
    # Ensure it's on CPU before converting to NumPy if it was on GPU
    corpus_embeddings_np = corpus_embeddings.cpu().numpy()
    dimension = corpus_embeddings_np.shape[1]

    # --- Build FAISS Index ---
    print(f"Building FAISS index (dimension: {dimension})...")
    index = faiss.IndexFlatIP(dimension)
    index.add(corpus_embeddings_np)
    print(f"FAISS index built with {index.ntotal} vectors.")

    # --- Save FAISS Index and DataFrame ---
    faiss.write_index(index, FAISS_INDEX_FILE_PATH)
    booktemp.to_parquet(BOOK_DATA_FILE_PATH)
    print(f"FAISS index saved to {FAISS_INDEX_FILE_PATH}")
    print(f"Book data saved to {BOOK_DATA_FILE_PATH}")

except Exception as e:
    print(f"Error during embedding generation, FAISS index creation, or saving: {e}")
    exit()

print("\nEmbedding and FAISS index preparation complete. You can now run the FastAPI application.")
