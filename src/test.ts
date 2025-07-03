import { readFileSync, existsSync } from 'fs';
import { CohereClient } from 'cohere-ai';
import { Index } from 'faiss-node';

const FAISS_INDEX_FILE_PATH = 'docker/init-data/AI/book_faiss_index.bin';
const BOOK_DATA_FILE_PATH = 'docker/init-data/AI/book_data.json';
const COHERE_API_KEY = process.env.COHERE_API_KEY;
const COHERE_EMBEDDING_MODEL = "embed-multilingual-v3.0";

interface BookData {
  title: string;
  description: string;
  categoryname: string;
}

interface SearchResult {
  title: string;
  description: string;
  category: string;
  similarity_score: number;
}

let coClient: CohereClient | null = null;
let faissIndex: Index | null = null;
let bookData: BookData[] = [];

export async function initializeApp(): Promise<void> {
  if (!COHERE_API_KEY) {
    throw new Error("Cohere API key not set in environment variables.");
  }
  coClient = new CohereClient({ token: COHERE_API_KEY });

  if (!existsSync(FAISS_INDEX_FILE_PATH)) {
    throw new Error(`FAISS index file not found at ${FAISS_INDEX_FILE_PATH}`);
  }
  const indexBuffer = readFileSync(FAISS_INDEX_FILE_PATH);
  faissIndex = Index.fromBuffer(indexBuffer);

  if (!existsSync(BOOK_DATA_FILE_PATH)) {
    throw new Error(`Book data file not found at ${BOOK_DATA_FILE_PATH}`);
  }
  const rawData = readFileSync(BOOK_DATA_FILE_PATH, 'utf-8');
  bookData = JSON.parse(rawData);
}

async function getEmbedding(text: string): Promise<number[]> {
  if (!coClient) {
    throw new Error("Cohere client is not initialized.");
  }
  if (!text.trim()) {
    throw new Error("Input text cannot be empty.");
  }

  const response = await coClient.embed({
    texts: [text],
    model: COHERE_EMBEDDING_MODEL,
    inputType: "search_query",
    embeddingTypes: ["float"]
  });

  // Validate response structure & return embedding vector
  if (!response.embeddings || !('float' in response.embeddings)) {
    throw new Error("Unexpected embedding response from Cohere.");
  }

  return (response.embeddings as any).float[0];
}

/**
 * Query the FAISS index and return top matching books.
 * @param query Search query string
 * @param top_n Number of results to return (default 5)
 * @returns Array of search results with similarity scores
 */
export async function queryBooks(query: string, top_n = 5): Promise<SearchResult[]> {
  if (!faissIndex) {
    throw new Error("FAISS index not initialized. Call initializeApp() first.");
  }
  if (!query.trim()) {
    throw new Error("Query cannot be empty.");
  }

  const embedding = await getEmbedding(query);
  const queryVector = Array.from(embedding);

  const k = Math.min(top_n, faissIndex.ntotal());
  const results = faissIndex.search(queryVector, k);

  const searchResults: SearchResult[] = [];
  for (let i = 0; i < results.labels.length; i++) {
    const idx = results.labels[i];
    const score = results.distances[i];

    if (idx === -1 || idx >= bookData.length) continue;

    const book = bookData[idx];
    searchResults.push({
      title: book.title,
      description: book.description,
      category: book.categoryname,
      similarity_score: score,
    });
  }
  return searchResults;
}