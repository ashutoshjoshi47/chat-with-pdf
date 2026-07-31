import { useState } from 'react'
import FileUpload from './components/FileUpload.jsx'
import QuestionInput from './components/QuestionInput.jsx'
import AnswerDisplay from './components/AnswerDisplay.jsx'
import Loader from './components/Loader.jsx'
import { uploadPdfAndAsk } from './api/api.js'
import './App.css'

export default function App() {
  const [file, setFile] = useState(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setAnswer('')

    if (!file) {
      setError('Please select a PDF file first.')
      return
    }
    if (!question.trim()) {
      setError('Please enter a question.')
      return
    }

    setLoading(true)
    try {
      const result = await uploadPdfAndAsk(file, question)
      setAnswer(typeof result === 'string' ? result : JSON.stringify(result))
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>PDF RAG Assistant</h1>
        <p>Upload a PDF, ask a question, get an AI-generated answer grounded in the document.</p>
      </header>

      <form className="app-form" onSubmit={handleSubmit}>
        <FileUpload file={file} onFileChange={setFile} />
        <QuestionInput question={question} onQuestionChange={setQuestion} />
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Processing...' : 'Ask'}
        </button>
      </form>

      {loading && <Loader text="Parsing PDF, embedding chunks, and generating an answer..." />}

      <AnswerDisplay answer={answer} error={error} />
    </div>
  )
}
