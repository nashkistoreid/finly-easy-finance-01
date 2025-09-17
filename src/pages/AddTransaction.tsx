import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveTransaction, getActiveCategories, formatInputCurrency, parseCurrencyInput } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { banks } from '@/lib/banks';

export default function AddTransaction() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '' as 'income' | 'expense' | '',
    category: '',
    amount: '',
    notes: '',
    bank_id: 'cash',
  });

  const categories = getActiveCategories();
  const filteredCategories = categories.filter(c => 
    formData.type ? c.type === formData.type : true
  );

  // Handle pre-filled data from navigation state
  useEffect(() => {
    const state = location.state as { defaultType?: 'income' | 'expense'; defaultCategory?: string } | null;
    if (state) {
      setFormData(prev => ({
        ...prev,
        type: state.defaultType || prev.type,
        category: state.defaultCategory || prev.category,
      }));
    }
  }, [location.state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.category || !formData.amount) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive"
      });
      return;
    }

    const amount = parseCurrencyInput(formData.amount);
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "Mohon masukkan nominal yang valid",
        variant: "destructive"
      });
      return;
    }

    try {
      saveTransaction({
        date: formData.date,
        type: formData.type,
        category: formData.category,
        amount: amount,
        notes: formData.notes || undefined,
        bank_id: formData.bank_id,
      });

      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('finly-update'));

      toast({
        title: "Berhasil!",
        description: `Transaksi ${formData.type === 'income' ? 'pemasukan' : 'pengeluaran'} berhasil disimpan`,
      });

      navigate('/');
    } catch (error) {
      toast({
        title: "Error", 
        description: "Gagal menyimpan transaksi",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="pb-24 px-3 sm:px-4 pt-6 w-full max-w-sm sm:max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/')}
          className="mr-3 h-10 w-10 sm:h-8 sm:w-8"
        >
          <ArrowLeft className="h-6 w-6 sm:h-5 sm:w-5" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-xl font-bold">Tambah Transaksi</h1>
          <p className="text-base sm:text-sm text-muted-foreground">Catat pemasukan atau pengeluaran</p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Jenis Transaksi *</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={formData.type === 'income' ? 'default' : 'outline'}
                className={formData.type === 'income' ? 'bg-income hover:bg-income/90' : ''}
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  type: 'income', 
                  category: '' 
                }))}
              >
                💰 Pemasukan
              </Button>
              <Button
                type="button"
                variant={formData.type === 'expense' ? 'default' : 'outline'}
                className={formData.type === 'expense' ? 'bg-expense hover:bg-expense/90' : ''}
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  type: 'expense', 
                  category: '' 
                }))}
              >
                💸 Pengeluaran
              </Button>
            </div>
          </div>

          {/* Category */}
          {formData.type && (
            <div className="space-y-2">
              <Label>Kategori *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Bank Account */}
          {formData.type && (
            <div className="space-y-2">
              <Label>Akun Bank *</Label>
              <Select 
                value={formData.bank_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, bank_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map(bank => (
                    <SelectItem key={bank.id} value={bank.id}>
                      <div className="flex items-center space-x-2">
                        <span>{bank.icon}</span>
                        <span>{bank.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Nominal *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                Rp
              </span>
              <Input
                id="amount"
                type="text"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => {
                  const formatted = formatInputCurrency(e.target.value);
                  setFormData(prev => ({ ...prev, amount: formatted }));
                }}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (opsional)</Label>
            <Textarea
              id="notes"
              placeholder="Misal: beli kopi, gaji September, dll."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent/90"
            size="lg"
          >
            <Save className="h-4 w-4 mr-2" />
            Simpan Transaksi
          </Button>
        </form>
      </Card>
    </div>
  );
}