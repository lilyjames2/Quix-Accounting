import React from 'react';
import { auth, googleProvider, signInWithPopup, signOut } from '../firebase';
import { LogIn, LogOut, User } from 'lucide-react';

interface AuthProps {
  user: any;
}

export const Auth: React.FC<AuthProps> = ({ user }) => {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-3 p-4 border-t border-slate-200">
        <img 
          src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
          alt={user.displayName} 
          className="w-8 h-8 rounded-full"
          referrerPolicy="no-referrer"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{user.displayName}</p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 text-slate-500 hover:text-red-600 transition-colors"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <button
        onClick={handleLogin}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
      >
        <LogIn size={18} />
        Sign In with Google
      </button>
    </div>
  );
};
