'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type JiraIssue } from "@/lib/types";
import { Overview } from "./overview";
import { CfdChart } from "./cfd-chart";
import { SprintAnalysis } from "./sprint-analysis";
import { CustomAnalysisBuilder } from "./custom-analysis-builder";
import { AdvancedAgile } from "./advanced-agile";
import { ItsmQuality } from "./itsm-quality";
import { FinancialReport } from "./financial-report";
import { ReleaseAnalysis } from "./release-analysis";
import { RawData } from "./raw-data";

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
      <TabsContent value="sprint" className="mt-0"><SprintAnalysis issues={issues} /></TabsContent>
      <TabsContent value="advanced-agile" className="mt-0"><AdvancedAgile issues={issues} /></TabsContent>
      <TabsContent value="cfd" className="mt-0"><CfdChart issues={issues} /></TabsContent>
      <TabsContent value="custom" className="mt-0"><CustomAnalysisBuilder issues={issues} /></TabsContent>
      <TabsContent value="itsm" className="mt-0"><ItsmQuality issues={issues} /></TabsContent>
      <TabsContent value="financial" className="mt-0"><FinancialReport issues={issues} /></TabsContent>
      <TabsContent value="release" className="mt-0"><ReleaseAnalysis issues={issues} /></TabsContent>
      <TabsContent value="raw-data" className="mt-0"><RawData issues={issues} /></TabsContent>
      <TabsContent value="settings" className="mt-0"><div className="text-center p-10 text-muted-foreground">Settings page is not yet implemented.</div></TabsContent>
    </Tabs>
  );
}
