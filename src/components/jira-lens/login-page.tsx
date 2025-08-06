'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type JiraCredentials } from '@/lib/types';
import { LogIn, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (credentials: JiraCredentials) => void;
  isConnecting: boolean;
}

export function LoginPage({ onLogin, isConnecting }: LoginPageProps) {
  const [url, setUrl] = useState('https://jira-lens.atlassian.net');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && email && token) {
      // Remove trailing slash if present
      const formattedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
      onLogin({
        url: formattedUrl,
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
            <CardDescription className="text-gray-600 dark:text-gray-400">Connect to Jira to see your dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-1">
              <Label htmlFor="jira-url" className="text-gray-700 dark:text-gray-300">Jira URL</Label>
              <Input 
                id="jira-url" 
                placeholder="https://your-domain.atlassian.net" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                disabled={isConnecting}
                className="bg-white dark:bg-gray-800"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="jira-email" className="text-gray-700 dark:text-gray-300">Jira Email</Label>
              <Input 
                id="jira-email" 
                placeholder="user@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isConnecting}
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
                disabled={isConnecting}
                className="bg-white dark:bg-gray-800"
              />
               <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">You can generate a token from your Atlassian account settings.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isConnecting}>
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" /> Connect & Analyze
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
