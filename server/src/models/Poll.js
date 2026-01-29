const { v4: uuidv4 } = require("uuid");

class Poll {
  constructor(teacherId) {
    this.id = uuidv4();
    this.teacherId = teacherId;
    this.students = new Map(); 
    this.currentQuestion = null;
    this.questions = [];
    this.results = new Map(); 
    this.status = "waiting";
    this.createdAt = new Date();
  }

  addStudent(studentId, name, tabId) {
    this.students.set(studentId, { name, tabId, hasAnswered: false });
  }

  addQuestion(questionData) {
    const questionId = uuidv4();
    this.questions.push({ id: questionId, ...questionData });
    this.results.set(questionId, { answers: new Map(), totalAnswers: 0 });
    return questionId;
  }

  submitAnswer(studentId, questionId, answer) {
    const result = this.results.get(questionId);
    const student = this.students.get(studentId);

    if (!result || !student) return false;
    if (result.answers.has(studentId)) return false;  

    result.answers.set(studentId, answer);
    result.totalAnswers++;
    student.hasAnswered = true;
    return true;
  }

  canProceed() {
    if (!this.currentQuestion) return false;
    const result = this.results.get(this.currentQuestion.id);
    return result.totalAnswers === this.students.size;
  }

  getResults(questionId) {
    const result = this.results.get(questionId);
    if (!result) return null;

    const answerCounts = {};
    result.answers.forEach((ans) => {
      answerCounts[ans] = (answerCounts[ans] || 0) + 1;
    });

    return {
      questionId,
      totalAnswers: result.totalAnswers,
      totalStudents: this.students.size,
      answerCounts,
      studentAnswers: Array.from(result.answers.entries()).map(
        ([sid, ans]) => ({
          studentId: sid,
          studentName: this.students.get(sid)?.name,
          answer: ans,
        }),
      ),
    };
  }
}

module.exports = Poll;
