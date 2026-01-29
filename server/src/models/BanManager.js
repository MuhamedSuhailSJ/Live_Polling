const store = require("../data/store");

const BanManager = {
  add: (tabId, minutes = 10) => {
    if (!tabId) return;
    const expiresAt = Date.now() + minutes * 60 * 1000;
    store.bannedTabs.set(tabId, expiresAt);
  },

  check: (tabId) => {
    if (!tabId) return { isBanned: false, expiry: null };

    const expiry = store.bannedTabs.get(tabId);
    if (!expiry) return { isBanned: false, expiry: null };
 
    if (Date.now() > expiry) {
      store.bannedTabs.delete(tabId);
      return { isBanned: false, expiry: null };
    }

    return { isBanned: true, expiry };
  },
};

module.exports = BanManager;
