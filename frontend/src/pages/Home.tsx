import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { checkBanStatus } from "../utils/ban";
import "../components/Styles/Home.css";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "teacher" | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkBanStatus().then(({ banned }) => {
      if (banned) navigate("/banned");
    });
    localStorage.clear(); // Reset session
  }, [navigate]);

  const handleContinue = async () => {
    if (!role) return;
    if (role === "teacher") {
      setLoading(true);
      try {
        const { teacherId } = await api.createPoll();
        localStorage.setItem("teacherId", teacherId);
        navigate("/teacher");
      } catch {
        alert("Error starting poll");
      } finally {
        setLoading(false);
      }
    } else {
      navigate("/join");
    }
  };

  return (
    <main className="lp-root">
      <div className="lp-badge">
        <span>✨ Intervue Poll</span>
      </div>
      <section className="lp-head">
        <h1 className="lp-title">
          Welcome to the{" "}
          <span className="lp-title-strong">Live Polling System</span>
        </h1>
        <p className="lp-subtitle">
          {" "}
          Please select the role that best describes you to begin using the live
          polling system
        </p>
      </section>
      <section className="lp-cards">
        <div
          className={`lp-card lp-card--outlined ${role === "student" ? "is-selected" : ""}`}
          onClick={() => setRole("student")}
        >
          <h3 className="lp-card-title">I’m a Student</h3>
          <p className="lp-card-desc">Join active polls and submit answers.</p>
        </div>
        <div
          className={`lp-card lp-card--outlined ${role === "teacher" ? "is-selected" : ""}`}
          onClick={() => setRole("teacher")}
        >
          <h3 className="lp-card-title">I’m a Teacher</h3>
          <p className="lp-card-desc">
            Submit answers and view live poll results in real-time.
          </p>
        </div>
      </section>
      <div className="lp-cta-wrap">
        <button
          className="lp-cta"
          onClick={handleContinue}
          disabled={!role || loading}
        >
          {loading ? "Please wait..." : "Continue"}
        </button>
      </div>
    </main>
  );
};

export default Home;
