export default function FileUpload({ file, onFileChange }) {
  const handleChange = (e) => {
    const selected = e.target.files?.[0]
    if (selected && selected.type === 'application/pdf') {
      onFileChange(selected)
    } else if (selected) {
      alert('Please select a PDF file.')
      e.target.value = ''
    }
  }

  return (
    <div className="upload-box">
      <label htmlFor="pdf-input" className="upload-label">
        {file ? file.name : 'Click to select a PDF'}
      </label>
      <input
        id="pdf-input"
        type="file"
        accept="application/pdf"
        onChange={handleChange}
        hidden
      />
    </div>
  )
}
