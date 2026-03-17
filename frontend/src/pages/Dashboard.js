// pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Filler
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiDollarSign, 
  FiTrendingUp, 
  FiCalendar,
  FiPieChart,
  FiBarChart2,
  FiLogOut,
  FiSettings,
  FiGift,
  FiCoffee,
  FiHome,
  FiShoppingBag,
  FiHeart,
  FiBriefcase,
  FiAward,
  FiTarget,
  FiZap,
  FiStar,
  FiDownload,
  FiSearch,
  FiFilter,
  FiMoon,
  FiSun,
  FiCreditCard,
  FiClock,
  FiUsers
} from 'react-icons/fi';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Filler
);

// PDF Generation Function
const generatePDF = (expenses, monthLabel, year, userName) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(22);
  doc.setTextColor(74, 222, 128);
  doc.text('ExpenseTracker Pro', 105, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(`${monthLabel} ${year} Expense Report`, 105, 35, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(200, 200, 200);
  doc.text(`Generated for: ${userName}`, 105, 45, { align: 'center' });
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 52, { align: 'center' });
  
  // Calculate totals
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Add summary
  doc.setFontSize(14);
  doc.setTextColor(74, 222, 128);
  doc.text('Summary', 20, 65);
  
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`Total Expenses: ₹${total.toFixed(2)}`, 20, 75);
  doc.text(`Number of Transactions: ${expenses.length}`, 20, 82);
  
  // Create table data
  const tableData = expenses.map(exp => [
    new Date(exp.date).toLocaleDateString(),
    exp.title,
    exp.category,
    `₹${exp.amount.toFixed(2)}`,
    exp.description || '-'
  ]);
  
  // Add table
  autoTable(doc, {
    head: [['Date', 'Title', 'Category', 'Amount', 'Description']],
    body: tableData,
    startY: 95,
    styles: {
      fontSize: 10,
      cellPadding: 3,
      textColor: [255, 255, 255],
      fillColor: [30, 41, 59]
    },
    headStyles: {
      fillColor: [74, 222, 128],
      textColor: [15, 23, 42],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [51, 65, 85]
    }
  });
  
  // Save the PDF
  doc.save(`${monthLabel}_${year}_Expenses.pdf`);
};

