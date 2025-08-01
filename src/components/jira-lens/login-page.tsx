'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type JiraCredentials } from '@/lib/types';
import { LogIn, Briefcase } from 'lucide-react';

interface LoginPageProps {
  onLogin: (credentials: JiraCredentials) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  
  const JIRA_URL = "https://your-domain.atlassian.net"; // Static instance URL

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && token) {
      onLogin({
        url: JIRA_URL,
        email,
        token
      });
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-background font-sans">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-accent/10 -z-10" />
      <Card className="w-full max-w-md shadow-2xl border-border/60">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
             <div className="mx-auto bg-gradient-to-br from-primary to-accent text-white p-3 rounded-xl w-fit shadow-lg">
                <Briefcase className="w-8 h-8" />
             </div>
            <CardTitle className="mt-4 text-3xl font-bold">Jira Lens</CardTitle>
            <CardDescription>Connect to Jira to analyze your project data. The Jira instance is preset to: <br/> <code className="p-1 mt-2 inline-block bg-muted rounded-md text-foreground text-xs">{JIRA_URL}</code></CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="jira-email">Jira Email</Label>
              <Input 
                id="jira-email" 
                placeholder="user@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jira-token">API Token</Label>
              <Input 
                id="jira-token" 
                type="password" 
                placeholder="Your Jira API Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" size="lg">
              <LogIn className="mr-2" /> Connect & Analyze
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
