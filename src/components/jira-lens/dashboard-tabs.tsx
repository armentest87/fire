'use client';
import { type JiraIssue } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "./overview";
import { SprintAnalysis } from "./sprint-analysis";
import { TimeworkReport } from "./timework-report";


export function DashboardTabs({ issues }: { issues: JiraIssue[] }) {
    if (!issues || issues.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8 bg-card rounded-lg shadow-md border">
                <h2 className="text-2xl font-semibold mb-2">No Issues Found</h2>
                <p className="text-muted-foreground">Your filters did not match any issues. Try adjusting your filter criteria.</p>
              </div>
            </div>
        );
    }
    
    return (
        <Tabs defaultValue="overview" className="w-full">
            <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="sprint-analysis">Sprint Analysis</TabsTrigger>
                <TabsTrigger value="timework-report">Timework Report</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
                 <Overview issues={issues} />
            </TabsContent>
            <TabsContent value="sprint-analysis">
                <SprintAnalysis issues={issues} />
            </TabsContent>
            <TabsContent value="timework-report">
                <TimeworkReport issues={issues} />
            </TabsContent>
        </Tabs>
    );
}