// Gradient Text Component
const GradientText = ({ children, colors = ['#4ade80', '#60a5fa', '#fbbf24'] }) => (
  <span style={{
    background: `linear-gradient(135deg, ${colors.join(', ')})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent',
    fontWeight: 'bold'
  }}>
    {children}
  </span>
);

const Dashboard = () => {
  const { user, logout, updateMonthlyLimit } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    limit: 15000,
    categoryBreakdown: {},
    count: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [newLimit, setNewLimit] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Other',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Months for selection
  const months = [
    { value: 'all', label: 'All Months' },
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' }
  ];

  // Years for selection (last 5 years)
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4];

  // Load user-specific data
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadUserData();
  }, [user]);

  // Filter expenses when month or year changes
  useEffect(() => {
    filterExpensesByMonth();
  }, [selectedMonth, selectedYear, expenses]);

  const loadUserData = () => {
    try {
      // Load user-specific expenses
      const allExpenses = JSON.parse(localStorage.getItem('all_expenses') || '{}');
      const userExpenses = allExpenses[user.id] || [];
      setExpenses(userExpenses);
      setFilteredExpenses(userExpenses);

      // Load user-specific limit
      const allLimits = JSON.parse(localStorage.getItem('all_limits') || '{}');
      const userLimit = allLimits[user.id] || 15000;

      // Calculate summary
      const total = userExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const categoryBreakdown = {};
      userExpenses.forEach(exp => {
        categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
      });

      setSummary({
        total,
        limit: userLimit,
        categoryBreakdown,
        count: userExpenses.length
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter expenses by selected month and year
  const filterExpensesByMonth = () => {
    if (selectedMonth === 'all') {
      setFilteredExpenses(expenses);
    } else {
      const filtered = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === parseInt(selectedMonth) && 
               expDate.getFullYear() === selectedYear;
      });
      setFilteredExpenses(filtered);
    }
  };

  // Download expenses for selected month as PDF
  const downloadMonthlyExpenses = () => {
    const monthLabel = selectedMonth === 'all' ? 'All_Months' : months.find(m => m.value === selectedMonth)?.label;
    generatePDF(
      selectedMonth === 'all' ? expenses : filteredExpenses, 
      monthLabel, 
      selectedYear, 
      user?.name || 'User'
    );
    toast.success(`📄 Downloaded ${monthLabel} expenses as PDF!`);
  };

  // Save user-specific expenses
  const saveExpenses = (newExpenses) => {
    const allExpenses = JSON.parse(localStorage.getItem('all_expenses') || '{}');
    allExpenses[user.id] = newExpenses;
    localStorage.setItem('all_expenses', JSON.stringify(allExpenses));
    setExpenses(newExpenses);
    filterExpensesByMonth();
    
    // Update summary
    const total = newExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const categoryBreakdown = {};
    newExpenses.forEach(exp => {
      categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
    });
    
    setSummary({
      ...summary,
      total,
      categoryBreakdown,
      count: newExpenses.length
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      Food: '#FF6B6B',
      Transport: '#4ECDC4',
      Shopping: '#FFE66D',
      Entertainment: '#A37CFF',
      Bills: '#FF8C42',
      Healthcare: '#FF6B9D',
      Education: '#6C5CE7',
      Other: '#A8A8A8'
    };
    return colors[category] || '#A8A8A8';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Food: <FiCoffee />,
      Transport: <FiTrendingUp />,
      Shopping: <FiShoppingBag />,
      Entertainment: <FiGift />,
      Bills: <FiHome />,
      Healthcare: <FiHeart />,
      Education: <FiBriefcase />,
      Other: <FiDollarSign />
    };
    return icons[category] || <FiDollarSign />;
  };

  // Chart data - use filtered expenses when month is selected
  const chartExpenses = selectedMonth === 'all' ? expenses : filteredExpenses;
  const chartTotal = chartExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const chartCategoryBreakdown = {};
  chartExpenses.forEach(exp => {
    chartCategoryBreakdown[exp.category] = (chartCategoryBreakdown[exp.category] || 0) + exp.amount;
  });

  const pieChartData = {
    labels: Object.keys(chartCategoryBreakdown),
    datasets: [{
      data: Object.values(chartCategoryBreakdown),
      backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A37CFF', '#FF8C42', '#FF6B9D', '#6C5CE7'],
      borderWidth: 0,
      hoverOffset: 10
    }]
  };

  const barChartData = {
    labels: ['Spent', 'Remaining'],
    datasets: [{
      label: 'Amount (₹)',
      data: [chartTotal, Math.max(0, summary.limit - chartTotal)],
      backgroundColor: ['#FF6B6B', '#4ECDC4'],
      borderRadius: 8,
      barPercentage: 0.6
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: {
          color: '#e2e8f0',
          font: { size: 12, weight: 'bold', family: "'Inter', sans-serif" }
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13, weight: '500' }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  // CRUD Handlers
  const handleAddExpense = async (e) => {
    e.preventDefault();
    const newExpense = {
      _id: Date.now().toString(),
      ...formData,
      amount: parseFloat(formData.amount),
      userId: user.id
    };
    
    const updatedExpenses = [newExpense, ...expenses];
    saveExpenses(updatedExpenses);
    setShowAddModal(false);
    resetForm();
    
    toast.success('🎉 Expense added successfully!', {
      style: { background: '#1e293b', color: '#fff', fontWeight: 'bold' }
    });
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm('Are you sure?')) {
      const updatedExpenses = expenses.filter(exp => exp._id !== id);
      saveExpenses(updatedExpenses);
      toast.success('🗑️ Expense deleted!', {
        style: { background: '#1e293b', color: '#fff', fontWeight: 'bold' }
      });
    }
  };

  const openEditModal = (expense) => {
    setCurrentExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      date: new Date(expense.date).toISOString().split('T')[0],
      description: expense.description || ''
    });
    setShowEditModal(true);
  };

  const handleEditExpense = (e) => {
    e.preventDefault();
    const updatedExpenses = expenses.map(exp => 
      exp._id === currentExpense._id ? 
      {...currentExpense, ...formData, amount: parseFloat(formData.amount)} : 
      exp
    );
    saveExpenses(updatedExpenses);
    setShowEditModal(false);
    resetForm();
    toast.success('✨ Expense updated!', {
      style: { background: '#1e293b', color: '#fff', fontWeight: 'bold' }
    });
  };

  const handleUpdateLimit = (e) => {
    e.preventDefault();
    const limit = parseFloat(newLimit);
    updateMonthlyLimit(limit);
    setSummary({...summary, limit});
    setShowLimitModal(false);
    setNewLimit('');
    toast.success('🎯 Monthly limit updated!', {
      style: { background: '#1e293b', color: '#fff', fontWeight: 'bold' }
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      category: 'Other',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setCurrentExpense(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0f172a',
        position: 'relative'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            width: '60px',
            height: '60px',
            border: '4px solid #334155',
            borderTop: '4px solid #4ade80',
            borderRadius: '50%',
            marginBottom: '20px',
            boxShadow: '0 0 20px rgba(74,222,128,0.2)'
          }}
        />
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ color: '#e2e8f0', fontSize: '16px', fontWeight: '500' }}
        >
          Loading your financial data...
        </motion.p>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      overflow: 'hidden',
      background: '#0f172a',
      color: '#e2e8f0',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Fixed Header - No scroll */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '12px 24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #4ade80, #60a5fa)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: 'bold',
              color: '#0f172a',
              boxShadow: '0 4px 12px rgba(74,222,128,0.3)'
            }}>
              ₹
            </div>
            <div>
              <h1 style={{ 
                fontSize: '22px', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #4ade80, #60a5fa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '2px'
              }}>
                ExpenseTracker Pro
              </h1>
              <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                Smart Money Management
              </p>
            </div>
          </div>

          {/* User Info & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              padding: '8px 16px',
              background: '#334155',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #4ade8020'
            }}>
              <FiStar color="#fbbf24" size={14} />
              <span style={{ fontWeight: '600', color: '#e2e8f0' }}>
                {user?.name || 'User'}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 4px 10px rgba(239,68,68,0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#dc2626'}
              onMouseLeave={(e) => e.target.style.background = '#ef4444'}
            >
              <FiLogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content - Offset for fixed header */}
      <div style={{
        height: '100vh',
        overflow: 'auto',
        paddingTop: '80px',
        background: '#0f172a'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '20px 24px 40px 24px'
        }}>
          {/* Welcome Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #1e293b, #2d3b4f)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid #4ade8020',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <FiAward size={48} color="#4ade80" />
              <div>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #4ade80, #60a5fa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '4px'
                }}>
                  Great job, {user?.name || 'User'}!
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '15px', fontWeight: '500' }}>
                  {expenses.length === 0 
                    ? '🚀 Start your financial journey by adding your first expense!'
                    : `🎯 You've saved ₹${(summary.limit - summary.total).toFixed(2)} this month. Keep up the great work!`}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Cards - Bold Design */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            marginBottom: '24px'
          }}>
            {[
              { 
                title: 'TOTAL SPENT', 
                amount: summary.total, 
                icon: FiDollarSign, 
                color: '#4ade80',
                bgGradient: 'linear-gradient(135deg, #132337, #1e2a3a)'
              },
              { 
                title: 'MONTHLY LIMIT', 
                amount: summary.limit, 
                icon: FiTarget, 
                color: '#fbbf24',
                bgGradient: 'linear-gradient(135deg, #1f2a1f, #2a3525)'
              },
              { 
                title: 'REMAINING', 
                amount: Math.max(0, summary.limit - summary.total), 
                icon: FiTrendingUp, 
                color: '#60a5fa',
                bgGradient: 'linear-gradient(135deg, #17253a, #1f3150)'
              },
              { 
                title: 'TRANSACTIONS', 
                amount: expenses.length, 
                icon: FiCalendar, 
                color: '#f87171',
                bgGradient: 'linear-gradient(135deg, #2a1f2a, #3a2535)'
              }
            ].map((card, index) => (
              <div
                key={index}
                style={{
                  background: card.bgGradient,
                  borderRadius: '20px',
                  padding: '24px',
                  border: `1px solid ${card.color}20`,
                  boxShadow: `0 8px 20px rgba(0,0,0,0.4)`,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <card.icon size={32} color={card.color} style={{ marginBottom: '16px' }} />
                <h3 style={{ 
                  fontSize: '13px', 
                  fontWeight: '700', 
                  color: '#94a3b8',
                  letterSpacing: '1px',
                  marginBottom: '8px'
                }}>
                  {card.title}
                </h3>
                <p style={{ 
                  fontSize: '32px', 
                  fontWeight: '800', 
                  color: card.color,
                  marginBottom: card.title === 'MONTHLY LIMIT' ? '12px' : 0
                }}>
                  {card.title === 'TRANSACTIONS' ? card.amount : `₹${card.amount.toFixed(2)}`}
                </p>
                {card.title === 'MONTHLY LIMIT' && (
                  <button
                    onClick={() => setShowLimitModal(true)}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(251,191,36,0.1)',
                      border: '1px solid #fbbf2440',
                      borderRadius: '8px',
                      color: '#fbbf24',
                      cursor: 'pointer',
                      width: '100%',
                      fontSize: '13px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(251,191,36,0.2)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(251,191,36,0.1)'}
                  >
                    <FiZap size={14} color="#fbbf24" /> UPDATE LIMIT
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Charts Section */}
          {expenses.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '24px'
            }}>
              {/* Pie Chart */}
              <div style={{
                background: '#1e293b',
                borderRadius: '20px',
                padding: '20px',
                border: '1px solid #334155',
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
              }}>
                <h3 style={{ 
                  color: '#e2e8f0', 
                  fontSize: '16px', 
                  fontWeight: '700',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiPieChart color="#4ade80" size={18} /> CATEGORY BREAKDOWN
                </h3>
                <div style={{ height: '260px' }}>
                  {Object.keys(chartCategoryBreakdown).length > 0 ? (
                    <Pie data={pieChartData} options={chartOptions} />
                  ) : (
                    <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px', fontWeight: '500' }}>
                      No expenses in selected period
                    </div>
                  )}
                </div>
              </div>

              {/* Bar Chart */}
              <div style={{
                background: '#1e293b',
                borderRadius: '20px',
                padding: '20px',
                border: '1px solid #334155',
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
              }}>
                <h3 style={{ 
                  color: '#e2e8f0', 
                  fontSize: '16px', 
                  fontWeight: '700',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiBarChart2 color="#fbbf24" size={18} /> BUDGET OVERVIEW
                </h3>
                <div style={{ height: '260px' }}>
                  {summary.limit > 0 ? (
                    <Bar data={barChartData} options={chartOptions} />
                  ) : (
                    <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px', fontWeight: '500' }}>
                      Set a monthly limit to see budget
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            background: '#1e293b',
            padding: '16px 20px',
            borderRadius: '16px',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowMonthPicker(!showMonthPicker)}
                style={{
                  padding: '10px 20px',
                  background: '#334155',
                  color: '#e2e8f0',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#475569'}
                onMouseLeave={(e) => e.target.style.background = '#334155'}
              >
                <FiSearch size={16} /> MONTHLY EXPENSES
              </button>

              {selectedMonth !== 'all' && (
                <button
                  onClick={downloadMonthlyExpenses}
                  style={{
                    padding: '10px 20px',
                    background: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#047857'}
                  onMouseLeave={(e) => e.target.style.background = '#059669'}
                >
                  <FiDownload size={16} /> DOWNLOAD PDF
                </button>
              )}
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: '10px 24px',
                background: '#4ade80',
                color: '#0f172a',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(74,222,128,0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#22c55e'}
              onMouseLeave={(e) => e.target.style.background = '#4ade80'}
            >
              <FiPlus size={18} /> ADD EXPENSE
            </button>
          </div>

          {/* Month Picker */}
          <AnimatePresence>
            {showMonthPicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: '#1e293b',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '20px',
                  border: '1px solid #334155',
                  display: 'flex',
                  gap: '20px',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '600' }}>MONTH:</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: '#334155',
                      color: '#e2e8f0',
                      border: '1px solid #4ade8040',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                  >
                    {months.map(month => (
                      <option key={month.value} value={month.value} style={{ background: '#1e293b' }}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '600' }}>YEAR:</span>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: '#334155',
                      color: '#e2e8f0',
                      border: '1px solid #4ade8040',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                  >
                    {years.map(year => (
                      <option key={year} value={year} style={{ background: '#1e293b' }}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedMonth !== 'all' && (
                  <div style={{ marginLeft: 'auto', color: '#4ade80', fontSize: '14px', fontWeight: '600' }}>
                    {filteredExpenses.length} EXPENSES • ₹{filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Filter */}
          {expenses.length > 0 && (
            <div style={{
              marginBottom: '20px',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              background: '#1e293b',
              padding: '16px',
              borderRadius: '16px',
              border: '1px solid #334155',
              alignItems: 'center'
            }}>
              <FiFilter color="#4ade80" size={16} style={{ marginRight: '8px' }} />
              {['all', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Other'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '30px',
                    border: 'none',
                    background: selectedCategory === cat ? getCategoryColor(cat) : '#334155',
                    color: selectedCategory === cat ? 'white' : '#e2e8f0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: selectedCategory === cat ? '700' : '600',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat !== 'all' && getCategoryIcon(cat)}
                  {cat === 'all' ? 'ALL' : cat.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          {/* Month Indicator */}
          {selectedMonth !== 'all' && (
            <div style={{
              background: '#059669',
              borderRadius: '8px',
              padding: '8px 16px',
              marginBottom: '16px',
              display: 'inline-block',
              color: 'white',
              fontSize: '14px',
              fontWeight: '700',
              boxShadow: '0 4px 12px rgba(5,150,105,0.3)'
            }}>
              {months.find(m => m.value === selectedMonth)?.label} {selectedYear} • {filteredExpenses.length} EXPENSES
            </div>
          )}

          {/* Expenses Table */}
          <div style={{
            background: '#1e293b',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid #334155',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ 
              color: '#e2e8f0', 
              fontSize: '18px', 
              fontWeight: '700',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FiCalendar color="#4ade80" size={18} /> 
              {selectedMonth === 'all' ? 'ALL EXPENSES' : `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear} EXPENSES`}
            </h3>

            <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#2d3b4f', zIndex: 5 }}>
                  <tr>
                    <th style={{ padding: '14px', textAlign: 'left', color: '#4ade80', fontSize: '13px', fontWeight: '700' }}>DATE</th>
                    <th style={{ padding: '14px', textAlign: 'left', color: '#4ade80', fontSize: '13px', fontWeight: '700' }}>TITLE</th>
                    <th style={{ padding: '14px', textAlign: 'left', color: '#4ade80', fontSize: '13px', fontWeight: '700' }}>CATEGORY</th>
                    <th style={{ padding: '14px', textAlign: 'left', color: '#4ade80', fontSize: '13px', fontWeight: '700' }}>AMOUNT</th>
                    <th style={{ padding: '14px', textAlign: 'left', color: '#4ade80', fontSize: '13px', fontWeight: '700' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {(selectedMonth === 'all' ? expenses : filteredExpenses)
                      .filter(exp => selectedCategory === 'all' || exp.category === selectedCategory)
                      .map((expense, index) => (
                      <motion.tr
                        key={expense._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.02 }}
                        style={{ borderBottom: '1px solid #334155' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#2d3b4f'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px', fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '14px', fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>
                          {expense.title}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span style={{
                            padding: '4px 12px',
                            background: getCategoryColor(expense.category),
                            color: 'white',
                            borderRadius: '30px',
                            fontSize: '12px',
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                          }}>
                            {getCategoryIcon(expense.category)}
                            {expense.category}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '14px',
                          fontWeight: '700',
                          color: expense.amount > 1000 ? '#f87171' : '#4ade80',
                          fontSize: '14px'
                        }}>
                          ₹{expense.amount.toFixed(2)}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <button
                            onClick={() => openEditModal(expense)}
                            style={{
                              padding: '6px 12px',
                              margin: '0 4px',
                              background: '#f59e0b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#d97706'}
                            onMouseLeave={(e) => e.target.style.background = '#f59e0b'}
                          >
                            <FiEdit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense._id)}
                            style={{
                              padding: '6px 12px',
                              margin: '0 4px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                            onMouseLeave={(e) => e.target.style.background = '#ef4444'}
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  
                  {(selectedMonth === 'all' ? expenses : filteredExpenses).length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
                        <h3 style={{ color: '#e2e8f0', marginBottom: '8px', fontSize: '18px', fontWeight: '700' }}>
                          {expenses.length === 0 
                            ? 'No expenses yet!' 
                            : 'No expenses match your filter'}
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>
                          {expenses.length === 0 
                            ? 'Add your first expense to get started.'
                            : 'Try changing your category or month filter.'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary Footer */}
            {(selectedMonth === 'all' ? expenses : filteredExpenses).length > 0 && (
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: '#2d3b4f',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#e2e8f0',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <span>TOTAL TRANSACTIONS: <span style={{ color: '#4ade80', fontWeight: '800' }}>
                  {(selectedMonth === 'all' ? expenses : filteredExpenses).length}
                </span></span>
                <span>TOTAL AMOUNT: <span style={{ color: '#4ade80', fontWeight: '800' }}>
                  ₹{(selectedMonth === 'all' ? expenses : filteredExpenses).reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                </span></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 2000,
              backdropFilter: 'blur(8px)'
            }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              style={{
                background: '#1e293b',
                padding: '32px',
                borderRadius: '24px',
                width: '90%',
                maxWidth: '440px',
                border: '1px solid #4ade8040',
                boxShadow: '0 20px 60px rgba(74,222,128,0.2)'
              }}
              onClick={e => e.stopPropagation()}
            >
              <h3 style={{ 
                marginBottom: '24px', 
                color: 'white',
                fontSize: '24px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FiPlus color="#4ade80" size={24} /> ADD EXPENSE
              </h3>
              
              <form onSubmit={handleAddExpense}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    color: '#4ade80',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    TITLE
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      borderRadius: '12px', 
                      border: '2px solid #334155',
                      background: '#0f172a',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#4ade80'}
                    onBlur={(e) => e.target.style.borderColor = '#334155'}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    color: '#4ade80',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    AMOUNT (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      borderRadius: '12px', 
                      border: '2px solid #334155',
                      background: '#0f172a',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#4ade80'}
                    onBlur={(e) => e.target.style.borderColor = '#334155'}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    color: '#4ade80',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    CATEGORY
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      borderRadius: '12px', 
                      border: '2px solid #334155',
                      background: '#0f172a',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#4ade80'}
                    onBlur={(e) => e.target.style.borderColor = '#334155'}
                  >
                    <option value="Food">🍔 FOOD</option>
                    <option value="Transport">🚗 TRANSPORT</option>
                    <option value="Shopping">🛍️ SHOPPING</option>
                    <option value="Entertainment">🎮 ENTERTAINMENT</option>
                    <option value="Bills">📄 BILLS</option>
                    <option value="Healthcare">❤️ HEALTHCARE</option>
                    <option value="Education">📚 EDUCATION</option>
                    <option value="Other">📦 OTHER</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    color: '#4ade80',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    DATE
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      borderRadius: '12px', 
                      border: '2px solid #334155',
                      background: '#0f172a',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#4ade80'}
                    onBlur={(e) => e.target.style.borderColor = '#334155'}
                    required
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="submit"
                    style={{ 
                      flex: 1, 
                      padding: '14px', 
                      background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                      color: '#0f172a', 
                      border: 'none', 
                      borderRadius: '12px', 
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '700',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    ADD EXPENSE
                  </button>
                  <button
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    style={{ 
                      flex: 1, 
                      padding: '14px', 
                      background: '#334155',
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '12px', 
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#475569'}
                    onMouseLeave={(e) => e.target.style.background = '#334155'}
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 2000,
              backdropFilter: 'blur(8px)'
            }}
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              style={{
                background: '#1e293b',
                padding: '32px',
                borderRadius: '24px',
                width: '90%',
                maxWidth: '440px',
                border: '1px solid #fbbf2440',
                boxShadow: '0 20px 60px rgba(251,191,36,0.2)'
              }}
              onClick={e => e.stopPropagation()}
            >
              <h3 style={{ 
                marginBottom: '24px', 
                color: 'white',
                fontSize: '24px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FiEdit color="#fbbf24" size={24} /> EDIT EXPENSE
              </h3>
              <form onSubmit={handleEditExpense}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    color: '#fbbf24',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    TITLE
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      borderRadius: '12px', 
                      border: '2px solid #334155',
                      background: '#0f172a',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
                    onBlur={(e) => e.target.style.borderColor = '#334155'}
                    required
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    color: '#fbbf24',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    AMOUNT (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      borderRadius: '12px', 
                      border: '2px solid #334155',
                      background: '#0f172a',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
                    onBlur={(e) => e.target.style.borderColor = '#334155'}
                    required
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    color: '#fbbf24',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    CATEGORY
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      borderRadius: '12px', 
                      border: '2px solid #334155',
                      background: '#0f172a',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
                    onBlur={(e) => e.target.style.borderColor = '#334155'}
                  >
                    <option value="Food">🍔 FOOD</option>
                    <option value="Transport">🚗 TRANSPORT</option>
                    <option value="Shopping">🛍️ SHOPPING</option>
                    <option value="Entertainment">🎮 ENTERTAINMENT</option>
                    <option value="Bills">📄 BILLS</option>
                    <option value="Healthcare">❤️ HEALTHCARE</option>
                    <option value="Education">📚 EDUCATION</option>
                    <option value="Other">📦 OTHER</option>
                  </select>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    color: '#fbbf24',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    DATE
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      borderRadius: '12px', 
                      border: '2px solid #334155',
                      background: '#0f172a',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
                    onBlur={(e) => e.target.style.borderColor = '#334155'}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="submit"
                    style={{ 
                      flex: 1, 
                      padding: '14px', 
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      color: '#0f172a', 
                      border: 'none', 
                      borderRadius: '12px', 
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '700',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    UPDATE
                  </button>
                  <button
                    type="button" 
                    onClick={() => setShowEditModal(false)}
                    style={{ 
                      flex: 1, 
                      padding: '14px', 
                      background: '#334155',
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '12px', 
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#475569'}
                    onMouseLeave={(e) => e.target.style.background = '#334155'}
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Limit Modal */}
      <AnimatePresence>
        {showLimitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 2000,
              backdropFilter: 'blur(8px)'
            }}
            onClick={() => setShowLimitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              style={{
                background: '#1e293b',
                padding: '32px',
                borderRadius: '24px',
                width: '90%',
                maxWidth: '440px',
                border: '1px solid #60a5fa40',
                boxShadow: '0 20px 60px rgba(96,165,250,0.2)'
              }}
              onClick={e => e.stopPropagation()}
            >
              <h3 style={{ 
                marginBottom: '24px', 
                color: 'white',
                fontSize: '24px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FiTarget color="#60a5fa" size={24} /> UPDATE LIMIT
              </h3>
              <form onSubmit={handleUpdateLimit}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    color: '#60a5fa',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    MONTHLY LIMIT (₹)
                  </label>
                  <input
                    type="number"
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      borderRadius: '12px', 
                      border: '2px solid #334155',
                      background: '#0f172a',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: '500',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#60a5fa'}
                    onBlur={(e) => e.target.style.borderColor = '#334155'}
                    required
                    placeholder="Enter your monthly limit"
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="submit"
                    style={{ 
                      flex: 1, 
                      padding: '14px', 
                      background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                      color: '#0f172a', 
                      border: 'none', 
                      borderRadius: '12px', 
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '700',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    UPDATE
                  </button>
                  <button
                    type="button" 
                    onClick={() => setShowLimitModal(false)}
                    style={{ 
                      flex: 1, 
                      padding: '14px', 
                      background: '#334155',
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '12px', 
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#475569'}
                    onMouseLeave={(e) => e.target.style.background = '#334155'}
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;