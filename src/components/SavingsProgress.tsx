import { useState, useEffect } from 'react';
import { Sparkles, Target } from 'lucide-react';
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