export default function Home({ onGetStarted }) {
  const features = [
    {
      icon: "💡",
      title: "Personalized questions",
      description: "Get questions based on your role and skills.",
    },
    {
      icon: "📊",
      title: "AI feedback",
      description: "Detailed analysis and improvement tips.",
    },
    {
      icon: "🎯",
      title: "Track progress",
      description: "Monitor your performance over time.",
    },
  ];

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <span className="pill">
            ✦ AI-powered interview practice
          </span>

          <h1>
            Adaptive AI
            <em>Interview</em>
          </h1>

          <p>
            Practice smarter. Get real-time feedback.
            <br />
            Build confidence for your dream job.
          </p>

          <div className="row hero-actions">
            <button className="btn primary" onClick={onGetStarted}>
              Get started →
            </button>
          </div>
        </div>

        <div className="hero-art">
          <img
            src="/src/assets/ai-robot.png"
            alt="AI robot assisting with interview practice"
          />
        </div>
      </section>

      <section className="feats" id="features">
        {features.map((feature) => (
          <article className="card feat" key={feature.title}>
            <div className="ficon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}