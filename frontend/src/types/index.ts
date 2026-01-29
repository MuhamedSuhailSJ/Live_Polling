export interface Student {
  studentId: string;
  name: string;
  tabId: string;
  hasAnswered?: boolean;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  timeLimit?: number;
}

export interface PollResult {
  questionId: string;
  totalAnswers: number;
  totalStudents: number;
  answerCounts: Record<string, number>;
}

export interface PollState {
  teacherId: string | null;
  studentId: string | null;
  status: "waiting" | "active" | "completed";
  currentQuestion: Question | null;
  results: PollResult | null;
  students: Student[];
}
