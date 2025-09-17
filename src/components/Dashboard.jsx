// admin/src/components/Dashboard.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { LogOut, BarChart3, BookOpen, Users, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const supabase = useSupabaseClient();
  const [stats, setStats] = React.useState({ courses: 0, teachers: 0, results: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [coursesRes, teachersRes, resultsRes] = await Promise.all([
        supabase.from('courses').select('id', { count: 'exact' }),
        supabase.from('teachers').select('id', { count: 'exact' }),
        supabase.from('student_results').select('id', { count: 'exact' })
      ]);

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

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Chiqishda xato yuz berdi');
    } else {
      toast.success('Chiqish muvaffaqiyatli!');
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
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
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700"
          >
            <BookOpen className="w-5 h-5" />
            <span>Kurslar</span>
          </Link>
          <Link 
            to="/teachers" 
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700"
          >
            <Users className="w-5 h-5" />
            <span>O'qituvchilar</span>
          </Link>
          <Link 
            to="/results" 
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700"
          >
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
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
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

            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
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

            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
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
            <h3 className="text-xl font-bold mb-4">Xush kelibsiz!</h3>
            <p className="text-gray-600 mb-4">
              Bu admin panelida siz barcha ma'lumotlarni boshqarishingiz mumkin. 
              Kurslar, o'qituvchilar va talabalar natijalarini qo'shish, o'zgartirish va o'chirish imkoniyati mavjud.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Kurslar bo'limida yangi kurslar qo'shing</p>
              <p>• O'qituvchilar ma'lumotlarini yangilang</p>
              <p>• Talabalar natijalarini qayd eting</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-4">Tezkor Havolalar</h3>
            <div className="space-y-3">
              <Link 
                to="/courses" 
                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50"
              >
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span>Yangi kurs qo'shish</span>
              </Link>
              <Link 
                to="/teachers" 
                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50"
              >
                <Users className="w-5 h-5 text-blue-600" />
                <span>O'qituvchi qo'shish</span>
              </Link>
              <Link 
                to="/results" 
                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50"
              >
                <Award className="w-5 h-5 text-green-600" />
                <span>Natija qo'shish</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;