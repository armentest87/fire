'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type JiraCredentials } from '@/lib/types';
import { LogIn } from 'lucide-react';

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
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-lg border border-gray-200 dark:border-gray-800">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Jira Lens</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Connect to Jira to see your dashboard. The instance is preset to: <br/> <code className="p-1 mt-2 inline-block bg-gray-100 dark:bg-gray-800 rounded-md text-gray-700 dark:text-gray-300 text-xs">{JIRA_URL}</code></CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="jira-email" className="text-gray-700 dark:text-gray-300">Jira Email</Label>
              <Input 
                id="jira-email" 
                placeholder="user@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white dark:bg-gray-800"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="jira-token" className="text-gray-700 dark:text-gray-300">API Token</Label>
              <Input 
                id="jira-token" 
                type="password" 
                placeholder="Your Jira API Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                className="bg-white dark:bg-gray-800"
              />
               <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">You can generate a token from your Atlassian account settings.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              <LogIn className="mr-2 h-4 w-4" /> Connect & Analyze
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
