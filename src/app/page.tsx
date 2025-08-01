'use client';
import { useState } from 'react';
import { LoginPage } from '@/components/jira-lens/login-page';
import { DashboardPage } from '@/components/jira-lens/dashboard-page';
import { type JiraCredentials } from '@/lib/types';

export default function Home() {
  const [credentials, setCredentials] = useState<JiraCredentials | null>(null);

  const handleLogin = (creds: JiraCredentials) => {
    setCredentials(creds);
  };

  const handleLogout = () => {
    setCredentials(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!credentials ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <DashboardPage credentials={credentials} onLogout={handleLogout} />
      )}
    </div>
  );
}
