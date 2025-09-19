import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Bell, AlertCircle, TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency, getFinancialNotifications, dismissNotification } from '@/lib/storage';

interface Notification {
  id: string;
  type: 'income' | 'expense_warning' | 'low_balance' | 'debt_payment' | 'debt_due' | 'weekly_report';
  message: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
}

export function FinancialNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const getDefaultIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <TrendingUp className="h-4 w-4 text-income" />;
      case 'expense_warning':
        return <TrendingDown className="h-4 w-4 text-expense" />;
      case 'low_balance':
        return <AlertCircle className="h-4 w-4 text-expense" />;
      case 'debt_payment':
      case 'debt_due':
        return <Calendar className="h-4 w-4 text-yellow-500" />;
      case 'weekly_report':
        return <DollarSign className="h-4 w-4 text-primary" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  useEffect(() => {
    const loadNotifications = () => {
      const notifs = getFinancialNotifications();
      // Map notifications and ensure all have icons
      const mappedNotifs: Notification[] = notifs.map(n => ({
        ...n,
        icon: n.icon || getDefaultIcon(n.type)
      }));
      setNotifications(mappedNotifs);
    };

    loadNotifications();

    // Check for new notifications periodically
    const interval = setInterval(loadNotifications, 30000); // Check every 30 seconds

    // Listen for updates
    const handleStorageChange = () => loadNotifications();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('finly-update', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('finly-update', handleStorageChange);
    };
  }, []);

  const handleDismiss = (notificationId: string) => {
    dismissNotification(notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-expense bg-expense/5';
      case 'medium':
        return 'border-yellow-500 bg-yellow-500/5';
      default:
        return 'border-primary bg-primary/5';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  const visibleNotifications = isExpanded ? notifications : notifications.slice(0, 2);
  const hasMore = notifications.length > 2;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Notifikasi Keuangan</h3>
        </div>
        {notifications.length > 0 && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {notifications.length} baru
          </span>
        )}
      </div>

      <div className="space-y-2">
        {visibleNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg border ${getNotificationColor(notification.priority)} transition-all duration-200`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2 flex-1">
                <div className="mt-0.5">{notification.icon}</div>
                <div className="flex-1">
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.timestamp).toLocaleString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-2"
                onClick={() => handleDismiss(notification.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Tampilkan lebih sedikit' : `Lihat ${notifications.length - 2} notifikasi lainnya`}
        </Button>
      )}
    </Card>
  );
}