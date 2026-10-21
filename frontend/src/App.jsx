import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import "./App.css";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
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

  const [interviewQuestions, setInterviewQuestions] = useState(QUESTIONS);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState("");
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(""));

  const [evaluations, setEvaluations] = useState([]);

  const [sessionId, setSessionId] = useState(null);

  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [evaluationError, setEvaluationError] = useState("");

  const [followUpCount, setFollowUpCount] = useState(0);

  const [seconds, setSeconds] = useState(0);
  const [typing, setTyping] = useState(false);

  const [recording, setRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const [doubtOpen, setDoubtOpen] = useState(false);
  const [doubtText, setDoubtText] = useState("");
  const [doubtReply, setDoubtReply] = useState("");
  const [doubtLoading, setDoubtLoading] = useState(false);
  const [doubtError, setDoubtError] = useState("");

  const [autoFinishStarted, setAutoFinishStarted] = useState(false);

  const [visibleQuestionCount, setVisibleQuestionCount] = useState(1);

  useEffect(() => {
    if (screen !== "interview" || seconds < 30 * 60 || autoFinishStarted) {
      return;
    }

    setAutoFinishStarted(true);

    const completeSession = async () => {
      try {
        if (!sessionId) {
          throw new Error("Interview session not found.");
        }

        const response = await fetch(
          `http://localhost:5000/api/sessions/${sessionId}/complete`,
          { method: "PATCH" },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not complete the interview.");
        }

        if (recording) {
          stopRecording();
        }

        setScreen("feedback");
      } catch (error) {
        console.error("Automatic completion error:", error);
        setEvaluationError(
          error.message || "Could not complete the interview.",
        );
      }
    };

    completeSession();
  }, [screen, seconds, autoFinishStarted, sessionId, recording]);

  useEffect(() => {
    if (screen !== "interview") return;

    const timer = setInterval(() => {
      setSeconds((current) => {
        if (current >= 30 * 60) {
          clearInterval(timer);
          return current;
        }

        return current + 1;
      });
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

  const insertFollowUpQuestion = (followUp, afterIndex) => {
    if (followUpCount >= 5 || afterIndex >= interviewQuestions.length - 1) {
      return false;
    }

    const replaceAt = afterIndex + 1;

    const followUpItem = {
      ...followUp,
      isFollowUp: true,
      hasFollowUp: false,
    };

    setInterviewQuestions((current) => {
      const updated = [...current];

      if (updated[afterIndex]) {
        updated[afterIndex] = {
          ...updated[afterIndex],
          hasFollowUp: true,
        };
      }

      updated[replaceAt] = followUpItem;
      return updated;
    });

    // Clear the answer belonging to the question being replaced.
    setAnswers((current) => {
      const updated = [...current];
      updated[replaceAt] = "";
      return updated;
    });

    // Remove any old evaluation associated with the replaced question.
    setEvaluations((current) =>
      current.filter((ev) => ev.questionIndex !== replaceAt),
    );

    setFollowUpCount((count) => count + 1);
    return true;
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

  const generateInterviewQuestions = async () => {
    setQuestionsLoading(true);
    setQuestionsError("");

    try {
      const response = await fetch("http://localhost:5000/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role, skills }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not generate questions.");
      }

      if (!Array.isArray(data.questions) || data.questions.length !== 10) {
        throw new Error("The AI returned an invalid question list.");
      }

      const sessionResponse = await fetch(
        "http://localhost:5000/api/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role,
            skills,
            questions: data.questions,
          }),
        },
      );

      const sessionData = await sessionResponse.json();

      if (!sessionResponse.ok) {
        throw new Error(
          sessionData.error || "Could not save the interview session.",
        );
      }

      setSessionId(sessionData.sessionId);

      setInterviewQuestions(data.questions);
      setAnswers(Array(data.questions.length).fill(""));
      setQuestionIndex(0);
      setVisibleQuestionCount(1);
      setEvaluations([]);
      setEvaluationError("");
      setFollowUpCount(0);
      setSeconds(0);
      setAutoFinishStarted(false);
      setDoubtOpen(false);
      setDoubtText("");
      setDoubtReply("");
      setDoubtError("");
      setScreen("interview");
    } catch (error) {
      console.error("Question generation error:", error);
      setQuestionsError(
        "Couldn't generate interview questions. Please check the backend and try again.",
      );
    } finally {
      setQuestionsLoading(false);
    }
  };

  const evaluateAnswer = async () => {
    const currentQuestion = interviewQuestions[questionIndex];
    const currentAnswer = answers[questionIndex];

    if (!currentAnswer?.trim()) {
      setEvaluationError("Please enter or speak an answer before continuing.");
      return null;
    }

    setEvaluationLoading(true);
    setEvaluationError("");

    try {
      const controller = new AbortController();

      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 90000);

      let response;

      try {
        response = await fetch("http://localhost:5000/api/evaluate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: currentQuestion.q,
            answer: currentAnswer,
            role,
            skill: currentQuestion.tag,
            level: currentQuestion.level,
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not evaluate your answer.");
      }

      const evaluation = {
        questionIndex,
        question: currentQuestion.q,
        answer: currentAnswer,
        tag: currentQuestion.tag,
        level: currentQuestion.level,
        isFollowUp: !!currentQuestion.isFollowUp,
        ...data.evaluation,
      };

      const saveResponse = await fetch(
        `http://localhost:5000/api/sessions/${sessionId}/answers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ evaluation }),
        },
      );

      const saveData = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(
          saveData.error || "Could not save the answer evaluation.",
        );
      }

      setEvaluations((current) => {
        const updated = [...current];
        const existingIndex = updated.findIndex(
          (item) => item.questionIndex === questionIndex,
        );

        if (existingIndex >= 0) {
          updated[existingIndex] = evaluation;
        } else {
          updated.push(evaluation);
        }

        return updated;
      });

      return evaluation;
    } catch (error) {
      console.error("Answer evaluation error:", error);

      if (error.name === "AbortError") {
        setEvaluationError(
          "Evaluation timed out after 90 seconds. Please try again.",
        );
      } else {
        setEvaluationError(
          error.message || "Couldn't evaluate your answer. Please try again.",
        );
      }

      return null;
    } finally {
      setEvaluationLoading(false);
    }
  };

  const handleProceed = async () => {
    if (evaluationLoading) return;

    if (recording) {
      stopRecording();
    }

    const evaluation = await evaluateAnswer();
    if (!evaluation) return;

    const currentQ = interviewQuestions[questionIndex];

    const canFollowUp =
      evaluation.followUpRecommended &&
      evaluation.followUpQuestion &&
      followUpCount < 5 &&
      questionIndex < interviewQuestions.length - 1 &&
      !currentQ?.hasFollowUp;

    if (canFollowUp) {
      const inserted = insertFollowUpQuestion(
        evaluation.followUpQuestion,
        questionIndex,
      );
      if (inserted) {
        setVisibleQuestionCount((count) => Math.max(count, questionIndex + 2));
        setQuestionIndex(questionIndex + 1);
        return;
      }
    }

    if (questionIndex < interviewQuestions.length - 1) {
      setVisibleQuestionCount((count) => Math.max(count, questionIndex + 2));
      setQuestionIndex((current) => current + 1);
    } else {
      try {
        const response = await fetch(
          `http://localhost:5000/api/sessions/${sessionId}/complete`,
          {
            method: "PATCH",
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Could not complete the interview session.",
          );
        }

        setScreen("feedback");
      } catch (error) {
        console.error("Session completion error:", error);
        setEvaluationError(
          "Your answers were evaluated, but the session status could not be updated. Please try again.",
        );
      }
    }
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
          question: interviewQuestions[questionIndex].q,
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

  const resetInterview = () => {
    if (recording) {
      stopRecording();
    }
    setInterviewQuestions(QUESTIONS);
    setAnswers(Array(QUESTIONS.length).fill(""));
    setQuestionIndex(0);
    setVisibleQuestionCount(1);
    setEvaluations([]);
    setEvaluationError("");
    setFollowUpCount(0);
    setSeconds(0);
    setAutoFinishStarted(false);
    setDoubtOpen(false);
    setDoubtText("");
    setDoubtReply("");
    setDoubtError("");
    setScreen("skills");
  };

  return (
    <div className="app" id="home">
      {screen === "landing" && (
        <>
          <Navbar onLogin={() => setScreen("login")} />

          <main>
            <Home onGetStarted={() => setScreen("role")} />
          </main>
        </>
      )}

      {screen === "login" && (
        <Login
          onBack={() => setScreen("landing")}
          onSignup={() => setScreen("signup")}
        />
      )}

      {screen === "signup" && (
        <Signup
          onBack={() => setScreen("landing")}
          onLogin={() => setScreen("login")}
        />
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
            disabled={skills.length === 0 || questionsLoading}
            onClick={generateInterviewQuestions}
          >
            {questionsLoading ? "Generating questions..." : "Next →"}
          </button>

          {questionsError && (
            <p className="doubt-error" role="alert">
              {questionsError}
            </p>
          )}
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
              ⏱ {String(Math.floor((30 * 60 - seconds) / 60)).padStart(2, "0")}:
              {String((30 * 60 - seconds) % 60).padStart(2, "0")}
            </span>

            <button
              className="btn primary"
              onClick={async () => {
                try {
                  if (sessionId) {
                    const response = await fetch(
                      `http://localhost:5000/api/sessions/${sessionId}/complete`,
                      { method: "PATCH" },
                    );

                    const data = await response.json();

                    if (!response.ok) {
                      throw new Error(
                        data.error || "Could not complete the interview.",
                      );
                    }
                  }

                  setScreen("skills");
                } catch (error) {
                  console.error("Interview completion error:", error);
                  alert(error.message || "Could not complete the interview.");
                }
              }}
            >
              End interview
            </button>
          </header>

          <div className="interview-layout">
            <aside className="question-list">
              {interviewQuestions
                .slice(0, visibleQuestionCount)
                .map((question, index) => (
                  <button
                    key={index}
                    className={`question-number ${
                      questionIndex === index ? "active" : ""
                    } ${answers[index]?.trim() ? "answered" : ""} ${
                      question.isFollowUp ? "is-follow-up-pill" : ""
                    }`}
                    onClick={() => setQuestionIndex(index)}
                    title={
                      question.isFollowUp
                        ? `Adaptive Follow-up (Q${index + 1})`
                        : `Question ${index + 1}`
                    }
                  >
                    Q{index + 1}
                    {question.isFollowUp ? "✦" : ""}
                  </button>
                ))}
            </aside>

            <section className="question-content">
              <h3>
                Question {questionIndex + 1} of {interviewQuestions.length}
              </h3>

              <div className="question-tags">
                <span>{role}</span>
                <span>{interviewQuestions[questionIndex].tag}</span>
                <span>{interviewQuestions[questionIndex].level}</span>
                {interviewQuestions[questionIndex].isFollowUp && (
                  <span className="followup-badge">✦ Adaptive Follow-up</span>
                )}
              </div>

              <div className="question-box">
                {interviewQuestions[questionIndex].q}
              </div>

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
                    value={answers[questionIndex] || ""}
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

                <button
                  className="btn ghost"
                  disabled={evaluationLoading}
                  onClick={async () => {
                    if (recording) {
                      stopRecording();
                    }

                    setEvaluationError("");
                    setDoubtOpen(false);
                    setDoubtReply("");

                    if (questionIndex < interviewQuestions.length - 1) {
                      setVisibleQuestionCount((count) =>
                        Math.max(count, questionIndex + 2),
                      );
                      setQuestionIndex((current) => current + 1);
                      return;
                    }

                    try {
                      if (!sessionId) {
                        throw new Error("Interview session not found.");
                      }

                      const response = await fetch(
                        `http://localhost:5000/api/sessions/${sessionId}/complete`,
                        { method: "PATCH" },
                      );

                      const data = await response.json();

                      if (!response.ok) {
                        throw new Error(
                          data.error || "Could not complete the interview.",
                        );
                      }

                      setScreen("feedback");
                    } catch (error) {
                      setEvaluationError(
                        error.message || "Could not complete the interview.",
                      );
                    }
                  }}
                >
                  Skip →
                </button>

                <button
                  className="btn primary"
                  disabled={evaluationLoading}
                  onClick={handleProceed}
                >
                  {evaluationLoading
                    ? "Evaluating..."
                    : questionIndex < interviewQuestions.length - 1
                      ? "Next →"
                      : "Finish interview"}
                </button>
              </div>

              {evaluationError && (
                <p className="doubt-error" role="alert">
                  {evaluationError}
                </p>
              )}
            </section>
          </div>
        </main>
      )}

      {screen === "feedback" && (
        <main className="feedback-page">
          <header className="feedback-header">
            <div className="step-logo">
              <img src={navImage} alt="" />
              <span>Adaptive AI Interview</span>
            </div>

            <div className="feedback-header-actions">
              <span className="interview-timer">
                ⏱ Total time:{" "}
                {String(Math.floor(seconds / 60)).padStart(2, "0")}:
                {String(seconds % 60).padStart(2, "0")}
              </span>
              <button className="btn primary" onClick={resetInterview}>
                Practice again ↻
              </button>
            </div>
          </header>

          <section className="feedback-hero">
            <h2>Interview Performance Summary</h2>
            <p>
              Target Role: <strong>{role}</strong> • Completed:{" "}
              <strong>{evaluations.length} questions</strong>{" "}
              {followUpCount > 0 && (
                <span className="followup-summary-pill">
                  ({followUpCount} adaptive follow-up
                  {followUpCount === 1 ? "" : "s"})
                </span>
              )}
            </p>
          </section>

          {evaluations.length === 0 ? (
            <div className="empty-feedback">
              <p>No completed evaluations found for this session.</p>
              <button className="btn primary" onClick={resetInterview}>
                Start New Interview
              </button>
            </div>
          ) : (
            <>
              <div className="scorecard-grid">
                <div className="score-card main-score">
                  <span className="score-label">Overall Score</span>
                  <div className="score-value">
                    {Math.round(
                      evaluations.reduce(
                        (sum, item) => sum + (item.score || 0),
                        0,
                      ) / evaluations.length,
                    )}
                    <span className="score-max">/100</span>
                  </div>
                  <span className="score-badge-text">
                    {(() => {
                      const avg = Math.round(
                        evaluations.reduce(
                          (sum, item) => sum + (item.score || 0),
                          0,
                        ) / evaluations.length,
                      );
                      if (avg >= 85) return "Excellent Performance";
                      if (avg >= 70) return "Strong Understanding";
                      if (avg >= 50) return "Good Foundation";
                      return "Needs Practice";
                    })()}
                  </span>
                </div>

                <div className="score-card">
                  <span className="score-label">Correctness</span>
                  <div className="score-value">
                    {Math.round(
                      evaluations.reduce(
                        (sum, item) => sum + (item.correctness || 0),
                        0,
                      ) / evaluations.length,
                    )}
                    <span className="score-max">%</span>
                  </div>
                  <span className="score-subtext">Technical accuracy</span>
                </div>

                <div className="score-card">
                  <span className="score-label">Relevance</span>
                  <div className="score-value">
                    {Math.round(
                      evaluations.reduce(
                        (sum, item) => sum + (item.relevance || 0),
                        0,
                      ) / evaluations.length,
                    )}
                    <span className="score-max">%</span>
                  </div>
                  <span className="score-subtext">Alignment to question</span>
                </div>

                <div className="score-card">
                  <span className="score-label">Completeness</span>
                  <div className="score-value">
                    {Math.round(
                      evaluations.reduce(
                        (sum, item) => sum + (item.completeness || 0),
                        0,
                      ) / evaluations.length,
                    )}
                    <span className="score-max">%</span>
                  </div>
                  <span className="score-subtext">Depth & coverage</span>
                </div>
              </div>

              <div className="analysis-grid">
                <div className="analysis-card strengths-card">
                  <h3>🌟 Key Strengths</h3>
                  <ul>
                    {Array.from(
                      new Set(
                        evaluations
                          .flatMap((item) => item.strengths || [])
                          .filter(Boolean),
                      ),
                    ).length > 0 ? (
                      Array.from(
                        new Set(
                          evaluations
                            .flatMap((item) => item.strengths || [])
                            .filter(Boolean),
                        ),
                      ).map((strength, i) => <li key={i}>{strength}</li>)
                    ) : (
                      <li>
                        Answers demonstrated good effort and communication.
                      </li>
                    )}
                  </ul>
                </div>

                <div className="analysis-card improvements-card">
                  <h3>🎯 Areas to Improve</h3>
                  <ul>
                    {Array.from(
                      new Set(
                        evaluations
                          .flatMap((item) => item.improvements || [])
                          .filter(Boolean),
                      ),
                    ).length > 0 ? (
                      Array.from(
                        new Set(
                          evaluations
                            .flatMap((item) => item.improvements || [])
                            .filter(Boolean),
                        ),
                      ).map((improvement, i) => <li key={i}>{improvement}</li>)
                    ) : (
                      <li>
                        Practice deeper architectural and edge-case questions.
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <section className="breakdown-section">
                <h3>Question-by-Question Review</h3>

                <div className="breakdown-list">
                  {evaluations.map((item, index) => (
                    <article key={index} className="breakdown-card">
                      <div className="breakdown-card-header">
                        <div className="breakdown-tags">
                          <span className="breakdown-num">Q{index + 1}</span>
                          {item.isFollowUp && (
                            <span className="followup-badge">✦ Follow-up</span>
                          )}
                          {item.tag && (
                            <span className="tag-pill">{item.tag}</span>
                          )}
                          {item.level && (
                            <span className="tag-pill">{item.level}</span>
                          )}
                        </div>
                        <div className="breakdown-score">
                          Score: <strong>{item.score ?? "N/A"}/100</strong>
                        </div>
                      </div>

                      <div className="breakdown-question">
                        <strong>Question:</strong> {item.question}
                      </div>

                      <div className="breakdown-answer">
                        <strong>Your answer:</strong>
                        <p>{item.answer || "No answer recorded."}</p>
                      </div>

                      {item.feedback && (
                        <div className="breakdown-feedback">
                          <strong>AI Feedback:</strong>
                          <p>{item.feedback}</p>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>

              <div className="feedback-footer">
                <button
                  className="btn ghost"
                  onClick={() => setScreen("landing")}
                >
                  Return to Home
                </button>
                <button className="btn primary" onClick={resetInterview}>
                  Start New Interview →
                </button>
              </div>
            </>
          )}
        </main>
      )}
    </div>
  );
}

export default App;
