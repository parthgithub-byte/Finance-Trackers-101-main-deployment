import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { IndianRupee, PieChart, Wallet, TrendingUp, LogIn, UserPlus, BarChart, Sun, Moon } from 'lucide-react';
import BudgetPage from './pages/BudgetPage';
import Graphs from './Graphs';
import { ThemeProvider, useTheme } from './ThemeContext';
import SignIn from './SignIn';
import SignUp from './SignUp';

function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();
  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
      aria-label="Toggle dark mode"
    >
      {darkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-800" />}
    </button>
  );
}

function HomePage() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('user_id');

  const spendingData = [
    { category: 'Housing',        amount: 15000, color: 'bg-blue-500' },
    { category: 'Food',           amount: 8000,  color: 'bg-green-500' },
    { category: 'Transportation', amount: 5000,  color: 'bg-yellow-500' },
    { category: 'Entertainment',  amount: 3000,  color: 'bg-purple-500' },
    { category: 'Healthcare',     amount: 4000,  color: 'bg-red-500' },
    { category: 'Shopping',       amount: 6000,  color: 'bg-pink-500' },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <IndianRupee className="h-8 w-8 text-orange-500 dark:text-yellow-400" />
              <span className="ml-2 text-xl font-bold text-black dark:text-white">
                Personal Finance Tracker
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <DarkModeToggle />
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    localStorage.removeItem('user_id');
                    navigate('/signin');
                  }}
                  className="px-4 py-2 rounded-full text-red-600 dark:text-red-400 hover:text-red-900"
                >
                  Log Out
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/signin')}
                    className="flex items-center px-4 py-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <LogIn className="h-5 w-5 mr-1" />
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="flex items-center px-4 py-2 rounded-full bg-orange-500 dark:bg-yellow-500 text-white hover:bg-orange-600 dark:hover:bg-yellow-600"
                  >
                    <UserPlus className="h-5 w-5 mr-1" />
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div
        className="relative h-[500px] bg-cover bg-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&q=80")',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-5xl font-bold mb-4">Take Control of Your Finances</h1>
            <p className="text-xl mb-8">Smart budgeting tools to help you manage your money better</p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/budget')}
                className="px-8 py-3 bg-orange-500 rounded-full text-white font-semibold hover:bg-orange-600"
              >
                Start Budgeting Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <PieChart className="h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Budget Tracking</h3>
            <p className="text-gray-600 dark:text-gray-400">Create and manage your monthly budgets with easy-to-use tools</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <Wallet className="h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Expense Management</h3>
            <p className="text-gray-600 dark:text-gray-400">Track your expenses and categorize your spending habits</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <TrendingUp className="h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Visual Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400">Interactive charts and graphs to visualize your spending patterns</p>
          </div>
        </div>
      </div>

      {/* Finance Tips */}
      <div className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Financial Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: '50/30/20 Rule', tip: 'Allocate 50% of your income to needs, 30% to wants, and 20% to savings' },
              { title: 'Emergency Fund', tip: 'Save 3–6 months of expenses for unexpected situations' },
              { title: 'Investment Strategy', tip: 'Start investing early and diversify your portfolio' },
              { title: 'Debt Management', tip: 'Prioritize paying off high-interest debt first' },
            ].map(({ title, tip }) => (
              <div key={title} className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-600 via-pink-700 to-yellow-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2024 Personal Finance Management Team S4 DIT Pimpri. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
