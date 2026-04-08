import React, { useState, useEffect } from 'react';
import { db, collection, query, where, getDocs, orderBy } from '../firebase';
import { Download, FileSpreadsheet, Calendar, Filter, Loader2, BarChart3 } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import * as XLSX from 'xlsx';

interface ReportsProps {
  user: any;
}

export const Reports: React.FC<ReportsProps> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  const generateExcel = async () => {
    setLoading(true);
    try {
      // Fetch all data
      const [transSnap, empSnap, noteSnap] = await Promise.all([
        getDocs(query(collection(db, 'transactions'), where('uid', '==', user.uid))),
        getDocs(query(collection(db, 'employees'), where('uid', '==', user.uid))),
        getDocs(query(collection(db, 'notes'), where('uid', '==', user.uid)))
      ]);

      const transactions = transSnap.docs.map(d => d.data());
      const employees = empSnap.docs.map(d => d.data());
      const notes = noteSnap.docs.map(d => d.data());

      // Filter transactions by date range
      const filteredTrans = transactions.filter(t => 
        isWithinInterval(parseISO(t.date), {
          start: startOfDay(parseISO(dateRange.start)),
          end: endOfDay(parseISO(dateRange.end))
        })
      );

      // Create Workbook
      const wb = XLSX.utils.book_new();

      // Transactions Sheet
      const wsTrans = XLSX.utils.json_to_sheet(filteredTrans.map(t => ({
        Date: t.date,
        Type: t.type,
        Category: t.category,
        Amount: t.amount,
        Description: t.description
      })));
      XLSX.utils.book_append_sheet(wb, wsTrans, "Transactions");

      // Employees Sheet
      const wsEmp = XLSX.utils.json_to_sheet(employees.map(e => ({
        Name: e.name,
        Position: e.position,
        Salary: e.salary,
        Contact: e.contact
      })));
      XLSX.utils.book_append_sheet(wb, wsEmp, "Employees");

      // Notes Sheet
      const wsNotes = XLSX.utils.json_to_sheet(notes.map(n => ({
        Date: n.timestamp,
        Title: n.title,
        Content: n.content
      })));
      XLSX.utils.book_append_sheet(wb, wsNotes, "Notes");

      // Summary Sheet
      const totalIncome = filteredTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const totalExpense = filteredTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const wsSummary = XLSX.utils.json_to_sheet([
        { Metric: 'Report Period', Value: `${dateRange.start} to ${dateRange.end}` },
        { Metric: 'Total Income', Value: totalIncome },
        { Metric: 'Total Expense', Value: totalExpense },
        { Metric: 'Net Balance', Value: totalIncome - totalExpense },
        { Metric: 'Total Employees', Value: employees.length }
      ]);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

      // Export
      XLSX.writeFile(wb, `Office_Report_${dateRange.start}_to_${dateRange.end}.xlsx`);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Reports</h2>
        <p className="text-slate-500">Generate and export office performance reports.</p>
      </header>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Excel Export</h3>
            <p className="text-sm text-slate-500">Select a date range for the financial summary.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Calendar size={14} /> Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Calendar size={14} /> End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={generateExcel}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 disabled:bg-indigo-400 transition-all font-bold shadow-lg shadow-indigo-100"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Download size={20} />
            )}
            Generate Excel Report
          </button>
          <p className="text-center text-xs text-slate-400">
            This will generate a multi-sheet Excel file containing Transactions, Employees, Notes, and a Summary.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-xl shadow-indigo-100">
          <BarChart3 className="mb-4 opacity-80" size={32} />
          <h4 className="text-lg font-bold mb-1">Auto-Summary</h4>
          <p className="text-indigo-100 text-sm">Daily and monthly summaries are automatically updated in the dashboard and reports.</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl shadow-slate-100">
          <FileSpreadsheet className="mb-4 opacity-80" size={32} />
          <h4 className="text-lg font-bold mb-1">Data Security</h4>
          <p className="text-slate-400 text-sm">All data is encrypted and stored securely in your private cloud database.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <Download className="mb-4 text-indigo-600" size={32} />
          <h4 className="text-lg font-bold text-slate-900 mb-1">Cloud Backup</h4>
          <p className="text-slate-500 text-sm">Your data is automatically backed up in real-time to the Firebase cloud storage.</p>
        </div>
      </div>
    </div>
  );
};
