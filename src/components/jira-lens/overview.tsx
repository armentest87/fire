'use client';
import { type JiraIssue } from "@/lib/types";
import { IssuesByPriorityChart } from "./issues-by-priority-chart";
import { IssuesByStatusChart } from "./issues-by-status-chart";
import { IssuesByTypeChart } from "./issues-by-type-chart";
import { KpiCards } from "./kpi-cards";
import { ProjectProgressChart } from "./project-progress-chart";


export function Overview({ issues }: { issues: JiraIssue[] }) {
    if (!issues || issues.length === 0) {
        return <p>No issue data to display.</p>;
    }
    
    return (
        <div className="space-y-6">
            <KpiCards issues={issues} />
            
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                <div className="xl:col-span-2"><IssuesByStatusChart issues={issues} /></div>
                <div className="xl:col-span-3"><ProjectProgressChart issues={issues} /></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <IssuesByTypeChart issues={issues} />
                <IssuesByPriorityChart issues={issues} />
            </div>

        </div>
    )
}
