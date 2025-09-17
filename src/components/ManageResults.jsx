// admin/src/components/ManageTeachers.jsx
import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, Upload, X, User, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageTeachers = () => {
  const supabase = useSupabaseClient();
  const [teachers, setTeachers] = useState([]);
  const [newTeacher, setNewTeacher] = useState({ 
    name: '', 
    specialization: '', 
    bio: '', 
    experience: '', 
    students_count: '', 
    rating: '',
    avatar_url: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('O\'qituvchilarni yuklashda xato');
      console.error('Error fetching teachers:', error);
    } else {
      setTeachers(data || []);
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('teacher-avatars')
      .upload(filePath, file);

    if (uploadError) {
      toast.error('Rasm yuklashda xato');
      return null;
    }

    const { data } = supabase.storage
      .from('teacher-avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleImageUpload = async (e, isEditing = false) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Rasm hajmi 5MB dan kichik bo\'lishi kerak');
      return;
    }

    setUploading(true);
    const imageUrl = await uploadImage(file);
    
    if (imageUrl) {
      if (isEditing) {
        setEditingTeacher({ ...editingTeacher, avatar_url: imageUrl });
      } else {
        setNewTeacher({ ...newTeacher, avatar_url: imageUrl });
      }
      toast.success('Rasm yuklandi');
    }
    setUploading(false);
  };

  const addTeacher = async (e) => {
    e.preventDefault();
    if (!newTeacher.name.trim()) {
      toast.error('Ism kiritish majburiy');
      return;
    }

    // Convert string numbers to integers/floats
    const teacherData = {
      ...newTeacher,
      experience: newTeacher.experience ? parseInt(newTeacher.experience) : null,
      students_count: newTeacher.students_count ? parseInt(newTeacher.students_count) : 0,
      rating: newTeacher.rating ? parseFloat(newTeacher.rating) : null
    };

    const { error } = await supabase
      .from('teachers')
      .insert([teacherData]);

    if (error) {
      toast.error('O\'qituvchi qo\'shishda xato');
      console.error('Error adding teacher:', error);
    } else {
      toast.success('O\'qituvchi qo\'shildi!');
      setNewTeacher({ 
        name: '', 
        specialization: '', 
        bio: '', 
        experience: '', 
        students_count: '', 
        rating: '',
        avatar_url: ''
      });
      setShowForm(false);
      fetchTeachers();
    }
  };

  const updateTeacher = async (e) => {
    e.preventDefault();
    if (!editingTeacher.name.trim()) {
      toast.error('Ism kiritish majburiy');
      return;
    }

    // Convert string numbers to integers/floats
    const teacherData = {
      ...editingTeacher,
      experience: editingTeacher.experience ? parseInt(editingTeacher.experience) : null,
      students_count: editingTeacher.students_count ? parseInt(editingTeacher.students_count) : 0,
      rating: editingTeacher.rating ? parseFloat(editingTeacher.rating) : null
    };

    const { error } = await supabase
      .from('teachers')
      .update(teacherData)
      .eq('id', editingId);

    if (error) {
      toast.error('O\'qituvchi yangilashda xato');
      console.error('Error updating teacher:', error);
    } else {
      toast.success('O\'qituvchi yangilandi!');
      setEditingId(null);
      setEditingTeacher(null);
      fetchTeachers();
    }
  };

  const deleteTeacher = async (id, avatarUrl) => {
    if (!confirm('O\'qituvchini o\'chirishni xohlaysizmi?')) return;

    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('O\'qituvchi o\'chirishda xato');
    } else {
      // Delete avatar from storage if exists
      if (avatarUrl) {
        const fileName = avatarUrl.split('/').pop();
        await supabase.storage
          .from('teacher-avatars')
          .remove([fileName]);
      }
      toast.success('O\'qituvchi o\'chirildi!');
      fetchTeachers();
    }
  };

  const startEdit = (teacher) => {
    setEditingId(teacher.id);
    setEditingTeacher({ 
      ...teacher,
      experience: teacher.experience?.toString() || '',
      students_count: teacher.students_count?.toString() || '',
      rating: teacher.rating?.toString() || ''
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTeacher(null);
    setShowForm(false);
    setNewTeacher({ 
      name: '', 
      specialization: '', 
      bio: '', 
      experience: '', 
      students_count: '', 
      rating: '',
      avatar_url: ''
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current opacity-50" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  const paginatedTeachers = teachers.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  const totalPages = Math.ceil(teachers.length / itemsPerPage);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">O'qituvchilarni Boshqarish</h1>
          <p className="text-gray-600 mt-2">Jami {teachers.length} ta o'qituvchi</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Yopish' : 'O\'qituvchi Qo\'shish'}
        </button>
      </div>

      {/* Qo'shish/Tahrirlash formasi */}
      {showForm && (
        <form onSubmit={editingId ? updateTeacher : addTeacher} className="bg-white p-6 rounded-xl shadow-md mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="To'liq ism *"
              value={editingId ? editingTeacher.name : newTeacher.name}
              onChange={(e) => editingId 
                ? setEditingTeacher({ ...editingTeacher, name: e.target.value }) 
                : setNewTeacher({ ...newTeacher, name: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Mutaxassislik (masalan: React Developer)"
              value={editingId ? editingTeacher.specialization : newTeacher.specialization}
              onChange={(e) => editingId 
                ? setEditingTeacher({ ...editingTeacher, specialization: e.target.value }) 
                : setNewTeacher({ ...newTeacher, specialization: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Tajriba (yil)"
              min="0"
              max="50"
              value={editingId ? editingTeacher.experience : newTeacher.experience}
              onChange={(e) => editingId 
                ? setEditingTeacher({ ...editingTeacher, experience: e.target.value }) 
                : setNewTeacher({ ...newTeacher, experience: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="O'quvchilar soni"
              min="0"
              value={editingId ? editingTeacher.students_count : newTeacher.students_count}
              onChange={(e) => editingId 
                ? setEditingTeacher({ ...editingTeacher, students_count: e.target.value }) 
                : setNewTeacher({ ...newTeacher, students_count: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              placeholder="Reyting (0-5)"
              value={editingId ? editingTeacher.rating : newTeacher.rating}
              onChange={(e) => editingId 
                ? setEditingTeacher({ ...editingTeacher, rating: e.target.value }) 
                : setNewTeacher({ ...newTeacher, rating: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <textarea
            placeholder="Biografiya va qisqacha ma'lumot"
            value={editingId ? editingTeacher.bio : newTeacher.bio}
            onChange={(e) => editingId 
              ? setEditingTeacher({ ...editingTeacher, bio: e.target.value }) 
              : setNewTeacher({ ...newTeacher, bio: e.target.value })}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={4}
          />

          {/* Avatar yuklash */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">O'qituvchi rasmi</label>
            <div className="flex items-center space-x-4">
              <label className={`flex items-center space-x-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {uploading ? 'Yuklanmoqda...' : 'Rasm tanlang'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, !!editingId)}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              {(editingId ? editingTeacher?.avatar_url : newTeacher.avatar_url) && (
                <div className="flex items-center space-x-2">
                  <img
                    src={editingId ? editingTeacher.avatar_url : newTeacher.avatar_url}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-full border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => editingId 
                      ? setEditingTeacher({ ...editingTeacher, avatar_url: '' })
                      : setNewTeacher({ ...newTeacher, avatar_url: '' })
                    }
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, JPEG formatlarida, maksimal 5MB</p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button 
              type="submit" 
              disabled={uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {editingId ? 'Yangilash' : 'Qo\'shish'}
            </button>
            <button 
              type="button" 
              onClick={cancelEdit}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Bekor qilish
            </button>
          </div>
        </form>
      )}

      {/* O'qituvchilar jadvali */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left font-semibold">O'qituvchi</th>
                <th className="p-4 text-left font-semibold">Mutaxassislik</th>
                <th className="p-4 text-left font-semibold">Tajriba</th>
                <th className="p-4 text-left font-semibold">O'quvchilar</th>
                <th className="p-4 text-left font-semibold">Reyting</th>
                <th className="p-4 text-left font-semibold">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTeachers.map((teacher) => (
                <tr key={teacher.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      {teacher.avatar_url ? (
                        <img
                          src={teacher.avatar_url}
                          alt={teacher.name}
                          className="w-12 h-12 object-cover rounded-full border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{teacher.name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(teacher.created_at).toLocaleDateString('uz-UZ')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {teacher.specialization && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {teacher.specialization}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      {teacher.experience ? (
                        <span className="font-medium">{teacher.experience} yil</span>
                      ) : (
                        <span className="text-gray-400">Noma'lum</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-purple-600">
                      {teacher.students_count || 0}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1">
                      {teacher.rating ? (
                        <>
                          <div className="flex space-x-0.5">
                            {renderStars(teacher.rating)}
                          </div>
                          <span className="text-sm font-medium text-gray-700 ml-2">
                            {teacher.rating.toFixed(1)}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-400">Reyting yo'q</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => startEdit(teacher)} 
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                        title="Tahrirlash"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteTeacher(teacher.id, teacher.avatar_url)} 
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {teachers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Hech qanday o'qituvchi topilmadi</h3>
            <p className="text-gray-500">Birinchi o'qituvchini qo'shish uchun yuqoridagi tugmani bosing</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t bg-gray-50">
            <button 
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))} 
              disabled={currentPage === 0} 
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Oldingi
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Sahifa <span className="font-medium">{currentPage + 1}</span> / <span className="font-medium">{totalPages}</span>
              </span>
            </div>
            
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} 
              disabled={currentPage === totalPages - 1} 
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Keyingi
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTeachers;