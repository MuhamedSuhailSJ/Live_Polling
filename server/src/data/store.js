const store = {
  poll: null,
  timer: null,
  bannedTabs: new Map(),
  sockets: {
    studentToSocket: new Map(),
    socketToStudent: new Map(),
  },
};

module.exports = store;
