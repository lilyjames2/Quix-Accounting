import React, { useState, useEffect } from 'react';
import { db, collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, orderBy } from '../firebase';
import { Plus, Search, Filter, Edit2, Trash2, X, Check, Banknote, Tag, FileText as FileIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface AccountingProps {
  user: any;
}

const CATEGORIES = [
  'Marketing', 'Snacks', 'Software / Tools', 'Electricity Bill', 'WiFi Bill', 'Office Bill', 'Phone Bill', 'Editing', 'Website / Web Development', 'Office Expenses', 'Student Expenses', 'Rakib', 'Rimel', 'Parash', 'Tamim', 'Rayhan', 'Other'
];

export const Accounting: React.FC<AccountingProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: 'Office Expenses',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    const q = query(
      collection(db, 'transactions'),
      where('uid', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      amount: parseFloat(formData.amount),
      uid: user.uid
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'transactions', editingId), data);
      } else {
        await addDoc(collection(db, 'transactions'), data);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        type: 'expense',
        amount: '',
        category: 'Office Expenses',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd')
      });
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    setFormData({
      type: t.type,
      amount: t.amount.toString(),
      category: t.category,
      description: t.description,
      date: t.date
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      await deleteDoc(doc(db, 'transactions', id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <header>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Accounting</h2>
          <p className="text-slate-500">Track your office income and expenses.</p>
        </header>
        <button
          onClick={() => {
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white py-2.5 px-5 rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          Add Transaction
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-bottom border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{format(new Date(t.date), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase",
                      t.type === 'income' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    )}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-bold">{t.category}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{t.description || '-'}</td>
                  <td className={cn(
                    "px-6 py-4 text-sm font-bold text-right",
                    t.type === 'income' ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {t.type === 'income' ? '+' : '-'}¤{t.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(t)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No transactions found. Add your first entry!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">{editingId ? 'Edit' : 'Add'} Transaction</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                    formData.type === 'income' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                    formData.type === 'expense' ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Expense
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Amount</label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                  rows={3}
                  placeholder="Optional details..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all font-bold mt-6 shadow-lg shadow-indigo-100"
              >
                {editingId ? 'Update' : 'Save'} Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
