import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import "./App.css";
import { ROLES, SKILLS, QUESTIONS } from "./data";
import { useEffect, useState } from "react";
import navImage from "./assets/roboNav.png";

function StepHeader({ step, onBack }) {
  const steps = ["Role", "Skills", "Interview"];

  return (
    <>
      <header className="step-header">
        <div className="step-logo">
          <img src={navImage} alt="Adaptive AI Interview" />
          Adaptive AI Interview
        </div>
        <span className="step-avatar">K</span>
      </header>

      <button className="btn ghost step-back" onClick={onBack}>
        ← Back
      </button>

      <ol className="stepper">
        {steps.map((label, index) => (
          <li key={label} className={index + 1 <= step ? "on" : ""}>
            <b>{index + 1}</b>
            <span>{label}</span>
          </li>
        ))}
      </ol>
    </>
  );
}

function App() {
  const [screen, setScreen] = useState("landing");
  const [role, setRole] = useState("Java Developer");
  const [skills, setSkills] = useState(["DSA", "OOP"]);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(""));
  const [seconds, setSeconds] = useState(0);
  const [typing, setTyping] = useState(false);

  const [recording, setRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const [doubtOpen, setDoubtOpen] = useState(false);
  const [doubtText, setDoubtText] = useState("");
  const [doubtReply, setDoubtReply] = useState("");
  const [doubtLoading, setDoubtLoading] = useState(false);
  const [doubtError, setDoubtError] = useState("");

  useEffect(() => {
    if (screen !== "interview") return;

    const timer = setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [screen]);

  const toggleSkill = (name) => {
    setSkills((current) =>
      current.includes(name)
        ? current.filter((skill) => skill !== name)
        : [...current, name],
    );
  };

  const startRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser. Please use Chrome.",
      );
      return;
    }

    const speech = new SpeechRecognition();
    speech.lang = "en-IN";
    speech.continuous = true;
    speech.interimResults = true;

    speech.onresult = (event) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }

      setAnswers((current) => {
        const updated = [...current];
        updated[questionIndex] = transcript.trim();
        return updated;
      });
    };

    speech.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setRecording(false);
    };

    speech.onend = () => {
      setRecording(false);
      setRecognition(null);
    };

    speech.start();
    setRecognition(speech);
    setRecording(true);
    setTyping(false);
  };

  const stopRecording = () => {
    recognition?.stop();
    setRecording(false);
  };

  const askDoubt = async (event) => {
    event.preventDefault();

    const doubt = doubtText.trim();
    if (!doubt || doubtLoading) return;

    setDoubtLoading(true);
    setDoubtError("");
    setDoubtReply("");
    setDoubtText("");

    try {
      const response = await fetch("http://localhost:5000/api/doubt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: QUESTIONS[questionIndex].q,
          doubt,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to get clarification.");
      }

      setDoubtReply(data.reply);
    } catch (error) {
      console.error("Ask doubt error:", error);
      setDoubtError(
        "Couldn't get a response. Please check that the backend is running and try again.",
      );
    } finally {
      setDoubtLoading(false);
    }
  };

  return (
    <div className="app" id="home">
      {screen === "landing" && (
        <>
          <Navbar />

          <main>
            <Home onGetStarted={() => setScreen("role")} />
          </main>
        </>
      )}

      {screen === "role" && (
        <main className="role-page">
          <StepHeader step={1} onBack={() => setScreen("landing")} />

          <h2>Select your role</h2>
          <p>Choose the role you want to practice for.</p>

          <div className="role-grid">
            {ROLES.map(([name, icon]) => (
              <button
                key={name}
                className={`role-card ${role === name ? "selected" : ""}`}
                onClick={() => setRole(name)}
              >
                <span>{icon}</span>
                {name}
              </button>
            ))}
          </div>
          <button
            className="btn primary role-next"
            onClick={() => setScreen("skills")}
          >
            Next →
          </button>
        </main>
      )}

      {screen === "skills" && (
        <main className="role-page">
          <StepHeader step={2} onBack={() => setScreen("role")} />

          <h2>Select your skills</h2>
          <p>Choose the topics you want to be interviewed on.</p>

          <div className="role-grid">
            {SKILLS.map(([name, icon]) => (
              <button
                key={name}
                className={`role-card ${skills.includes(name) ? "selected" : ""}`}
                onClick={() => toggleSkill(name)}
              >
                <span>{icon}</span>
                {name}
              </button>
            ))}
          </div>

          <button
            className="btn primary role-next"
            disabled={skills.length === 0}
            onClick={() => setScreen("interview")}
          >
            Next →
          </button>
        </main>
      )}

      {screen === "interview" && (
        <main className="interview-page">
          <header className="interview-header">
            <div className="step-logo">
              <img src={navImage} alt="" />
              Adaptive AI Interview
            </div>

            <span className="interview-timer">
              ⏱ {String(Math.floor(seconds / 60)).padStart(2, "0")}:
              {String(seconds % 60).padStart(2, "0")}
            </span>

            <button className="btn primary" onClick={() => setScreen("skills")}>
              End interview
            </button>
          </header>

          <div className="interview-layout">
            <aside className="question-list">
              {QUESTIONS.map((question, index) => (
                <button
                  key={index}
                  className={`question-number ${
                    questionIndex === index ? "active" : ""
                  } ${answers[index].trim() ? "answered" : ""}`}
                  onClick={() => setQuestionIndex(index)}
                >
                  Q{index + 1}
                </button>
              ))}
            </aside>

            <section className="question-content">
              <h3>
                Question {questionIndex + 1} of {QUESTIONS.length}
              </h3>

              <div className="question-tags">
                <span>{role}</span>
                <span>{QUESTIONS[questionIndex].tag}</span>
                <span>{QUESTIONS[questionIndex].level}</span>
              </div>

              <div className="question-box">{QUESTIONS[questionIndex].q}</div>

              <div className="doubt-assistant">
                <button
                  type="button"
                  className="btn ghost doubt-toggle"
                  onClick={() => setDoubtOpen((current) => !current)}
                >
                  💬 {doubtOpen ? "Close doubt assistant" : "Ask a doubt"}
                </button>

                {doubtOpen && (
                  <div className="doubt-panel">
                    <h4>Question Doubt Assistant</h4>
                    <p>
                      Need help understanding the question? Ask here. I'll
                      clarify what it means without giving you the answer.
                    </p>

                    <form className="doubt-form" onSubmit={askDoubt}>
                      <input
                        type="text"
                        placeholder="Ask about the question..."
                        value={doubtText}
                        onChange={(event) => setDoubtText(event.target.value)}
                        maxLength={1000}
                        disabled={doubtLoading}
                      />

                      <button
                        className="btn primary"
                        type="submit"
                        disabled={doubtLoading || !doubtText.trim()}
                      >
                        {doubtLoading ? "Asking..." : "Ask"}
                      </button>
                    </form>

                    {doubtLoading && (
                      <p className="doubt-status">Getting clarification...</p>
                    )}

                    {doubtError && (
                      <p className="doubt-error" role="alert">
                        {doubtError}
                      </p>
                    )}

                    {doubtReply && (
                      <div className="doubt-reply" aria-live="polite">
                        <strong>AI clarification</strong>
                        <p>{doubtReply}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="answer-area">
                {typing ? (
                  <textarea
                    className="answer-input"
                    placeholder="Type your answer here..."
                    value={answers[questionIndex]}
                    onChange={(event) => {
                      const updated = [...answers];
                      updated[questionIndex] = event.target.value;
                      setAnswers(updated);
                    }}
                  />
                ) : (
                  <div className="answer-idle">
                    <span className="answer-mic">🎙</span>
                    <p>
                      {answers[questionIndex] ||
                        "Click to speak or type your answer..."}
                    </p>
                  </div>
                )}
              </div>

              <div className="answer-mode-actions">
                <button
                  className={`btn ghost ${typing ? "mode-active" : ""}`}
                  onClick={() => {
                    setRecording(false);
                    setTyping(true);
                  }}
                >
                  ✎ Type answer
                </button>

                <button
                  className="btn rec"
                  onClick={recording ? stopRecording : startRecording}
                >
                  {recording ? "■ Stop recording" : "● Start recording"}
                </button>
              </div>

              <div className="interview-actions">
                <button
                  className="btn ghost"
                  disabled={questionIndex === 0}
                  onClick={() => setQuestionIndex((current) => current - 1)}
                >
                  ← Previous
                </button>

                {questionIndex < QUESTIONS.length - 1 ? (
                  <button
                    className="btn primary"
                    onClick={() => setQuestionIndex((current) => current + 1)}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    className="btn primary"
                    onClick={() => setScreen("feedback")}
                  >
                    Finish interview
                  </button>
                )}
              </div>
            </section>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
