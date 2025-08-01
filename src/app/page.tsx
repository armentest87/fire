'use client';
import { useState } from 'react';
import { JiraConnection } from '@/components/jira-lens/jira-connection';
import { DashboardTabs } from '@/components/jira-lens/dashboard-tabs';
import { type JiraIssue } from '@/lib/types';

export default function Home() {
  const [issues, setIssues] = useState<JiraIssue[] | null>(null);
  const [jql, setJql] = useState<string>("project = 'PROJ' ORDER BY created DESC");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-[350px] flex-shrink-0 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-primary-dark">Jira Lens 📊</h1>
            <p className="text-sm text-muted-foreground">Dynamic Insights Dashboard</p>
        </div>
        <div className="overflow-y-auto flex-1">
            <JiraConnection 
              jql={jql}
              setJql={setJql}
              setIssues={setIssues}
              setIsLoading={setIsLoading}
              setError={setError}
            />
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        {isLoading && <div className="fixed inset-0 bg-background/50 z-50 flex items-center justify-center"><p>Loading data...</p></div>}
        <DashboardTabs issues={issues} jql={jql} isLoading={isLoading} error={error} />
      </main>
    </div>
  );
}
