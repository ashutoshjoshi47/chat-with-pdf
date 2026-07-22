# 📄 Chat with PDF — RAG Backend

A Node.js backend that lets users upload a PDF and ask questions about its content using **RAG (Retrieval-Augmented Generation)**.

## How it works
1. **Upload** – User uploads a PDF file via an API endpoint.
2. **Parse** – The PDF is read and its raw text is extracted using `pdf-parse`.
3. **Chunk** – Extracted text is split into smaller chunks for better context retrieval.
4. **Embed** – Each chunk is converted into vector embeddings.
5. **Store** – Embeddings are stored in a vector database for similarity search.
6. **Retrieve** – When a user asks a question, relevant chunks are retrieved based on semantic similarity.
7. **Generate** – The retrieved context + user's question is sent to an LLM, which generates an accurate, context-aware answer.