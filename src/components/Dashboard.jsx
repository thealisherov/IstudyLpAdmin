// admin/src/components/Dashboard.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { LogOut, BarChart3, BookOpen, Users, Award } from 'lucide-react';
import toast from 'react-hot-toast';

// Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = React.useState({ courses: 0, teachers: 0, results: 0 });

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [coursesRes, teachersRes, resultsRes] = await Promise.all([
      supabase.from('courses').select('count').single(),
      supabase.from('teachers').select('count').single(),
      supabase.from('student_results').select('count').single()
    ]);
    setStats({
      courses: coursesRes.data?.count || 0,
      teachers: teachersRes.data?.count || 0,
      results: resultsRes.data?.count || 0
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Chiqish muvaffaqiyatli!');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        <nav className="p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50">
            <BarChart3 className="w-5 h-5" />
            <span>Boshqaruv</span>
          </Link>
          <Link to="/courses" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50">
            <BookOpen className="w-5 h-5" />
            <span>Kurslar</span>
          </Link>
          <Link to="/teachers" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50">
            <Users className="w-5 h-5" />
            <span>O'qituvchilar</span>
          </Link>
          <Link to="/results" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50">
            <Award className="w-5 h-5" />
            <span>Natijalar</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="w-5 h-5" />
            <span>Chiqish</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Kurslar soni</p>
                <p className="text-3xl font-bold text-purple-600">{stats.courses}</p>
              </div>
              <BookOpen className="w-12 h-12 text-purple-500 opacity-75" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">O'qituvchilar soni</p>
                <p className="text-3xl font-bold text-blue-600">{stats.teachers}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500 opacity-75" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Natijalar soni</p>
                <p className="text-3xl font-bold text-green-600">{stats.results}</p>
              </div>
              <Award className="w-12 h-12 text-green-500 opacity-75" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-4">Xush kelibsiz!</h2>
          <p className="text-gray-600">Bu yerda siz barcha ma'lumotlarni boshqarishingiz mumkin.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;