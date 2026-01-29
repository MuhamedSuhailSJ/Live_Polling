import { api } from "../api/api";
import { getTabId } from "./storage";

const LOCAL_KEY = "banList";

export const banTabLocally = (minutes = 10): void => {
  const tabId = getTabId();
  const list = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
  list[tabId] = Date.now() + minutes * 60 * 1000;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
};

export const checkBanStatus = async (): Promise<{ banned: boolean }> => {
  const tabId = getTabId();
  try {
    const { banned } = await api.checkBan(tabId);
    return { banned };
  } catch   {
    // Fallback to local check
    const list = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
    const exp = list[tabId];
    if (exp && Date.now() < exp) return { banned: true };
    return { banned: false };
  }
};
