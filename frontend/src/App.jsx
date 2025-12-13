// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import TopicExplorer from "./pages/TopicExplorer";
import Signup from "./pages/Signup";
import Login from "./pages/Login";

function App() {
;
  // Only show on Home

  return (
    <>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path='/chat/:id' element={<TopicExplorer/>} />

        <Route
          path="*"
          element={
            <div className="p-8 text-center text-white">Page not found</div>
          }
        />
      </Routes>
    </>
  );
}

export default function AppWrapper() {
  // BrowserRouter must wrap App to allow useLocation inside App
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
