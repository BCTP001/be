# 📚 Book Recommendation API

A multilingual book recommendation engine using **Cohere** embeddings + **FAISS** + **FastAPI**.

---

## 📁 Project Structure

- `prepare_embeddings.py` — Creates FAISS index from book data  
- `main.py` — FastAPI application server  
- `booktemp.csv` — Source book data (title, description, category)  
- `book_faiss_index.bin` — Generated FAISS index file  
- `book_data.parquet` — Processed book data  
- `README.md` — This file  

---

## 🛠️ Install Dependencies

```bash
pip install pandas faiss-cpu cohere sentence-transformers torch fastapi uvicorn
```

🔑 Set Cohere API Key
```bash
export COHERE_API_KEY='your_cohere_api_key_here'
```

## ⚙️ Generate FAISS Index
```bash
python prepare_embeddings.py
```

## 🚀 Start the API Server
```bash
python main.py
```
