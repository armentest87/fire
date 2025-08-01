'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type JiraIssue } from "@/lib/types";
import { Overview } from "./overview";
import { CfdChart } from "./cfd-chart";
import { SprintAnalysis } from "./sprint-analysis";
import { CustomAnalysisBuilder } from "./custom-analysis-builder";

interface DashboardTabsProps {
  issues: JiraIssue[] | null;
  jql: string;
  isLoading: boolean;
  error: string | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function DashboardTabs({ issues, jql, isLoading, error, activeTab, setActiveTab }: DashboardTabsProps) {
  if (!issues || issues.length === 0) {
    return null; 
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-in">
      {/* The TabsList is now controlled by the sidebar, so we don't render it here */}
      <TabsContent value="overview" className="mt-0"><Overview issues={issues} /></TabsContent>
      <TabsContent value="cfd" className="mt-0"><CfdChart issues={issues} /></TabsContent>
      <TabsContent value="sprint" className="mt-0"><SprintAnalysis issues={issues} /></TabsContent>
      <TabsContent value="custom" className="mt-0"><CustomAnalysisBuilder issues={issues} /></TabsContent>
      <TabsContent value="other" className="mt-0"><div className="text-center p-10 text-muted-foreground">Other reports are not yet implemented.</div></TabsContent>
      <TabsContent value="settings" className="mt-0"><div className="text-center p-10 text-muted-foreground">Settings page is not yet implemented.</div></TabsContent>
    </Tabs>
  );
}
