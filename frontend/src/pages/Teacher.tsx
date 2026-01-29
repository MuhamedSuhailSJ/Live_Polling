import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { socket } from "../api/socket";
import Chat from "../components/Chat";
import type{ Student, PollResult, Question } from "../types";
import "../components/Styles/Teacher.css";

const Teacher: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<PollResult | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Form State
  const [qText, setQText] = useState("");
  const [timer, setTimer] = useState(60);
  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  useEffect(() => {
    const teacherId = localStorage.getItem("teacherId");
    if (!teacherId) {
      navigate("/");
      return;
    }

    // Init Socket
    const io = socket.connect();
    socket.join("teacher", undefined, "Teacher");

    io.on("connect", () => setIsConnected(true));
    io.on("disconnect", () => setIsConnected(false));

    // Listeners
    io.on("participants:list", (data: { students: Student[] }) =>
      setStudents(data.students),
    );
    io.on("answerSubmitted", (data: { results: PollResult }) =>
      setResults(data.results),
    );
    io.on("allStudentsAnswered", (data: { results: PollResult }) =>
      setResults(data.results),
    );
    io.on("questionTimeUp", (data: { results: PollResult }) =>
      setResults(data.results),
    );

    // Load initial data
    api.getPoll().then((data) => {
      if (data.students) setStudents(data.students);
      if (data.currentQuestion) {
        setCurrentQuestion(data.currentQuestion);
        socket.requestResults(data.currentQuestion.id);
      }
    });

    return () => socket.disconnect();
  }, [navigate]);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOpts = options.filter((o) => o.text.trim() !== "");
    if (!qText || cleanOpts.length < 2) return alert("Invalid Question");

    try {
      await api.addQuestion(qText, cleanOpts, timer);
      setQText("");
      setOptions([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]);
      setResults(null);
      setCurrentQuestion({
        id: "temp",
        question: qText,
        options: cleanOpts.map((o) => o.text),
      });
    } catch (e) {
      alert("Failed to add question");
    }
  };

  const updateOption = (idx: number, field: string, val: any) => {
    const newOpts = [...options];
    (newOpts[idx] as any)[field] = val;
    setOptions(newOpts);
  };

  return (
    <div className="td-wrap">
      <div className="td-top">
        <div className="td-badge">
          <span>✨ Intervue Poll</span>
        </div>
        <button className="td-history-btn" onClick={() => navigate("/history")}>
          View History
        </button>
      </div>

      <div className="td-hero">
        <h1>
          Let’s <span className="bold">Get Started</span>
        </h1>
      </div>

      <form className="td-create" onSubmit={handleAddQuestion}>
        <div className="td-row">
          <label className="td-label">Enter your question</label>
          <div className="td-timer">
            <select
              value={timer}
              onChange={(e) => setTimer(Number(e.target.value))}
            >
              {[15, 30, 45, 60].map((t) => (
                <option key={t} value={t}>
                  {t} seconds
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="td-textarea-wrap">
          <textarea
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            placeholder="Type here..."
            maxLength={100}
          />
          <div className="td-counter">{qText.length}/100</div>
        </div>

        <div className="td-options-wrap">
          <div className="td-options-head">
            <span className="td-label">Edit Options</span>
          </div>
          <div className="td-options-list">
            {options.map((opt, i) => (
              <div key={i} className="td-option-row">
                <span className="td-chip">{i + 1}</span>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => updateOption(i, "text", e.target.value)}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="td-remove"
                    onClick={() =>
                      setOptions(options.filter((_, idx) => idx !== i))
                    }
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="td-add"
            onClick={() =>
              setOptions([...options, { text: "", isCorrect: false }])
            }
          >
            + Add Option
          </button>
        </div>
        <div className="td-footer-cta">
          <button className="td-ask" type="submit">
            Ask Question
          </button>
        </div>
      </form>

      {currentQuestion && (
        <>
          <h2 className="td-section-title">Current Results</h2>
          <div className="td-result-card">
            <div className="td-result-header">
              <div className="td-result-title">{currentQuestion.question}</div>
            </div>
            <div className="td-result-body">
              {currentQuestion.options.map((opt, i) => {
                const count = results?.answerCounts?.[opt] || 0;
                const total = results?.totalAnswers || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={i} className="td-result-row">
                    <div
                      className="td-result-fill"
                      style={{ width: `${pct}%` }}
                    ></div>
                    <span className="td-result-chip">{i + 1}</span>
                    <span className="td-result-text">{opt}</span>
                    <span className="td-result-pct">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="td-status">
        <div className={`status-dot ${isConnected ? "ok" : "bad"}`}></div>
        <span>{isConnected ? "Connected" : "Disconnected"}</span>
        <span className="td-dot">•</span>
        <span>Students: {students.length}</span>
      </div>

      <Chat userType="teacher" name="Teacher" userId="teacher" />
    </div>
  );
};

export default Teacher;
