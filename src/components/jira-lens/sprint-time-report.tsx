'use client';
import { type JiraIssue } from "@/lib/types";
import { useState, useMemo, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from 'react-chartjs-2';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";


const KpiCard = ({ title, value, description }: { title: string; value: string | number; description?: string }) => (
    <Card className="shadow-sm">
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-2xl font-bold">{value}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
    </Card>
);

const formatHours = (hours: number | null | undefined): string => {
    if (hours === null || hours === undefined) return '0h 0m';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
}

const EstimatePercentageChart = ({ issues }: { issues: JiraIssue[] }) => {
    const chartData = useMemo(() => {
        const data = issues
            .map(issue => {
                const original = issue.time_original_estimate_hours || 0;
                const remaining = issue.time_spent_hours ? Math.max(0, original - issue.time_spent_hours) : original;
                const percentage = original > 0 ? (remaining / original) * 100 : 0;
                return { key: issue.key, percentage };
            })
            .filter(d => d.percentage > 0)
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 10);

        return {
            labels: data.map(d => d.key),
            datasets: [{
                label: '% Remaining',
                data: data.map(d => d.percentage),
                backgroundColor: '#219ebc',
                borderColor: '#219ebc',
                barThickness: 10,
            }]
        };
    }, [issues]);

    return (
        <Card>
            <CardHeader><CardTitle className="text-base">Estimate Remaining % of Original</CardTitle></CardHeader>
            <CardContent className="h-80">
                <Bar data={chartData} options={{ indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false }}, scales: { x: { ticks: { callback: (v) => `${v}%`}}}}} />
            </CardContent>
        </Card>
    );
};


const EstimateComparisonChart = ({ issues }: { issues: JiraIssue[] }) => {
    const chartData = useMemo(() => {
        const data = issues
            .filter(i => i.time_original_estimate_hours || 0 > 0)
            .sort((a,b) => (b.time_original_estimate_hours || 0) - (a.time_original_estimate_hours || 0))
            .slice(0, 10);
        
        return {
            labels: data.map(d => d.key),
            datasets: [
                {
                    label: 'Original Estimate',
                    data: data.map(d => d.time_original_estimate_hours),
                    backgroundColor: '#8ecae6',
                },
                {
                    label: 'Remaining Estimate',
                    data: data.map(d => {
                        const original = d.time_original_estimate_hours || 0;
                        return d.time_spent_hours ? Math.max(0, original - d.time_spent_hours) : original;
                    }),
                    backgroundColor: '#023047',
                }
            ]
        };
    }, [issues]);

     return (
        <Card>
            <CardHeader><CardTitle className="text-base">Estimate Remaining vs. Original</CardTitle></CardHeader>
            <CardContent className="h-80">
                <Bar data={chartData} options={{ maintainAspectRatio: false, scales: {y: {beginAtZero: true, title: {display: true, text: 'Hours'}}} }} />
            </CardContent>
        </Card>
    );
}

