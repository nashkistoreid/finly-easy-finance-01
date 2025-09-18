// Local storage utilities for Finly
export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense' | 'debt' | 'loan' | 'debt_payment';
  category: string;
  amount: number;
  notes?: string;
  bank_id?: string;
  // Debt/Loan specific fields
  party_name?: string;
  debt_type?: 'debt' | 'loan';
  loan_date?: string;
  due_date?: string;
  debt_id?: string; // For linking payments to debts
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  is_savings?: boolean;
  savings_goal_id?: string;
  is_active?: boolean;
}

const TRANSACTIONS_KEY = 'finly_transactions';
const CATEGORIES_KEY = 'finly_categories';
const SAVINGS_GOALS_KEY = 'finly_savings_goals';

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Gaji', type: 'income', is_active: true },
  { id: '2', name: 'Bonus', type: 'income', is_active: true },
  { id: '3', name: 'Lainnya', type: 'income', is_active: true },
  { id: '4', name: 'Makan', type: 'expense', is_active: true },
  { id: '5', name: 'Transportasi', type: 'expense', is_active: true },
  { id: '6', name: 'Tagihan', type: 'expense', is_active: true },
  { id: '7', name: 'Hiburan', type: 'expense', is_active: true },
  { id: '8', name: 'Belanja', type: 'expense', is_active: true },
  { id: '9', name: 'Lainnya', type: 'expense', is_active: true },
];

export const getTransactions = (): Transaction[] => {
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTransaction = (transaction: Omit<Transaction, 'id'>): Transaction => {
  const transactions = getTransactions();
  const newTransaction = {
    ...transaction,
    id: Date.now().toString(),
  };
  transactions.push(newTransaction);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  return newTransaction;
};

export const deleteTransaction = (id: string): void => {
  const transactions = getTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(filtered));
};

export const getCategories = (): Category[] => {
  const data = localStorage.getItem(CATEGORIES_KEY);
  if (!data) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  return JSON.parse(data);
};

export const getBalance = (): { balance: number; totalIncome: number; totalExpense: number } => {
  const transactions = getTransactions();
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    balance: totalIncome - totalExpense,
    totalIncome,
    totalExpense,
  };
};

export const getMonthlyData = (year: number, month: number) => {
  const transactions = getTransactions();
  const monthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });

  const monthlyIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const monthlyExpense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    income: monthlyIncome,
    expense: monthlyExpense,
    difference: monthlyIncome - monthlyExpense,
    transactions: monthTransactions,
  };
};

export const getCategoryExpenses = () => {
  const transactions = getTransactions();
  const categories = getCategories();
  const expenseCategories = categories.filter(c => c.type === 'expense');
  
  return expenseCategories.map(category => {
    const amount = transactions
      .filter(t => t.type === 'expense' && t.category === category.name)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      name: category.name,
      value: amount,
    };
  }).filter(item => item.value > 0);
};

export const getCategoryIncome = () => {
  const transactions = getTransactions();
  const categories = getCategories();
  const incomeCategories = categories.filter(c => c.type === 'income');
  
  return incomeCategories.map(category => {
    const amount = transactions
      .filter(t => t.type === 'income' && t.category === category.name)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      name: category.name,
      value: amount,
    };
  }).filter(item => item.value > 0);
};

// Active banks management
export const getActiveBanks = (): string[] => {
  const stored = localStorage.getItem('activeBanks');
  if (!stored) {
    // Default: only show common banks
    return ['cash', 'bca', 'bni', 'bri', 'mandiri'];
  }
  return JSON.parse(stored);
};

export const setActiveBanks = (bankIds: string[]) => {
  localStorage.setItem('activeBanks', JSON.stringify(bankIds));
  window.dispatchEvent(new CustomEvent('finly-update'));
};

