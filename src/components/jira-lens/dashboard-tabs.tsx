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

export function DashboardTabs({ issues, jql, isLoading, error }: DashboardTabsProps) {
  if (!issues || issues.length === 0) {
    return null; 
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
