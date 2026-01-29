const express = require("express");
const { v4: uuidv4 } = require("uuid");
const store = require("../data/store");
const Poll = require("../models/Poll");
const BanManager = require("../models/BanManager");

const ROOM_KEY = process.env.ROOM_KEY || "default-room";

module.exports = (io) => {
  const router = express.Router();

  const startQuestionTimer = (questionId, durationSec) => {
    if (store.timer) {
      clearTimeout(store.timer);
      store.timer = null;
    }

    store.timer = setTimeout(() => {
      const { poll } = store;
      if (
        poll &&
        poll.status === "active" &&
        poll.currentQuestion?.id === questionId
      ) {
        const results = poll.getResults(questionId);
        io.to(ROOM_KEY).emit("questionTimeUp", { questionId, results });
        poll.status = "waiting";
        poll.currentQuestion = null;
      }
      store.timer = null;
    }, durationSec * 1000);
  };


  router.post("/", (req, res) => {
    const teacherId = uuidv4();
    store.poll = new Poll(teacherId);
    if (store.timer) {
      clearTimeout(store.timer);
      store.timer = null;
    }
    res.json({ teacherId });
  });

  router.get("/", (req, res) => {
    if (!store.poll)
      return res.status(404).json({ error: "Poll not created yet" });
    const { id, status, students, currentQuestion, questions } = store.poll;
    res.json({
      id,
      status,
      students: Array.from(students.values()),
      currentQuestion,
      questions,
    });
  });

  router.post("/join", (req, res) => {
    if (!store.poll)
      return res.status(404).json({ error: "Poll not created yet" });
    const { name, tabId } = req.body;

    if (!name || !tabId)
      return res.status(400).json({ error: "Missing fields" });

    const { isBanned, expiry } = BanManager.check(tabId);
    if (isBanned)
      return res.status(403).json({ error: "Banned", bannedUntil: expiry });

    const isJoined = Array.from(store.poll.students.values()).some(
      (s) => s.tabId === tabId,
    );
    if (isJoined) return res.status(400).json({ error: "Already connected" });

    const studentId = uuidv4();
    store.poll.addStudent(studentId, name, tabId);
    res.json({ studentId });
  });

  router.post("/questions", (req, res) => {
    if (!store.poll)
      return res.status(404).json({ error: "Poll not created yet" });
    const { question, options, timerSec } = req.body;

    if (!question || !options || options.length === 0)
      return res.status(400).json({ error: "Invalid payload" });
    if (store.poll.status === "active" && !store.poll.canProceed()) {
      return res.status(400).json({ error: "Current question not finished" });
    }

    const questionId = store.poll.addQuestion({ question, options });
    const optionTexts = options.map((opt) => opt.text);

    store.poll.currentQuestion = {
      id: questionId,
      question,
      options: optionTexts,
    };
    store.poll.status = "active";

    startQuestionTimer(questionId, timerSec);
    io.to(ROOM_KEY).emit("newQuestion", {
      ...store.poll.currentQuestion,
      timeLimit: timerSec,
    });

    res.json({ questionId });
  });

  router.get("/ban/check", (req, res) => {
    const { tabId } = req.query;
    if (!tabId) return res.status(400).json({ error: "tabId required" });
    const { isBanned, expiry } = BanManager.check(tabId);
    res.json({ banned: isBanned, bannedUntil: expiry });
  });

  return router;
};
