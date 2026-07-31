# 📄 Chat with PDF — RAG Backend

A Node.js backend that lets users upload a PDF and ask questions about its content using **RAG (Retrieval-Augmented Generation)**.

## How it works
Document Processing: PDF Upload -> Extract Text -> Chunking -> Generate Embeddings for Chunks
User Query: User Question -> Generate Embedding
Vector Comparison: Compare: Question Vector vs. Chunk Vectors
Context Retrieval: Best Matching Chunk Found
Generation: Send Best Chunk to Gemini -> Gemini Generates Answer