const TimeReportByIssueTable = ({ issues }: { issues: JiraIssue[] }) => {
    const totals = useMemo(() => {
        return issues.reduce((acc, issue) => {
            acc.original += issue.time_original_estimate_hours || 0;
            const remaining = issue.time_spent_hours ? Math.max(0, (issue.time_original_estimate_hours || 0) - issue.time_spent_hours) : (issue.time_original_estimate_hours || 0);
            acc.remaining += remaining;
            acc.logged += issue.time_spent_hours || 0;
            return acc;
        }, { original: 0, remaining: 0, logged: 0 });
    }, [issues]);
    
    return (
        <Card>
            <CardHeader><CardTitle className="text-base">Time Report</CardTitle></CardHeader>
            <CardContent>
                 <div className="overflow-x-auto h-96 border rounded-md">
                    <Table>
                        <TableHeader className="sticky top-0 bg-muted/50">
                            <TableRow>
                                <TableHead>Issue Key</TableHead>
                                <TableHead>Assignee</TableHead>
                                <TableHead>Est. Original</TableHead>
                                <TableHead>Est. Remaining</TableHead>
                                <TableHead>Logged</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             <TableRow className="font-semibold bg-muted/20">
                                <TableCell>Total For All Issues</TableCell>
                                <TableCell></TableCell>
                                <TableCell>{formatHours(totals.original)}</TableCell>
                                <TableCell>{formatHours(totals.remaining)}</TableCell>
                                <TableCell>{formatHours(totals.logged)}</TableCell>
                            </TableRow>
                            {issues.map(issue => (
                                <TableRow key={issue.key}>
                                    <TableCell>{issue.key}</TableCell>
                                    <TableCell>{issue.assignee?.displayName}</TableCell>
                                    <TableCell>{formatHours(issue.time_original_estimate_hours)}</TableCell>
                                    <TableCell>{formatHours(issue.time_spent_hours ? Math.max(0, (issue.time_original_estimate_hours || 0) - issue.time_spent_hours) : (issue.time_original_estimate_hours || 0))}</TableCell>
                                    <TableCell>{formatHours(issue.time_spent_hours)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};


const TimeReportByAssigneeTable = ({ issues }: { issues: JiraIssue[] }) => {
    const dataByAssignee = useMemo(() => {
        const assignees = issues.reduce((acc, issue) => {
            const assignee = issue.assignee?.displayName || 'Unassigned';
            if (!acc[assignee]) {
                acc[assignee] = { original: 0, remaining: 0, logged: 0 };
            }
             acc[assignee].original += issue.time_original_estimate_hours || 0;
            const remaining = issue.time_spent_hours ? Math.max(0, (issue.time_original_estimate_hours || 0) - issue.time_spent_hours) : (issue.time_original_estimate_hours || 0);
            acc[assignee].remaining += remaining;
            acc[assignee].logged += issue.time_spent_hours || 0;

            return acc;
        }, {} as Record<string, {original: number, remaining: number, logged: number}>);

        return Object.entries(assignees).sort(([,a], [,b]) => b.original - a.original);
    }, [issues]);

     return (
        <Card>
            <CardHeader><CardTitle className="text-base">Time Report by Assignee and Sprint</CardTitle></CardHeader>
            <CardContent>
                 <div className="overflow-x-auto h-96 border rounded-md">
                    <Table>
                        <TableHeader className="sticky top-0 bg-muted/50">
                            <TableRow>
                                <TableHead>Assignee</TableHead>
                                <TableHead>Est. Original</TableHead>
                                <TableHead>Est. Remaining</TableHead>
                                <TableHead>Logged</TableHead>
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                            {dataByAssignee.map(([assignee, data]) => (
                                <TableRow key={assignee}>
                                    <TableCell>{assignee}</TableCell>
                                    <TableCell>{formatHours(data.original)}</TableCell>
                                    <TableCell>{formatHours(data.remaining)}</TableCell>
                                    <TableCell>{formatHours(data.logged)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}


export function SprintTimeReport({ issues, allIssues }: { issues: JiraIssue[], allIssues: JiraIssue[] }) {
    const sprints = useMemo(() => {
        const sprintSet = new Set<string>();
        allIssues.forEach(issue => {
            issue.sprint_names?.forEach(sprint => sprintSet.add(sprint));
        });
        return Array.from(sprintSet).sort((a, b) => {
            const aNum = parseInt(a.match(/\d+$/)?.[0] || '0');
            const bNum = parseInt(b.match(/\d+$/)?.[0] || '0');
            if (aNum !== bNum) return bNum - aNum;
            return b.localeCompare(a);
        });
    }, [allIssues]);
    
    const [selectedSprint, setSelectedSprint] = useState<string | null>(null);

    useEffect(() => {
        if (sprints.length > 0) {
            setSelectedSprint(sprints[0]);
        } else {
            setSelectedSprint(null);
        }
    }, [sprints]);

    const sprintIssues = useMemo(() => {
        if (!selectedSprint) return []; // Return empty array if no sprint is selected
        return issues.filter(issue => issue.sprint_names?.includes(selectedSprint));
    }, [selectedSprint, issues]);

    const { originalEstimate, remainingEstimate, percentComplete } = useMemo(() => {
        const original = sprintIssues.reduce((sum, i) => sum + (i.time_original_estimate_hours || 0), 0);
        const remaining = sprintIssues.reduce((sum, i) => {
            const time_spent = i.time_spent_hours || 0;
            const original_est = i.time_original_estimate_hours || 0;
            return sum + Math.max(0, original_est - time_spent);
        }, 0);
        const percent = original > 0 ? ((original - remaining) / original) * 100 : 0;
        return {
            originalEstimate: formatHours(original),
            remainingEstimate: formatHours(remaining),
            percentComplete: `${percent.toFixed(2)}%`
        };
    }, [sprintIssues]);


    if (sprints.length === 0) {
        return <div className="text-center p-8"><p className="text-muted-foreground">No sprint data available for this report.</p></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
                 <h2 className="text-xl font-bold">Sprint Time Report</h2>
                <div className="flex gap-4">
                     <Select value={selectedSprint || undefined} onValueChange={setSelectedSprint}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Select a sprint" /></SelectTrigger>
                        <SelectContent>
                            {sprints.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <KpiCard title="Original Estimate (h)" value={originalEstimate} />
                <KpiCard title="Remaining Estimate (h)" value={remainingEstimate} description={`${percentComplete} complete`}/>
            </div>
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <EstimatePercentageChart issues={sprintIssues} />
                <EstimateComparisonChart issues={sprintIssues} />
             </div>
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <TimeReportByIssueTable issues={sprintIssues} />
                <TimeReportByAssigneeTable issues={sprintIssues} />
             </div>
        </div>
    );
}
