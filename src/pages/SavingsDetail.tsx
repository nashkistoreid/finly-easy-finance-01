import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, ArrowDownLeft, ArrowUpRight, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getSavingsGoals, getSavingsGoalProgress, getTransactions, getCategories, formatCurrency, type SavingsGoal, type Transaction } from '@/lib/storage';

export default function SavingsDetail() {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const updateData = () => {
      if (!goalId) return;
      
      const goals = getSavingsGoals();
      const foundGoal = goals.find(g => g.id === goalId);
      setGoal(foundGoal || null);

      if (foundGoal) {
        const allTransactions = getTransactions();
        const categories = getCategories();
        
        // Get savings category and withdrawal category for this goal
        const savingsCategory = categories.find(c => 
          c.is_savings && c.savings_goal_id === goalId
        );
        const withdrawalCategory = categories.find(c => 
          c.name === `Penarikan Tabungan: ${foundGoal.name}`
        );

        // Filter transactions related to this savings goal
        const relatedTransactions = allTransactions.filter(t => {
          if (savingsCategory && t.category === savingsCategory.name) return true;
          if (withdrawalCategory && t.category === withdrawalCategory.name) return true;
          return false;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setTransactions(relatedTransactions);
      }
    };

    updateData();
    
    // Listen for storage changes
    const handleStorageChange = () => updateData();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('finly-update', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('finly-update', handleStorageChange);
    };
  }, [goalId]);

  if (!goal) {
    return (
      <div className="pb-24 px-3 sm:px-4 pt-6 w-full max-w-sm sm:max-w-md mx-auto">
        <div className="text-center py-8">
          <h2 className="text-lg font-medium">Target tabungan tidak ditemukan</h2>
          <Button onClick={() => navigate('/savings')} className="mt-4">
            Kembali ke Tabungan
          </Button>
        </div>
      </div>
    );
  }

  const progress = getSavingsGoalProgress(goal.id);

  return (
    <div className="pb-24 px-3 sm:px-4 pt-6 w-full max-w-sm sm:max-w-md mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/savings')}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{goal.name}</h1>
          <p className="text-sm text-muted-foreground">Detail Riwayat Tabungan</p>
        </div>
      </div>

      {/* Progress Summary */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">Target: {formatCurrency(goal.target_amount)}</h3>
              <p className="text-sm text-muted-foreground">
                Terkumpul: {formatCurrency(progress.collected_amount)}
              </p>
            </div>
            <Badge variant={progress.progress_percent >= 100 ? "default" : "secondary"} className="text-xs">
              {progress.progress_percent}%
            </Badge>
          </div>
          
          <Progress value={progress.progress_percent} className="h-3" />
          
          {progress.progress_percent < 100 ? (
            <p className="text-sm text-muted-foreground">
              Sisa: {formatCurrency(progress.remaining_amount)}
            </p>
          ) : (
            <p className="text-sm text-green-600 font-medium">
              🎉 Target tercapai!
            </p>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <Button
          size="sm"
          onClick={() => navigate('/add', { 
            state: { 
              defaultType: 'expense',
              defaultCategory: `Tabungan: ${goal.name}`
            }
          })}
          className="flex-1"
        >
          <ArrowUpRight className="h-4 w-4 mr-1" />
          Setor Lagi
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate('/add', { 
            state: { 
              defaultType: 'income',
              defaultCategory: `Penarikan Tabungan: ${goal.name}`
            }
          })}
          className="flex-1"
        >
          <ArrowDownLeft className="h-4 w-4 mr-1" />
          Tarik Dana
        </Button>
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Riwayat Transaksi</h2>
        
        {transactions.length === 0 ? (
          <Card className="p-6 text-center">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium mb-2">Belum Ada Transaksi</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Mulai dengan melakukan setoran pertama untuk {goal.name}
            </p>
            <Button
              size="sm"
              onClick={() => navigate('/add', { 
                state: { 
                  defaultType: 'expense',
                  defaultCategory: `Tabungan: ${goal.name}`
                }
              })}
            >
              <ArrowUpRight className="h-4 w-4 mr-1" />
              Setor Sekarang
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => {
              const isDeposit = transaction.type === 'expense';
              const isWithdrawal = transaction.type === 'income';
              
              return (
                <Card key={transaction.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-full ${
                        isDeposit ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {isDeposit ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            {isDeposit ? 'Setoran' : 'Penarikan'}
                          </h4>
                          <Badge variant={isDeposit ? "default" : "destructive"} className="text-xs">
                            {isDeposit ? 'Setor' : 'Tarik'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(transaction.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                        {transaction.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {transaction.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        isDeposit ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isDeposit ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}