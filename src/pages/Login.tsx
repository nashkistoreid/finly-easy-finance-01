import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate loading
    setTimeout(() => {
      if (email === 'admin' && password === 'admin') {
        login(); // Update AuthContext state
        toast({
          title: "Login berhasil",
          description: "Selamat datang di Finly!",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Login gagal",
          description: "Email atau password salah",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-3 sm:px-4">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl sm:text-2xl font-bold">Finly</CardTitle>
          <CardDescription className="text-base sm:text-sm">
            Masuk ke akun Anda untuk mengelola keuangan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-base sm:text-sm">Email/Username</Label>
              <Input
                id="email"
                type="text"
                placeholder="Masukkan email atau username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 sm:h-10 text-base sm:text-sm"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-base sm:text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 sm:h-10 text-base sm:text-sm"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 sm:h-10 text-base sm:text-sm" 
              disabled={isLoading}
            >
              {isLoading ? 'Memuat...' : 'Masuk'}
            </Button>
          </form>
          <div className="mt-4 text-center text-base sm:text-sm text-muted-foreground">
            <p>Demo: admin / admin</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}