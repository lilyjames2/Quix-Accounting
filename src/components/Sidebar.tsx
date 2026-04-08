import React from 'react';
import { LayoutDashboard, Calculator, Users, FileText, BarChart3, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { Auth } from './Auth';

type View = 'dashboard' | 'accounting' | 'employees' | 'notes' | 'reports';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  user: any;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, user }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounting', label: 'Accounting', icon: Calculator },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">OfficePro</h1>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                currentView === item.id
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon size={20} className={cn(
                "transition-colors",
                currentView === item.id ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
              )} />
              {item.label}
              {currentView === item.id && (
                <ChevronRight size={16} className="ml-auto text-indigo-600" />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto">
        <Auth user={user} />
      </div>
    </aside>
  );
};
