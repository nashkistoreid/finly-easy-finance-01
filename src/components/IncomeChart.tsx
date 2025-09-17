import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import { getCategoryIncome, formatCurrency } from '@/lib/storage';

const COLORS = [
  'hsl(var(--income))',
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  '#10b981',
  '#22d3ee',
  '#8b5cf6',
  '#f59e0b',
  '#06b6d4',
  '#84cc16',
];

export const IncomeChart = () => {
  const data = getCategoryIncome();

  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Pemasukan per Kategori</h3>
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          <p>Belum ada data pemasukan</p>
        </div>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-income font-semibold">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Pemasukan per Kategori</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-muted-foreground">{entry.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};