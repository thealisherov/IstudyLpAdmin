// admin/src/components/ManageCourses.jsx
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

// Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', price: '', category: '' });
  const [editingId, setEditingId] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    if (error) toast.error('Kurslarni yuklashda xato');
    else setCourses(data || []);
  };

  const addCourse = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('courses').insert([newCourse]);
    if (error) toast.error('Kurs qo\'shishda xato');
    else {
      toast.success('Kurs qo\'shildi!');
      setNewCourse({ title: '', description: '', price: '', category: '' });
      fetchCourses();
    }
  };

  const updateCourse = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('courses').update(editingCourse).eq('id', editingId);
    if (error) toast.error('Kurs yangilashda xato');
    else {
      toast.success('Kurs yangilandi!');
      setEditingId(null);
      setEditingCourse(null);
      fetchCourses();
    }
  };

  const deleteCourse = async (id) => {
    if (confirm('Kursni o\'chirishni xohlaysizmi?')) {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) toast.error('Kurs o\'chirishda xato');
      else {
        toast.success('Kurs o\'chirildi!');
        fetchCourses();
      }
    }
  };

  const startEdit = (course) => {
    setEditingId(course.id);
    setEditingCourse({ ...course });
  };

  const paginatedCourses = courses.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Kurslarni Boshqarish</h1>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> Qo'shish
        </button>
      </div>

      {/* Qo'shish formasi */}
      {(editingId || !editingId) && (
        <form onSubmit={editingId ? updateCourse : addCourse} className="bg-white p-6 rounded-xl shadow-md mb-6 space-y-4">
          <input
            type="text"
            placeholder="Sarlavha"
            value={editingId ? editingCourse.title : newCourse.title}
            onChange={(e) => editingId ? setEditingCourse({ ...editingCourse, title: e.target.value }) : setNewCourse({ ...newCourse, title: e.target.value })}
            className="w-full p-3 border rounded-lg"
            required
          />
          <textarea
            placeholder="Tavsif"
            value={editingId ? editingCourse.description : newCourse.description}
            onChange={(e) => editingId ? setEditingCourse({ ...editingCourse, description: e.target.value }) : setNewCourse({ ...newCourse, description: e.target.value })}
            className="w-full p-3 border rounded-lg"
            rows={3}
          />
          <input
            type="text"
            placeholder="Narx"
            value={editingId ? editingCourse.price : newCourse.price}
            onChange={(e) => editingId ? setEditingCourse({ ...editingCourse, price: e.target.value }) : setNewCourse({ ...newCourse, price: e.target.value })}
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Kategoriya"
            value={editingId ? editingCourse.category : newCourse.category}
            onChange={(e) => editingId ? setEditingCourse({ ...editingCourse, category: e.target.value }) : setNewCourse({ ...newCourse, category: e.target.value })}
            className="w-full p-3 border rounded-lg"
          />
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg">
            {editingId ? 'Yangilash' : "Qo'shish"}
          </button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setEditingCourse(null); }} className="px-6 py-2 bg-gray-500 text-white rounded-lg">Bekor qilish</button>}
        </form>
      )}

      {/* Jadval */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Sarlavha</th>
              <th className="p-4 text-left">Tavsif</th>
              <th className="p-4 text-left">Narx</th>
              <th className="p-4 text-left">Kategoriya</th>
              <th className="p-4 text-left">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCourses.map((course) => (
              <tr key={course.id} className="border-t">
                <td className="p-4">{course.title}</td>
                <td className="p-4">{course.description.substring(0, 50)}...</td>
                <td className="p-4">{course.price}</td>
                <td className="p-4">{course.category}</td>
                <td className="p-4 space-x-2">
                  <button onClick={() => startEdit(course)} className="text-blue-600 hover:text-blue-800">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => deleteCourse(course.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {courses.length > itemsPerPage && (
          <div className="flex justify-between items-center p-4 border-t">
            <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="p-2 disabled:opacity-50">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span>{currentPage + 1} / {Math.ceil(courses.length / itemsPerPage)}</span>
            <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(courses.length / itemsPerPage) - 1, p + 1))} disabled={currentPage === Math.ceil(courses.length / itemsPerPage) - 1} className="p-2 disabled:opacity-50">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCourses;