'use client';
import { type JiraIssue } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "../ui/table";
import { Badge } from "../ui/badge";
import { useMemo } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, ChartOptions } from 'chart.js';
import { eachDayOfInterval, format, parseISO, startOfDay, eachMonthOfInterval, startOfMonth } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const IssuesByTypeDonut = ({ issues }: { issues: JiraIssue[] }) => {
    const chartData = useMemo(() => {
        const typeCounts = issues.reduce((acc, issue) => {
            const type = issue.issuetype === 'Bug' ? 'Bug' : 'Task';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            labels: Object.keys(typeCounts),
            datasets: [{
                data: Object.values(typeCounts),
                backgroundColor: ['#DA4453', '#5D9CEC'],
                hoverBackgroundColor: ['#E9573F', '#4A89DC']
            }]
        }
    }, [issues]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Issues by Type</CardTitle>
                <CardDescription>Distribution of issues by type (Task vs. Bug).</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-64">
                    <Doughnut data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom'}}}} />
                </div>
            </CardContent>
        </Card>
    )
}

const IssuesOverTimeChart = ({ issues }: { issues: JiraIssue[] }) => {
    const chartData = useMemo(() => {
        const dailyData: Record<string, { Bug: number, Task: number }> = {};
        const dates = issues.map(i => parseISO(i.created));
        if (dates.length === 0) return { labels: [], datasets: [] };
        
        const dateRange = eachDayOfInterval({ start: new Date(Math.min(...dates.map(d => d.getTime()))), end: new Date(Math.max(...dates.map(d => d.getTime()))) });

        dateRange.forEach(day => {
            const dayString = format(day, 'yyyy-MM-dd');
            dailyData[dayString] = { Bug: 0, Task: 0 };
        });

        issues.forEach(issue => {
            const dayString = format(parseISO(issue.created), 'yyyy-MM-dd');
            const type = issue.issuetype === 'Bug' ? 'Bug' : 'Task';
            if (dailyData[dayString]) {
                dailyData[dayString][type]++;
            }
        });
        
        const labels = Object.keys(dailyData);

        return {
            labels,
            datasets: [
                { label: 'Bug', data: labels.map(l => dailyData[l].Bug), backgroundColor: '#DA4453' },
                { label: 'Task', data: labels.map(l => dailyData[l].Task), backgroundColor: '#5D9CEC' },
            ]
        }
    }, [issues]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Issues Over Time</CardTitle>
                <CardDescription>Daily breakdown of created issues by type.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-64">
                    <Bar data={chartData} options={{ maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } }, plugins: { legend: { position: 'bottom' }}}} />
                </div>
            </CardContent>
        </Card>
    );
}

const CumulativeIssuesOverTimeChart = ({ issues }: { issues: JiraIssue[] }) => {
    const chartData = useMemo(() => {
         if (issues.length === 0) return { labels: [], datasets: [] };

        const sortedIssues = issues.sort((a,b) => parseISO(a.created).getTime() - parseISO(b.created).getTime());
        const labels = sortedIssues.map(i => format(parseISO(i.created), 'yyyy-MM-dd'));
        const cumulativeData = sortedIssues.map((_, index) => index + 1);

        return {
            labels,
            datasets: [{
                label: 'Cumulative Issues',
                data: cumulativeData,
                borderColor: 'hsl(var(--primary))',
                fill: false,
                tension: 0.1,
                pointRadius: 0,
            }]
        }
    }, [issues]);
    
    return (
         <Card>
            <CardHeader>
                <CardTitle>Cumulative Issues Over Time</CardTitle>
                <CardDescription>Cumulative growth of issues over time.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-64">
                    <Line data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false }}}} />
                </div>
            </CardContent>
        </Card>
    )
}

const DetailedReleaseTable = ({ issues }: { issues: JiraIssue[] }) => {
    const releases = useMemo(() => {
        const releaseMap: Record<string, { version: string, issues: JiraIssue[] }> = {};
        issues.forEach(issue => {
            issue.fix_versions?.forEach(version => {
                if (!releaseMap[version]) {
                    releaseMap[version] = { version, issues: [] };
                }
                releaseMap[version].issues.push(issue);
            })
        });
        return Object.values(releaseMap);
    }, [issues]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Detailed Release Information</CardTitle>
                <CardDescription>Granular details for each version and issue.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md overflow-auto h-96">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Version</TableHead>
                                <TableHead>Issue</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead className="text-right">Logged (h)</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {releases.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-full text-center text-muted-foreground">
                                        No release data in the selected issues.
                                    </TableCell>
                                </TableRow>
                            )}
                            {releases.map(release => release.issues.map((issue, index) => (
                                <TableRow key={issue.key}>
                                    {index === 0 && <TableCell rowSpan={release.issues.length} className="font-semibold align-top">{release.version}</TableCell>}
                                    <TableCell>{issue.key}</TableCell>
                                    <TableCell>{issue.assignee}</TableCell>
                                    <TableCell className="text-right">{issue.time_spent_hours?.toFixed(1) || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant={issue.issuetype === 'Bug' ? 'destructive' : 'secondary'}>
                                            {issue.issuetype}
                                        </Badge>
                                    </TableCell>
                                     <TableCell>
                                        <Badge variant={issue.status_category === 'Done' ? 'default' : 'outline'}>
                                            {issue.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            )))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export function ReleasesReport({ issues }: { issues: JiraIssue[] }) {
    if (!issues || issues.length === 0) {
        return <p>No issue data to display for Releases Report.</p>;
    }
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
                 <h2 className="text-xl font-bold">Releases Report</h2>
                <div className="flex flex-wrap gap-4">
                     <Select defaultValue="all-projects">
                        <SelectTrigger className="w-48"><SelectValue placeholder="Select Projects" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all-projects">BI Cloud & Server</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select defaultValue="all-versions">
                        <SelectTrigger className="w-48"><SelectValue placeholder="Select Version" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all-versions">All Versions</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="released">
                        <SelectTrigger className="w-48"><SelectValue placeholder="Release Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="released">Released</SelectItem>
                            <SelectItem value="unreleased">Unreleased</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select defaultValue="not-archived">
                        <SelectTrigger className="w-48"><SelectValue placeholder="Archived Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="not-archived">Not Archived</SelectItem>
                             <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <IssuesByTypeDonut issues={issues} />
                 <IssuesOverTimeChart issues={issues} />
                 <CumulativeIssuesOverTimeChart issues={issues} />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <DetailedReleaseTable issues={issues} />
            </div>
        </div>
    );
}
