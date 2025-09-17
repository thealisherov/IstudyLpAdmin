// admin/src/components/BackToDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';

const BackToDashboard = ({ className = '' }) => {
  return (
    <Link 
      to="/dashboard" 
      className={`inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 ${className}`}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      <BarChart3 className="w-4 h-4 mr-2" />
      <span>Dashboard'ga qaytish</span>
    </Link>
  );
};

export default BackToDashboard;