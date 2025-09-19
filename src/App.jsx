// admin/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import Dashboard from './components/Dashboard';
import ManageCourses from './components/ManageCourses';
import ManageTeachers from './components/ManageTeachers';
import ManageResults from './components/ManageResults';
import { Toaster } from 'react-hot-toast';

// Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<ManageCourses />} />
        <Route path="/teachers" element={<ManageTeachers />} />
        <Route path="/results" element={<ManageResults />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
};

export { supabase };
export default App;