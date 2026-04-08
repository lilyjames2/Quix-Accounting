import React, { useState, useEffect } from 'react';
import { db, collection, query, where, onSnapshot, orderBy } from '../firebase';
import { TrendingUp, TrendingDown, Wallet, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from 'date-fns';

interface DashboardProps {
  user: any;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'transactions'),
      where('uid', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const stats = transactions.reduce((acc, curr) => {
    if (curr.type === 'income') acc.income += curr.amount;
    else acc.expense += curr.amount;
    return acc;
  }, { income: 0, expense: 0 });

  const balance = stats.income - stats.expense;

  // Chart Data: Last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return format(d, 'yyyy-MM-dd');
  }).reverse();

  const chartData = last7Days.map(date => {
    const dayTransactions = transactions.filter(t => t.date.startsWith(date));
    const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return {
      date: format(parseISO(date), 'MMM dd'),
      income,
      expense
    };
  });

  const StatCard = ({ title, amount, icon: Icon, color, trend }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="text-white w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">¤{amount.toLocaleString()}</h3>
    </div>
  );

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
        <p className="text-slate-500">Welcome back, {user.displayName}. Here's your office overview.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Income" 
          amount={stats.income} 
          icon={TrendingUp} 
          color="bg-emerald-500"
        />
        <StatCard 
          title="Total Expenses" 
          amount={stats.expense} 
          icon={TrendingDown} 
          color="bg-rose-500"
        />
        <StatCard 
          title="Net Balance" 
          amount={balance} 
          icon={Wallet} 
          color="bg-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Calendar className="text-indigo-600" size={20} />
            Financial Activity (Last 7 Days)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Transactions</h3>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {t.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.category}</p>
                    <p className="text-xs text-slate-500">{format(parseISO(t.date), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                <p className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'income' ? '+' : '-'}¤{t.amount.toLocaleString()}
                </p>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400">No transactions yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
