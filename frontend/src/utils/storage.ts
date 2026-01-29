export const generateTabId = (): string => {
  return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getTabId = (): string => {
  let tabId = localStorage.getItem("tabId");
  if (!tabId) {
    tabId = generateTabId();
    localStorage.setItem("tabId", tabId);
  }
  return tabId;
};
