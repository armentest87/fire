'use client';
import { type JiraIssue } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "./overview";
import { SprintAnalysis } from "./sprint-analysis";
import { TimeworkReport } from "./timework-report";
import { SprintTimeReport } from "./sprint-time-report";
import { CumulativeFlowDiagram } from "./cumulative-flow-diagram";
import { ServiceManagement } from "./service-management";
import { ItsmIssuesCreatedReport } from "./itsm-issues-created-report";


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
            <TabsList className="overflow-x-auto whitespace-nowrap">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="cumulative-flow">Cumulative Flow</TabsTrigger>
                <TabsTrigger value="sprint-analysis">Sprint Analysis</TabsTrigger>
                <TabsTrigger value="sprint-time-report">Sprint Time Report</TabsTrigger>
                <TabsTrigger value="timework-report">Timework Report</TabsTrigger>
                <TabsTrigger value="service-management">Service Management</TabsTrigger>
                <TabsTrigger value="itsm-report">ITSM Report</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
                 <Overview issues={issues} />
            </TabsContent>
            <TabsContent value="cumulative-flow">
                <CumulativeFlowDiagram issues={issues} />
            </TabsContent>
            <TabsContent value="sprint-analysis">
                <SprintAnalysis issues={issues} />
            </TabsContent>
             <TabsContent value="sprint-time-report">
                <SprintTimeReport issues={issues} />
            </TabsContent>
            <TabsContent value="timework-report">
                <TimeworkReport issues={issues} />
            </TabsContent>
            <TabsContent value="service-management">
                <ServiceManagement issues={issues} />
            </TabsContent>
            <TabsContent value="itsm-report">
                <ItsmIssuesCreatedReport issues={issues} />
            </TabsContent>
        </Tabs>
    );
}
