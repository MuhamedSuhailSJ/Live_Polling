import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { getTabId } from "../utils/storage";
import { checkBanStatus } from "../utils/ban";
import "../components/Styles/Join.css";

const Join: React.FC = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkBanStatus().then(({ banned }) => {
      if (banned) navigate("/banned");
    });
  }, [navigate]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      const tabId = getTabId();
      const { studentId } = await api.joinPoll(name, tabId);

      localStorage.setItem("studentId", studentId);
      localStorage.setItem("studentName", name);
      navigate("/student");
    } catch (e) {
      alert("Failed to join poll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-container">
      <div className="badge">
        <span className="badge-text">✨ Intervue Poll</span>
      </div>
      <div className="heading">
        <h1>
          Let's <span className="bold">Get Started</span>
        </h1>
        <p>
          If you’re a student, you’ll be able to{" "}
          <span className="bold">submit your answers</span>, participate in live
          polls, and see how your responses compare with your classmates
        </p>
      </div>
      <form className="input-section" onSubmit={handleJoin}>
        <label>Enter your Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          disabled={loading}
        />
        <button
          className="continue-btn"
          type="submit"
          disabled={!name || loading}
        >
          {loading ? "Joining..." : "Continue"}
        </button>
      </form>
    </div>
  );
};

export default Join;
