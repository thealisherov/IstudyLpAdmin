// admin/src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, BookOpen, Users, Award, Settings } from 'lucide-react';
import { supabase } from '../App';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({ courses: 0, teachers: 0, results: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [coursesRes, teachersRes, resultsRes] = await Promise.all([
        supabase.from('courses').select('id', { count: 'exact' }),
        supabase.from('teachers').select('id', { count: 'exact' }),
        supabase.from('student_results').select('id', { count: 'exact' })
      ]);

      if (coursesRes.error) throw coursesRes.error;
      if (teachersRes.error) throw teachersRes.error;
      if (resultsRes.error) throw resultsRes.error;

      setStats({
        courses: coursesRes.count || 0,
        teachers: teachersRes.count || 0,
        results: resultsRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Statistikalarni yuklashda xato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-500">Boshqaruv tizimi</p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-purple-50 text-purple-700 font-medium"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Boshqaruv</span>
          </Link>
          <Link 
            to="/courses" 
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            <span>Kurslar</span>
          </Link>
          <Link 
            to="/teachers" 
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
          >
            <Users className="w-5 h-5" />
            <span>O'qituvchilar</span>
          </Link>
          <Link 
            to="/results" 
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
          >
            <Award className="w-5 h-5" />
            <span>Natijalar</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Boshqaruv Paneli</h2>
          <p className="text-gray-600">Umumiy statistika va ma'lumotlar</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Jami Kurslar</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.courses}</p>
                  <p className="text-sm text-gray-500 mt-1">Faol kurslar soni</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <BookOpen className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">O'qituvchilar</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.teachers}</p>
                  <p className="text-sm text-gray-500 mt-1">Faol o'qituvchilar</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Talaba Natijalari</p>
                  <p className="text-3xl font-bold text-green-600">{stats.results}</p>
                  <p className="text-sm text-gray-500 mt-1">Muvaffaqiyatli bitirganlar</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-purple-600" />
              Admin Panel
            </h3>
            <p className="text-gray-600 mb-4">
              Bu admin panelida siz barcha ma'lumotlarni boshqarishingiz mumkin. 
              Kurslar, o'qituvchilar va talabalar natijalarini qo'shish, o'zgartirish va o'chirish imkoniyati mavjud.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <span>Kurslar bo'limida yangi kurslar qo'shing</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span>O'qituvchilar ma'lumotlarini yangilang</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Talabalar natijalarini qayd eting</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-4">Tezkor Havolalar</h3>
            <div className="space-y-3">
              <Link 
                to="/courses" 
                className="flex items-center space-x-3 p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
              >
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <span className="font-medium text-gray-900">Yangi kurs qo'shish</span>
                  <p className="text-sm text-gray-500">Kurslar sahifasiga o'ting</p>
                </div>
              </Link>
              <Link 
                to="/teachers" 
                className="flex items-center space-x-3 p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <span className="font-medium text-gray-900">O'qituvchi qo'shish</span>
                  <p className="text-sm text-gray-500">O'qituvchilar sahifasiga o'ting</p>
                </div>
              </Link>
              <Link 
                to="/results" 
                className="flex items-center space-x-3 p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group"
              >
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <span className="font-medium text-gray-900">Natija qo'shish</span>
                  <p className="text-sm text-gray-500">Natijalar sahifasiga o'ting</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;