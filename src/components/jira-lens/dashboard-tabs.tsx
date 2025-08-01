'use client';
import { type JiraIssue } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "./overview";
import { FinancialReport } from "./financial-report";
import { ItsmQuality } from "./itsm-quality";
import { RawData } from "./raw-data";
import { ReleaseAnalysis } from "./release-analysis";
import { SprintAnalysis } from "./sprint-analysis";
import { TimeworkReport } from "./timework-report";


export function DashboardTabs({ issues }: { issues: JiraIssue[] }) {
    return (
        <Tabs defaultValue="overview" className="w-full">
             <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="sprint">Sprint Analysis</TabsTrigger>
                <TabsTrigger value="timework">Timework Report</TabsTrigger>
                <TabsTrigger value="itsm">ITSM & Quality</TabsTrigger>
                <TabsTrigger value="financial">Financial Report</TabsTrigger>
                <TabsTrigger value="release">Release Analysis</TabsTrigger>
                <TabsTrigger value="raw">Raw Data</TabsTrigger>
            </TabsList>
            <TabsContent value="overview"><Overview issues={issues} /></TabsContent>
            <TabsContent value="sprint"><SprintAnalysis issues={issues} /></TabsContent>
            <TabsContent value="timework"><TimeworkReport issues={issues} /></TabsContent>
            <TabsContent value="itsm"><ItsmQuality issues={issues} /></TabsContent>
            <TabsContent value="financial"><FinancialReport issues={issues} /></TabsContent>
            <TabsContent value="release"><ReleaseAnalysis issues={issues} /></TabsContent>
            <TabsContent value="raw"><RawData issues={issues} /></TabsContent>
        </Tabs>
    );
}
