import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { calculateFinancialHealthScore, formatCurrency } from '@/lib/storage';

export function FinancialHealthScore() {
  const [scoreData, setScoreData] = useState<{
    score: number;
    label: string;
    color: string;
    icon: React.ReactNode;
    suggestions: string[];
    details: {
      savingsRatio: number;
      debtStatus: string;
      expenseControl: string;
      goalProgress: number;
    };
  } | null>(null);

  useEffect(() => {
    const updateScore = () => {
      const data = calculateFinancialHealthScore();
      setScoreData(data);
    };

    updateScore();

    // Update score when data changes
    const handleStorageChange = () => updateScore();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('finly-update', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('finly-update', handleStorageChange);
    };
  }, []);

  if (!scoreData) {
    return (
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center space-x-2 mb-3">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-lg">Skor Kesehatan Keuangan</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          💡 Belum ada data untuk menilai skor kesehatan finansialmu. Yuk mulai catat pengeluaran & pemasukan secara rutin!
        </p>
      </Card>
    );
  }

  const getProgressColor = () => {
    if (scoreData.score >= 80) return 'bg-income';
    if (scoreData.score >= 60) return 'bg-yellow-500';
    return 'bg-expense';
  };

  return (
    <Card className="p-4 relative overflow-hidden">
      {/* Background gradient based on score */}
      <div className={`absolute inset-0 ${
        scoreData.score >= 80 ? 'bg-gradient-to-br from-green-500/5 to-green-600/5' :
        scoreData.score >= 60 ? 'bg-gradient-to-br from-yellow-500/5 to-orange-500/5' :
        'bg-gradient-to-br from-red-500/5 to-red-600/5'
      }`} />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {scoreData.icon}
            <h3 className="font-semibold text-lg">Skor Kesehatan Keuangan</h3>
          </div>
          <div className="text-2xl font-bold" style={{ color: scoreData.color }}>
            {scoreData.score}/100
          </div>
        </div>

        <div className="w-full bg-muted rounded-full h-3 mb-3">
          <div 
            className={`h-3 rounded-full transition-all ${getProgressColor()}`}
            style={{ width: `${scoreData.score}%` }}
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            scoreData.score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
            scoreData.score >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {scoreData.label}
          </span>
          <span className="text-xs text-muted-foreground">
            Diperbarui: {new Date().toLocaleDateString('id-ID')}
          </span>
        </div>

        {/* Score Details */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-2 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground">Rasio Tabungan</p>
            <p className="text-sm font-medium">
              {scoreData.details.savingsRatio.toFixed(1)}%
            </p>
          </div>
          <div className="p-2 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground">Status Hutang</p>
            <p className="text-sm font-medium">{scoreData.details.debtStatus}</p>
          </div>
          <div className="p-2 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground">Kontrol Pengeluaran</p>
            <p className="text-sm font-medium">{scoreData.details.expenseControl}</p>
          </div>
          <div className="p-2 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground">Progress Impian</p>
            <p className="text-sm font-medium">{scoreData.details.goalProgress}%</p>
          </div>
        </div>

        {/* AI Suggestions */}
        {scoreData.suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Catatan AI:</p>
            {scoreData.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-2">
                {scoreData.score < 60 ? (
                  <AlertCircle className="h-4 w-4 text-expense mt-0.5" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
                )}
                <p className="text-sm">{suggestion}</p>
              </div>
            ))}
          </div>
        )}

        {/* Critical warning */}
        {scoreData.score < 60 && (
          <div className="mt-4 p-3 bg-expense/10 border border-expense/20 rounded-lg">
            <p className="text-sm text-expense font-medium">
              🚨 Keuanganmu sedang kurang sehat. Fokus pada kurangi pengeluaran & lunasi hutang kecil dulu.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}