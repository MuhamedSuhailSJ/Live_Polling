import React, { useState, useEffect, useRef } from "react";
import { socket } from "../api/socket";
import type{ Student } from "../types";
import "./Styles/Chat.css";

interface ChatProps {
  userType: "teacher" | "student";
  userId: string;
  name: string;
}

const Chat: React.FC<ChatProps> = ({ userType, userId, name }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"chat" | "people">("chat");
  const [msgs, setMsgs] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [people, setPeople] = useState<Student[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const io = socket.connect();

    io.on("chat:message", (msg: any) => {
      setMsgs((prev) => [...prev, msg]);
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    });

    io.on("participants:list", (data: { students: Student[] }) =>
      setPeople(data.students),
    );

    return () => {
      io.off("chat:message");
      io.off("participants:list");
    };
  }, []);

  const send = () => {
    if (!input.trim()) return;
    socket.sendChat({ userId, userType, name, text: input });
    setInput("");
  };

  return (
    <>
      <button className="td-chat" onClick={() => setIsOpen(!isOpen)}>
        💬
      </button>
      {isOpen && (
        <div className="cw-panel">
          <div className="cw-tabs">
            <button
              className={`cw-tab ${tab === "chat" ? "active" : ""}`}
              onClick={() => setTab("chat")}
            >
              Chat
            </button>
            <button
              className={`cw-tab ${tab === "people" ? "active" : ""}`}
              onClick={() => setTab("people")}
            >
              People
            </button>
          </div>
          <div className="cw-body">
            {tab === "chat" ? (
              <>
                {msgs.map((m, i) => (
                  <div
                    key={i}
                    className={`cw-msg ${m.userId === userId ? "mine" : ""}`}
                  >
                    <div className="cw-msg-user">{m.name}</div>
                    <div className="cw-bubble">{m.text}</div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </>
            ) : (
              people.map((p) => (
                <div key={p.studentId} className="cw-part-row">
                  <span className="cw-name">{p.name}</span>
                  {userType === "teacher" && (
                    <button
                      className="cw-kick"
                      onClick={() => socket.kickStudent(p.studentId)}
                    >
                      Kick
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          {tab === "chat" && (
            <div className="cw-input">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button onClick={send}>Send</button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Chat;
