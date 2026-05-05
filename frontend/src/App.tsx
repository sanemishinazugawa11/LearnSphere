import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "./store/useStore";
import Navbar from "./components/Navbar";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CourseDetail from "./pages/CourseDetail";
import LessonViewer from "./pages/LessonViewer";
import InstructorStudio from './pages/InstructorPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useStore((state) => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 font-sans text-zinc-900 antialiased selection:bg-teal-100 selection:text-teal-900">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/course/:courseId" element={<CourseDetail />} />
                <Route path="/course/:courseId/lesson/:lessonId" element={<LessonViewer />} />
                <Route path="/instructor" element={<InstructorStudio />} />
              </Routes>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;