import React, { useState, useEffect } from 'react';
import { auth, onAuthStateChanged, User } from './firebase';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Accounting } from './components/Accounting';
import { Employees } from './components/Employees';
import { Notes } from './components/Notes';
import { Reports } from './components/Reports';
import { Auth } from './components/Auth';
import { LayoutDashboard, Loader2 } from 'lucide-react';

type View = 'dashboard' | 'accounting' | 'employees' | 'notes' | 'reports';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">OfficePro Manager</h1>
          <p className="text-slate-600 mb-8">A comprehensive solution for small office management, accounting, and employee tracking.</p>
          <Auth user={user} />
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard user={user} />;
      case 'accounting': return <Accounting user={user} />;
      case 'employees': return <Employees user={user} />;
      case 'notes': return <Notes user={user} />;
      case 'reports': return <Reports user={user} />;
      default: return <Dashboard user={user} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        user={user} 
      />
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
