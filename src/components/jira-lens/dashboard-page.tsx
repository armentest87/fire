'use client';
import { useState, useMemo } from 'react';
import { DashboardTabs } from '@/components/jira-lens/dashboard-tabs';
import { type JiraIssue, type JiraCredentials } from '@/lib/types';
import { PanelLeft, Rocket, LogOut, BarChart3, Settings, LayoutDashboard, GanttChart, TestTube2, Briefcase, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { JiraFilterSidebar } from './jira-filter-sidebar';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface DashboardPageProps {
  credentials: JiraCredentials;
  onLogout: () => void;
}

export function DashboardPage({ credentials, onLogout }: DashboardPageProps) {
  const [issues, setIssues] = useState<JiraIssue[] | null>(null);
  const [jql, setJql] = useState<string>("statusCategory = 'In Progress' ORDER BY created DESC");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(true);

  const navItems = useMemo(() => [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cfd', label: 'Cumulative Flow', icon: GanttChart },
    { id: 'sprint', label: 'Sprint Analysis', icon: Rocket },
    { id: 'custom', label: 'Custom Analysis', icon: TestTube2 },
    { id: 'other', label: 'Other Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ], []);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <SheetHeader className="p-4 border-b text-left">
          <SheetTitle>Jira Lens</SheetTitle>
          <SheetDescription>AI-Powered Analytics</SheetDescription>
        </SheetHeader>
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        <h2 className="px-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">Analytics</h2>
        {navItems.slice(0, 4).map(item => (
            <TooltipProvider key={item.id} delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button
                            variant={activeTab === item.id ? 'secondary' : 'ghost'}
                            className="w-full justify-start text-base h-11"
                            onClick={() => setActiveTab(item.id)}
                            >
                            <item.icon className="h-5 w-5 mr-3" />
                            {item.label}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center">{item.label}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ))}
         <h2 className="px-2 pt-4 text-xs font-semibold text-muted-foreground tracking-wider uppercase">Configuration</h2>
         {navItems.slice(4).map(item => (
            <TooltipProvider key={item.id} delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button
                            variant={activeTab === item.id ? 'secondary' : 'ghost'}
                            className="w-full justify-start text-base h-11"
                            onClick={() => setActiveTab(item.id)}
                            disabled
                            >
                            <item.icon className="h-5 w-5 mr-3" />
                            {item.label}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center">{item.label}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ))}

      </nav>
      <div className="p-4 border-t mt-auto">
        <Button variant="outline" className="w-full" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </div>
    </div>
  );

  const WelcomePlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-card rounded-2xl border shadow-sm">
      <div className="p-4 bg-primary/10 rounded-full mb-4">
        <Rocket className="w-12 h-12 text-primary" />
      </div>
      <h2 className="text-3xl font-bold mb-2 text-gradient">Welcome to Jira Lens</h2>
      <p className="text-muted-foreground max-w-md">
        Use the filters in the sidebar to fetch and analyze your project data. Start by selecting a project and date range, or use a custom JQL query.
      </p>
    </div>
  );

  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      <aside className="w-72 flex-shrink-0 border-r bg-card flex-col hidden lg:flex">
        {sidebarContent}
      </aside>

      <div className="flex flex-1">
        <aside className={cn(
          "flex-shrink-0 border-r bg-card/80 backdrop-blur-sm p-6 flex flex-col transition-all duration-300 ease-in-out",
          isFilterSidebarOpen ? "w-[400px]" : "w-0 p-0 border-none overflow-hidden"
        )}>
            <JiraFilterSidebar 
              credentials={credentials}
              jql={jql}
              setJql={setJql}
              setIssues={setIssues}
              setIsLoading={setIsLoading}
              setError={setError}
              isLoading={isLoading}
            />
        </aside>
        <main className="flex-1 p-6 overflow-auto relative">
             <div className="absolute top-0 right-0 h-64 w-full bg-gradient-to-bl from-primary/5 to-accent/5 -z-10 blur-3xl" />
            <header className="flex items-center gap-4 mb-6">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="lg:hidden">
                      <PanelLeft className="h-5 w-5" />
                      <span className="sr-only">Toggle Sidebar</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-72 bg-card">
                     {sidebarContent}
                  </SheetContent>
                </Sheet>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                  <p className="text-muted-foreground">Your dynamic insights dashboard for Jira.</p>
                </div>
                <Button 
                    variant="outline" 
                    onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
                    className="ml-auto"
                >
                    <SlidersHorizontal className="h-4 w-4 mr-2"/>
                    Filters
                </Button>
            </header>

            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <p>Loading data...</p>
              </div>
            )}

            {issues && issues.length > 0 && (
              <DashboardTabs issues={issues} jql={jql} isLoading={isLoading} error={error} activeTab={activeTab} setActiveTab={setActiveTab}/>
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
    </div>
  );
}