export const getBalanceByBank = () => {
  const transactions = getTransactions();
  const bankBalances: { [key: string]: { income: number; expense: number; balance: number } } = {};
  
  transactions.forEach(t => {
    const bankId = t.bank_id || 'cash';
    if (!bankBalances[bankId]) {
      bankBalances[bankId] = { income: 0, expense: 0, balance: 0 };
    }
    
    if (t.type === 'income') {
      bankBalances[bankId].income += t.amount;
    } else {
      bankBalances[bankId].expense += t.amount;
    }
    bankBalances[bankId].balance = bankBalances[bankId].income - bankBalances[bankId].expense;
  });
  
  return bankBalances;
};

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  is_active: boolean;
  created_at: string;
  bank_id?: string;
}

// Legacy interface for backward compatibility
export interface SavingsTarget {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: string;
}

export const getSavingsTargets = (): SavingsTarget[] => {
  const saved = localStorage.getItem('savingsTargets');
  return saved ? JSON.parse(saved) : [];
};

export const saveSavingsTarget = (target: Omit<SavingsTarget, 'id'>): void => {
  const targets = getSavingsTargets();
  const newTarget: SavingsTarget = {
    ...target,
    id: Date.now().toString(),
  };
  targets.push(newTarget);
  localStorage.setItem('savingsTargets', JSON.stringify(targets));
  
  // Trigger custom event for updates
  window.dispatchEvent(new CustomEvent('finly-update'));
};

export const updateSavingsTarget = (id: string, updates: Partial<SavingsTarget>): void => {
  const targets = getSavingsTargets();
  const index = targets.findIndex(t => t.id === id);
  if (index !== -1) {
    targets[index] = { ...targets[index], ...updates };
    localStorage.setItem('savingsTargets', JSON.stringify(targets));
    
    // Trigger custom event for updates
    window.dispatchEvent(new CustomEvent('finly-update'));
  }
};

export const deleteSavingsTarget = (id: string): void => {
  const targets = getSavingsTargets();
  const filtered = targets.filter(t => t.id !== id);
  localStorage.setItem('savingsTargets', JSON.stringify(filtered));
  
  // Trigger custom event for updates
  window.dispatchEvent(new CustomEvent('finly-update'));
};

