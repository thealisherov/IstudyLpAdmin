// admin/src/components/Login.jsx
import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <BookOpen className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Panel</h2>
          <p className="text-gray-600">Kirish uchun hisobingizdan foydalaning</p>
        </div>
        <Auth
          supabaseClient={window.supabase} // Global sifatida o'rnatish kerak (index.html da)
          appearance={{ theme: ThemeSupa }}
          providers={['google', 'github']} // Ixtiyoriy, local email/password default
          onAuthStateChange={(event, session) => {
            if (event === 'SIGNED_IN') {
              navigate('/dashboard');
            }
          }}
        />
      </div>
    </div>
  );
};

export default Login;