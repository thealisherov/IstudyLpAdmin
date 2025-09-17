// admin/src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ManageCourses from './components/ManageCourses';
import ManageTeachers from './components/ManageTeachers';
import ManageResults from './components/ManageResults';
import { Toaster } from 'react-hot-toast'; // Ogohlantirishlar uchun (npm install react-hot-toast)

// Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

const App = () => {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><ManageCourses /></ProtectedRoute>} />
          <Route path="/teachers" element={<ProtectedRoute><ManageTeachers /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><ManageResults /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </SessionContextProvider>
  );
};

// Protected Route komponenti
const ProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Yuklanmoqda...</div>;
  if (!session) return <Navigate to="/login" />;

  return children;
};

export default App;