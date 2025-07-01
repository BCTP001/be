import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any
import json
from sklearn.metrics.pairwise import cosine_similarity
import re

class ModernBookRetrieval:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize the book retrieval system with modern embeddings and vector DB
        
        Args:
            model_name: SentenceTransformer model name for embeddings
        """
        # Use a more powerful model for better semantic understanding
        self.embedding_model = SentenceTransformer(model_name)
        
        # Initialize ChromaDB for vector storage
        self.chroma_client = chromadb.Client(Settings(
            chroma_db_impl="duckdb+parquet",
            persist_directory="./chroma_db"
        ))
        
        # Create collection for books
        try:
            self.collection = self.chroma_client.get_collection("books")
        except:
            self.collection = self.chroma_client.create_collection(
                name="books",
                metadata={"hnsw:space": "cosine"}  # Use cosine similarity
            )
    
    def preprocess_text(self, text: str) -> str:
        """Clean and preprocess text for better embeddings"""
        if pd.isna(text) or text is None:
            return ""
        
        # Remove extra whitespace and normalize
        text = re.sub(r'\s+', ' ', str(text).strip())
        return text
    
    def create_searchable_content(self, title: str, description: str, category: str) -> str:
        """
        Combine book fields into optimized searchable content
        Weights important fields for better retrieval
        """
        title = self.preprocess_text(title)
        description = self.preprocess_text(description)
        category = self.preprocess_text(category)
        
        # Weight title and category more heavily for search relevance
        searchable_content = f"{title} {title} {category} {category} {description}"
        return searchable_content
    
    def add_books(self, books_df: pd.DataFrame):
        """
        Add books to the vector database
        
        Args:
            books_df: DataFrame with columns 'title', 'description', 'categoryname'
        """
        print(f"Processing {len(books_df)} books...")
        
        # Prepare data for embedding
        searchable_texts = []
        metadatas = []
        ids = []
        
        for idx, row in books_df.iterrows():
            # Create searchable content
            searchable_content = self.create_searchable_content(
                row.get('title', ''),
                row.get('description', ''),
                row.get('categoryname', '')
            )
            
            searchable_texts.append(searchable_content)
            
            # Prepare metadata
            metadata = {
                'title': str(row.get('title', '')),
                'description': str(row.get('description', ''))[:500],  # Truncate long descriptions
                'category': str(row.get('categoryname', '')),
                'original_index': int(idx)
            }
            metadatas.append(metadata)
            ids.append(f"book_{idx}")
        
        # Generate embeddings in batches for efficiency
        print("Generating embeddings...")
        batch_size = 32
        all_embeddings = []
        
        for i in range(0, len(searchable_texts), batch_size):
            batch = searchable_texts[i:i + batch_size]
            batch_embeddings = self.embedding_model.encode(
                batch,
                convert_to_numpy=True,
                show_progress_bar=True
            )
            all_embeddings.extend(batch_embeddings.tolist())
        
        # Add to ChromaDB
        print("Adding to vector database...")
        self.collection.add(
            embeddings=all_embeddings,
            metadatas=metadatas,
            documents=searchable_texts,
            ids=ids
        )
        
        print(f"Successfully added {len(books_df)} books to the database!")
    
    def search_books(self, 
                    query: str, 
                    n_results: int = 10,
                    category_filter: str = None) -> List[Dict[str, Any]]:
        """
        Search for books using semantic similarity
        
        Args:
            query: Search query
            n_results: Number of results to return
            category_filter: Optional category to filter by
            
        Returns:
            List of book results with similarity scores
        """
        # Generate query embedding
        query_embedding = self.embedding_model.encode([query], convert_to_numpy=True)[0]
        
        # Prepare where clause for filtering
        where_clause = None
        if category_filter:
            where_clause = {"category": {"$eq": category_filter}}
        
        # Search in ChromaDB
        results = self.collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=n_results,
            where=where_clause,
            include=['metadatas', 'distances', 'documents']
        )
        
        # Format results
        formatted_results = []
        for i, (metadata, distance, document) in enumerate(
            zip(results['metadatas'][0], results['distances'][0], results['documents'][0])
        ):
            # Convert distance to similarity score (ChromaDB uses cosine distance)
            similarity_score = 1 - distance
            
            result = {
                'rank': i + 1,
                'title': metadata['title'],
                'description': metadata['description'],
                'category': metadata['category'],
                'similarity_score': round(similarity_score, 4),
                'confidence': self._get_confidence_level(similarity_score)
            }
            formatted_results.append(result)
        
        return formatted_results
    
    def _get_confidence_level(self, similarity_score: float) -> str:
        """Provide human-readable confidence levels"""
        if similarity_score >= 0.85:
            return "Very High"
        elif similarity_score >= 0.7:
            return "High"
        elif similarity_score >= 0.5:
            return "Medium"
        elif similarity_score >= 0.3:
            return "Low"
        else:
            return "Very Low"
    
    def get_category_suggestions(self, query: str, top_k: int = 5) -> List[str]:
        """Get category suggestions based on query"""
        # Search across all books and extract categories
        results = self.search_books(query, n_results=50)
        
        # Count category frequencies
        category_counts = {}
        for result in results:
            category = result['category']
            if category not in category_counts:
                category_counts[category] = 0
            category_counts[category] += result['similarity_score']
        
        # Sort by weighted frequency
        sorted_categories = sorted(
            category_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return [cat[0] for cat in sorted_categories[:top_k]]
    
    def hybrid_search(self, 
                     query: str, 
                     n_results: int = 10,
                     semantic_weight: float = 0.7) -> List[Dict[str, Any]]:
        """
        Hybrid search combining semantic and keyword-based retrieval
        
        Args:
            query: Search query
            n_results: Number of results to return
            semantic_weight: Weight for semantic search (1-semantic_weight for keyword)
        """
        # Get semantic results
        semantic_results = self.search_books(query, n_results=n_results * 2)
        
        # Simple keyword scoring
        query_terms = set(query.lower().split())
        
        # Re-score results with hybrid approach
        hybrid_results = []
        for result in semantic_results:
            # Keyword score based on term overlap
            title_terms = set(result['title'].lower().split())
            desc_terms = set(result['description'].lower().split())
            cat_terms = set(result['category'].lower().split())
            
            all_terms = title_terms | desc_terms | cat_terms
            keyword_score = len(query_terms & all_terms) / len(query_terms) if query_terms else 0
            
            # Combine scores
            hybrid_score = (
                semantic_weight * result['similarity_score'] + 
                (1 - semantic_weight) * keyword_score
            )
            
            result['hybrid_score'] = round(hybrid_score, 4)
            result['keyword_score'] = round(keyword_score, 4)
            hybrid_results.append(result)
        
        # Sort by hybrid score
        hybrid_results.sort(key=lambda x: x['hybrid_score'], reverse=True)
        
        return hybrid_results[:n_results]


# Example usage and testing
def demo_book_retrieval():
    """Demonstrate the book retrieval system"""
    
    # Create sample book data
    sample_books = pd.DataFrame({
        'title': [
            'The Great Gatsby',
            'To Kill a Mockingbird',
            'Python Programming for Beginners',
            'Machine Learning Fundamentals',
            'The Art of War',
            'Cooking Basics',
            'Advanced JavaScript',
            'History of Ancient Rome',
            'Quantum Physics Made Simple',
            'Gardening for Dummies'
        ],
        'description': [
            'A classic American novel about the Jazz Age and the American Dream',
            'A gripping tale of racial injustice in the American South',
            'Learn Python programming from scratch with practical examples',
            'Comprehensive guide to machine learning algorithms and applications',
            'Ancient Chinese military treatise on strategy and tactics',
            'Essential cooking techniques and recipes for beginners',
            'Advanced JavaScript concepts including closures and async programming',
            'Comprehensive overview of Roman civilization and empire',
            'Introduction to quantum mechanics for non-physicists',
            'Complete guide to home gardening and plant care'
        ],
        'categoryname': [
            'Classic Literature',
            'Classic Literature', 
            'Programming',
            'Technology',
            'Philosophy',
            'Cooking',
            'Programming',
            'History',
            'Science',
            'Gardening'
        ]
    })
    
    # Initialize retrieval system
    print("Initializing Modern Book Retrieval System...")
    retrieval = ModernBookRetrieval()
    
    # Add books to the system
    retrieval.add_books(sample_books)
    
    # Test different types of searches
    test_queries = [
        "programming python coding",
        "american literature classic",
        "cooking food recipes",
        "ancient military strategy",
        "science physics quantum"
    ]
    
    print("\n" + "="*50)
    print("TESTING BOOK RETRIEVAL SYSTEM")
    print("="*50)
    
    for query in test_queries:
        print(f"\nSearch Query: '{query}'")
        print("-" * 30)
        
        # Regular semantic search
        results = retrieval.search_books(query, n_results=3)
        
        for result in results:
            print(f"📚 {result['title']} (Score: {result['similarity_score']})")
            print(f"   Category: {result['category']}")
            print(f"   Confidence: {result['confidence']}")
            print()
        
        # Category suggestions
        categories = retrieval.get_category_suggestions(query, top_k=3)
        print(f"Suggested Categories: {', '.join(categories)}")
        print()

if __name__ == "__main__":
    demo_book_retrieval()