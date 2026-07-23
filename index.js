const express = require('express')
const multer = require('multer')
const pdfParse = require('pdf-parse')
const fs = require('fs')
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express()

const upload = multer({ dest: "uploads/" })

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})

async function createEmbedding(text) {
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-2',
        contents: text,
    });

    return response.embeddings[0].values;
}

function cosineSimilarity(vecA, vecB){
    let dotProduct = 0;
    for(let i=0; i<vecA.length ; i++){
        dotProduct+= vecA[i]*vecB[i]
    }
    return dotProduct;
}

app.get('/', (req, res) => {
    res.send("API is working")
})

app.post('/upload', upload.single("pdf"), async (req, res) => {
    console.log(req.body)

    try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        const text = pdfData.text;

        const chunks = text.split('\n\n').filter((chunk)=> chunk.trim() != '');

        const chunkEmbeddings = [];

        for(const chunk of chunks){
            const embedding = await createEmbedding(chunk);

            chunkEmbeddings.push({
                text: chunk,
                embedding
            })
        }
        

        const question = req.body.question;
        const questionEmbedding = await createEmbedding(question);

        // const matchedChunk = chunks.find((chunk) => chunk.toLowerCase().includes(question));

        let bestChunk = 0;
        let bestScore = -Infinity;

        for(const items of chunkEmbeddings){
            const score = cosineSimilarity(questionEmbedding, items.embedding);
            if(score > bestScore){
                bestChunk = items.text;
                bestScore = score;
            }
        }
        console.log(bestScore);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: `Answer the question using the context: ${bestChunk}
            Question: ${question}`
        })

        res.send(response.text);

    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})


app.listen(3000, () => {
    console.log("Server running on port 3000")
})