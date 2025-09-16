import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/storage';

interface BalanceCardProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
}

export const BalanceCard = ({ balance, totalIncome, totalExpense }: BalanceCardProps) => {
  return (
    <div className="space-y-4">
      {/* Main Balance Card */}
      <Card className="p-6 bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground shadow-lg">
        <div className="text-center">
          <div className="flex items-center justify-center mb-3">
            <DollarSign className="h-7 w-7 sm:h-6 sm:w-6 mr-2" />
            <span className="text-base sm:text-sm font-medium opacity-90">Saldo Saat Ini</span>
          </div>
          <div className="text-4xl sm:text-3xl font-bold mb-2">
            {formatCurrency(balance)}
          </div>
          <p className="text-base sm:text-sm opacity-80">
            Total dari semua transaksi
          </p>
        </div>
      </Card>

      {/* Income & Expense Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-income-light border-income/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-income rounded-full">
              <TrendingUp className="h-5 w-5 sm:h-4 sm:w-4 text-income-foreground" />
            </div>
            <div>
              <p className="text-sm sm:text-xs font-medium text-muted-foreground">Pemasukan</p>
              <p className="font-bold text-income text-base sm:text-sm">
                {formatCurrency(totalIncome)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-expense-light border-expense/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-expense rounded-full">
              <TrendingDown className="h-5 w-5 sm:h-4 sm:w-4 text-expense-foreground" />
            </div>
            <div>
              <p className="text-sm sm:text-xs font-medium text-muted-foreground">Pengeluaran</p>
              <p className="font-bold text-expense text-base sm:text-sm">
                {formatCurrency(totalExpense)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};