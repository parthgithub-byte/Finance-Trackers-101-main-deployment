import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Trash2, Home, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTransactions, addTransaction, deleteTransaction } from '../api';
import { useTheme } from '../ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import Graphs from '../Graphs';

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
}

type SortField = 'date' | 'amount' | 'none';
type SortDir = 'asc' | 'desc';

// Parses **bold** and bullet lines (* / -) into JSX
function InsightText({ text }: { text: string }) {
  const lines = text.split('\n').filter((l) => l.trim() !== '');

  const parseBold = (line: string) =>
    line.split(/\*\*(.*?)\*\*/g).map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="font-semibold text-white">{part}</strong> : part
    );

  const isBullet = (line: string) => /^[*\-]\s/.test(line.trim());
  const bulletLines = lines.filter(isBullet);
  const headLines = lines.filter((l) => !isBullet(l));

  return (
    <>
      {headLines.map((line, i) => (
        <p key={i} className="mb-3 text-blue-100">{parseBold(line)}</p>
      ))}
      {bulletLines.length > 0 && (
        <ul className="space-y-3 mt-1">
          {bulletLines.map((line, i) => (
            <li key={i} className="flex items-start gap-3 bg-white/5 rounded-lg px-4 py-2">
              <span className="mt-0.5 text-blue-300 flex-shrink-0">◆</span>
              <span className="text-blue-100 text-sm leading-relaxed">
                {parseBold(line.replace(/^[*\-]\s/, ''))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function BudgetPage() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Data
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Charts panel
  const [showCharts, setShowCharts] = useState(false);

  // Add expense form
  const [showForm, setShowForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'Housing',
    date: new Date().toISOString().split('T')[0],
  });

  // AI Insights
  const [showInsightForm, setShowInsightForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showInsight, setShowInsight] = useState(false);
  const [insight, setInsight] = useState('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  // Sort & Filter
  const [sortField, setSortField] = useState<SortField>('none');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filterCategory, setFilterCategory] = useState('All');

  const categories = ['Housing', 'Food', 'Transportation', 'Entertainment', 'Groceries', 'Healthcare', 'Shopping', 'Others'];

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => {
    try {
      const data = await getTransactions();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTransaction(
        newExpense.description,
        parseFloat(newExpense.amount) || 0,
        newExpense.category,
        newExpense.date,
      );
      await fetchTransactions();
      setShowForm(false);
      setNewExpense({ description: '', amount: '', category: 'Housing', date: new Date().toISOString().split('T')[0] });
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTransaction(id);
      setExpenses(expenses.filter((e) => e.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const fetchInsights = async () => {
    setShowInsightForm(false);    // close form immediately
    setShowInsight(true);         // open insight panel right away
    setIsLoadingInsight(true);    // show spinner
    setInsight('');               // clear old text
    try {
      const response = await fetch('http://localhost:5000/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_date: startDate, end_date: endDate }),
      });
      const data = await response.json();
      setInsight(data.insight);
    } catch (error) {
      setInsight('Something went wrong fetching AI insights.');
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const displayedExpenses = useMemo(() => {
    let list = [...expenses];
    if (filterCategory !== 'All') list = list.filter((e) => e.category === filterCategory);
    if (sortField !== 'none') {
      list.sort((a, b) => {
        const va = sortField === 'date' ? a.date : a.amount;
        const vb = sortField === 'date' ? b.date : b.amount;
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [expenses, filterCategory, sortField, sortDir]);

  const SortBtn = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        sortField === field
          ? 'bg-orange-500 text-white'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      {label}
      <ArrowUpDown className="h-3.5 w-3.5" />
      {sortField === field && <span className="text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">

          {/* ── Header ── */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Home className="h-4 w-4" /> Home
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budget Dashboard</h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center px-5 py-2.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
              >
                <PlusCircle className="h-5 w-5 mr-2" /> Add Expense
              </button>
              <button
                onClick={() => setShowInsightForm(true)}
                className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                💡 AI Insights
              </button>
            </div>
          </div>

          {/* ── Charts Dropdown ── */}
          <div className="mb-8 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowCharts((v) => !v)}
              className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="text-lg font-semibold text-gray-800 dark:text-white">📊 Spending Charts</span>
              {showCharts ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
            </button>
            <AnimatePresence>
              {showCharts && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-white dark:bg-gray-800">
                    {expenses.length > 0
                      ? <Graphs key={expenses.length} />
                      : <p className="text-center text-gray-400 py-8">Add some transactions to see charts.</p>
                    }
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── AI Insight Panel ── */}
          <AnimatePresence>
            {showInsight && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <div className="bg-gradient-to-br from-blue-900 to-indigo-900 border border-blue-500/30 rounded-xl p-6 shadow-xl">
                  {/* Panel header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💬</span>
                      <h2 className="text-lg font-bold text-white">AI Insights</h2>
                      {isLoadingInsight && (
                        <span className="text-blue-300 text-sm font-normal animate-pulse">
                          Analyzing your spending…
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => { setShowInsight(false); setIsLoadingInsight(false); }}
                      className="text-blue-300 hover:text-white transition-colors text-sm px-2 py-1 rounded hover:bg-white/10"
                    >
                      Close ✖
                    </button>
                  </div>

                  {/* Loading spinner */}
                  {isLoadingInsight ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-4">
                      <svg
                        className="animate-spin h-12 w-12 text-blue-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      <p className="text-blue-300 text-sm">Gemini is reading your transactions…</p>
                    </div>
                  ) : (
                    /* Formatted insight */
                    <InsightText text={insight} />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Transaction Table ── */}
          <div className="mt-2">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Transaction History</h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Sort:</span>
                <SortBtn field="date" label="Date" />
                <SortBtn field="amount" label="Amount" />
                {sortField !== 'none' && (
                  <button
                    onClick={() => { setSortField('none'); setSortDir('asc'); }}
                    className="px-3 py-1.5 text-sm rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 transition-colors"
                  >
                    Clear
                  </button>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">Filter:</span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="All">All Categories</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {displayedExpenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      {['Date', 'Description', 'Category', 'Amount', 'Actions'].map((h) => (
                        <th key={h} className={`px-4 py-3 border dark:border-gray-600 ${h === 'Actions' ? 'text-center' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayedExpenses.map((expense) => (
                      <tr key={expense.id} className="border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-4 py-2 border dark:border-gray-600 text-gray-900 dark:text-gray-100">{expense.date}</td>
                        <td className="px-4 py-2 border dark:border-gray-600 text-gray-900 dark:text-gray-100">{expense.description}</td>
                        <td className="px-4 py-2 border dark:border-gray-600 text-gray-900 dark:text-gray-100">{expense.category}</td>
                        <td className="px-4 py-2 border dark:border-gray-600 text-gray-900 dark:text-gray-100 font-medium">₹{expense.amount.toFixed(2)}</td>
                        <td className="px-4 py-2 border dark:border-gray-600 text-center">
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700 transition flex items-center mx-auto"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Showing {displayedExpenses.length} of {expenses.length} transactions
                </p>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-300">
                {expenses.length === 0 ? 'No expenses added yet.' : 'No transactions match the selected filter.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Insight Date Form Modal ── */}
      {showInsightForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 dark:text-white rounded-xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Get AI Insights</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Leave dates empty to analyse all transactions.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 shadow-sm" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowInsightForm(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300">Cancel</button>
              <button onClick={fetchInsights} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Analyse →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Expense Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 dark:text-white rounded-xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Add New Expense</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <input type="text" required value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 shadow-sm focus:ring-2 focus:ring-orange-400 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label>
                  <input type="text" required value={newExpense.amount}
                    onChange={(e) => { if (/^\d*\.?\d*$/.test(e.target.value)) setNewExpense({ ...newExpense, amount: e.target.value }); }}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 shadow-sm focus:ring-2 focus:ring-orange-400 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 shadow-sm focus:ring-2 focus:ring-orange-400 outline-none">
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input type="date" required value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 shadow-sm focus:ring-2 focus:ring-orange-400 outline-none" />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium">Add Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
