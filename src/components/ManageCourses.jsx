// admin/src/components/ManageCourses.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, Upload, X, Image, BookOpen } from 'lucide-react';
import { supabase } from '../App';
import toast from 'react-hot-toast';
import BackToDashboard from './BacktoDashboard';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', price: '', category: '', image_url: '' });
  const [editingId, setEditingId] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      toast.error('Kurslarni yuklashda xato');
      console.error('Error fetching courses:', error);
    }
  };

  const uploadImage = async (file, bucket = 'course-images') => {
    if (!file) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Rasm yuklashda xato: ' + error.message);
      return null;
    }
  };

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
        setEditingCourse({ ...editingCourse, image_url: imageUrl });
      } else {
        setNewCourse({ ...newCourse, image_url: imageUrl });
      }
      toast.success('Rasm muvaffaqiyatli yuklandi!');
    }
    setUploading(false);
  };

  const addCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.title.trim()) {
      toast.error('Sarlavha kiritish majburiy');
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .insert([newCourse]);

      if (error) throw error;

      toast.success('Kurs muvaffaqiyatli qo\'shildi!');
      setNewCourse({ title: '', description: '', price: '', category: '', image_url: '' });
      setShowForm(false);
      fetchCourses();
    } catch (error) {
      toast.error('Kurs qo\'shishda xato: ' + error.message);
      console.error('Error adding course:', error);
    }
  };

  const updateCourse = async (e) => {
    e.preventDefault();
    if (!editingCourse.title.trim()) {
      toast.error('Sarlavha kiritish majburiy');
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .update(editingCourse)
        .eq('id', editingId);

      if (error) throw error;

      toast.success('Kurs muvaffaqiyatli yangilandi!');
      setEditingId(null);
      setEditingCourse(null);
      setShowForm(false);
      fetchCourses();
    } catch (error) {
      toast.error('Kurs yangilashda xato: ' + error.message);
      console.error('Error updating course:', error);
    }
  };

  const deleteCourse = async (id, imageUrl) => {
    if (!window.confirm('Kursni o\'chirishni xohlaysizmi?')) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Delete image from storage if exists
      if (imageUrl) {
        try {
          const fileName = imageUrl.split('/').pop();
          await supabase.storage
            .from('course-images')
            .remove([fileName]);
        } catch (storageError) {
          console.error('Error deleting image:', storageError);
          // Don't show error to user as the course was deleted successfully
        }
      }
      
      toast.success('Kurs muvaffaqiyatli o\'chirildi!');
      fetchCourses();
    } catch (error) {
      toast.error('Kurs o\'chirishda xato: ' + error.message);
      console.error('Error deleting course:', error);
    }
  };

  const startEdit = (course) => {
    setEditingId(course.id);
    setEditingCourse({ ...course });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingCourse(null);
    setShowForm(false);
    setNewCourse({ title: '', description: '', price: '', category: '', image_url: '' });
  };

  const paginatedCourses = courses.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  const totalPages = Math.ceil(courses.length / itemsPerPage);

  return (
    <div className="p-8">
      <BackToDashboard/>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Kurslarni Boshqarish</h1>
          <p className="text-gray-600 mt-2">Jami {courses.length} ta kurs</p>
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
          {showForm ? 'Yopish' : 'Kurs Qo\'shish'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={editingId ? updateCourse : addCourse} className="bg-white p-6 rounded-xl shadow-md mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Kurs sarlavhasi *"
              value={editingId ? editingCourse.title : newCourse.title}
              onChange={(e) => editingId 
                ? setEditingCourse({ ...editingCourse, title: e.target.value }) 
                : setNewCourse({ ...newCourse, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <input
              type="text" 
              placeholder="Kategoriya"
              value={editingId ? editingCourse.category : newCourse.category}
              onChange={(e) => editingId
                ? setEditingCourse({ ...editingCourse, category: e.target.value })
                : setNewCourse({ ...newCourse, category: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Narx"
              value={editingId ? editingCourse.price : newCourse.price}
              onChange={(e) => editingId
                ? setEditingCourse({ ...editingCourse, price: e.target.value })
                : setNewCourse({ ...newCourse, price: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <textarea
            placeholder="Kurs tavsifi"
            value={editingId ? editingCourse.description : newCourse.description}
            onChange={(e) => editingId 
              ? setEditingCourse({ ...editingCourse, description: e.target.value }) 
              : setNewCourse({ ...newCourse, description: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={4}
          />

          {/* Image Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Kurs rasmi</label>
            <div className="flex items-center space-x-4">
              <label className={`flex items-center space-x-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
              {(editingId ? editingCourse?.image_url : newCourse.image_url) && (
                <div className="flex items-center space-x-2">
                  <img
                    src={editingId ? editingCourse.image_url : newCourse.image_url}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => editingId 
                      ? setEditingCourse({ ...editingCourse, image_url: '' })
                      : setNewCourse({ ...newCourse, image_url: '' })
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

      {/* Courses Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left font-semibold">Rasm</th>
                <th className="p-4 text-left font-semibold">Sarlavha</th>
                <th className="p-4 text-left font-semibold">Kategoriya</th>
                <th className="p-4 text-left font-semibold">Narx</th>
                <th className="p-4 text-left font-semibold">Tavsif</th>
                <th className="p-4 text-left font-semibold">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCourses.map((course) => (
                <tr key={course.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    {course.image_url ? (
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center" style={{display: course.image_url ? 'none' : 'flex'}}>
                      <Image className="w-6 h-6 text-gray-400" />
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{course.title}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(course.created_at).toLocaleDateString('uz-UZ')}
                    </div>
                  </td>
                  <td className="p-4">
                    {course.category && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        {course.category}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-green-600">{course.price || 'Noma\'lum'}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-600 max-w-xs">
                      {course.description ? 
                        `${course.description.substring(0, 100)}${course.description.length > 100 ? '...' : ''}` 
                        : 'Tavsif yo\'q'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => startEdit(course)} 
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteCourse(course.id, course.image_url)} 
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

        {courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Hech qanday kurs topilmadi</h3>
            <p className="text-gray-500">Birinchi kursni qo'shish uchun yuqoridagi tugmani bosing</p>
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

export default ManageCourses;