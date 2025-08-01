'use client';

import { useState } from 'react';
import { type JiraIssue, type JiraCredentials } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { LogOut, PanelLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JiraFilterSidebar } from './jira-filter-sidebar';
import { fetchJiraData } from '@/lib/dummy-data';
import { DashboardTabs } from './dashboard-tabs';

interface DashboardPageProps {
  credentials: JiraCredentials;
  onLogout: () => void;
}

const WelcomePlaceholder = () => (
    <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Welcome to Jira Lens</h2>
      <p className="text-gray-500 dark:text-gray-400">Use the filters in the sidebar to fetch your project data and begin your analysis.</p>
    </div>
);

export function DashboardPage({ credentials, onLogout }: DashboardPageProps) {
  const [issues, setIssues] = useState<JiraIssue[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { toast } = useToast();

  const handleFetch = async (jql: string) => {
    if (!jql) {
        toast({
            title: "JQL query is empty",
            description: "Please provide a JQL query to fetch data.",
            variant: "destructive",
        });
        return;
    }
    setIsLoading(true);
    setIssues(null);
    if(isMobileSidebarOpen) setMobileSidebarOpen(false);
    try {
      const data = await fetchJiraData(jql);
      setIssues(data);
      toast({
        title: "Success!",
        description: `Successfully fetched ${data.length} issues.`,
      });
    } catch (error) {
       toast({
        title: "Error fetching data",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const sidebarContent = (
      <JiraFilterSidebar
          onFetch={handleFetch}
          isLoading={isLoading}
          onLogout={onLogout}
      />
  );


  return (
    <div className="flex min-h-screen">
       <aside className={cn(
           "hidden lg:block bg-white dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out",
           isSidebarOpen ? 'w-80' : 'w-0'
       )}>
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Filters</h2>
               <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            {sidebarContent}
          </div>
       </aside>

      <main className="flex-1 p-6 bg-gray-50/50 dark:bg-gray-900/50">
        <header className="flex items-center gap-4 mb-6">
            <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-4 bg-white dark:bg-gray-900">
                  <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                      <SheetDescription>
                          Use the filters below to fetch and analyze your Jira data.
                      </SheetDescription>
                  </SheetHeader>
                  {sidebarContent}
              </SheetContent>
            </Sheet>

          {!isSidebarOpen && (
            <Button variant="outline" onClick={() => setSidebarOpen(true)}>
              <PanelLeft className="h-5 w-5 mr-2" />
              Filters
            </Button>
          )}

          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Jira Lens
          </h1>
          <div className="ml-auto">
             <Button variant="ghost" onClick={onLogout}>
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </header>

        <div className="h-[calc(100vh-8rem)] overflow-y-auto">
            {!issues && !isLoading && <WelcomePlaceholder />}
            {isLoading && (
                 <div className="flex items-center justify-center h-full">
                    <p className="text-lg text-gray-600 dark:text-gray-300">Loading project data...</p>
                </div>
            )}
            {issues && <DashboardTabs issues={issues} />}
        </div>
      </main>
    </div>
  );
}
