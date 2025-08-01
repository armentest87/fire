'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type JiraIssue } from "@/lib/types";
import { Overview } from "./overview";
import { CfdChart } from "./cfd-chart";
import { SprintAnalysis } from "./sprint-analysis";
import { CustomAnalysisBuilder } from "./custom-analysis-builder";
import { AiSuggester } from "./ai-suggester";
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
  const renderContent = (Component: React.ElementType, tabName: string) => {
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
    if (!issues) {
      return <Placeholder title={`Welcome to the ${tabName} Tab`} message="Please fetch issue data in the sidebar to see the dashboard." />;
    }
    if (issues.length === 0) {
      return <Placeholder title="No Data to Display" message="Your query returned no issues. Try a different JQL query." />;
    }
    return <Component issues={issues} />;
  };

  return (
    <Tabs defaultValue="overview" className="w-full animate-fade-in">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="cfd">Cumulative Flow</TabsTrigger>
        <TabsTrigger value="sprint">Sprint Analysis</TabsTrigger>
        <TabsTrigger value="custom">Custom Analysis</TabsTrigger>
        <TabsTrigger value="ai">AI Suggester</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-4">{renderContent(Overview, 'Overview')}</TabsContent>
      <TabsContent value="cfd" className="mt-4">{renderContent(CfdChart, 'Cumulative Flow')}</TabsContent>
      <TabsContent value="sprint" className="mt-4">{renderContent(SprintAnalysis, 'Sprint Analysis')}</TabsContent>
      <TabsContent value="custom" className="mt-4">{renderContent(CustomAnalysisBuilder, 'Custom Analysis')}</TabsContent>
      <TabsContent value="ai" className="mt-4">
        {isLoading ? <Skeleton className="h-[400px] w-full" /> : <AiSuggester jql={jql} />}
      </TabsContent>
    </Tabs>
  );
}
