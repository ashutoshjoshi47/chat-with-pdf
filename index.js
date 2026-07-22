const express = require('express')
const multer = require('multer')
const pdfParse = require('pdf-parse')
const fs = require('fs')

const app = express()

const upload = multer({dest: "uploads/"})

app.post('/upload', upload.single("pdf"), async(req,res) => {
    console.log(req.file)

    const dataBuffer = fs.readFileSync(req.file.path);      // Read the uploaded file from disk into memory as raw binary data.
    const pdfData = await pdfParse(dataBuffer);             // Parse the binary buffer to extract the PDF content as structured data.
    const text = pdfData.text;                              // Extract the plain text content from the parsed PDF object.

    const chunks = text.split('\n\n');

    res.json({
        totalChunks: chunks.length,
        chunks
    })


    res.send(text)
})

app.get('/', (req,res)=> {
    res.send("API is working")
})

app.listen(3000, ()=> {
    console.log("Server running on port 3000")
})