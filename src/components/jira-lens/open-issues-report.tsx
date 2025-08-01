'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, ArrowUp, ArrowDown, ArrowRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Badge } from "../ui/badge";


interface OpenIssuesReportProps {
  issues: JiraIssue[];
}

const PRIORITY_ICON: Record<string, React.ReactNode> = {
    'Highest': <ArrowUp className="h-4 w-4 text-red-600"/>,
    'High': <ArrowUp className="h-4 w-4 text-orange-500"/>,
    'Medium': <ArrowRight className="h-4 w-4 text-yellow-500 -rotate-90"/>,
    'Low': <ArrowDown className="h-4 w-4 text-green-500"/>,
    'Lowest': <ArrowDown className="h-4 w-4 text-blue-500"/>,
};

const STATUS_COLORS: Record<string, string> = {
    'To Do': 'bg-gray-200 text-gray-800',
    'In Progress': 'bg-blue-200 text-blue-800',
    'Done': 'bg-green-200 text-green-800',
    'Open': 'bg-yellow-200 text-yellow-800',
    'Completed': 'bg-green-200 text-green-800',
    'Work in progress': 'bg-blue-200 text-blue-800',
    'Pending': 'bg-orange-200 text-orange-800',
};


export function OpenIssuesReport({ issues }: OpenIssuesReportProps) {
  const openIssues = useMemo(() => {
    return issues.filter(issue => issue.status_category !== 'Done').slice(0, 10);
  }, [issues]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Open Issues Report</CardTitle>
        <Info className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Issue Key</TableHead>
                        <TableHead>Current Assignee</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total Time Spent incl. Subtasks (h)</TableHead>
                        <TableHead>Priority</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                   {openIssues.map(issue => (
                     <TableRow key={issue.key}>
                        <TableCell className="font-medium">{issue.key}</TableCell>
                        <TableCell>{issue.assignee || 'Unassigned'}</TableCell>
                        <TableCell>
                            <Badge className={`${STATUS_COLORS[issue.status] || 'bg-gray-200 text-gray-800'} font-medium`}>
                                {issue.status}
                            </Badge>
                        </TableCell>
                        <TableCell>{issue.time_spent_hours ? issue.time_spent_hours.toFixed(1) : 'N/A'}</TableCell>
                        <TableCell className="flex items-center gap-2">
                            {PRIORITY_ICON[issue.priority]}
                            {issue.priority}
                        </TableCell>
                     </TableRow>
                   ))}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
