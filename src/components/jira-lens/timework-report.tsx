'use client';
import { type JiraIssue } from "@/lib/types";

export function TimeworkReport({ issues }: { issues: JiraIssue[] }) {
    return (
        <div className="flex items-center justify-center h-full p-8 bg-card rounded-lg shadow-md border">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Timework Report</h2>
            <p className="text-muted-foreground">This section is under construction. It will soon display a detailed breakdown of time spent by users.</p>
          </div>
        </div>
    );
}
