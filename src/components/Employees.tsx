import React, { useState, useEffect } from 'react';
import { db, collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, orderBy } from '../firebase';
import { Plus, Search, UserPlus, Trash2, Edit2, Check, X, Calendar, User, Briefcase, Phone, Banknote } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface EmployeesProps {
  user: any;
}

export const Employees: React.FC<EmployeesProps> = ({ user }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'attendance'>('list');
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    salary: '',
    contact: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'employees'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const q = query(
      collection(db, 'attendance'), 
      where('uid', '==', user.uid),
      where('date', '==', today)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAttendance(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      salary: parseFloat(formData.salary),
      uid: user.uid
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'employees', editingId), data);
      } else {
        await addDoc(collection(db, 'employees'), data);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', position: '', salary: '', contact: '' });
    } catch (error) {
      console.error("Error saving employee:", error);
    }
  };

  const handleAttendance = async (employeeId: string, status: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const existing = attendance.find(a => a.employeeId === employeeId);

    try {
      if (existing) {
        await updateDoc(doc(db, 'attendance', existing.id), { status });
      } else {
        await addDoc(collection(db, 'attendance'), {
          employeeId,
          date: today,
          status,
          uid: user.uid
        });
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      await deleteDoc(doc(db, 'employees', id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <header>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Employees</h2>
          <p className="text-slate-500">Manage your team and track attendance.</p>
        </header>
        <button
          onClick={() => {
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white py-2.5 px-5 rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-lg shadow-indigo-200"
        >
          <UserPlus size={20} />
          Add Employee
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit mb-6">
        <button
          onClick={() => setActiveTab('list')}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === 'list' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Employee List
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === 'attendance' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Daily Attendance
        </button>
      </div>

      {activeTab === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((emp) => (
            <div key={emp.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                  <User size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => {
                    setEditingId(emp.id);
                    setFormData({ name: emp.name, position: emp.position, salary: emp.salary.toString(), contact: emp.contact });
                    setIsModalOpen(true);
                  }} className="p-2 text-slate-400 hover:text-indigo-600">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(emp.id)} className="p-2 text-slate-400 hover:text-rose-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{emp.name}</h3>
              <p className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                <Briefcase size={14} /> {emp.position}
              </p>
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2"><Banknote size={14} /> Salary</span>
                  <span className="font-bold text-slate-900">¤{emp.salary.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2"><Phone size={14} /> Contact</span>
                  <span className="text-slate-900">{emp.contact || '-'}</span>
                </div>
              </div>
            </div>
          ))}
          {employees.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-400">No employees added yet.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-600" />
              Attendance for {format(new Date(), 'MMMM dd, yyyy')}
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {employees.map((emp) => {
              const record = attendance.find(a => a.employeeId === emp.id);
              return (
                <div key={emp.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{emp.name}</p>
                      <p className="text-xs text-slate-500">{emp.position}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {['present', 'absent', 'late'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleAttendance(emp.id, status)}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all",
                          record?.status === status
                            ? status === 'present' ? "bg-emerald-500 text-white" :
                              status === 'absent' ? "bg-rose-500 text-white" : "bg-amber-500 text-white"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            {employees.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                Add employees first to track attendance.
              </div>
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">{editingId ? 'Edit' : 'Add'} Employee</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Position</label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Manager"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Monthly Salary</label>
                <input
                  type="number"
                  required
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Contact Info</label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Email or Phone"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all font-bold mt-6 shadow-lg shadow-indigo-100"
              >
                {editingId ? 'Update' : 'Save'} Employee
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
