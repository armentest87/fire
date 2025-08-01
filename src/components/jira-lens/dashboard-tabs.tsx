'use client';
import { type JiraIssue } from "@/lib/types";
import { Overview } from "./overview";


export function DashboardTabs({ issues }: { issues: JiraIssue[] }) {
    return (
        <div className="w-full">
           <Overview issues={issues} />
        </div>
    );
}
