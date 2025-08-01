'use client';
import { type JiraIssue } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "./overview";
import { SprintAnalysis } from "./sprint-analysis";


export function DashboardTabs({ issues }: { issues: JiraIssue[] }) {
    return (
        <Tabs defaultValue="overview" className="w-full">
            <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="sprint-analysis">Sprint Analysis</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
                 <Overview issues={issues} />
            </TabsContent>
            <TabsContent value="sprint-analysis">
                <SprintAnalysis issues={issues} />
            </TabsContent>
        </Tabs>
    );
}
