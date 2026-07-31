export default function QuestionInput({ question, onQuestionChange }) {
  return (
    <textarea
      className="question-input"
      placeholder="Ask a question about the PDF..."
      value={question}
      onChange={(e) => onQuestionChange(e.target.value)}
      rows={3}
    />
  )
}
