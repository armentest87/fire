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
import { ReleasesReport } from "./releases-report";


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
        <Tabs defaultValue="overview" orientation="vertical" className="flex w-full space-x-4">
            <TabsList className="flex flex-col h-full space-y-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="cumulative-flow">Cumulative Flow</TabsTrigger>
                <TabsTrigger value="sprint-analysis">Sprint Analysis</TabsTrigger>
                <TabsTrigger value="sprint-time-report">Sprint Time Report</TabsTrigger>
                <TabsTrigger value="timework-report">Timework Report</TabsTrigger>
                <TabsTrigger value="service-management">Service Management</TabsTrigger>
                <TabsTrigger value="itsm-report">ITSM Report</TabsTrigger>
                <TabsTrigger value="releases-report">Releases Report</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="flex-1">
                 <Overview issues={issues} />
            </TabsContent>
            <TabsContent value="cumulative-flow" className="flex-1">
                <CumulativeFlowDiagram issues={issues} />
            </TabsContent>
            <TabsContent value="sprint-analysis" className="flex-1">
                <SprintAnalysis issues={issues} />
            </TabsContent>
             <TabsContent value="sprint-time-report" className="flex-1">
                <SprintTimeReport issues={issues} />
            </TabsContent>
            <TabsContent value="timework-report" className="flex-1">
                <TimeworkReport issues={issues} />
            </TabsContent>
            <TabsContent value="service-management" className="flex-1">
                <ServiceManagement issues={issues} />
            </TabsContent>
            <TabsContent value="itsm-report" className="flex-1">
                <ItsmIssuesCreatedReport issues={issues} />
            </TabsContent>
            <TabsContent value="releases-report" className="flex-1">
                <ReleasesReport issues={issues} />
            </TabsContent>
        </Tabs>
    );
}
