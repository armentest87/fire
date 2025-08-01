'use client';

import { useState } from 'react';
import { type JiraIssue, type JiraCredentials } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { fetchJiraData } from '@/lib/dummy-data';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Info, LogOut, Loader2 } from 'lucide-react';
import { KpiCards } from './kpi-cards';
import { ProjectProgressChart } from './project-progress-chart';
import { IssuesByStatusChart } from './issues-by-status-chart';
import { IssuesByTypeChart } from './issues-by-type-chart';
import { IssuesByPriorityChart } from './issues-by-priority-chart';
import { UserWorkloadReport } from './user-workload-report';
import { OpenIssuesReport } from './open-issues-report';


interface DashboardPageProps {
  credentials: JiraCredentials;
  onLogout: () => void;
}

const WelcomePlaceholder = () => (
    <div className="text-center p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-2">Welcome to your Jira Project Dashboard</h2>
      <p className="text-gray-500">Please select a project from the dropdown above to see the data.</p>
    </div>
);

export function DashboardPage({ credentials, onLogout }: DashboardPageProps) {
  const [issues, setIssues] = useState<JiraIssue[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const { toast } = useToast();

  const handleProjectChange = async (projectKey: string) => {
    setSelectedProject(projectKey);
    setIsLoading(true);
    setIssues(null);
    try {
      // In a real app, you'd use the projectKey to form a JQL query
      const jql = `project = "${projectKey}" ORDER BY created DESC`;
      const data = await fetchJiraData(jql);
      setIssues(data);
      toast({
        title: "Success!",
        description: `Successfully fetched ${data.length} issues for project ${projectKey}.`,
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Jira Project Dashboard</h1>
        <div className="flex items-center gap-4">
          <Select onValueChange={handleProjectChange} value={selectedProject}>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Choose Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PROJ">Project Phoenix</SelectItem>
              <SelectItem value="DATA">Data Platform</SelectItem>
              <SelectItem value="ITSAM">ITSM Sample</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <LogOut className="h-5 w-5 text-gray-600" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </header>
      
      <main>
        {isLoading && (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-lg text-gray-600">Loading project data...</p>
            </div>
        )}
        {!isLoading && !issues && <WelcomePlaceholder />}
        
        {issues && (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1"><KpiCards issues={issues} /></div>
                    <div className="md:col-span-2"><ProjectProgressChart issues={issues} /></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <IssuesByStatusChart issues={issues} />
                    <IssuesByTypeChart issues={issues} />
                    <IssuesByPriorityChart issues={issues} />
                </div>
                
                 <div className="grid grid-cols-1 gap-6">
                    <UserWorkloadReport issues={issues} />
                    <OpenIssuesReport issues={issues} />
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
