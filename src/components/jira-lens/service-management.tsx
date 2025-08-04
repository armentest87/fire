'use client';
import { type JiraIssue } from "@/lib/types";
import { CreatedVsClosedChart } from "./created-vs-closed-chart";
import { CreatedIssuesByPriorityPie } from "./created-issues-by-priority-pie";
import { CreatedIssuesByTypePie } from "./created-issues-by-type-pie";
import { OpenIssuesByStatusPie } from "./open-issues-by-status-pie";
import { ServiceKpiCards } from "./service-kpi-cards";
import { TimeToResolutionChart } from "./time-to-resolution-chart";
import { CreatedIssuesByTypeOverTimeChart } from "./created-issues-by-type-over-time-chart";


export function ServiceManagement({ issues }: { issues: JiraIssue[] }) {
    if (!issues || issues.length === 0) {
        return <p>No issue data to display for Service Management.</p>;
    }

    return (
        <div className="space-y-6">
            <ServiceKpiCards issues={issues} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <OpenIssuesByStatusPie issues={issues} />
                <CreatedIssuesByTypePie issues={issues} />
                <CreatedIssuesByPriorityPie issues={issues} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <TimeToResolutionChart issues={issues} />
                <CreatedVsClosedChart issues={issues} />
            </div>
             <CreatedIssuesByTypeOverTimeChart issues={issues} />
        </div>
    );
}
