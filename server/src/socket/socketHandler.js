const store = require("../data/store");
const BanManager = require("../models/BanManager");

const ROOM_KEY = process.env.ROOM_KEY || "default-room";

module.exports = (io) => {
  const broadcastStudentList = () => {
    if (!store.poll) return;
    const students = Array.from(store.poll.students.entries()).map(
      ([id, i]) => ({
        studentId: id,
        name: i.name,
      }),
    );
    io.to(ROOM_KEY).emit("participants:list", { students });
  };

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinPoll", ({ userType, studentId, name }) => {
      if (!store.poll) return;
      socket.join(ROOM_KEY);

      if (userType === "student" && studentId) {
        store.sockets.studentToSocket.set(studentId, socket.id);
        store.sockets.socketToStudent.set(socket.id, studentId);
      }

      socket.emit("pollJoined", { userType, studentId, name });

      const studentList = Array.from(store.poll.students.entries()).map(
        ([id, s]) => ({
          studentId: id,
          name: s.name,
        }),
      );

      io.to(ROOM_KEY).emit("userJoined", {
        userType,
        name: name || "Unknown",
        id: studentId || socket.id,
        students: studentList,
      });
      broadcastStudentList();
    });

    socket.on("chat:message", (payload) => {
      if (payload?.text) io.to(ROOM_KEY).emit("chat:message", payload);
    });

    socket.on("participant:kick", ({ studentId }) => {
      if (!store.poll) return;
      const student = store.poll.students.get(studentId);
      if (!student) return;

      BanManager.add(student.tabId, 10);
      store.poll.students.delete(studentId);

      const socketId = store.sockets.studentToSocket.get(studentId);
      if (socketId) {
        io.to(socketId).emit("forceDisconnect", {
          reason: "You have been removed from the poll.",
        });
        const target = io.sockets.sockets.get(socketId);
        if (target) target.leave(ROOM_KEY);
        store.sockets.studentToSocket.delete(studentId);
        store.sockets.socketToStudent.delete(socketId);
      }

      io.to(ROOM_KEY).emit("participantKicked", {
        studentId,
        name: student.name,
      });
      broadcastStudentList();
    });

    socket.on("submitAnswer", ({ studentId, questionId, answer }) => {
      if (!store.poll) return;
      if (store.poll.submitAnswer(studentId, questionId, answer)) {
        const results = store.poll.getResults(questionId);
        io.to(ROOM_KEY).emit("answerSubmitted", {
          questionId,
          results,
          studentId,
          studentName: store.poll.students.get(studentId)?.name,
        });

        if (store.poll.canProceed()) {
          io.to(ROOM_KEY).emit("allStudentsAnswered", { questionId, results });
          store.poll.status = "waiting";
          store.poll.currentQuestion = null;
          if (store.timer) {
            clearTimeout(store.timer);
            store.timer = null;
          }
        }
      }
    });

    socket.on("requestResults", ({ questionId }) => {
      if (!store.poll) return;
      socket.emit("questionResults", store.poll.getResults(questionId));
    });

    socket.on("disconnect", () => {
      const sid = store.sockets.socketToStudent.get(socket.id);
      if (sid) {
        store.sockets.studentToSocket.delete(sid);
        store.sockets.socketToStudent.delete(socket.id);
      }
    });
  });
};
