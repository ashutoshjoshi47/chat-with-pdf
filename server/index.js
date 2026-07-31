const express = require('express')
const multer = require('multer')
const pdfParse = require('pdf-parse')
const fs = require('fs')
const { GoogleGenAI } = require('@google/genai');
const { QdrantClient } = require('@qdrant/js-client-rest');
require('dotenv').config();
const cors = require('cors')

const app = express()

const upload = multer({ dest: "uploads/" })

app.use(cors({
    origin: "http://localhost:5173", // only allow your Vite frontend
    methods: ["GET", "POST"],
    credentials: true
}))


//Google's Gemini AI client
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})


//Gemini's embedding model to convert our text into a embedding(vector)
async function createEmbedding(text) {
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-2',
        contents: text,
    });

    // The response contains an array of embeddings; we just take the first one's values
    return response.embeddings[0].values;
}

// Qdrant vector database client
const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY
});

// Test route
app.get('/', (req, res) => {
    res.send("API is working")
})

// Create a collection to store vectors
app.get('/create-collection', async (req, res) => {
    try {
        await qdrant.createCollection('pdf-docs', {
            vectors: {
                size: 3072,          //embeddings size by default
                distance: "Cosine",  // Use cosine similarity for search
            },
        })
        res.send("collection is created");
    } catch (err) {
        res.status(500).send(err);
    }
})

app.post('/upload', upload.single("pdf"), async (req, res) => {
    console.log(req.body)

    try {
        const dataBuffer = fs.readFileSync(req.file.path);       
        const pdfData = await pdfParse(dataBuffer);
        const text = pdfData.text;

        // Split PDF into smaller chunks
        const chunks = text.split('\n\n').filter((chunk) => chunk.trim() != '');

        const chunkEmbeddings = [];

        // Generate embedding for every chunk
        for (const chunk of chunks) {
            const embedding = await createEmbedding(chunk);

            chunkEmbeddings.push({
                text: chunk,
                embedding
            })
        }

        // Convert chunks into Qdrant points
        const points = chunkEmbeddings.map((item, index) => ({
            id: index + 1,
            vector: item.embedding,
            payload: {
                text: item.text
            },
        }));

        // Store vectors in Qdrant
        await qdrant.upsert('pdf-docs', {
            points,
        });

        // Get user's question and convert question into an embedding
        const question = req.body.question;
        const questionEmbedding = await createEmbedding(question);

         // Find the most relevant chunk
        const searchResult = await qdrant.search('pdf-docs', {
            vector: questionEmbedding,
            limit: 1
        });

        // Extract matching text
        const bestChunk = searchResult[0].payload.text;

        // Send context + question to Gemini
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: `Answer the question using the context: ${bestChunk}
            Question: ${question}`
        })

        // Return Gemini's answer
        res.send(response.text);

    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})

// Start the server
app.listen(3000, () => {
    console.log("Server running on port 3000")
})