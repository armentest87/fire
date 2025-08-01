'use client';
import { type JiraIssue } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "./overview";
import { SprintAnalysis } from "./sprint-analysis";
import { TimeworkReport } from "./timework-report";


export function DashboardTabs({ issues }: { issues: JiraIssue[] }) {
    return (
        <Tabs defaultValue="overview" className="w-full">
             <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="sprint">Sprint Analysis</TabsTrigger>
                <TabsTrigger value="timework">Timework Report</TabsTrigger>
            </TabsList>
            <TabsContent value="overview"><Overview issues={issues} /></TabsContent>
            <TabsContent value="sprint"><SprintAnalysis issues={issues} /></TabsContent>
            <TabsContent value="timework"><TimeworkReport issues={issues} /></TabsContent>
        </Tabs>
    );
}
