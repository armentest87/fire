'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type JiraIssue } from "@/lib/types";
import { Overview } from "./overview";
import { CfdChart } from "./cfd-chart";
import { SprintAnalysis } from "./sprint-analysis";
import { CustomAnalysisBuilder } from "./custom-analysis-builder";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

interface DashboardTabsProps {
  issues: JiraIssue[] | null;
  jql: string;
  isLoading: boolean;
  error: string | null;
}

const Placeholder = ({ title, message }: { title: string; message: string }) => (
  <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg bg-card text-center p-4">
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{message}</p>
  </div>
);

export function DashboardTabs({ issues, jql, isLoading, error }: DashboardTabsProps) {
  
  if (isLoading) {
    return <Skeleton className="h-[600px] w-full" />;
  }
  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error Fetching Data</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  if (!issues || issues.length === 0) {
      return <Placeholder title="No Data to Display" message="Your query returned no issues. Try a different JQL query." />;
  }


  return (
    <Tabs defaultValue="overview" className="w-full animate-fade-in">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="cfd">Cumulative Flow</TabsTrigger>
        <TabsTrigger value="sprint">Sprint Analysis</TabsTrigger>
        <TabsTrigger value="custom">Custom Analysis</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-4"><Overview issues={issues} /></TabsContent>
      <TabsContent value="cfd" className="mt-4"><CfdChart issues={issues} /></TabsContent>
      <TabsContent value="sprint" className="mt-4"><SprintAnalysis issues={issues} /></TabsContent>
      <TabsContent value="custom" className="mt-4"><CustomAnalysisBuilder issues={issues} /></TabsContent>
    </Tabs>
  );
}
