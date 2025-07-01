from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
from sentence_transformers import SentenceTransformer
import os
import uvicorn
import faiss # Import FAISS

# --- Configuration ---
FAISS_INDEX_FILE_PATH = 'book_faiss_index.bin'
BOOK_DATA_FILE_PATH = 'book_data.parquet'
MODEL_NAME = 'all-mpnet-base-v2'
TOP_N_RESULTS = 5

# --- Global Variables (Loaded on startup) ---
app = FastAPI(
    title="Book Recommendation AI (FAISS)",
    description="API to find books most related to a given query using FAISS for fast similarity search.",
    version="1.0.0"
)
model: SentenceTransformer = None
faiss_index: faiss.Index = None # Declare FAISS index
booktemp_df: pd.DataFrame = None

# --- Pydantic Model for Request Body ---
class QueryRequest(BaseModel):
    query: str
    top_n: int = TOP_N_RESULTS

# --- Startup Event: Load Model, FAISS Index, and Book Data ---
@app.on_event("startup")
async def startup_event():
    global model, faiss_index, booktemp_df
    print("Starting up FastAPI application with FAISS...")

    # 1. Load Sentence Transformer Model
    print(f"Loading Sentence Transformer model: {MODEL_NAME}...")
    try:
        model = SentenceTransformer(MODEL_NAME)
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model '{MODEL_NAME}': {e}")
        print("Please ensure you have an internet connection or the model is cached locally.")
        raise HTTPException(status_code=500, detail="Failed to load AI model.")

    # 2. Load FAISS Index
    print(f"Loading FAISS index from {FAISS_INDEX_FILE_PATH}...")
    if not os.path.exists(FAISS_INDEX_FILE_PATH):
        print(f"Error: FAISS index file not found at {FAISS_INDEX_FILE_PATH}.")
        print("Please run 'prepare_embeddings.py' first to generate and save the index.")
        raise HTTPException(status_code=500, detail="FAISS index not found. Run preparation script.")
    try:
        faiss_index = faiss.read_index(FAISS_INDEX_FILE_PATH)
        print(f"FAISS index loaded with {faiss_index.ntotal} vectors.")
    except Exception as e:
        print(f"Error loading FAISS index: {e}")
        raise HTTPException(status_code=500, detail="Failed to load FAISS index.")

    # 3. Load Book Data DataFrame
    print(f"Loading book data from {BOOK_DATA_FILE_PATH}...")
    if not os.path.exists(BOOK_DATA_FILE_PATH):
        print(f"Error: Book data file not found at {BOOK_DATA_FILE_PATH}.")
        print("Please run 'prepare_embeddings.py' first to save book data.")
        raise HTTPException(status_code=500, detail="Book data not found. Run preparation script.")
    try:
        booktemp_df = pd.read_parquet(BOOK_DATA_FILE_PATH)
        print(f"Book data loaded. Shape: {booktemp_df.shape}")
    except Exception as e:
        print(f"Error loading book data: {e}")
        raise HTTPException(status_code=500, detail="Failed to load book data.")

    print("FastAPI application startup complete.")

# --- API Endpoint: Get Related Books ---
@app.post("/query")
async def get_related_books(request: QueryRequest):
    """
    Finds the most related books based on the provided query using FAISS for fast search.
    """
    if not request.query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    if request.top_n <= 0:
        raise HTTPException(status_code=400, detail="top_n must be a positive integer.")

    print(f"Received query: '{request.query}' (top_n: {request.top_n})")

    try:
        # Encode the query and normalize it for FAISS
        query_embedding = model.encode(request.query, convert_to_tensor=True, normalize_embeddings=True)
        query_embedding_np = query_embedding.cpu().numpy().reshape(1, -1) # Reshape for FAISS search

        # Perform search using FAISS
        # D is distances/scores, I is indices
        # FAISS returns distances (inner product in this case) and indices
        # For IndexFlatIP, higher inner product means higher similarity.
        distances, indices = faiss_index.search(query_embedding_np, k=min(request.top_n, faiss_index.ntotal))

        results = []
        # Iterate through the results from FAISS
        for i in range(len(indices[0])):
            idx = indices[0][i] # Get the original index of the book
            score = distances[0][i] # Get the similarity score (inner product)

            if idx == -1: # FAISS returns -1 if not enough results are found
                continue

            results.append({
                'title': booktemp_df.loc[idx, 'title'],
                'description': booktemp_df.loc[idx, 'description'],
                'category': booktemp_df.loc[idx, 'categoryname'],
                'similarity_score': float(score) # Ensure score is a standard float
            })

        return {"query": request.query, "results": results}

    except Exception as e:
        print(f"Error processing query: {e}")
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {e}")

# --- Main entry point for Uvicorn (if running directly) ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
