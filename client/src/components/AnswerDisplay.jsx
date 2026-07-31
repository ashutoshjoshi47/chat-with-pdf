export default function AnswerDisplay({ answer, error }) {
  if (error) {
    return (
      <div className="answer-box error">
        <strong>Error:</strong> {error}
      </div>
    )
  }

  if (!answer) return null

  return (
    <div className="answer-box">
      <h3>Answer</h3>
      <p>{answer}</p>
    </div>
  )
}
