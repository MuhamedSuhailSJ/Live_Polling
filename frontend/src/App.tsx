import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Join from "./pages/Join";
import Teacher from "./pages/Teacher";
import Student from "./pages/Student";
import History from "./pages/History";
import Banned from "./pages/Banned";
import "./App.css";

const App: React.FC = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/teacher" element={<Teacher />} />
        <Route path="/join" element={<Join />} />
        <Route path="/student" element={<Student />} />
        <Route path="/history" element={<History />} />
        <Route path="/banned" element={<Banned />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
