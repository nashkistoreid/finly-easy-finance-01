import { useState, useEffect } from 'react';
import { Plus, Target, Trash2, TrendingUp, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getSavingsGoals, saveSavingsGoal, updateSavingsGoal, deactivateSavingsGoal, getSavingsGoalProgress, createDepositTransaction, createWithdrawalTransaction, formatCurrency, type SavingsGoal } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function SavingsGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    deposit_amount: '',
    withdrawal_amount: '',
    notes: '',
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const updateData = () => {
      setGoals(getSavingsGoals().filter(g => g.is_active));
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

  const resetForm = () => {
    setFormData({ name: '', target_amount: '', deposit_amount: '', withdrawal_amount: '', notes: '' });
    setEditingGoal(null);
    setSelectedGoalId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.target_amount) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    const target_amount = parseFloat(formData.target_amount);

    if (target_amount <= 0) {
      toast({
        title: "Error", 
        description: "Target nominal harus lebih dari 0",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingGoal) {
        updateSavingsGoal(editingGoal.id, {
          name: formData.name.trim(),
          target_amount,
        });
        toast({
          title: "Berhasil",
          description: "Target tabungan berhasil diperbarui",
        });
      } else {
        saveSavingsGoal({
          name: formData.name.trim(),
          target_amount,
          is_active: true,
          created_at: new Date().toISOString(),
        });
        toast({
          title: "Berhasil",
          description: "Target tabungan berhasil ditambahkan",
        });
      }

      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGoalId || !formData.deposit_amount) {
      toast({
        title: "Error",
        description: "Mohon masukkan nominal setoran",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.deposit_amount);
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "Nominal setoran harus lebih dari 0",
        variant: "destructive",
      });
      return;
    }

    try {
      createDepositTransaction(selectedGoalId, amount, formData.notes);
      toast({
        title: "Berhasil",
        description: "Setoran berhasil ditambahkan",
      });
      resetForm();
      setIsDepositDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGoalId || !formData.withdrawal_amount) {
      toast({
        title: "Error",
        description: "Mohon masukkan nominal penarikan",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.withdrawal_amount);
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "Nominal penarikan harus lebih dari 0",
        variant: "destructive",
      });
      return;
    }

    try {
      createWithdrawalTransaction(selectedGoalId, amount, formData.notes);
      toast({
        title: "Berhasil",
        description: "Penarikan berhasil dicatat",
      });
      resetForm();
      setIsWithdrawalDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount.toString(),
      deposit_amount: '',
      withdrawal_amount: '',
      notes: '',
    });
    setIsAddDialogOpen(true);
  };

  const handleDeactivate = (id: string) => {
    deactivateSavingsGoal(id);
    toast({
      title: "Berhasil",
      description: "Target tabungan berhasil dinonaktifkan",
    });
  };

  const openDepositDialog = (goalId: string) => {
    setSelectedGoalId(goalId);
    setFormData({ ...formData, deposit_amount: '', notes: '' });
    setIsDepositDialogOpen(true);
  };

  const openWithdrawalDialog = (goalId: string) => {
    setSelectedGoalId(goalId);
    setFormData({ ...formData, withdrawal_amount: '', notes: '' });
    setIsWithdrawalDialogOpen(true);
  };

  return (
    <div className="pb-24 px-3 sm:px-4 pt-6 w-full max-w-sm sm:max-w-md mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-2xl font-bold mb-1">Target Tabungan</h1>
          <p className="text-muted-foreground text-base sm:text-sm">Kelola target tabungan terintegrasi</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button size="default" className="h-12 sm:h-9 text-base sm:text-sm px-6 sm:px-4">
              <Plus className="h-5 w-5 sm:h-4 sm:w-4 mr-2 sm:mr-1" />
              Tambah Target
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? 'Edit Target Tabungan' : 'Tambah Target Tabungan'}
              </DialogTitle>
              <DialogDescription>
                {editingGoal ? 'Perbarui detail target tabungan Anda' : 'Buat target tabungan baru yang terintegrasi dengan transaksi'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Tujuan</Label>
                <Input
                  id="name"
                  placeholder="contoh: Umroh, Motor Baru"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target_amount">Nominal Target</Label>
                <Input
                  id="target_amount"
                  type="number"
                  placeholder="25000000"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  required
                />
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    resetForm();
                    setIsAddDialogOpen(false);
                  }}
                >
                  Batal
                </Button>
                <Button type="submit" className="flex-1">
                  {editingGoal ? 'Perbarui' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Savings Goals List */}
      {goals.length === 0 ? (
        <Card className="p-8 text-center">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Belum Ada Target Tabungan</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Mulai dengan membuat target tabungan pertama yang terintegrasi dengan transaksi Anda
          </p>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Tambah Target
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = getSavingsGoalProgress(goal.id);
            
            return (
              <Card key={goal.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{goal.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Target: {formatCurrency(goal.target_amount)}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(goal)}
                      className="h-8 w-8 p-0"
                      title="Edit"
                    >
                      <TrendingUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeactivate(goal.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      title="Nonaktifkan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Progress value={progress.progress_percent} className="h-3" />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatCurrency(progress.collected_amount)} terkumpul
                    </span>
                    <span className={`font-medium ${progress.progress_percent >= 100 ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {progress.progress_percent}%
                    </span>
                  </div>
                  
                  {progress.progress_percent < 100 && (
                    <p className="text-xs text-muted-foreground">
                      Sisa: {formatCurrency(progress.remaining_amount)}
                    </p>
                  )}
                  
                  {progress.progress_percent >= 100 && (
                    <p className="text-xs text-green-600 font-medium">
                      🎉 Target tercapai!
                    </p>
                  )}

                  {/* Quick Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => openDepositDialog(goal.id)}
                      className="flex-1"
                    >
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      Setor
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openWithdrawalDialog(goal.id)}
                      className="flex-1"
                    >
                      <ArrowDownLeft className="h-4 w-4 mr-1" />
                      Tarik
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/savings/${goal.id}`)}
                    >
                      Detail
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Deposit Dialog */}
      <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Setor ke Tabungan</DialogTitle>
            <DialogDescription>
              Catat setoran untuk target tabungan Anda
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleDeposit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deposit_amount">Nominal Setoran</Label>
              <Input
                id="deposit_amount"
                type="number"
                placeholder="500000"
                value={formData.deposit_amount}
                onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deposit_notes">Catatan (opsional)</Label>
              <Input
                id="deposit_notes"
                placeholder="Setoran rutin bulanan"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  resetForm();
                  setIsDepositDialogOpen(false);
                }}
              >
                Batal
              </Button>
              <Button type="submit" className="flex-1">
                Setor
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Withdrawal Dialog */}
      <Dialog open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tarik dari Tabungan</DialogTitle>
            <DialogDescription>
              Catat penarikan dari target tabungan Anda
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleWithdrawal} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdrawal_amount">Nominal Penarikan</Label>
              <Input
                id="withdrawal_amount"
                type="number"
                placeholder="200000"
                value={formData.withdrawal_amount}
                onChange={(e) => setFormData({ ...formData, withdrawal_amount: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="withdrawal_notes">Catatan (opsional)</Label>
              <Input
                id="withdrawal_notes"
                placeholder="Keperluan mendesak"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  resetForm();
                  setIsWithdrawalDialogOpen(false);
                }}
              >
                Batal
              </Button>
              <Button type="submit" className="flex-1" variant="destructive">
                Tarik
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}