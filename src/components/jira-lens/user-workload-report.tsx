
'use client';
import React from "react";
import { type JiraIssue } from "@/lib/types";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Button } from "../ui/button";

interface UserWorkloadReportProps {
  issues: JiraIssue[];
}

interface ProjectData {
    name: string;
    issueCount: number;
    estimateOriginal: number;
    estimateRemaining: number;
    issues: JiraIssue[];
}

interface WorkloadData {
  assignee: string;
  projects: ProjectData[];
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
            if (issue.status?.statusCategory?.name === 'Done') return acc;
            
            const assignee = issue.assignee?.displayName || 'Unassigned';
             if (assignee === 'Unassigned' && !issue.assignee) return acc; // Skip truly unassigned issues

            if (!acc[assignee]) {
                acc[assignee] = {
                    projects: {},
                    issueCount: 0,
                    estimateOriginal: 0,
                    estimateRemaining: 0,
                };
            }
            const projectKey = issue.key.split('-')[0];
            if (!acc[assignee].projects[projectKey]) {
                 acc[assignee].projects[projectKey] = {
                    name: projectKey,
                    issueCount: 0,
                    estimateOriginal: 0,
                    estimateRemaining: 0,
                    issues: []
                };
            }

            const projectData = acc[assignee].projects[projectKey];
            projectData.issues.push(issue);
            projectData.issueCount++;
            projectData.estimateOriginal += issue.time_original_estimate_hours || 0;
            projectData.estimateRemaining += issue.time_spent_hours ? Math.max(0, (issue.time_original_estimate_hours || 0) - issue.time_spent_hours) : (issue.time_original_estimate_hours || 0);
            
            acc[assignee].issueCount++;
            acc[assignee].estimateOriginal += issue.time_original_estimate_hours || 0;
            acc[assignee].estimateRemaining += issue.time_spent_hours ? Math.max(0, (issue.time_original_estimate_hours || 0) - issue.time_spent_hours) : (issue.time_original_estimate_hours || 0);

            return acc;
        }, {} as Record<string, any>);

        return Object.entries(dataByAssignee).map(([assignee, data]) => ({
            assignee,
            projects: Object.values(data.projects as Record<string, ProjectData>).sort((a,b) => b.issueCount - a.issueCount),
            issueCount: data.issueCount,
            estimateOriginal: data.estimateOriginal,
            estimateRemaining: data.estimateRemaining,
        })).sort((a,b) => b.issueCount - a.issueCount);
    }, [issues]);

    const toggleRow = (key: string) => {
        setExpandedRows(prev => ({ ...prev, [key]: !prev[key] }));
    }
    
    const totalIssues = workloadData.reduce((sum, row) => sum + row.issueCount, 0);
    const totalEstimateOriginal = workloadData.reduce((sum, row) => sum + row.estimateOriginal, 0);
    const totalEstimateRemaining = workloadData.reduce((sum, row) => sum + row.estimateRemaining, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Workload Report</CardTitle>
        <CardDescription>Breakdown of open issues and workload per user. Click to expand.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40%]">Assignee / Project / Issue</TableHead>
                        <TableHead className="text-right">Issues</TableHead>
                        <TableHead className="text-right">Est. Original (h)</TableHead>
                        <TableHead className="text-right">Est. Remaining (h)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow className="bg-muted/50 font-semibold hover:bg-muted/50">
                        <TableCell>Open Issues Total</TableCell>
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
                                <TableCell className="text-right">{row.issueCount}</TableCell>
                                <TableCell className="text-right">{formatHours(row.estimateOriginal)}</TableCell>
                                <TableCell className="text-right">{formatHours(row.estimateRemaining)}</TableCell>
                            </TableRow>
                            {expandedRows[row.assignee] && (
                                <>
                                 {row.projects.map(p => (
                                    <React.Fragment key={`${row.assignee}-${p.name}`}>
                                    <TableRow className="bg-muted/30 hover:bg-muted/40">
                                        <TableCell className="pl-4">
                                             <Button variant="ghost" size="sm" onClick={() => toggleRow(`${row.assignee}-${p.name}`)} className="-ml-2">
                                                {expandedRows[`${row.assignee}-${p.name}`] ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
                                                <span className="text-muted-foreground ml-2">{p.name}</span>
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">{p.issueCount}</TableCell>
                                        <TableCell className="text-right text-muted-foreground">{formatHours(p.estimateOriginal)}</TableCell>
                                        <TableCell className="text-right text-muted-foreground">{formatHours(p.estimateRemaining)}</TableCell>
                                    </TableRow>
                                    {expandedRows[`${row.assignee}-${p.name}`] && p.issues.map(issue => (
                                         <TableRow key={`${row.assignee}-${p.name}-${issue.key}`} className="bg-muted/10 hover:bg-muted/20">
                                            <TableCell className="pl-16 text-xs text-muted-foreground/80 flex items-center gap-2">
                                               <FileText className="h-3 w-3" />
                                               <span>{issue.key}: {issue.summary}</span>
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-muted-foreground/80">1</TableCell>
                                            <TableCell className="text-right text-xs text-muted-foreground/80">{formatHours(issue.time_original_estimate_hours)}</TableCell>
                                            <TableCell className="text-right text-xs text-muted-foreground/80">{formatHours(issue.time_spent_hours ? Math.max(0, (issue.time_original_estimate_hours || 0) - issue.time_spent_hours) : (issue.time_original_estimate_hours || 0))}</TableCell>
                                        </TableRow>
                                    ))}
                                    </React.Fragment>
                                 ))}
                                </>
                            )}
                       </React.Fragment>
                    ))}
                     {workloadData.length === 0 && (
                       <TableRow>
                           <TableCell colSpan={4} className="text-center h-24">
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
