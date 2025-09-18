import { useState, useEffect } from 'react';
import { ArrowLeft, Filter, TrendingUp, TrendingDown, Trash2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getTransactions, getCategories, deleteTransaction, formatCurrency, type Transaction, getDebts } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

export default function History() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState({
    month: '',
    type: '',
    category: '',
  });

  const categories = getCategories();

  useEffect(() => {
    const loadTransactions = () => {
      const data = getTransactions().sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setTransactions(data);
      setFilteredTransactions(data);
    };

    loadTransactions();
    
    const handleUpdate = () => loadTransactions();
    window.addEventListener('finly-update', handleUpdate);
    
    return () => window.removeEventListener('finly-update', handleUpdate);
  }, []);

  useEffect(() => {
    let filtered = transactions;

    if (filters.month) {
      filtered = filtered.filter(t => {
        const transactionMonth = new Date(t.date).toISOString().slice(0, 7);
        return transactionMonth === filters.month;
      });
    }

    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    setFilteredTransactions(filtered);
  }, [transactions, filters]);

  const handleDelete = (id: string) => {
    if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
      deleteTransaction(id);
      window.dispatchEvent(new CustomEvent('finly-update'));
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil dihapus",
      });
    }
  };

  const getMonthOptions = () => {
    const months = new Set<string>();
    transactions.forEach(t => {
      const month = new Date(t.date).toISOString().slice(0, 7);
      months.add(month);
    });
    return Array.from(months).sort().reverse();
  };

  const clearFilters = () => {
    setFilters({ month: '', type: '', category: '' });
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();
    
    // Set font to support Indonesian text
    pdf.setFont('helvetica');
    
    // Header
    pdf.setFontSize(20);
    pdf.text('Finly - Laporan Riwayat Transaksi', 20, 20);
    
    // Date and filter info
    pdf.setFontSize(12);
    const filterText = [];
    if (filters.month) {
      const monthName = new Date(filters.month + '-01').toLocaleDateString('id-ID', { 
        month: 'long', 
        year: 'numeric' 
      });
      filterText.push(`Bulan: ${monthName}`);
    }
    if (filters.type) {
      filterText.push(`Jenis: ${filters.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}`);
    }
    if (filters.category) {
      filterText.push(`Kategori: ${filters.category}`);
    }
    
    pdf.text(`Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID')}`, 20, 35);
    if (filterText.length > 0) {
      pdf.text(`Filter: ${filterText.join(', ')}`, 20, 45);
    }
    
    // Summary
    pdf.setFontSize(14);
    pdf.text('Ringkasan:', 20, 60);
    pdf.setFontSize(12);
    pdf.text(`Total Pemasukan: Rp ${totals.income.toLocaleString('id-ID')}`, 20, 75);
    pdf.text(`Total Pengeluaran: Rp ${totals.expense.toLocaleString('id-ID')}`, 20, 85);
    pdf.text(`Selisih: Rp ${(totals.income - totals.expense).toLocaleString('id-ID')}`, 20, 95);
    
    // Transaction list header
    pdf.setFontSize(14);
    pdf.text('Daftar Transaksi:', 20, 115);
    
    let yPosition = 130;
    pdf.setFontSize(10);
    
    // Table headers
    pdf.text('Tanggal', 20, yPosition);
    pdf.text('Kategori', 60, yPosition);
    pdf.text('Jenis', 110, yPosition);
    pdf.text('Jumlah', 140, yPosition);
    pdf.text('Catatan', 180, yPosition);
    
    yPosition += 10;
    pdf.line(20, yPosition - 5, 270, yPosition - 5); // Header line
    
    // Transaction data
    filteredTransactions.forEach((transaction, index) => {
      if (yPosition > 270) { // New page
        pdf.addPage();
        yPosition = 20;
        
        // Repeat headers on new page
        pdf.setFontSize(10);
        pdf.text('Tanggal', 20, yPosition);
        pdf.text('Kategori', 60, yPosition);
        pdf.text('Jenis', 110, yPosition);
        pdf.text('Jumlah', 140, yPosition);
        pdf.text('Catatan', 180, yPosition);
        yPosition += 10;
        pdf.line(20, yPosition - 5, 270, yPosition - 5);
      }
      
      const date = new Date(transaction.date).toLocaleDateString('id-ID');
      const type = transaction.type === 'income' ? 'Masuk' : 'Keluar';
      const amount = `Rp ${transaction.amount.toLocaleString('id-ID')}`;
      const notes = transaction.notes ? transaction.notes.substring(0, 20) + '...' : '-';
      
      pdf.text(date, 20, yPosition);
      pdf.text(transaction.category.substring(0, 15), 60, yPosition);
      pdf.text(type, 110, yPosition);
      pdf.text(amount, 140, yPosition);
      pdf.text(notes, 180, yPosition);
      
      yPosition += 8;
    });
    
    // Save the PDF
    const fileName = `Finly_Riwayat_${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(fileName);
    
    toast({
      title: "Berhasil",
      description: "Laporan PDF berhasil diunduh",
    });
  };

  // Calculate totals for filtered results
  const totals = filteredTransactions.reduce(
    (acc, t) => {
      if (t.type === 'income') {
        acc.income += t.amount;
      } else {
        acc.expense += t.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

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
        <div className="flex-1">
          <h1 className="text-2xl sm:text-xl font-bold">Riwayat Transaksi</h1>
          <p className="text-base sm:text-sm text-muted-foreground">
            {filteredTransactions.length} dari {transactions.length} transaksi
          </p>
        </div>
        <Button 
          onClick={exportToPDF}
          size="sm"
          className="ml-3"
        >
          <Download className="h-4 w-4 mr-2" />
          PDF
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm sm:text-xs text-muted-foreground mb-2">Pemasukan</p>
            <p className="font-semibold text-income text-base sm:text-sm">
              {formatCurrency(totals.income)}
            </p>
          </div>
          <div>
            <p className="text-sm sm:text-xs text-muted-foreground mb-2">Pengeluaran</p>
            <p className="font-semibold text-expense text-base sm:text-sm">
              {formatCurrency(totals.expense)}
            </p>
          </div>
          <div>
            <p className="text-sm sm:text-xs text-muted-foreground mb-2">Selisih</p>
            <p className={`font-semibold text-base sm:text-sm ${
              totals.income - totals.expense >= 0 ? 'text-income' : 'text-expense'
            }`}>
              {formatCurrency(totals.income - totals.expense)}
            </p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4 mb-4">
        <div className="flex items-center mb-3">
          <Filter className="h-4 w-4 mr-2" />
          <span className="font-medium">Filter</span>
          {(filters.month || filters.type || filters.category) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="ml-auto text-xs"
            >
              Clear
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <Select 
            value={filters.month} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, month: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih bulan" />
            </SelectTrigger>
            <SelectContent>
              {getMonthOptions().map(month => (
                <SelectItem key={month} value={month}>
                  {new Date(month + '-01').toLocaleDateString('id-ID', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-2">
            <Select 
              value={filters.type} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Pemasukan</SelectItem>
                <SelectItem value="expense">Pengeluaran</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.category} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Tidak ada transaksi yang ditemukan</p>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'income' 
                      ? 'bg-income-light text-income' 
                      : 'bg-expense-light text-expense'
                  }`}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.category}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('id-ID')}
                    </p>
                    {transaction.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {transaction.notes}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-income' : 'text-expense'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(transaction.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}