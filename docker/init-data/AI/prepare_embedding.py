import pandas as pd
from sentence_transformers import SentenceTransformer, util
import faiss # Import FAISS

# --- Configuration ---
CSV_FILE_PATH = 'booktemp.csv'
FAISS_INDEX_FILE_PATH = 'book_faiss_index.bin' # File to save FAISS index
BOOK_DATA_FILE_PATH = 'book_data.parquet' # File to save DataFrame
MODEL_NAME = 'all-mpnet-base-v2'
# 'all-MiniLM-L6-v2'

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
print(f"\nLoading Sentence Transformer model: {MODEL_NAME}...")
try:
    model = SentenceTransformer(MODEL_NAME)
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model '{MODEL_NAME}': {e}")
    exit()

# --- Generate Embeddings ---
print("\nGenerating embeddings for book titles and descriptions...")
try:
    # Ensure embeddings are normalized for cosine similarity with FAISS IndexFlatIP or L2.
    # Sentence-transformers usually normalize by default, but it's good to be explicit.
    corpus_embeddings = model.encode(
        booktemp['combined_text'].tolist(),
        convert_to_tensor=True,
        show_progress_bar=True,
        normalize_embeddings=True # Explicitly normalize embeddings
    )
    print(f"Embeddings generated for {len(corpus_embeddings)} books.")

    # Convert embeddings to NumPy array for FAISS
    corpus_embeddings_np = corpus_embeddings.cpu().numpy()
    dimension = corpus_embeddings_np.shape[1] # Dimension of the embeddings

    # --- Build FAISS Index ---
    # We'll use IndexFlatIP for Inner Product similarity, which is equivalent to
    # cosine similarity if vectors are normalized (which we did above).
    # For very large datasets (millions+), consider IndexIVFFlat for approximate search.
    print(f"Building FAISS index (dimension: {dimension})...")
    index = faiss.IndexFlatIP(dimension) # Inner Product index
    # If you prefer L2 distance (Euclidean), use:
    # index = faiss.IndexFlatL2(dimension)

    index.add(corpus_embeddings_np) # Add embeddings to the index
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
