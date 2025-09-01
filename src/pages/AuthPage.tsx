import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, BarChart3, Shield, Zap, Globe } from 'lucide-react';

export function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (isSignUp) {
      await signUp(email, password);
    } else {
      await signIn(email, password);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Brand Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analytics Pro</h1>
              <p className="text-muted-foreground">Privacy-first analytics with AI insights</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-medium text-foreground">Privacy First</h3>
                <p className="text-sm text-muted-foreground">GDPR compliant, cookie-free tracking</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-medium text-foreground">AI-Powered Insights</h3>
                <p className="text-sm text-muted-foreground">Smart anomaly detection and natural language queries</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-medium text-foreground">Industry Benchmarks</h3>
                <p className="text-sm text-muted-foreground">Compare your metrics with industry standards</p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">
              {isSignUp ? 'Create account' : 'Welcome back'}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? 'Enter your email to create your account' 
                : 'Enter your email to sign in to your account'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>
            </form>
            
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}