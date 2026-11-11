export default function PerformanceReport({ report, onBack }) {
  if (!report) {
    return <p>No interview report selected.</p>;
  }

  return (
    <main className="history-page">
      <header className="history-header">
        <h2>{report.role} — Performance Report</h2>

        <button className="btn ghost" onClick={onBack}>
          ← Back to History
        </button>
      </header>

      <div className="history-card">
        <h3>Overall Score</h3>
        <div className="history-score">
          {report.overallScore}
          <span>/100</span>
        </div>

        <div className="report-metrics">
          <div className="report-metric">
            <span>Correctness</span>
            <strong>{report.correctness}%</strong>
          </div>

          <div className="report-metric">
            <span>Relevance</span>
            <strong>{report.relevance}%</strong>
          </div>

          <div className="report-metric">
            <span>Completeness</span>
            <strong>{report.completeness}%</strong>
          </div>
        </div>
      </div>

      <h2>Question-by-Question Review</h2>

      {report.questionReviews?.map((item, index) => (
        <article className="history-card" key={index}>
          <h3>
            Question {index + 1}
            {item.isFollowUp && " (Follow-up)"}
          </h3>

          <p>
            <strong>Question:</strong> {item.question}
          </p>

          <p>
            <strong>Your Answer:</strong>
          </p>
          <p>{item.answer || "No answer provided."}</p>

          <h4>Score: {item.score}/100</h4>

          <div className="report-metrics question-metrics">
            <div className="report-metric">
              <span>Correctness</span>
              <strong>{item.correctness}%</strong>
            </div>

            <div className="report-metric">
              <span>Relevance</span>
              <strong>{item.relevance}%</strong>
            </div>

            <div className="report-metric">
              <span>Completeness</span>
              <strong>{item.completeness}%</strong>
            </div>
          </div>

          <p>
            <strong>Feedback:</strong> {item.feedback}
          </p>

          <div className="report-feedback-grid">
            <div className="report-strengths">
              <h4>✓ Strengths</h4>
              <ul>
                {item.strengths?.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>

            <div className="report-improvements">
              <h4>↗ Areas to Improve</h4>
              <ul>
                {item.improvements?.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      ))}
    </main>
  );
}
