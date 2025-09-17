// admin/src/components/ManageResults.jsx
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

// Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

const ManageResults = () => {
  const [results, setResults] = useState([]);
  const [newResult, setNewResult] = useState({ student_name: '', course_name: '', testimonial: '', position: '', completion_date: '' });
  const [editingId, setEditingId] = useState(null);
  const [editingResult, setEditingResult] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    const { data, error } = await supabase.from('student_results').select('*').order('created_at', { ascending: false });
    if (error) toast.error('Natijalarni yuklashda xato');
    else setResults(data || []);
  };

  const addResult = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('student_results').insert([newResult]);
    if (error) toast.error('Natija qo\'shishda xato');
    else {
      toast.success('Natija qo\'shildi!');
      setNewResult({ student_name: '', course_name: '', testimonial: '', position: '', completion_date: '' });
      fetchResults();
    }
  };

  const updateResult = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('student_results').update(editingResult).eq('id', editingId);
    if (error) toast.error('Natija yangilashda xato');
    else {
      toast.success('Natija yangilandi!');
      setEditingId(null);
      setEditingResult(null);
      fetchResults();
    }
  };

  const deleteResult = async (id) => {
    if (confirm('Natijani o\'chirishni xohlaysizmi?')) {
      const { error } = await supabase.from('student_results').delete().eq('id', id);
      if (error) toast.error('Natija o\'chirishda xato');
      else {
        toast.success('Natija o\'chirildi!');
        fetchResults();
      }
    }
  };

  const startEdit = (result) => {
    setEditingId(result.id);
    setEditingResult({ ...result });
  };

  const paginatedResults = results.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Natijalarni Boshqarish</h1>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> Qo'shish
        </button>
      </div>

      {/* Qo'shish formasi */}
      {(editingId || !editingId) && (
        <form onSubmit={editingId ? updateResult : addResult} className="bg-white p-6 rounded-xl shadow-md mb-6 space-y-4">
          <input
            type="text"
            placeholder="O'quvchi ismi"
            value={editingId ? editingResult.student_name : newResult.student_name}
            onChange={(e) => editingId ? setEditingResult({ ...editingResult, student_name: e.target.value }) : setNewResult({ ...newResult, student_name: e.target.value })}
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="Kurs nomi"
            value={editingId ? editingResult.course_name : newResult.course_name}
            onChange={(e) => editingId ? setEditingResult({ ...editingResult, course_name: e.target.value }) : setNewResult({ ...newResult, course_name: e.target.value })}
            className="w-full p-3 border rounded-lg"
          />
          <textarea
            placeholder="Fikr"
            value={editingId ? editingResult.testimonial : newResult.testimonial}
            onChange={(e) => editingId ? setEditingResult({ ...editingResult, testimonial: e.target.value }) : setNewResult({ ...newResult, testimonial: e.target.value })}
            className="w-full p-3 border rounded-lg"
            rows={3}
          />
          <input
            type="text"
            placeholder="Lavozim"
            value={editingId ? editingResult.position : newResult.position}
            onChange={(e) => editingId ? setEditingResult({ ...editingResult, position: e.target.value }) : setNewResult({ ...newResult, position: e.target.value })}
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Tugash sanasi"
            value={editingId ? editingResult.completion_date : newResult.completion_date}
            onChange={(e) => editingId ? setEditingResult({ ...editingResult, completion_date: e.target.value }) : setNewResult({ ...newResult, completion_date: e.target.value })}
            className="w-full p-3 border rounded-lg"
          />
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg">
            {editingId ? 'Yangilash' : "Qo'shish"}
          </button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setEditingResult(null); }} className="px-6 py-2 bg-gray-500 text-white rounded-lg">Bekor qilish</button>}
        </form>
      )}

      {/* Jadval */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">O'quvchi</th>
              <th className="p-4 text-left">Kurs</th>
              <th className="p-4 text-left">Fikr</th>
              <th className="p-4 text-left">Lavozim</th>
              <th className="p-4 text-left">Sana</th>
              <th className="p-4 text-left">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {paginatedResults.map((result) => (
              <tr key={result.id} className="border-t">
                <td className="p-4">{result.student_name}</td>
                <td className="p-4">{result.course_name}</td>
                <td className="p-4">{result.testimonial.substring(0, 50)}...</td>
                <td className="p-4">{result.position}</td>
                <td className="p-4">{result.completion_date}</td>
                <td className="p-4 space-x-2">
                  <button onClick={() => startEdit(result)} className="text-blue-600 hover:text-blue-800">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => deleteResult(result.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {results.length > itemsPerPage && (
          <div className="flex justify-between items-center p-4 border-t">
            <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="p-2 disabled:opacity-50">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span>{currentPage + 1} / {Math.ceil(results.length / itemsPerPage)}</span>
            <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(results.length / itemsPerPage) - 1, p + 1))} disabled={currentPage === Math.ceil(results.length / itemsPerPage) - 1} className="p-2 disabled:opacity-50">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageResults;