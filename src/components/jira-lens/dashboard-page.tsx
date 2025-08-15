
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { type JiraIssue, type JiraCredentials, type JiraProject, type JiraIssueType, type JiraStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Loader2, Menu } from 'lucide-react';
import { fetchJiraData, fetchJiraProjects, fetchJiraIssueTypes, fetchJiraStatuses } from '@/app/actions';
import { DashboardTabs } from './dashboard-tabs';
import { JiraFilterPopover } from './jira-filter-popover';
import { FetchDataDialog } from './fetch-data-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

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
  const [issueTypes, setIssueTypes] = useState<JiraIssueType[]>([]);
  const [statuses, setStatuses] = useState<JiraStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingIssues, setIsFetchingIssues] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    }
  };

  const handleProjectMetaFetch = useCallback(async (projectId: string) => {
    if (!projectId) {
      setIssueTypes([]);
      setStatuses([]);
      return;
    }
    try {
      const [types, projectStatuses] = await Promise.all([
        fetchJiraIssueTypes(credentials, projectId),
        fetchJiraStatuses(credentials, projectId)
      ]);
      setIssueTypes(types);
      setStatuses(projectStatuses);
    } catch (error) {
       toast({
        title: "Error fetching project details",
        description: error instanceof Error ? error.message : "Could not load issue types or statuses.",
        variant: "destructive",
      });
    }
  }, [credentials, toast]);

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
  const issuesForTab = filteredIssues ?? [];
  
  const onTabSelect = (tab: string) => {
    setActiveTab(tab);
    if(isMobile) {
        setIsSidebarOpen(false);
    }
  }

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {isMobile ? (
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetContent side="left" className="p-0 w-64">
                <SheetHeader>
                    <SheetTitle className="sr-only">Main Navigation</SheetTitle>
                </SheetHeader>
                 <DashboardTabs activeTab={activeTab} setActiveTab={onTabSelect} />
            </SheetContent>
        </Sheet>
      ) : (
         <div className="hidden md:flex">
            <DashboardTabs activeTab={activeTab} setActiveTab={onTabSelect} />
         </div>
      )}

      <div className="flex flex-col flex-1">
        <header className="flex items-center justify-between gap-4 py-3 px-4 md:px-6 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <div className='flex items-center gap-2'>
            {isMobile && (
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}><Menu className="h-6 w-6"/></Button>
            )}
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-primary">
                    {currentTabInfo?.label}
                </h1>
                <p className="text-sm text-muted-foreground hidden md:block">
                    {currentTabInfo?.description}
                </p>
            </div>
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
            
            <Dialog>
              <DialogTrigger asChild>
                <Button size={isMobile ? 'icon' : 'default'}>
                  {isFetchingIssues ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin md:mr-2" />
                      <span className='hidden md:inline'>Fetching...</span>
                    </>
                  ) : (
                     <>
                      <span className='hidden md:inline'>Fetch Data</span>
                      <span className='inline md:hidden'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                      </span>
                     </>
                  )}
                  <span className="sr-only">Fetch Data</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                    <DialogTitle>Fetch Jira Data</DialogTitle>
                    <DialogDescription>
                        Choose to fetch by basic filters or use a custom JQL query.
                    </DialogDescription>
                </DialogHeader>
                <FetchDataDialog
                  onFetch={handleFetch}
                  isFetching={isFetchingIssues}
                  projects={projects}
                  issueTypes={issueTypes}
                  statuses={statuses}
                  onProjectChange={handleProjectMetaFetch}
                />
              </DialogContent>
            </Dialog>

            <Button variant="ghost" size="icon" onClick={onLogout}>
              <LogOut className="h-5 w-5" />
               <span className="sr-only">Logout</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/50">
            <div className="p-4 sm:p-6 rounded-xl shadow-sm bg-background">
              {!allIssues && !isDataLoading && <WelcomePlaceholder />}
              {isDataLoading && (
                  <div className="flex items-center justify-center h-full min-h-[50vh]">
                      <div className="text-center">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                        <p className="text-lg text-muted-foreground mt-4">
                          {isLoading ? "Loading projects..." : "Fetching issues..."}
                        </p>
                      </div>
                  </div>
              )}
              {CurrentTabComponent && allIssues ? (
                  <div className="animate-fade-in">
                    <CurrentTabComponent issues={issuesForTab} projects={projects} allIssues={allIssues} />
                  </div>
                ) : (
                   !isDataLoading && allIssues && <DashboardTabs.NoIssuesPlaceholder />
                )
              }
            </div>
        </main>
      </div>
    </div>
  );
}
