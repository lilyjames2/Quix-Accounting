import React, { useState, useEffect } from 'react';
import { db, collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, orderBy } from '../firebase';
import { Plus, Trash2, Edit2, X, FileText, Clock, Search, Check } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface NotesProps {
  user: any;
}

export const Notes: React.FC<NotesProps> = ({ user }) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => setShowSuccessToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  useEffect(() => {
    const q = query(
      collection(db, 'notes'),
      where('uid', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      timestamp: new Date().toISOString(),
      uid: user.uid
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'notes', editingId), data);
      } else {
        await addDoc(collection(db, 'notes'), data);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ title: '', content: '' });
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <header>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Notes & Logs</h2>
          <p className="text-slate-500">Keep track of office events and reminders.</p>
        </header>
        <button
          onClick={() => {
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white py-2.5 px-5 rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          New Note
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
        />
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {filteredNotes.map((note) => (
          <div key={note.id} className="break-inside-avoid bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <FileText size={20} />
                <span className="text-xs font-bold uppercase tracking-wider">Note</span>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => {
                  setEditingId(note.id);
                  setFormData({ title: note.title, content: note.content });
                  setIsModalOpen(true);
                }} className="p-2 text-slate-400 hover:text-indigo-600">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => setDeleteConfirmId(note.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{note.title}</h3>
            <p className="text-slate-600 text-sm whitespace-pre-wrap mb-4">{note.content}</p>
            <div className="flex items-center gap-2 text-xs text-slate-400 border-t border-slate-100 pt-4">
              <Clock size={14} />
              {format(new Date(note.timestamp), 'MMM dd, yyyy • h:mm a')}
            </div>
          </div>
        ))}
        {filteredNotes.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-400">No notes found.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">{editingId ? 'Edit' : 'New'} Note</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                  placeholder="Meeting Minutes, Task List, etc."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Content</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  rows={8}
                  placeholder="Write your note here..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all font-bold mt-6 shadow-lg shadow-indigo-100"
              >
                {editingId ? 'Update' : 'Save'} Note
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center"
            >
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Note?</h3>
              <p className="text-slate-500 mb-6">Are you sure you want to delete this note? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await deleteDoc(doc(db, 'notes', deleteConfirmId));
                      setDeleteConfirmId(null);
                      setShowSuccessToast(true);
                    } catch (error) {
                      console.error("Error deleting note:", error);
                    }
                  }}
                  className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-[70]"
          >
            <div className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">Note deleted successfully</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
