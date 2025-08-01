import { GraphQLError } from "graphql";
import { Resolvers } from "@generated";
import { Index } from "faiss-node";
import { CohereClient } from "cohere-ai";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { GQL } from "@interface/graphql";
const FAISS_INDEX_FILE_PATH = path.resolve(
  __dirname,
  "../../docker/init-data/AI/book_faiss_index.bin",
);
const BOOK_DATA_FILE_PATH = path.resolve(
  __dirname,
  "../../docker/init-data/AI/book_data.json",
);
// const FAISS_INDEX_FILE_PATH = readFileSync(
//   path.resolve(__dirname, "../../docker/init-data/AI/book_faiss_index.bin"),
//   {
//     encoding: "utf-8",
//   },
// );
// const BOOK_DATA_FILE_PATH = readFileSync(
//   path.resolve(__dirname, "../../docker/init-data/AI/book_data.json"),
//   {
//     encoding: "utf-8",
//   },
// );
const COHERE_API_KEY = process.env.COHERE_API_KEY;
const COHERE_EMBEDDING_MODEL = "embed-multilingual-v3.0";

const indexBuffer = readFileSync(FAISS_INDEX_FILE_PATH);
const faissIndex: Index | null = Index.fromBuffer(indexBuffer);
const coClient: CohereClient | null = new CohereClient({
  token: COHERE_API_KEY,
});
const rawData = readFileSync(BOOK_DATA_FILE_PATH, "utf-8");
export interface BookData {
  title: string;
  description: string;
  categoryname: string;
  cover: string;
  author: string;
}
const bookData: BookData[] = JSON.parse(rawData);

export async function initializeApp(): Promise<void> {
  if (!COHERE_API_KEY) {
    throw new Error("Cohere API key not set in environment variables.");
  }

  if (!existsSync(FAISS_INDEX_FILE_PATH)) {
    throw new Error(`FAISS index file not found at ${FAISS_INDEX_FILE_PATH}`);
  }

  if (!existsSync(BOOK_DATA_FILE_PATH)) {
    throw new Error(`Book data file not found at ${BOOK_DATA_FILE_PATH}`);
  }
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
    embeddingTypes: ["float"],
  });

  // Validate response structure & return embedding vector
  if (!response.embeddings || !("float" in response.embeddings)) {
    throw new Error("Unexpected embedding response from Cohere.");
  }

  return response.embeddings.float[0];
}

export const aiRecommendationResolvers: Resolvers = {
  Query: {
    async recommendBooks(_, { request }) {
      try {
        await initializeApp();
        if (!faissIndex) {
          throw new Error(
            "FAISS index not initialized. Call initializeApp() first.",
          );
        }
        if (!request.keyword.trim()) {
          throw new Error("Query cannot be empty.");
        }

        const embedding = await getEmbedding(request.keyword);
        const queryVector = Array.from(embedding);

        const k = Math.min(request.top_n, faissIndex.ntotal());
        const results = faissIndex.search(queryVector, k);

        const searchResults: GQL.RecommendBookInfo[] = [];
        for (let i = 0; i < results.labels.length; i++) {
          const idx = results.labels[i];

          if (idx === -1 || idx >= bookData.length) continue;

          const book = bookData[idx];
          searchResults.push({
            title: book.title,
            description: book.description,
            category: book.categoryname,
            cover: book.cover,
            author: book.author,
          });
        }
        return searchResults;
      } catch (err) {
        console.log(err);
        throw new GraphQLError(err);
      }
    },
  },
};
