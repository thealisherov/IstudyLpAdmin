// admin/src/components/ManageTeachers.jsx
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

// Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [newTeacher, setNewTeacher] = useState({ name: '', specialization: '', bio: '', experience: '', students_count: '', rating: '' });
  const [editingId, setEditingId] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    const { data, error } = await supabase.from('teachers').select('*').order('created_at', { ascending: false });
    if (error) toast.error('O\'qituvchilarni yuklashda xato');
    else setTeachers(data || []);
  };

  const addTeacher = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('teachers').insert([newTeacher]);
    if (error) toast.error('O\'qituvchi qo\'shishda xato');
    else {
      toast.success('O\'qituvchi qo\'shildi!');
      setNewTeacher({ name: '', specialization: '', bio: '', experience: '', students_count: '', rating: '' });
      fetchTeachers();
    }
  };

  const updateTeacher = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('teachers').update(editingTeacher).eq('id', editingId);
    if (error) toast.error('O\'qituvchi yangilashda xato');
    else {
      toast.success('O\'qituvchi yangilandi!');
      setEditingId(null);
      setEditingTeacher(null);
      fetchTeachers();
    }
  };

  const deleteTeacher = async (id) => {
    if (confirm('O\'qituvchini o\'chirishni xohlaysizmi?')) {
      const { error } = await supabase.from('teachers').delete().eq('id', id);
      if (error) toast.error('O\'qituvchi o\'chirishda xato');
      else {
        toast.success('O\'qituvchi o\'chirildi!');
        fetchTeachers();
      }
    }
  };

  const startEdit = (teacher) => {
    setEditingId(teacher.id);
    setEditingTeacher({ ...teacher });
  };

  const paginatedTeachers = teachers.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">O'qituvchilarni Boshqarish</h1>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> Qo'shish
        </button>
      </div>

      {/* Qo'shish formasi */}
      {(editingId || !editingId) && (
        <form onSubmit={editingId ? updateTeacher : addTeacher} className="bg-white p-6 rounded-xl shadow-md mb-6 space-y-4">
          <input
            type="text"
            placeholder="Ism"
            value={editingId ? editingTeacher.name : newTeacher.name}
            onChange={(e) => editingId ? setEditingTeacher({ ...editingTeacher, name: e.target.value }) : setNewTeacher({ ...newTeacher, name: e.target.value })}
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="Mutaxassislik"
            value={editingId ? editingTeacher.specialization : newTeacher.specialization}
            onChange={(e) => editingId ? setEditingTeacher({ ...editingTeacher, specialization: e.target.value }) : setNewTeacher({ ...newTeacher, specialization: e.target.value })}
            className="w-full p-3 border rounded-lg"
          />
          <textarea
            placeholder="Bio"
            value={editingId ? editingTeacher.bio : newTeacher.bio}
            onChange={(e) => editingId ? setEditingTeacher({ ...editingTeacher, bio: e.target.value }) : setNewTeacher({ ...newTeacher, bio: e.target.value })}
            className="w-full p-3 border rounded-lg"
            rows={3}
          />
          <input
            type="number"
            placeholder="Tajriba (yil)"
            value={editingId ? editingTeacher.experience : newTeacher.experience}
            onChange={(e) => editingId ? setEditingTeacher({ ...editingTeacher, experience: e.target.value }) : setNewTeacher({ ...newTeacher, experience: e.target.value })}
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="number"
            placeholder="O'quvchilar soni"
            value={editingId ? editingTeacher.students_count : newTeacher.students_count}
            onChange={(e) => editingId ? setEditingTeacher({ ...editingTeacher, students_count: e.target.value }) : setNewTeacher({ ...newTeacher, students_count: e.target.value })}
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="number"
            step="0.1"
            placeholder="Reyting"
            value={editingId ? editingTeacher.rating : newTeacher.rating}
            onChange={(e) => editingId ? setEditingTeacher({ ...editingTeacher, rating: e.target.value }) : setNewTeacher({ ...newTeacher, rating: e.target.value })}
            className="w-full p-3 border rounded-lg"
          />
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg">
            {editingId ? 'Yangilash' : "Qo'shish"}
          </button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setEditingTeacher(null); }} className="px-6 py-2 bg-gray-500 text-white rounded-lg">Bekor qilish</button>}
        </form>
      )}

      {/* Jadval */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Ism</th>
              <th className="p-4 text-left">Mutaxassislik</th>
              <th className="p-4 text-left">Tajriba</th>
              <th className="p-4 text-left">O'quvchilar</th>
              <th className="p-4 text-left">Reyting</th>
              <th className="p-4 text-left">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTeachers.map((teacher) => (
              <tr key={teacher.id} className="border-t">
                <td className="p-4">{teacher.name}</td>
                <td className="p-4">{teacher.specialization}</td>
                <td className="p-4">{teacher.experience} yil</td>
                <td className="p-4">{teacher.students_count}</td>
                <td className="p-4">{teacher.rating}</td>
                <td className="p-4 space-x-2">
                  <button onClick={() => startEdit(teacher)} className="text-blue-600 hover:text-blue-800">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => deleteTeacher(teacher.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {teachers.length > itemsPerPage && (
          <div className="flex justify-between items-center p-4 border-t">
            <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="p-2 disabled:opacity-50">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span>{currentPage + 1} / {Math.ceil(teachers.length / itemsPerPage)}</span>
            <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(teachers.length / itemsPerPage) - 1, p + 1))} disabled={currentPage === Math.ceil(teachers.length / itemsPerPage) - 1} className="p-2 disabled:opacity-50">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTeachers;