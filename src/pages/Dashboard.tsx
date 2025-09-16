import { useEffect, useState } from 'react';
import { BalanceCard } from '@/components/BalanceCard';
import { ExpenseChart } from '@/components/ExpenseChart';
import { SavingsProgress } from '@/components/SavingsProgress';
import { getBalance, getMonthlyData, getSavingsMonthlyData, getTotalSavingsAmount, formatCurrency } from '@/lib/storage';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, PiggyBank, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [balanceData, setBalanceData] = useState({ balance: 0, totalIncome: 0, totalExpense: 0 });
  const [monthlyData, setMonthlyData] = useState({ income: 0, expense: 0, difference: 0 });
  const [savingsData, setSavingsData] = useState({ savingsDeposits: 0, nonSavingsExpenses: 0, totalExpenses: 0 });
  const [totalSavingsAmount, setTotalSavingsAmount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const updateData = () => {
      setBalanceData(getBalance());
      setMonthlyData(getMonthlyData(selectedDate.getFullYear(), selectedDate.getMonth()));
      setSavingsData(getSavingsMonthlyData(selectedDate.getFullYear(), selectedDate.getMonth()));
      setTotalSavingsAmount(getTotalSavingsAmount());
    };

    updateData();
    
    // Listen for storage changes
    const handleStorageChange = () => updateData();
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab updates
    window.addEventListener('finly-update', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('finly-update', handleStorageChange);
    };
  }, [selectedDate]);

  const currentMonth = selectedDate.toLocaleDateString('id-ID', { 
    month: 'long', 
    year: 'numeric' 
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      options.push({
        value: date.toISOString(),
        label: date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      });
    }
    return options;
  };

  return (
    <div className="pb-24 px-3 sm:px-4 pt-6 w-full max-w-sm sm:max-w-md mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-2xl font-bold mb-2">Finly</h1>
        <p className="text-muted-foreground text-base sm:text-sm">Kelola keuangan pribadi Anda</p>
      </div>

      {/* Balance Section */}
      <BalanceCard 
        balance={balanceData.balance}
        totalIncome={balanceData.totalIncome}
        totalExpense={balanceData.totalExpense}
      />

      {/* Monthly Summary */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg sm:text-base">Ringkasan</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Select 
              value={selectedDate.toISOString()} 
              onValueChange={(value) => setSelectedDate(new Date(value))}
            >
              <SelectTrigger className="w-[160px] h-8">
                <SelectValue>{currentMonth}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {getMonthOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8"
              disabled={selectedDate.getMonth() === new Date().getMonth() && selectedDate.getFullYear() === new Date().getFullYear()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <PiggyBank className="h-6 w-6 mx-auto text-primary mb-2" />
            <p className="text-sm sm:text-xs text-muted-foreground mb-2">Setoran Tabungan</p>
            <p className="font-semibold text-primary text-base sm:text-sm">
              {formatCurrency(savingsData.savingsDeposits)}
            </p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <Wallet className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm sm:text-xs text-muted-foreground mb-2">Pengeluaran Non-Tabungan</p>
            <p className="font-semibold text-expense text-base sm:text-sm">
              {formatCurrency(savingsData.nonSavingsExpenses)}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 text-center text-sm sm:text-xs">
          <div>
            <p className="text-muted-foreground mb-2">Pemasukan</p>
            <p className="font-medium text-income text-base sm:text-sm">
              {formatCurrency(monthlyData.income)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-2">Total Pengeluaran</p>
            <p className="font-medium text-expense text-base sm:text-sm">
              {formatCurrency(savingsData.totalExpenses)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-2">Selisih</p>
            <p className={`font-medium text-base sm:text-sm ${
              monthlyData.difference >= 0 ? 'text-income' : 'text-expense'
            }`}>
              {formatCurrency(monthlyData.difference)}
            </p>
          </div>
        </div>
        
        {totalSavingsAmount > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg text-center">
            <p className="text-sm sm:text-xs text-muted-foreground mb-2">Total Terkumpul Semua Target</p>
            <p className="font-semibold text-primary text-base sm:text-sm">
              {formatCurrency(totalSavingsAmount)}
            </p>
          </div>
        )}
      </Card>

      {/* Savings Progress */}
      <SavingsProgress />

      {/* Expense Chart */}
      <ExpenseChart />
    </div>
  );
}