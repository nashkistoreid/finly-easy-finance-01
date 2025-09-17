import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Settings2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { saveTransaction, getActiveCategories, formatInputCurrency, parseCurrencyInput, getActiveBanks, setActiveBanks } from '@/lib/storage';
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
  const [activeBanks, setActiveBanksState] = useState<string[]>(getActiveBanks());

  const categories = getActiveCategories();
  const filteredCategories = categories.filter(c => 
    formData.type ? c.type === formData.type : true
  );

  const availableBanks = banks.filter(bank => activeBanks.includes(bank.id));

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

  const handleBankToggle = (bankId: string) => {
    const newActiveBanks = activeBanks.includes(bankId)
      ? activeBanks.filter(id => id !== bankId)
      : [...activeBanks, bankId];
    
    // Always keep at least one bank active
    if (newActiveBanks.length === 0) {
      toast({
        title: "Peringatan",
        description: "Minimal harus ada satu bank yang aktif",
        variant: "destructive"
      });
      return;
    }
    
    setActiveBanksState(newActiveBanks);
    setActiveBanks(newActiveBanks);
    
    // Reset bank_id if current selection is removed
    if (!newActiveBanks.includes(formData.bank_id)) {
      setFormData(prev => ({ ...prev, bank_id: newActiveBanks[0] }));
    }
  };

  return (
    <div className="pb-24 px-3 sm:px-4 pt-6 w-full max-w-sm sm:max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
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
        
        {/* Bank Settings Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings2 className="h-4 w-4" />
              <span className="hidden sm:inline">Akun Bank</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Akun Bank Kamu</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Pilih bank yang kamu gunakan
                </p>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {banks.map(bank => (
                  <div key={bank.id} className="flex items-center space-x-3 py-2">
                    <Checkbox
                      id={bank.id}
                      checked={activeBanks.includes(bank.id)}
                      onCheckedChange={() => handleBankToggle(bank.id)}
                    />
                    <label
                      htmlFor={bank.id}
                      className="flex items-center space-x-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      <span className="text-lg">{bank.icon}</span>
                      <span>{bank.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
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
                  {availableBanks.map(bank => (
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