'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, ChevronDown, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

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
        }));
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
        <Info className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-2/5">Assignee</TableHead>
                        <TableHead className="w-1/5">Project</TableHead>
                        <TableHead>Number of Issues</TableHead>
                        <TableHead>Estimate Original (h)</TableHead>
                        <TableHead>Estimate Remaining (h)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow className="bg-gray-100 font-semibold">
                        <TableCell colSpan={2}>Open Issues Total</TableCell>
                        <TableCell>{totalIssues}</TableCell>
                        <TableCell>{formatHours(totalEstimateOriginal)}</TableCell>
                        <TableCell>{formatHours(totalEstimateRemaining)}</TableCell>
                    </TableRow>
                    {workloadData.map(row => (
                       <React.Fragment key={row.assignee}>
                            <TableRow className="cursor-pointer hover:bg-gray-50" onClick={() => toggleRow(row.assignee)}>
                                <TableCell className="font-medium flex items-center gap-2">
                                     {expandedRows[row.assignee] ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
                                    {row.assignee}
                                </TableCell>
                                <TableCell>Assignee Open Issues Total</TableCell>
                                <TableCell>{row.issueCount}</TableCell>
                                <TableCell>{formatHours(row.estimateOriginal)}</TableCell>
                                <TableCell>{formatHours(row.estimateRemaining)}</TableCell>
                            </TableRow>
                            {expandedRows[row.assignee] && (
                                <>
                                 {row.projects.map(p => (
                                    <TableRow key={p.name} className="bg-gray-50/50">
                                        <TableCell></TableCell>
                                        <TableCell className="pl-12">{p.name}</TableCell>
                                        <TableCell>{p.count}</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                 ))}
                                </>
                            )}
                       </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
