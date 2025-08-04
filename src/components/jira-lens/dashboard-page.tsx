'use client';

import { useState, useMemo } from 'react';
import { type JiraIssue, type JiraCredentials } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Filter, Loader2 } from 'lucide-react';
import { fetchJiraData } from '@/lib/dummy-data';
import { DashboardTabs } from './dashboard-tabs';
import { JiraFilterPopover } from './jira-filter-popover';

interface DashboardPageProps {
  credentials: JiraCredentials;
  onLogout: () => void;
}

const WelcomePlaceholder = () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center p-8 bg-card rounded-lg shadow-md border">
        <h2 className="text-2xl font-semibold mb-2">Welcome to Jira Lens</h2>
        <p className="text-muted-foreground">Click the "Fetch Data" button to load your project data and begin your analysis.</p>
      </div>
    </div>
);

export function DashboardPage({ credentials, onLogout }: DashboardPageProps) {
  const [allIssues, setAllIssues] = useState<JiraIssue[] | null>(null);
  const [filteredIssues, setFilteredIssues] = useState<JiraIssue[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFetch = async () => {
    setIsLoading(true);
    setAllIssues(null);
    setFilteredIssues(null);
    try {
      // In a real app, the initial JQL might be more specific
      const data = await fetchJiraData("project = PROJ"); 
      setAllIssues(data);
      setFilteredIssues(data);
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
  
  const uniqueFilterOptions = useMemo(() => {
    if (!allIssues) return { assignees: [], statuses: [] };
    const assignees = [...new Set(allIssues.map(i => i.assignee).filter(Boolean))].sort();
    const statuses = [...new Set(allIssues.map(i => i.status))].sort();
    return { assignees, statuses };
  }, [allIssues]);


  return (
    <div className="flex flex-col h-screen w-full bg-background">
      <header className="flex items-center gap-4 py-3 px-4 sm:px-6 border-b sticky top-0 bg-background z-10">
        <h1 className="text-xl md:text-2xl font-bold flex-1 truncate">
          Jira Lens
        </h1>
        
        <div className="flex items-center gap-2 ml-auto">
          {allIssues && (
            <JiraFilterPopover
              allIssues={allIssues}
              onFilterChange={setFilteredIssues}
              assignees={uniqueFilterOptions.assignees}
              statuses={uniqueFilterOptions.statuses}
            />
          )}

          <Button onClick={handleFetch} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Fetching...
              </>
            ) : (
               'Fetch Data'
            )}
          </Button>

          <Button variant="ghost" onClick={onLogout}>
            <LogOut className="mr-2 h-5 w-5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!allIssues && !isLoading && <WelcomePlaceholder />}
          {isLoading && (
               <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-lg text-muted-foreground">Loading project data...</p>
                  </div>
              </div>
          )}
          {filteredIssues && <DashboardTabs issues={filteredIssues} />}
      </main>
    </div>
  );
}
