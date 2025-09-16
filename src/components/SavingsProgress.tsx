import { useState, useEffect } from 'react';
import { PiggyBank, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { getSavingsGoals, getSavingsGoalProgress, getTotalSavingsAmount, formatCurrency, type SavingsGoal } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';

export const SavingsProgress = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [totalSavingsAmount, setTotalSavingsAmount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const updateData = () => {
      const activeGoals = getSavingsGoals().filter(g => g.is_active);
      setGoals(activeGoals);
      setTotalSavingsAmount(getTotalSavingsAmount());
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
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <PiggyBank className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Progress Nabung</h3>
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
        <div className="mb-4 p-3 bg-primary/5 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Total Tabungan</p>
          <p className="font-semibold text-primary">
            {formatCurrency(totalSavingsAmount)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            *Uang yang dialokasikan untuk tujuan tertentu
          </p>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="text-center py-6">
          <Target className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-3">
            Belum ada target tabungan
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/savings')}
          >
            Buat Target Pertama
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
              className="w-full text-xs"
            >
              Lihat {goals.length - 3} target lainnya
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};