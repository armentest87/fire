'use client';
import { type JiraIssue } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RawDataProps {
  issues: JiraIssue[];
}

export function RawData({ issues }: RawDataProps) {
  const displayColumns: (keyof JiraIssue)[] = [
    'key', 'summary', 'issuetype', 'status', 'priority', 'assignee', 'reporter', 'created', 'resolved'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Raw Data Explorer</CardTitle>
        <CardDescription>This table contains the raw data fetched from your Jira instance for your own analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-[600px] overflow-y-auto border rounded-md">
            <Table>
                <TableHeader className="sticky top-0 bg-card">
                    <TableRow>
                        {displayColumns.map(col => <TableHead key={col}>{col}</TableHead>)}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {issues.map(issue => (
                        <TableRow key={issue.key}>
                           {displayColumns.map(col => (
                                <TableCell key={col}>
                                    {issue[col] ? String(issue[col]) : 'N/A'}
                                </TableCell>
                           ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
