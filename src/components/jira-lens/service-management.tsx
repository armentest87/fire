'use client';
import { type JiraIssue } from "@/lib/types";
import { CreatedVsClosedChart } from "./created-vs-closed-chart";
import { CreatedIssuesByPriorityPie } from "./created-issues-by-priority-pie";
import { CreatedIssuesByTypePie } from "./created-issues-by-type-pie";
import { OpenIssuesByStatusPie } from "./open-issues-by-status-pie";
import { ServiceKpiCards } from "./service-kpi-cards";
import { TimeToResolutionChart } from "./time-to-resolution-chart";
import { CreatedIssuesByTypeOverTimeChart } from "./created-issues-by-type-over-time-chart";
import { ClosedIssuesByPriorityPie } from "./closed-issues-by-priority-pie";
import { TimeResolutionTable } from "./time-resolution-table";


export function ServiceManagement({ issues }: { issues: JiraIssue[] }) {
    if (!issues || issues.length === 0) {
        return <p>No issue data to display for Service Management.</p>;
    }

    return (
        <div className="space-y-6">
            <ServiceKpiCards issues={issues} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <OpenIssuesByStatusPie issues={issues} />
                <ClosedIssuesByPriorityPie issues={issues} />
                <CreatedIssuesByTypePie issues={issues} />
            </div>

            <div className="grid grid-cols-1 gap-6">
                 <CreatedIssuesByTypeOverTimeChart issues={issues} />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <TimeToResolutionChart issues={issues} groupBy="priority" title="Average Time to Resolution by Priority" />
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TimeToResolutionChart issues={issues} groupBy="issuetype" title="Average Time to Resolution by Type"/>
                <TimeToResolutionChart issues={issues} groupBy="assignee" title="Average Time to Resolution by Assignee" />
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <TimeResolutionTable issues={issues} />
            </div>

            <div className="grid grid-cols-1 gap-6">
                 <CreatedVsClosedChart issues={issues} />
            </div>
        </div>
    );
}
