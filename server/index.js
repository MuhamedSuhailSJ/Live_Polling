const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");

const pollRoutes = require("./src/routes/pollRoutes");
const socketHandler = require("./src/socket/socketHandler");

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";


const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  path: "/socket.io",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false,
  },
});


app.use(cors());
app.use(express.json());


app.use("/api/poll", pollRoutes(io));


socketHandler(io);


if (NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
}


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
});
