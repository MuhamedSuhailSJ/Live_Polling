const BASE_URL = "https://live-polling-opal.vercel.app"; // Or process.env.REACT_APP_API_URL

export const api = {
  createPoll: async () => {
    const res = await fetch(`${BASE_URL}/api/poll`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to create poll");
    return res.json();
  },

  getPoll: async () => {
    const res = await fetch(`${BASE_URL}/api/poll`);
    if (!res.ok) throw new Error("Poll not found");
    return res.json();
  },

  joinPoll: async (name: string, tabId: string) => {
    const res = await fetch(`${BASE_URL}/api/poll/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, tabId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to join");
    return data;
  },

  addQuestion: async (
    question: string,
    options: { text: string }[],
    timerSec: number,
  ) => {
    const res = await fetch(`${BASE_URL}/api/poll/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, options, timerSec }),
    });
    if (!res.ok) throw new Error("Failed to add question");
    return res.json();
  },

  checkBan: async (tabId: string) => {
    const res = await fetch(
      `${BASE_URL}/api/poll/ban/check?tabId=${encodeURIComponent(tabId)}`,
    );
    return res.json();
  },
};
