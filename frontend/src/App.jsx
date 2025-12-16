// App.jsx
import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Home from "./pages/Home";
import TopicExplorer from "./pages/TopicExplorer";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import OAuthSuccess from "./pages/OAuthSuccess";
import VerifyEmail from "./pages/VerifyEmail";

import ProtectedRoute from "./components/ProtectedRoutes/ProtectedRoute";
import { fetchMe } from "./api/user";
import { setUser } from "./store/userSlice";

/* ================== BOOTSTRAP ================== */
function AppBootstrap({ children }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.accessToken);

  useEffect(() => {
    if (token) {
      fetchMe()
        .then((user) => dispatch(setUser(user)))
        .catch(() => {});
    }
  }, [token, dispatch]);

  return children;
}

/* ================== APP ================== */
function App() {


  return (
    <AppBootstrap>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail/>}/>
        <Route path="/login" element={<Login />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />

        {/* Protected routes */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <TopicExplorer />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="p-8 text-center text-white">
              Page not found
            </div>
          }
        />
      </Routes>
    </AppBootstrap>
  );
}

/* ================== WRAPPER ================== */
export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
