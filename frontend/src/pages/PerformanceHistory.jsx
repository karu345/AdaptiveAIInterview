import { useEffect, useState } from "react";

export default function PerformanceHistory({
  authToken,
  onBack,
  onViewReport,
}) {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/performance-summaries",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not load performance history.");
        }

        setSummaries(Array.isArray(data) ? data : data.summaries || []);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    if (authToken) {
      fetchHistory();
    } else {
      setError("Please log in to view your performance history.");
      setLoading(false);
    }
  }, [authToken]);

  return (
    <main className="history-page">
      <header className="history-header">
        <h2>My Performance History</h2>
        <button className="btn ghost" onClick={onBack}>
          ← Back to Home
        </button>
      </header>

      {loading && <p>Loading your performance history...</p>}

      {error && <p className="doubt-error">{error}</p>}

      {!loading && !error && summaries.length === 0 && (
        <div className="empty-feedback">
          <h3>No interviews yet</h3>
          <p>Complete your first interview to see your performance here.</p>
        </div>
      )}

      {!loading && !error && summaries.length > 0 && (
        <div className="history-grid">
          {summaries.map((item) => (
            <article
              className="history-card"
              key={item._id}
              onClick={() => onViewReport(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onViewReport(item);
                }
              }}
            >
              <h3>{item.role}</h3>

              <p>{new Date(item.completedAt).toLocaleString()}</p>

              <div className="history-score">
                {item.overallScore}
                <span>/100</span>
              </div>

              <div className="history-details">
                <span>Questions: {item.totalQuestions}</span>
                <span>Follow-ups: {item.followUpCount}</span>
                <span>
                  Duration: {Math.floor(item.durationSeconds / 60)} min
                </span>
              </div>

              <div className="history-metrics">
                <p>Correctness: {item.correctness}%</p>
                <p>Relevance: {item.relevance}%</p>
                <p>Completeness: {item.completeness}%</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
