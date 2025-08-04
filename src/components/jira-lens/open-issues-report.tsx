'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUp, ArrowDown, ArrowRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Badge } from "../ui/badge";


interface OpenIssuesReportProps {
  issues: JiraIssue[];
}

const PRIORITY_ICON: Record<string, React.ReactNode> = {
    'Highest': <ArrowUp className="h-4 w-4 text-red-600"/>,
    'High': <ArrowUp className="h-4 w-4 text-orange-500"/>,
    'Medium': <ArrowRight className="h-4 w-4 text-yellow-500 rotate-[-90deg]"/>,
    'Low': <ArrowDown className="h-4 w-4 text-green-500"/>,
    'Lowest': <ArrowDown className="h-4 w-4 text-blue-500"/>,
};

const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
        case 'to do': return 'bg-gray-200 text-gray-800';
        case 'in progress': return 'bg-blue-200 text-blue-800';
        case 'done': return 'bg-green-200 text-green-800';
        default: return 'bg-purple-200 text-purple-800';
    }
}


export function OpenIssuesReport({ issues }: OpenIssuesReportProps) {
  const openIssues = useMemo(() => {
    return issues.filter(issue => issue.status_category !== 'Done')
                 .sort((a,b) => (b.time_spent_hours || 0) - (a.time_spent_hours || 0))
                 .slice(0, 10);
  }, [issues]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Open Issues</CardTitle>
        <CardDescription>A list of open issues, prioritized by time spent.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Key</TableHead>
                        <TableHead>Summary</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Time Spent (h)</TableHead>
                        <TableHead>Priority</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                   {openIssues.map(issue => (
                     <TableRow key={issue.key}>
                        <TableCell className="font-medium">{issue.key}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{issue.summary}</TableCell>
                        <TableCell>{issue.assignee || 'Unassigned'}</TableCell>
                        <TableCell>
                            <Badge variant="outline" className={`${getStatusColor(issue.status)} font-medium`}>
                                {issue.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">{issue.time_spent_hours ? issue.time_spent_hours.toFixed(1) : 'N/A'}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                {PRIORITY_ICON[issue.priority]}
                                <span>{issue.priority}</span>
                            </div>
                        </TableCell>
                     </TableRow>
                   ))}
                   {openIssues.length === 0 && (
                       <TableRow>
                           <TableCell colSpan={6} className="text-center h-24">
                               No open issues found.
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
