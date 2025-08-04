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
    <div className="flex items-center justify-center h-full">
      <div className="text-center p-8 bg-card rounded-lg shadow-md border">
        <h2 className="text-2xl font-semibold mb-2">Welcome to Jira Lens</h2>
        <p className="text-muted-foreground">Use the filters in the sidebar to fetch your project data and begin your analysis.</p>
      </div>
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
      />
  );


  return (
    <div className="flex h-screen w-full bg-background">
       <aside className={cn(
           "hidden lg:flex flex-col bg-card border-r transition-all duration-300 ease-in-out",
           isSidebarOpen ? 'w-80' : 'w-0 border-r-0'
       )}>
          <div className={cn("p-4 flex flex-col h-full transition-opacity", isSidebarOpen ? 'opacity-100' : 'opacity-0')}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Filters</h2>
               <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            {sidebarContent}
          </div>
       </aside>

      <div className="flex flex-col flex-1 w-full min-w-0">
        <header className="flex items-center gap-4 py-3 px-4 sm:px-6 border-b sticky top-0 bg-background z-10">
            <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 flex flex-col bg-card">
                  <div className="p-4">
                    <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                        <SheetDescription>
                            Use the filters below to fetch and analyze your Jira data.
                        </SheetDescription>
                    </SheetHeader>
                  </div>
                  <div className="p-4 flex-grow overflow-y-auto">
                    {sidebarContent}
                  </div>
              </SheetContent>
            </Sheet>

          {!isSidebarOpen && (
            <Button variant="outline" onClick={() => setSidebarOpen(true)} className="hidden lg:inline-flex">
              <PanelLeft className="h-5 w-5 mr-2" />
              Filters
            </Button>
          )}

          <h1 className="text-xl md:text-2xl font-bold flex-1 truncate">
            Jira Lens
          </h1>
          <div className="ml-auto">
             <Button variant="ghost" onClick={onLogout}>
              <LogOut className="mr-2 h-5 w-5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {!issues && !isLoading && <WelcomePlaceholder />}
            {isLoading && (
                 <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-lg text-muted-foreground">Loading project data...</p>
                    </div>
                </div>
            )}
            {issues && <DashboardTabs issues={issues} />}
        </main>
      </div>
    </div>
  );
}
