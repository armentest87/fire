'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { ScrollArea } from "../ui/scroll-area";
import { parseISO } from "date-fns";

const TARGET_HOURS = 48; // Default target

interface ResolutionData {
    assignee: string;
    project: string;
    issueKey: string;
    actualHours: number;
    targetHours: number;
}

export function TimeResolutionTable({ issues }: { issues: JiraIssue[] }) {
    
    const resolutionData: ResolutionData[] = useMemo(() => {
        return issues
            .filter(i => i.resolved && i.created && i.assignee?.displayName)
            .map(issue => {
                const resolutionHours = (parseISO(issue.resolved!).getTime() - parseISO(issue.created).getTime()) / (1000 * 3600);
                return {
                    assignee: issue.assignee!.displayName,
                    project: issue.key.split('-')[0],
                    issueKey: issue.key,
                    actualHours: resolutionHours,
                    targetHours: TARGET_HOURS, // Simplified target for now
                };
            })
            .sort((a,b) => b.actualHours - a.actualHours);
    }, [issues]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Detailed Time to Resolution</CardTitle>
                <CardDescription>A detailed breakdown of resolution times per issue.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96 w-full">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Assignee</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Issue Key</TableHead>
                                <TableHead className="text-right">Actual (h)</TableHead>
                                <TableHead className="text-right">Target (h)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {resolutionData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        No resolved issues with time data found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                resolutionData.map(data => (
                                    <TableRow key={data.issueKey}>
                                        <TableCell>{data.assignee}</TableCell>
                                        <TableCell>{data.project}</TableCell>
                                        <TableCell className="font-medium">{data.issueKey}</TableCell>
                                        <TableCell className="text-right">{data.actualHours.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">{data.targetHours.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
