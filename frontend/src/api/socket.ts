import { io, Socket } from "socket.io-client";

const SOCKET_URL = "https://live-polling-opal.vercel.app";

class SocketManager {
  public socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        path: "/socket.io",
        transports: ["polling", "websocket"],
      });
    }
    return this.socket;
  }

  join(userType: "teacher" | "student", studentId?: string, name?: string) {
    this.connect();
    this.socket?.emit("joinPoll", { userType, studentId, name });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Helpers
  sendChat(payload: any) {
    this.socket?.emit("chat:message", payload);
  }
  kickStudent(studentId: string) {
    this.socket?.emit("participant:kick", { studentId });
  }
  submitAnswer(sid: string, qid: string, ans: string) {
    this.socket?.emit("submitAnswer", {
      studentId: sid,
      questionId: qid,
      answer: ans,
    });
  }
  requestResults(questionId: string) {
    this.socket?.emit("requestResults", { questionId });
  }
}

export const socket = new SocketManager();
