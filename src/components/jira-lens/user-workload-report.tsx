'use client';
import React from "react";
import { type JiraIssue } from "@/lib/types";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Button } from "../ui/button";


interface UserWorkloadReportProps {
  issues: JiraIssue[];
}

interface WorkloadData {
  assignee: string;
  projects: { name: string, count: number }[];
  issueCount: number;
  estimateOriginal: number;
  estimateRemaining: number;
}

const formatHours = (hours: number | null | undefined): string => {
    if (hours === null || hours === undefined) return '0h';
    return `${Math.round(hours)}h`;
}


export function UserWorkloadReport({ issues }: UserWorkloadReportProps) {
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    const workloadData: WorkloadData[] = useMemo(() => {
        const dataByAssignee = issues.reduce((acc, issue) => {
            if (issue.status_category === 'Done') return acc;
            
            const assignee = issue.assignee || 'Unassigned';
            if (!acc[assignee]) {
                acc[assignee] = {
                    projects: {},
                    issueCount: 0,
                    estimateOriginal: 0,
                    estimateRemaining: 0,
                };
            }
            const projectKey = issue.key.split('-')[0];
            acc[assignee].projects[projectKey] = (acc[assignee].projects[projectKey] || 0) + 1;
            acc[assignee].issueCount++;
            acc[assignee].estimateOriginal += issue.time_original_estimate_hours || 0;
            acc[assignee].estimateRemaining += issue.time_spent_hours ? Math.max(0, (issue.time_original_estimate_hours || 0) - issue.time_spent_hours) : (issue.time_original_estimate_hours || 0);

            return acc;
        }, {} as Record<string, any>);

        return Object.entries(dataByAssignee).map(([assignee, data]) => ({
            assignee,
            projects: Object.entries(data.projects).map(([name, count]) => ({ name, count: count as number })),
            issueCount: data.issueCount,
            estimateOriginal: data.estimateOriginal,
            estimateRemaining: data.estimateRemaining,
        })).sort((a,b) => b.issueCount - a.issueCount);
    }, [issues]);

    const toggleRow = (assignee: string) => {
        setExpandedRows(prev => ({ ...prev, [assignee]: !prev[assignee] }));
    }
    
    const totalIssues = workloadData.reduce((sum, row) => sum + row.issueCount, 0);
    const totalEstimateOriginal = workloadData.reduce((sum, row) => sum + row.estimateOriginal, 0);
    const totalEstimateRemaining = workloadData.reduce((sum, row) => sum + row.estimateRemaining, 0);


  return (
    <Card>
      <CardHeader>
        <CardTitle>User Workload Report</CardTitle>
        <CardDescription>Breakdown of open issues and workload per user.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40%]">Assignee</TableHead>
                        <TableHead className="w-[20%]">Project</TableHead>
                        <TableHead className="text-right">Issues</TableHead>
                        <TableHead className="text-right">Est. Original (h)</TableHead>
                        <TableHead className="text-right">Est. Remaining (h)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow className="bg-muted/50 font-semibold hover:bg-muted/50">
                        <TableCell colSpan={2}>Open Issues Total</TableCell>
                        <TableCell className="text-right">{totalIssues}</TableCell>
                        <TableCell className="text-right">{formatHours(totalEstimateOriginal)}</TableCell>
                        <TableCell className="text-right">{formatHours(totalEstimateRemaining)}</TableCell>
                    </TableRow>
                    {workloadData.map(row => (
                       <React.Fragment key={row.assignee}>
                            <TableRow>
                                <TableCell>
                                    <Button variant="ghost" size="sm" onClick={() => toggleRow(row.assignee)} className="-ml-2">
                                        {expandedRows[row.assignee] ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
                                        <span className="font-medium ml-2">{row.assignee}</span>
                                    </Button>
                                </TableCell>
                                <TableCell>Assignee Open Issues Total</TableCell>
                                <TableCell className="text-right">{row.issueCount}</TableCell>
                                <TableCell className="text-right">{formatHours(row.estimateOriginal)}</TableCell>
                                <TableCell className="text-right">{formatHours(row.estimateRemaining)}</TableCell>
                            </TableRow>
                            {expandedRows[row.assignee] && (
                                <>
                                 {row.projects.map(p => (
                                    <TableRow key={p.name} className="bg-muted/20 hover:bg-muted/40">
                                        <TableCell></TableCell>
                                        <TableCell className="pl-12 text-muted-foreground">{p.name}</TableCell>
                                        <TableCell className="text-right text-muted-foreground">{p.count}</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                 ))}
                                </>
                            )}
                       </React.Fragment>
                    ))}
                     {workloadData.length === 0 && (
                       <TableRow>
                           <TableCell colSpan={5} className="text-center h-24">
                               No open issues assigned to users.
                           </TableCell>
                       </TableRow>
                   )}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
