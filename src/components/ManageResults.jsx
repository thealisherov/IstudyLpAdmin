// admin/src/components/ManageResults.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, Upload, X, User, Award } from 'lucide-react';
import { supabase } from '../App';
import toast from 'react-hot-toast';
import BackToDashboard from './BacktoDashboard';

const ManageResults = () => {
  const [results, setResults] = useState([]);
  const [newResult, setNewResult] = useState({
    student_name: '',
    course_name: '',
    testimonial: '',
    position: '',
    completion_date: '',
    avatar_url: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [editingResult, setEditingResult] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const itemsPerPage = 5;

  // Fetch results from Supabase
  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('student_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      toast.error('Natijalarni yuklashda xato');
      console.error('Error fetching results:', error);
    }
  };

  // Upload image to Supabase storage
  const uploadImage = async (file) => {
    if (!file) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('student-avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('student-avatars')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Rasm yuklashda xato: ' + error.message);
      return null;
    }
  };

  // Handle image upload
  const handleImageUpload = async (e, isEditing = false) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Rasm hajmi 5MB dan kichik bo\'lishi kerak');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Faqat rasm fayllari qabul qilinadi');
      return;
    }

    setUploading(true);
    const imageUrl = await uploadImage(file);

    if (imageUrl) {
      if (isEditing) {
        setEditingResult({ ...editingResult, avatar_url: imageUrl });
      } else {
        setNewResult({ ...newResult, avatar_url: imageUrl });
      }
      toast.success('Rasm muvaffaqiyatli yuklandi!');
    }
    setUploading(false);
  };

  // Add new result
  const addResult = async (e) => {
    e.preventDefault();
    if (!newResult.student_name.trim() || !newResult.course_name.trim()) {
      toast.error('Talaba ismi va kurs nomi kiritish majburiy');
      return;
    }

    try {
      const { error } = await supabase
        .from('student_results')
        .insert([newResult]);

      if (error) throw error;

      toast.success('Natija muvaffaqiyatli qo\'shildi!');
      setNewResult({
        student_name: '',
        course_name: '',
        testimonial: '',
        position: '',
        completion_date: '',
        avatar_url: '',
      });
      setShowForm(false);
      fetchResults();
    } catch (error) {
      toast.error('Natija qo\'shishda xato: ' + error.message);
      console.error('Error adding result:', error);
    }
  };

  // Update existing result
  const updateResult = async (e) => {
    e.preventDefault();
    if (!editingResult.student_name.trim() || !editingResult.course_name.trim()) {
      toast.error('Talaba ismi va kurs nomi kiritish majburiy');
      return;
    }

    try {
      const { error } = await supabase
        .from('student_results')
        .update(editingResult)
        .eq('id', editingId);

      if (error) throw error;

      toast.success('Natija muvaffaqiyatli yangilandi!');
      setEditingId(null);
      setEditingResult(null);
      setShowForm(false);
      fetchResults();
    } catch (error) {
      toast.error('Natija yangilashda xato: ' + error.message);
      console.error('Error updating result:', error);
    }
  };

  // Delete result
  const deleteResult = async (id, avatarUrl) => {
    if (!window.confirm('Natijani o\'chirishni xohlaysizmi?')) return;

    try {
      const { error } = await supabase
        .from('student_results')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Delete avatar from storage if exists
      if (avatarUrl) {
        try {
          const fileName = avatarUrl.split('/').pop();
          await supabase.storage
            .from('student-avatars')
            .remove([fileName]);
        } catch (storageError) {
          console.error('Error deleting avatar:', storageError);
          // Don't show error to user as the result was deleted successfully
        }
      }

      toast.success('Natija muvaffaqiyatli o\'chirildi!');
      fetchResults();
    } catch (error) {
      toast.error('Natija o\'chirishda xato: ' + error.message);
      console.error('Error deleting result:', error);
    }
  };

  // Start editing a result
  const startEdit = (result) => {
    setEditingId(result.id);
    setEditingResult({ ...result });
    setShowForm(true);
  };

  // Cancel editing or adding
  const cancelEdit = () => {
    setEditingId(null);
    setEditingResult(null);
    setShowForm(false);
    setNewResult({
      student_name: '',
      course_name: '',
      testimonial: '',
      position: '',
      completion_date: '',
      avatar_url: '',
    });
  };

  // Pagination logic
  const paginatedResults = results.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  const totalPages = Math.ceil(results.length / itemsPerPage);

  return (
    <div className="p-8">
      <BackToDashboard />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Talaba Natijalarini Boshqarish</h1>
          <p className="text-gray-600 mt-2">Jami {results.length} ta natija</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              cancelEdit();
            }
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Yopish' : 'Natija Qo\'shish'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form
          onSubmit={editingId ? updateResult : addResult}
          className="bg-white p-6 rounded-xl shadow-md mb-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Talaba ismi *"
              value={editingId ? editingResult.student_name : newResult.student_name}
              onChange={(e) =>
                editingId
                  ? setEditingResult({ ...editingResult, student_name: e.target.value })
                  : setNewResult({ ...newResult, student_name: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Kurs nomi *"
              value={editingId ? editingResult.course_name : newResult.course_name}
              onChange={(e) =>
                editingId
                  ? setEditingResult({ ...editingResult, course_name: e.target.value })
                  : setNewResult({ ...newResult, course_name: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Lavozim (masalan: Frontend Developer)"
              value={editingId ? editingResult.position : newResult.position}
              onChange={(e) =>
                editingId
                  ? setEditingResult({ ...editingResult, position: e.target.value })
                  : setNewResult({ ...newResult, position: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Tugatish sanasi (masalan: 2024 yil dekabr)"
              value={editingId ? editingResult.completion_date : newResult.completion_date}
              onChange={(e) =>
                editingId
                  ? setEditingResult({ ...editingResult, completion_date: e.target.value })
                  : setNewResult({ ...newResult, completion_date: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <textarea
            placeholder="Talaba sharhi va testimonial"
            value={editingId ? editingResult.testimonial : newResult.testimonial}
            onChange={(e) =>
              editingId
                ? setEditingResult({ ...editingResult, testimonial: e.target.value })
                : setNewResult({ ...newResult, testimonial: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={4}
          />

          {/* Image Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Talaba rasmi</label>
            <div className="flex items-center space-x-4">
              <label
                className={`flex items-center space-x-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
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
              {(editingId ? editingResult?.avatar_url : newResult.avatar_url) && (
                <div className="flex items-center space-x-2">
                  <img
                    src={editingId ? editingResult.avatar_url : newResult.avatar_url}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-full border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      editingId
                        ? setEditingResult({ ...editingResult, avatar_url: '' })
                        : setNewResult({ ...newResult, avatar_url: '' })
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {editingId ? 'Yangilash' : 'Qo\'shish'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Bekor qilish
            </button>
          </div>
        </form>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left font-semibold">Talaba</th>
                <th className="p-4 text-left font-semibold">Kurs</th>
                <th className="p-4 text-left font-semibold">Lavozim</th>
                <th className="p-4 text-left font-semibold">Tugatish sanasi</th>
                <th className="p-4 text-left font-semibold">Sharh</th>
                <th className="p-4 text-left font-semibold">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {paginatedResults.map((result) => (
                <tr key={result.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      {result.avatar_url ? (
                        <img
                          src={result.avatar_url}
                          alt={result.student_name}
                          className="w-12 h-12 object-cover rounded-full border-2 border-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center"
                        style={{
                          display: result.avatar_url ? 'none' : 'flex',
                        }}
                      >
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{result.student_name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(result.created_at).toLocaleDateString('uz-UZ')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {result.course_name}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      {result.position || <span className="text-gray-400">Noma'lum</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-600">
                      {result.completion_date || <span className="text-gray-400">Noma'lum</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-600 max-w-xs">
                      {result.testimonial
                        ? `${result.testimonial.substring(0, 100)}${result.testimonial.length > 100 ? '...' : ''}`
                        : <span className="text-gray-400">Sharh yo'q</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(result)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteResult(result.id, result.avatar_url)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
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

        {results.length === 0 && (
          <div className="text-center py-12">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Hech qanday natija topilmadi</h3>
            <p className="text-gray-500">
              Birinchi natijani qo'shish uchun yuqoridagi "Natija Qo'shish" tugmasini bosing
            </p>
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

export default ManageResults;