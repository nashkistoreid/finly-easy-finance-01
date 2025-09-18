import { useState, useEffect } from 'react';
import { Sparkles, Target, Shield, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getSavingsGoals, getSavingsGoalProgress, getTotalSavingsAmount, formatCurrency, type SavingsGoal, getDebtFreeProgress, createOrUpdateDebtFreeGoal, getTotalActiveDebt, getUpcomingDueDates } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';

export const SavingsProgress = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [totalSavingsAmount, setTotalSavingsAmount] = useState(0);
  const [debtProgress, setDebtProgress] = useState<ReturnType<typeof getDebtFreeProgress> | null>(null);
  const [upcomingDues, setUpcomingDues] = useState<ReturnType<typeof getUpcomingDueDates>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const updateData = () => {
      const activeGoals = getSavingsGoals().filter(g => g.is_active);
      setGoals(activeGoals);
      setTotalSavingsAmount(getTotalSavingsAmount());
      setDebtProgress(getDebtFreeProgress());
      setUpcomingDues(getUpcomingDueDates());
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
  }, []);

  return (
    <Card className="p-5 bg-gradient-to-br from-accent/10 via-primary/10 to-accent/10 border-primary/20 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary/20 rounded-full">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Progress Impian
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/savings')}
          className="text-primary text-xs"
        >
          Lihat Semua
        </Button>
      </div>

      {totalSavingsAmount > 0 && (
        <div className="mb-4 p-4 bg-gradient-to-r from-primary/15 to-accent/15 rounded-lg border border-primary/20">
          <p className="text-xs text-muted-foreground mb-1 font-medium">Total Dana Impian</p>
          <p className="font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {formatCurrency(totalSavingsAmount)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            💰 Dana terkumpul untuk mewujudkan impian Anda
          </p>
        </div>
      )}

      {/* Debt Free Progress */}
      {debtProgress && debtProgress.total_debt > 0 && (
        <div className="mb-4">
          {debtProgress.is_achieved ? (
            <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-green-500" />
                <h4 className="font-semibold text-green-600">Selamat! Kamu sudah bebas hutang 🎉</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Total hutang {formatCurrency(debtProgress.total_debt)} telah lunas!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-orange-500" />
                  <h4 className="text-sm font-medium">Bebas Hutang</h4>
                </div>
                {!goals.some(g => g.name === 'Bebas Hutang') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      createOrUpdateDebtFreeGoal();
                      window.dispatchEvent(new CustomEvent('finly-update'));
                    }}
                    className="text-xs"
                  >
                    Buat Impian
                  </Button>
                )}
              </div>
              
              <Progress 
                value={debtProgress.progress_percent} 
                className="h-2"
              />
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Sudah dibayar</p>
                  <p className="font-medium">{formatCurrency(debtProgress.paid_amount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Sisa hutang</p>
                  <p className="font-medium text-orange-500">{formatCurrency(debtProgress.remaining_debt)}</p>
                </div>
              </div>

              {debtProgress.nearest_due_date && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <AlertDescription className="text-xs">
                    Jatuh tempo terdekat: {new Date(debtProgress.nearest_due_date.date).toLocaleDateString('id-ID')} - {debtProgress.nearest_due_date.party_name}
                  </AlertDescription>
                </Alert>
              )}

              {upcomingDues.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-xs">
                    ⚠️ Ada {upcomingDues.length} hutang yang akan jatuh tempo dalam 3 hari
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      )}

      {goals.length === 0 ? (
        <div className="text-center py-8">
          <div className="p-3 bg-accent/10 rounded-full w-fit mx-auto mb-3">
            <Target className="h-10 w-10 text-accent" />
          </div>
          <p className="text-sm font-medium text-foreground mb-2">
            Belum ada impian yang ditargetkan
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Mulai wujudkan impian Anda dengan membuat target
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/savings')}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            Buat Impian Pertama ✨
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.slice(0, 3).map((goal) => {
            const progress = getSavingsGoalProgress(goal.id);
            
            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium truncate flex-1 mr-2">
                    {goal.name}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {progress.progress_percent}%
                  </span>
                </div>
                
                <Progress value={progress.progress_percent} className="h-2" />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(progress.collected_amount)}</span>
                  <span>{formatCurrency(goal.target_amount)}</span>
                </div>
              </div>
            );
          })}
          
          {goals.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/savings')}
              className="w-full text-xs hover:bg-primary/10"
            >
              Lihat {goals.length - 3} impian lainnya ✨
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};