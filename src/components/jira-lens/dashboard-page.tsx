'use client';
import { useState } from 'react';
import { DashboardTabs } from '@/components/jira-lens/dashboard-tabs';
import { type JiraIssue, type JiraCredentials } from '@/lib/types';
import { PanelLeft, Rocket, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { JiraFilterSidebar } from './jira-filter-sidebar';

interface DashboardPageProps {
    credentials: JiraCredentials;
    onLogout: () => void;
}

export function DashboardPage({ credentials, onLogout }: DashboardPageProps) {
  const [issues, setIssues] = useState<JiraIssue[] | null>(null);
  const [jql, setJql] = useState<string>("project = 'PROJ' ORDER BY created DESC");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sidebarContent = (
    <>
      <div className="p-6 border-b flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Jira Lens 📊</h1>
          <p className="text-sm text-muted-foreground">Dynamic Insights Dashboard</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onLogout} title="Logout">
            <LogOut className="h-5 w-5" />
        </Button>
      </div>
      <div className="overflow-y-auto flex-1">
        <JiraFilterSidebar 
          credentials={credentials}
          jql={jql}
          setJql={setJql}
          setIssues={setIssues}
          setIsLoading={setIsLoading}
          setError={setError}
        />
      </div>
    </>
  );

  const WelcomePlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <Rocket className="w-16 h-16 mb-4 text-primary" />
      <h2 className="text-2xl font-bold mb-2">Welcome to Jira Lens</h2>
      <p className="text-muted-foreground">
        Use the filters in the sidebar to fetch and analyze your project data.
      </p>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-[350px] flex-shrink-0 border-r bg-card flex-col hidden lg:flex">
        {sidebarContent}
      </aside>
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <header className="flex items-center gap-4 mb-4 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[350px]">
                <SheetHeader>
                  <SheetTitle className="sr-only">Sidebar</SheetTitle>
                  <SheetDescription className="sr-only">Main navigation and connection settings.</SheetDescription>
                </SheetHeader>
                 <aside className="w-full h-full bg-card flex flex-col">
                   {sidebarContent}
                 </aside>
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-bold text-primary">Jira Lens 📊</h1>
        </header>

        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <p>Loading data...</p>
          </div>
        )}

        {issues && issues.length > 0 && (
           <DashboardTabs issues={issues} jql={jql} isLoading={isLoading} error={error} />
        )}
        
        {!isLoading && (!issues || issues.length === 0) && !error && <WelcomePlaceholder />}

        {error && !isLoading && (
           <div className="flex items-center justify-center h-full text-center text-red-500">
             <div>
               <h2 className="text-2xl font-bold mb-2">An Error Occurred</h2>
               <p>{error}</p>
             </div>
           </div>
        )}
      </main>
    </div>
  );
}
