import React, { useEffect, useState } from "react";
import { api } from "../api/api";
import { socket } from "../api/socket";
import "../components/Styles/History.css";

const History: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [resultsMap, setResultsMap] = useState<Record<string, any>>({});

  useEffect(() => {
    api.getPoll().then((data) => {
      setQuestions(data.questions || []);
      const io = socket.connect();
      io.on("questionResults", (res: any) => {
        setResultsMap((prev) => ({ ...prev, [res.questionId]: res }));
      });
      data.questions?.forEach((q: any) => socket.requestResults(q.id));
    });
  }, []);

  return (
    <div className="ph-wrap">
      <h1 className="ph-title">Poll History</h1>
      {questions.map((q, i) => {
        const res = resultsMap[q.id];
        return (
          <div key={q.id} className="ph-block">
            <h2 className="ph-qnum">Question {i + 1}</h2>
            <div className="ph-card">
              <div className="ph-header">{q.question}</div>
              <div className="ph-body">
                {q.options.map((opt: any, idx: number) => {
                  const total = res?.totalAnswers || 1;
                  const count = res?.answerCounts?.[opt.text] || 0;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={idx} className="ph-row">
                      <div
                        className="ph-fill"
                        style={{ width: `${pct}%` }}
                      ></div>
                      <span className="ph-chip">{idx + 1}</span>
                      <span className="ph-text">{opt.text}</span>
                      <span className="ph-pct">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default History;
