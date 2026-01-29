import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../api/socket";
import Chat from "../components/Chat";
import type { Question, PollResult } from "../types";
import "../components/Styles/Student.css";

const Student: React.FC = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [timer, setTimer] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [results, setResults] = useState<PollResult | null>(null);
  const [status, setStatus] = useState<"waiting" | "active">("waiting");

  const studentId = localStorage.getItem("studentId");
  const name = localStorage.getItem("studentName") || "Student";

  useEffect(() => {
    if (!studentId) {
      navigate("/");
      return;
    }

    const io = socket.connect();
    socket.join("student", studentId, name);

    io.on("newQuestion", (q: any) => {
      setQuestion(q);
      setTimer(q.timeLimit);
      setResults(null);
      setSelected(null);
      setHasAnswered(false);
      setStatus("active");
    });

    io.on("questionTimeUp", ({ results }: any) => {
      setResults(results);
      setStatus("waiting");
      setTimer(0);
    });

    io.on("allStudentsAnswered", ({ results }: any) => {
      setResults(results);
      setStatus("waiting");
    });

    io.on("forceDisconnect", () => {
      localStorage.clear();
      navigate("/banned");
    });

    return () => socket.disconnect();
  }, [studentId, name, navigate]);

  useEffect(() => {
    if (timer > 0 && status === "active") {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, status]);

  const submit = () => {
    if (!selected || hasAnswered) return;
    socket.submitAnswer(studentId!, question?.id!, selected);
    setHasAnswered(true);
  };

  return (
    <div className="sd-wrap">
      {status === "waiting" && !results && (
        <div className="loading-container">
          <div className="loading-content">
            <div className="loading-badge">✨ Intervue Poll</div>
            <div className="loading-spinner"></div>
            <p className="loading-text">
              Wait for the teacher to ask questions..
            </p>
          </div>
        </div>
      )}

      {question && (
        <>
          <div className="sd-headline">
            <span className="sd-qtitle">Question</span>
            <div className="sd-timer">{timer}s</div>
          </div>

          {!results ? (
            // ANSWER MODE
            <>
              <div className="sd-card">
                <div className="sd-card-header">{question.question}</div>
                <div className="sd-card-body">
                  {question.options.map((opt, i) => (
                    <button
                      key={i}
                      className={`sd-option ${selected === opt ? "selected" : ""}`}
                      onClick={() => !hasAnswered && setSelected(opt)}
                      disabled={hasAnswered || status !== "active"}
                    >
                      <span className="sd-chip">{i + 1}</span>
                      <span className="sd-opt-text">{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="sd-submit-row">
                <button
                  className="sd-submit"
                  onClick={submit}
                  disabled={!selected || hasAnswered}
                >
                  Submit
                </button>
              </div>
            </>
          ) : (
            // RESULTS MODE
            <div>
              <div className="sd-card sd-results">
                <div className="sd-card-header">{question.question}</div>
                <div className="sd-result-body">
                  {question.options.map((opt, i) => {
                    const pct = Math.round(
                      ((results.answerCounts[opt] || 0) /
                        (results.totalAnswers || 1)) *
                        100,
                    );
                    return (
                      <div key={i} className="sd-result-row">
                        <div
                          className="sd-result-fill"
                          style={{ width: `${pct}%` }}
                        ></div>
                        <span className="sd-result-chip">{i + 1}</span>
                        <span className="sd-result-text">{opt}</span>
                        <span className="sd-result-pct">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="sd-wait-next">Wait for the teacher to ask a new question...</div>
            </div>
          )}
        </>
      )}

      <Chat userType="student" userId={studentId!} name={name} />
    </div>
  );
};

export default Student;
