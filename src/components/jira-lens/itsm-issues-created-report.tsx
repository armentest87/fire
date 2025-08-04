'use client';
import { type JiraIssue } from "@/lib/types";
import { ItsmKpiCards } from "./itsm-kpi-cards";
import { CreatedIssuesOverTimeChart } from "./created-issues-over-time-chart";
import { ItsmIssuesByType } from "./itsm-issues-by-type";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";


export function ItsmIssuesCreatedReport({ issues }: { issues: JiraIssue[] }) {
    if (!issues || issues.length === 0) {
        return <p>No issue data to display for ITSM Report.</p>;
    }
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
                 <h2 className="text-xl font-bold">ITSM Issues Created Report</h2>
                <div className="flex gap-4">
                     <Select defaultValue="2y">
                        <SelectTrigger className="w-48"><SelectValue placeholder="Select Time Frame" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1y">Last Year</SelectItem>
                            <SelectItem value="2y">Last 2 Years</SelectItem>
                             <SelectItem value="all">All Time</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                        <SelectTrigger className="w-48"><SelectValue placeholder="Choose Project" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Projects</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <ItsmKpiCards issues={issues} />
            
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                <div className="xl:col-span-3">
                    <CreatedIssuesOverTimeChart issues={issues} />
                </div>
                <div className="xl:col-span-2">
                    <ItsmIssuesByType issues={issues} />
                </div>
            </div>
        </div>
    );
}
