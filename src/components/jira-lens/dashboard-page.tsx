'use client';

import { useState, useMemo, useEffect } from 'react';
import { type JiraIssue, type JiraCredentials, type JiraProject } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Loader2 } from 'lucide-react';
import { fetchJiraData, fetchJiraProjects } from '@/app/actions';
import { DashboardTabs } from './dashboard-tabs';
import { JiraFilterPopover } from './jira-filter-popover';
import { FetchDataDialog } from './fetch-data-dialog';


interface DashboardPageProps {
  credentials: JiraCredentials;
  onLogout: () => void;
}

const WelcomePlaceholder = () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center p-8 bg-card rounded-lg shadow-sm border">
        <h2 className="text-2xl font-semibold mb-2">Welcome to Jira Lens</h2>
        <p className="text-muted-foreground">Click the "Fetch Data" button to load your project data and begin your analysis.</p>
      </div>
    </div>
);

export function DashboardPage({ credentials, onLogout }: DashboardPageProps) {
  const [allIssues, setAllIssues] = useState<JiraIssue[] | null>(null);
  const [filteredIssues, setFilteredIssues] = useState<JiraIssue[] | null>(null);
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [isFetchingIssues, setIsFetchingIssues] = useState(false);
  const [isFetchDialogOpen, setIsFetchDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    const loadProjects = async () => {
        setIsLoading(true);
        try {
            const fetchedProjects = await fetchJiraProjects(credentials);
            setProjects(fetchedProjects);
        } catch (error) {
            toast({
                title: "Error fetching projects",
                description: error instanceof Error ? error.message : "Could not load the list of available projects.",
                variant: "destructive",
            });
            // If fetching projects fails on dashboard, maybe we logout?
            onLogout();
        } finally {
            setIsLoading(false);
        }
    };
    if (credentials.url) {
      loadProjects();
    }
  }, [credentials, toast, onLogout]);

  const handleFetch = async (jql: string) => {
    setIsFetchingIssues(true);
    setAllIssues(null);
    setFilteredIssues(null);
    try {
      const data = await fetchJiraData(credentials, jql);
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
      setIsFetchingIssues(false);
      setIsFetchDialogOpen(false);
    }
  };

  const uniqueFilterOptions = useMemo(() => {
    if (!allIssues) return { assignees: [], statuses: [], issueTypes: [], priorities: [] };
    const assignees = [...new Set(allIssues.map(i => i.assignee?.displayName).filter(Boolean))].sort();
    const statuses = [...new Set(allIssues.map(i => i.status?.name).filter(Boolean))].sort();
    const issueTypes = [...new Set(allIssues.map(i => i.issuetype?.name).filter(Boolean))].sort();
    const priorities = [...new Set(allIssues.map(i => i.priority?.name).filter(Boolean))].sort();
    return { assignees, statuses, issueTypes, priorities };
  }, [allIssues]);

  const CurrentTabComponent = DashboardTabs.components.find(c => c.value === activeTab)?.component;
  const currentTabInfo = DashboardTabs.components.find(c => c.value === activeTab);
  
  const isDataLoading = isLoading || isFetchingIssues;

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex flex-col flex-1">
        <header className="flex items-center justify-between gap-4 py-4 px-6 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-primary">
                {currentTabInfo?.label}
            </h1>
            <p className="text-sm text-muted-foreground">
                {currentTabInfo?.description}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {allIssues && (
              <JiraFilterPopover
                allIssues={allIssues}
                onFilterChange={setFilteredIssues}
                assignees={uniqueFilterOptions.assignees}
                statuses={uniqueFilterOptions.statuses}
                issueTypes={uniqueFilterOptions.issueTypes}
                priorities={uniqueFilterOptions.priorities}
              />
            )}

            <Button onClick={() => setIsFetchDialogOpen(true)} disabled={isDataLoading}>
              {isFetchingIssues ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Fetching...
                </>
              ) : (
                'Fetch Data'
              )}
            </Button>

            <FetchDataDialog
              isOpen={isFetchDialogOpen}
              onOpenChange={setIsFetchDialogOpen}
              onFetch={handleFetch}
              isFetching={isFetchingIssues}
              projects={projects}
            />

            <Button variant="ghost" size="icon" onClick={onLogout}>
              <LogOut className="h-5 w-5" />
               <span className="sr-only">Logout</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {!allIssues && !isDataLoading && <WelcomePlaceholder />}
            {isDataLoading && (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                      <p className="text-lg text-muted-foreground mt-4">
                        {isLoading ? "Loading projects..." : "Fetching issues..."}
                      </p>
                    </div>
                </div>
            )}
            {filteredIssues && CurrentTabComponent ? (
                <div className="animate-fade-in">
                  <CurrentTabComponent issues={filteredIssues} projects={projects} />
                </div>
              ) : (
                 !isDataLoading && allIssues && <DashboardTabs.NoIssuesPlaceholder />
              )
            }
        </main>
      </div>
    </div>
  );
}
