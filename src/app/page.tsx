'use client';
import { useState } from 'react';
import { LoginPage } from '@/components/jira-lens/login-page';
import { DashboardPage } from '@/components/jira-lens/dashboard-page';
import { type JiraCredentials } from '@/lib/types';
import { fetchJiraProjects } from './actions';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [credentials, setCredentials] = useState<JiraCredentials | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (creds: JiraCredentials) => {
    setIsVerifying(true);
    try {
      // Try to fetch projects to verify credentials.
      await fetchJiraProjects(creds);
      setCredentials(creds);
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Could not connect to Jira. Please check your URL and credentials.",
        variant: "destructive",
      });
      setCredentials(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    setCredentials(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {!credentials ? (
        <LoginPage onLogin={handleLogin} isConnecting={isVerifying} />
      ) : (
        <DashboardPage credentials={credentials} onLogout={handleLogout} />
      )}
    </main>
  );
}
