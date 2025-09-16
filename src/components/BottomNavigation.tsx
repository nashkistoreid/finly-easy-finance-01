import { Home, Plus, History, LogOut, PiggyBank } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Plus, label: 'Tambah', path: '/add' },
  { icon: PiggyBank, label: 'Impian', path: '/savings' },
  { icon: History, label: 'Riwayat', path: '/history' },
];

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout berhasil",
      description: "Anda telah keluar dari akun",
    });
    navigate('/login');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="grid grid-cols-5 h-20">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-1 transition-all duration-200 h-full",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground active:bg-muted/50"
              )}
            >
              <Icon size={20} className={cn(
                "mb-1 transition-transform duration-200",
                isActive && "scale-110"
              )} />
              <span className="text-xs font-medium leading-tight">{label}</span>
            </button>
          );
        })}
        
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center py-2 px-1 transition-all duration-200 text-muted-foreground hover:text-foreground active:bg-muted/50 h-full"
        >
          <LogOut size={20} className="mb-1 transition-transform duration-200" />
          <span className="text-xs font-medium leading-tight">Keluar</span>
        </button>
      </div>
    </nav>
  );
};