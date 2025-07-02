from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
import pandas as pd
import os
import uvicorn
import faiss # Import FAISS
import cohere # Import Cohere library
import numpy as np # Import numpy for array conversion

# --- Configuration ---
FAISS_INDEX_FILE_PATH = 'book_faiss_index.bin'
BOOK_DATA_FILE_PATH = 'book_data.parquet'
TOP_N_RESULTS = 5

# Cohere Configuration
# It's crucial to set this environment variable before running the application.
# Example (Linux/macOS): export COHERE_API_KEY='YOUR_COHERE_API_KEY_HERE'
# Example (Windows CMD): set COHERE_API_KEY=YOUR_COHERE_API_KEY_HERE
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
# This model must match the one used in prepare_embeddings.py
COHERE_EMBEDDING_MODEL = "embed-multilingual-v3.0"

# --- Global Variables (Loaded on startup) ---
app = FastAPI(
    title="Book Recommendation AI (FAISS with Cohere Multilingual Embeddings)",
    description="API to find books most related to a given query using FAISS for fast similarity search and Cohere's multilingual model for embeddings, optimized for Korean.",
    version="1.0.0"
)
co_client: cohere.Client = None # Declare Cohere client
faiss_index: faiss.Index = None
booktemp_df: pd.DataFrame = None

# --- Pydantic Model for Request Body ---
class QueryRequest(BaseModel):
    query: str
    top_n: int = TOP_N_RESULTS

# --- Helper function for Cohere Embedding (for queries) ---
async def get_cohere_embedding_for_query(text: str, model_name: str = COHERE_EMBEDDING_MODEL):
    """
    Generates a single embedding vector for a given text query using Cohere's multilingual model.
    """
    if not text.strip():
        raise ValueError("Input text for embedding cannot be empty.")

    try:
        # Cohere's embed endpoint expects 'texts' as a list of strings
        # 'search_query' is critical for optimizing query embeddings against document embeddings.
        response = co_client.embed(
            texts=[text], # Wrap the single text in a list
            model=model_name,
            input_type="search_query", # Specify input_type as "search_query" for queries
            embedding_types=["float"] # Request float embeddings
        )
        # Cohere's response object has a .embeddings attribute which is a list of lists (float vectors)
        # We asked for one text, so we expect one embedding list.
        return np.array(response.embeddings.float[0])

    except Exception as e:
        print(f"Error generating Cohere embedding for query '{text}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate embedding for query: {e}"
        )

# --- Startup Event: Load FAISS Index and Book Data ---
@app.on_event("startup")
async def startup_event():
    global co_client, faiss_index, booktemp_df

    print("Starting up FastAPI application with FAISS and Cohere Multilingual...")

    # 1. Configure Cohere Client
    if not COHERE_API_KEY:
        print("Error: COHERE_API_KEY environment variable not set.")
        print("Please set your Cohere API key (from cohere.com) before running the script.")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Cohere API Key not configured.")
    try:
        co_client = cohere.Client(COHERE_API_KEY)
        print("Cohere client configured successfully.")
    except Exception as e:
        print(f"Error configuring Cohere client: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to configure Cohere client.")

    # 2. Load FAISS Index
    print(f"Loading FAISS index from {FAISS_INDEX_FILE_PATH}...")
    if not os.path.exists(FAISS_INDEX_FILE_PATH):
        print(f"Error: FAISS index file not found at {FAISS_INDEX_FILE_PATH}.")
        print("Please run the data preparation script (e.g., 'prepare_embeddings.py') first to generate and save the index.")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="FAISS index not found. Run preparation script.")
    try:
        faiss_index = faiss.read_index(FAISS_INDEX_FILE_PATH)
        print(f"FAISS index loaded with {faiss_index.ntotal} vectors.")
    except Exception as e:
        print(f"Error loading FAISS index: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to load FAISS index.")

    # 3. Load Book Data DataFrame
    print(f"Loading book data from {BOOK_DATA_FILE_PATH}...")
    if not os.path.exists(BOOK_DATA_FILE_PATH):
        print(f"Error: Book data file not found at {BOOK_DATA_FILE_PATH}.")
        print("Please run the data preparation script (e.g., 'prepare_embeddings.py') first to save book data.")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Book data not found. Run preparation script.")
    try:
        booktemp_df = pd.read_parquet(BOOK_DATA_FILE_PATH)
        print(f"Book data loaded. Shape: {booktemp_df.shape}")
    except Exception as e:
        print(f"Error loading book data: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to load book data.")

    print("FastAPI application startup complete.")

# --- API Endpoint: Get Related Books ---
@app.post("/query")
async def get_related_books(request: QueryRequest):
    """
    Finds the most related books based on the provided query using FAISS for fast similarity search
    and Cohere's multilingual model for embedding the query.
    """
    if not request.query.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Query cannot be empty.")

    if request.top_n <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="top_n must be a positive integer.")

    print(f"Received query: '{request.query}' (top_n: {request.top_n})")

    try:
        # Generate embedding for the query using Cohere's multilingual model
        query_embedding_np = await get_cohere_embedding_for_query(request.query)
        query_embedding_np = query_embedding_np.reshape(1, -1) # Reshape for FAISS search

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

            # Ensure the index is valid (FAISS returns -1 for unfilled results or out-of-bounds)
            if idx == -1 or idx >= len(booktemp_df):
                continue

            results.append({
                'title': booktemp_df.iloc[idx]['title'], # Use .iloc for integer-location based indexing
                'description': booktemp_df.iloc[idx]['description'],
                'category': booktemp_df.iloc[idx]['categoryname'],
                'similarity_score': float(score) # Ensure score is a standard float
            })

        return {"query": request.query, "results": results}

    except HTTPException as e:
        # Re-raise HTTPExceptions directly
        raise e
    except Exception as e:
        print(f"Error processing query: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An internal error occurred: {e}")

# --- Main entry point for Uvicorn (if running directly) ---
if __name__ == "__main__":
    # Ensure the COHERE_API_KEY is set in your environment
    if not COHERE_API_KEY:
        print("CRITICAL ERROR: COHERE_API_KEY environment variable is not set.")
        print("Please set it before running the FastAPI application.")
        exit(1) # Exit if API key is missing

    # Uvicorn will automatically call the @app.on_event("startup") function
    uvicorn.run(app, host="0.0.0.0", port=8000) # You can change the port if 8000 is in use