// New integrated savings system
export const getSavingsGoals = (): SavingsGoal[] => {
  const data = localStorage.getItem(SAVINGS_GOALS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveSavingsGoal = (goal: Omit<SavingsGoal, 'id'>): SavingsGoal => {
  const goals = getSavingsGoals();
  
  // Check for duplicate names
  const existingGoal = goals.find(g => g.name.toLowerCase() === goal.name.toLowerCase() && g.is_active);
  if (existingGoal) {
    throw new Error('Goal dengan nama tersebut sudah ada');
  }

  const newGoal: SavingsGoal = {
    ...goal,
    id: Date.now().toString(),
  };
  
  goals.push(newGoal);
  localStorage.setItem(SAVINGS_GOALS_KEY, JSON.stringify(goals));
  
  // Create associated savings category
  createSavingsCategory(newGoal);
  
  // Trigger custom event for updates
  window.dispatchEvent(new CustomEvent('finly-update'));
  
  return newGoal;
};

export const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>): void => {
  const goals = getSavingsGoals();
  const index = goals.findIndex(g => g.id === id);
  if (index !== -1) {
    const oldGoal = goals[index];
    goals[index] = { ...oldGoal, ...updates };
    localStorage.setItem(SAVINGS_GOALS_KEY, JSON.stringify(goals));
    
    // Update category name if goal name changed
    if (updates.name && updates.name !== oldGoal.name) {
      updateSavingsCategoryName(id, updates.name);
    }
    
    // Trigger custom event for updates
    window.dispatchEvent(new CustomEvent('finly-update'));
  }
};


export const deactivateSavingsGoal = (id: string): void => {
  const goals = getSavingsGoals();
  const index = goals.findIndex(g => g.id === id);
  if (index !== -1) {
    goals[index].is_active = false;
    localStorage.setItem(SAVINGS_GOALS_KEY, JSON.stringify(goals));
    
    // Deactivate associated category
    deactivateSavingsCategory(id);
    
    // Trigger custom event for updates
    window.dispatchEvent(new CustomEvent('finly-update'));
  }
};

const createSavingsCategory = (goal: SavingsGoal): void => {
  const categories = getCategories();
  const newCategory: Category = {
    id: `savings_${goal.id}`,
    name: `Impian: ${goal.name}`,
    type: 'expense',
    is_savings: true,
    savings_goal_id: goal.id,
    is_active: true,
  };
  
  categories.push(newCategory);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

const updateSavingsCategoryName = (goalId: string, newGoalName: string): void => {
  const categories = getCategories();
  const categoryIndex = categories.findIndex(c => c.savings_goal_id === goalId && c.is_savings);
  if (categoryIndex !== -1) {
    categories[categoryIndex].name = `Impian: ${newGoalName}`;
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }
};

const deactivateSavingsCategory = (goalId: string): void => {
  const categories = getCategories();
  const categoryIndex = categories.findIndex(c => c.savings_goal_id === goalId && c.is_savings);
  if (categoryIndex !== -1) {
    categories[categoryIndex].is_active = false;
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }
};

export const getSavingsGoalProgress = (goalId: string): { collected_amount: number; progress_percent: number; remaining_amount: number } => {
  const transactions = getTransactions();
  const categories = getCategories();
  
  // Find savings category for this goal
  const savingsCategory = categories.find(c => c.savings_goal_id === goalId && c.is_savings);
  if (!savingsCategory) {
    return { collected_amount: 0, progress_percent: 0, remaining_amount: 0 };
  }
  
  // Calculate deposits (expenses to savings category)
  const deposits = transactions
    .filter(t => t.type === 'expense' && t.category === savingsCategory.name)
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate withdrawals (income from withdrawal category)
  const withdrawalCategoryName = `Penarikan Impian: ${savingsCategory.name.replace('Impian: ', '')}`;
  const withdrawals = transactions
    .filter(t => t.type === 'income' && t.category === withdrawalCategoryName)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const collected_amount = deposits - withdrawals;
  
  const goal = getSavingsGoals().find(g => g.id === goalId);
  const target_amount = goal?.target_amount || 0;
  
  const progress_percent = target_amount > 0 ? Math.min(100, Math.round((collected_amount / target_amount) * 100)) : 0;
  const remaining_amount = Math.max(0, target_amount - collected_amount);
  
  return { collected_amount, progress_percent, remaining_amount };
};

export const createDepositTransaction = (goalId: string, amount: number, notes?: string): Transaction => {
  const goal = getSavingsGoals().find(g => g.id === goalId);
  if (!goal) {
    throw new Error('Goal tidak ditemukan');
  }
  
  const categories = getCategories();
  const savingsCategory = categories.find(c => c.savings_goal_id === goalId && c.is_savings);
  if (!savingsCategory) {
    throw new Error('Kategori impian tidak ditemukan');
  }
  
  const transaction = saveTransaction({
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    category: savingsCategory.name,
    amount,
    notes: notes || `Setoran ${goal.name}`,
  });
  
  // Trigger custom event for updates
  window.dispatchEvent(new CustomEvent('finly-update'));
  
  return transaction;
};

export const createWithdrawalTransaction = (goalId: string, amount: number, notes?: string): Transaction => {
  const goal = getSavingsGoals().find(g => g.id === goalId);
  if (!goal) {
    throw new Error('Goal tidak ditemukan');
  }
  
  const categories = getCategories();
  const withdrawalCategoryName = `Penarikan Impian: ${goal.name}`;
  
  // Create withdrawal category if it doesn't exist
  let withdrawalCategory = categories.find(c => c.name === withdrawalCategoryName);
  if (!withdrawalCategory) {
    withdrawalCategory = {
      id: `withdrawal_${goalId}`,
      name: withdrawalCategoryName,
      type: 'income',
      is_active: true,
    };
    categories.push(withdrawalCategory);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }
  
  const transaction = saveTransaction({
    date: new Date().toISOString().split('T')[0],
    type: 'income',
    category: withdrawalCategoryName,
    amount,
    notes: notes || `Penarikan ${goal.name}`,
  });
  
  // Trigger custom event for updates
  window.dispatchEvent(new CustomEvent('finly-update'));
  
  return transaction;
};

export const getActiveCategories = (): Category[] => {
  return getCategories().filter(c => c.is_active !== false);
};

export const getSavingsMonthlyData = (year: number, month: number) => {
  const transactions = getTransactions();
  const categories = getCategories();
  const savingsCategories = categories.filter(c => c.is_savings);
  
  const monthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });

  const savingsDeposits = monthTransactions
    .filter(t => t.type === 'expense' && savingsCategories.some(sc => sc.name === t.category))
    .reduce((sum, t) => sum + t.amount, 0);
  
  const nonSavingsExpenses = monthTransactions
    .filter(t => t.type === 'expense' && !savingsCategories.some(sc => sc.name === t.category))
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    savingsDeposits,
    nonSavingsExpenses,
    totalExpenses: savingsDeposits + nonSavingsExpenses,
  };
};

export const getTotalSavingsAmount = (): number => {
  const goals = getSavingsGoals().filter(g => g.is_active);
  return goals.reduce((total, goal) => {
    const progress = getSavingsGoalProgress(goal.id);
    return total + progress.collected_amount;
  }, 0);
};

export const formatCurrency = (amount: number, abbreviated: boolean = false): string => {
  // Check if we should abbreviate (for mobile)
  if (abbreviated && window.innerWidth < 640) {
    if (amount >= 1000000000) {
      return `Rp ${(amount / 1000000000).toFixed(1).replace(/\.0$/, '')}M`;
    } else if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1).replace(/\.0$/, '')}JT`;
    }
  }
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format input value with thousand separators
export const formatInputCurrency = (value: string): string => {
  // Remove all non-digit characters
  const numericValue = value.replace(/\D/g, '');
  
  // Add thousand separators
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Parse formatted input back to number
export const parseCurrencyInput = (value: string): number => {
  // Remove all non-digit characters
  const numericValue = value.replace(/\D/g, '');
  return parseInt(numericValue, 10) || 0;
};

// Debt/Loan Management
export interface Debt {
  id: string;
  party_name: string;
  type: 'debt' | 'loan';
  amount: number;
  loan_date: string;
  due_date: string;
  is_active: boolean;
  notes?: string;
  bank_id?: string;
  paid_amount: number;
}

const DEBTS_KEY = 'finly_debts';

export const getDebts = (): Debt[] => {
  const data = localStorage.getItem(DEBTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveDebt = (debt: Omit<Debt, 'id' | 'paid_amount'>): Debt => {
  const debts = getDebts();
  const newDebt: Debt = {
    ...debt,
    id: Date.now().toString(),
    paid_amount: 0,
  };
  
  debts.push(newDebt);
  localStorage.setItem(DEBTS_KEY, JSON.stringify(debts));
  
  // Trigger custom event for updates
  window.dispatchEvent(new CustomEvent('finly-update'));
  
  // Auto-create or update "Bebas Hutang" goal if it's a debt
  if (debt.type === 'debt') {
    createOrUpdateDebtFreeGoal();
  }
  
  return newDebt;
};

export const updateDebtPayment = (debtId: string, paymentAmount: number): void => {
  const debts = getDebts();
  const debtIndex = debts.findIndex(d => d.id === debtId);
  
  if (debtIndex !== -1) {
    debts[debtIndex].paid_amount += paymentAmount;
    
    // Mark as inactive if fully paid
    if (debts[debtIndex].paid_amount >= debts[debtIndex].amount) {
      debts[debtIndex].is_active = false;
    }
    
    localStorage.setItem(DEBTS_KEY, JSON.stringify(debts));
    
    // Update "Bebas Hutang" goal progress
    updateDebtFreeGoalProgress();
    
    // Trigger custom event for updates
    window.dispatchEvent(new CustomEvent('finly-update'));
  }
};

export const getTotalActiveDebt = (): number => {
  const debts = getDebts();
  return debts
    .filter(d => d.type === 'debt' && d.is_active)
    .reduce((total, debt) => total + (debt.amount - debt.paid_amount), 0);
};

export const getTotalDebtPayments = (): number => {
  const debts = getDebts();
  return debts
    .filter(d => d.type === 'debt')
    .reduce((total, debt) => total + debt.paid_amount, 0);
};

export const getUpcomingDueDates = (): Debt[] => {
  const debts = getDebts();
  const today = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(today.getDate() + 3);
  
  return debts
    .filter(d => {
      if (!d.is_active) return false;
      const dueDate = new Date(d.due_date);
      return dueDate <= threeDaysFromNow && dueDate >= today;
    })
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
};

export const getOverdueDebts = (): Debt[] => {
  const debts = getDebts();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return debts
    .filter(d => {
      if (!d.is_active) return false;
      const dueDate = new Date(d.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    });
};

// Special "Bebas Hutang" goal management
export const createOrUpdateDebtFreeGoal = (): void => {
  const goals = getSavingsGoals();
  const totalDebt = getTotalActiveDebt();
  
  let debtFreeGoal = goals.find(g => g.name === 'Bebas Hutang');
  
  if (!debtFreeGoal && totalDebt > 0) {
    // Create new "Bebas Hutang" goal
    saveSavingsGoal({
      name: 'Bebas Hutang',
      target_amount: totalDebt,
      is_active: true,
      created_at: new Date().toISOString().split('T')[0],
    });
  } else if (debtFreeGoal && totalDebt > 0) {
    // Update existing goal target
    updateSavingsGoal(debtFreeGoal.id, {
      target_amount: totalDebt,
    });
  }
};

export const updateDebtFreeGoalProgress = (): void => {
  const goals = getSavingsGoals();
  const debtFreeGoal = goals.find(g => g.name === 'Bebas Hutang');
  
  if (!debtFreeGoal) return;
  
  const totalDebt = getTotalActiveDebt();
  
  // If all debts are paid, mark goal as achieved
  if (totalDebt === 0) {
    updateSavingsGoal(debtFreeGoal.id, {
      is_active: false,
    });
  }
};

export const getDebtFreeProgress = (): { 
  total_debt: number;
  paid_amount: number;
  remaining_debt: number;
  progress_percent: number;
  nearest_due_date?: { date: string; party_name: string };
  is_achieved: boolean;
} => {
  const debts = getDebts().filter(d => d.type === 'debt');
  const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0);
  const paidAmount = debts.reduce((sum, d) => sum + d.paid_amount, 0);
  const remainingDebt = Math.max(0, totalDebt - paidAmount);
  const progressPercent = totalDebt > 0 ? Math.min(100, Math.round((paidAmount / totalDebt) * 100)) : 0;
  
  // Find nearest due date for active debts
  const activeDebts = debts.filter(d => d.is_active);
  const sortedByDue = activeDebts.sort((a, b) => 
    new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );
  
  const nearestDue = sortedByDue[0] ? {
    date: sortedByDue[0].due_date,
    party_name: sortedByDue[0].party_name,
  } : undefined;
  
  return {
    total_debt: totalDebt,
    paid_amount: paidAmount,
    remaining_debt: remainingDebt,
    progress_percent: progressPercent,
    nearest_due_date: nearestDue,
    is_achieved: remainingDebt === 0 && totalDebt > 0,
  };
};