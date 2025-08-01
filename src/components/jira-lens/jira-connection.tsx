'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { fetchJiraData } from "@/lib/dummy-data";
import { type JiraIssue } from "@/lib/types";
import { Rocket, Loader2 } from "lucide-react";

interface JiraConnectionProps {
  jql: string;
  setJql: (jql: string) => void;
  setIssues: (issues: JiraIssue[] | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export function JiraConnection({ jql, setJql, setIssues, setIsLoading, setError }: JiraConnectionProps) {
  const { toast } = useToast();
  const [localIsLoading, setLocalIsLoading] = useState(false);

  const handleFetch = async () => {
    setLocalIsLoading(true);
    setIsLoading(true);
    setError(null);
    setIssues(null);
    try {
      const data = await fetchJiraData(jql);
      if (data && data.length > 0) {
        setIssues(data);
        toast({
          title: "Success!",
          description: `Successfully fetched ${data.length} issues.`,
          variant: 'default',
          className: 'bg-green-100 dark:bg-green-900 border-green-500',
        });
      } else {
        setIssues([]);
        toast({
          title: "No data",
          description: "Query returned no issues.",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      setIssues(null);
      toast({
        title: "Error fetching data",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLocalIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Jira Connection</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="jira-url">Jira URL</Label>
            <Input id="jira-url" placeholder="https://your-domain.atlassian.net" defaultValue="https://jira.example.com" />
          </div>
          <div>
            <Label htmlFor="jira-email">Jira Email</Label>
            <Input id="jira-email" placeholder="user@example.com" />
          </div>
          <div>
            <Label htmlFor="jira-token">API Token</Label>
            <Input id="jira-token" type="password" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Data Filtering</h3>
        <div>
          <Label htmlFor="jql-query">JQL Query</Label>
          <Textarea 
            id="jql-query"
            value={jql}
            onChange={(e) => setJql(e.target.value)}
            className="min-h-[120px] font-mono text-sm"
            placeholder="e.g., project = 'PROJ' and status = 'Done'"
          />
        </div>
      </div>
      <Button onClick={handleFetch} disabled={localIsLoading} className="w-full" size="lg">
        {localIsLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
            <Rocket className="mr-2 h-4 w-4" />
        )}
        Fetch & Analyze
      </Button>
    </div>
  );
}
