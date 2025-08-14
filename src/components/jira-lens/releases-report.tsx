'use client';
import { type JiraIssue, type JiraProject } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "../ui/table";
import { Badge } from "../ui/badge";
import { useMemo, useState, useEffect } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, ChartOptions } from 'chart.js';
import { eachDayOfInterval, format, parseISO } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const HIGH_CONTRAST_COLORS = [
    '#fb8500', '#219ebc', '#023047', '#ffb703', '#8ecae6', 
    '#a8dadc', '#d9ed92', '#e63946', '#f1faee', '#a8dadc', 
    '#457b9d', '#1d3557'
];

const getColor = (index: number) => HIGH_CONTRAST_COLORS[index % HIGH_CONTRAST_COLORS.length];


const IssuesByTypeDonut = ({ issues }: { issues: JiraIssue[] }) => {
    const chartData = useMemo(() => {
        const typeCounts = issues.reduce((acc, issue) => {
            if (issue.issuetype && issue.issuetype.name) {
                const type = issue.issuetype.name;
                acc[type] = (acc[type] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        
        const labels = Object.keys(typeCounts).sort((a,b) => typeCounts[b] - typeCounts[a]);

        return {
            labels,
            datasets: [{
                data: labels.map(l => typeCounts[l]),
                backgroundColor: labels.map((_,i) => getColor(i)),
                hoverBackgroundColor: labels.map((_,i) => getColor(i))
            }]
        }
    }, [issues]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Issues by Type</CardTitle>
                <CardDescription>Distribution of issues by type.</CardDescription>
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
        const dailyData: Record<string, Record<string, number>> = {};
        const issueTypes = [...new Set(issues.map(i => i.issuetype?.name).filter(Boolean))];

        const validIssues = issues.filter(i => i.created);
        if (validIssues.length === 0) return { labels: [], datasets: [] };

        const dates = validIssues.map(i => parseISO(i.created!));
        const dateRange = eachDayOfInterval({ start: new Date(Math.min(...dates.map(d => d.getTime()))), end: new Date(Math.max(...dates.map(d => d.getTime()))) });

        dateRange.forEach(day => {
            const dayString = format(day, 'yyyy-MM-dd');
            dailyData[dayString] = {};
            issueTypes.forEach(type => dailyData[dayString][type] = 0);
        });

        validIssues.forEach(issue => {
            if (!issue.created || !issue.issuetype?.name) return;
            const dayString = format(parseISO(issue.created), 'yyyy-MM-dd');
            const type = issue.issuetype.name;
            if (dailyData[dayString]) {
                dailyData[dayString][type]++;
            }
        });
        
        const labels = Object.keys(dailyData);

        return {
            labels,
            datasets: issueTypes.map((type, index) => ({
                label: type,
                data: labels.map(l => dailyData[l][type] || 0),
                backgroundColor: getColor(index)
            }))
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
        const validIssues = issues.filter(i => i.created);
        if (validIssues.length === 0) return { labels: [], datasets: [] };

        const sortedIssues = validIssues.sort((a,b) => parseISO(a.created!).getTime() - parseISO(b.created!).getTime());
        const labels = sortedIssues.map(i => format(parseISO(i.created!), 'yyyy-MM-dd'));
        const cumulativeData = sortedIssues.map((_, index) => index + 1);

        return {
            labels,
            datasets: [{
                label: 'Cumulative Issues',
                data: cumulativeData,
                borderColor: '#219ebc',
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
                if (!releaseMap[version.name]) {
                    releaseMap[version.name] = { version: version.name, issues: [] };
                }
                releaseMap[version.name].issues.push(issue);
            })
        });
        return Object.values(releaseMap).sort((a,b) => a.version.localeCompare(b.version));
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
                                <TableRow key={`${release.version}-${issue.key}`}>
                                    {index === 0 && <TableCell rowSpan={release.issues.length} className="font-semibold align-top">{release.version}</TableCell>}
                                    <TableCell>{issue.key}</TableCell>
                                    <TableCell>{issue.assignee?.displayName || 'Unassigned'}</TableCell>
                                    <TableCell className="text-right">{issue.time_spent_hours?.toFixed(1) || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant={issue.issuetype.name === 'Bug' ? 'destructive' : 'secondary'}>
                                            {issue.issuetype.name || 'Task'}
                                        </Badge>
                                    </TableCell>
                                     <TableCell>
                                        <Badge variant={issue.status.statusCategory.name === 'Done' ? 'default' : 'outline'}>
                                            {issue.status.name || 'To Do'}
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

export function ReleasesReport({ issues, projects }: { issues: JiraIssue[], projects: JiraProject[] }) {
    
    const [selectedProject, setSelectedProject] = useState<string>('all');
    const [selectedVersion, setSelectedVersion] = useState<string>('all-versions');

    const availableProjects = useMemo(() => {
        const issueProjectKeys = [...new Set(issues.map(i => i.key.split('-')[0]))];
        return projects.filter(p => issueProjectKeys.includes(p.key));
    }, [issues, projects]);

    // Auto-select project if only one is available from the fetched issues
    useEffect(() => {
        if (availableProjects.length === 1) {
            setSelectedProject(availableProjects[0].id);
        } else {
            setSelectedProject('all');
        }
    }, [availableProjects]);
    
    const projectIssues = useMemo(() => {
        if (selectedProject === 'all') return issues;
        const projectKey = projects.find(p => p.id === selectedProject)?.key;
        if (!projectKey) return issues;
        return issues.filter(issue => issue.key.startsWith(`${projectKey}-`));
    }, [issues, selectedProject, projects]);

    const uniqueFixVersions = useMemo(() => {
        const versions = new Set<string>();
        projectIssues.forEach(issue => {
            issue.fix_versions?.forEach(v => versions.add(v.name));
        });
        return Array.from(versions).sort();
    }, [projectIssues]);
    
    // Reset version if it's not in the new list of versions for the selected project
    useEffect(() => {
        if (selectedVersion !== 'all-versions' && !uniqueFixVersions.includes(selectedVersion)) {
            setSelectedVersion('all-versions');
        }
    }, [uniqueFixVersions, selectedVersion]);


    const filteredIssues = useMemo(() => {
        if (selectedVersion === 'all-versions') return projectIssues;
        return projectIssues.filter(issue => issue.fix_versions?.some(v => v.name === selectedVersion));
    }, [projectIssues, selectedVersion]);


    if (!issues || issues.length === 0) {
        return <p>No issue data to display for Releases Report.</p>;
    }
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
                 <h2 className="text-xl font-bold">Releases Report</h2>
                <div className="flex flex-wrap gap-4">
                     <Select value={selectedProject} onValueChange={setSelectedProject}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Select Projects" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Projects</SelectItem>
                             {availableProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={selectedVersion} onValueChange={setSelectedVersion} disabled={uniqueFixVersions.length === 0}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Select Version" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all-versions">All Versions</SelectItem>
                            {uniqueFixVersions.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <IssuesByTypeDonut issues={filteredIssues} />
                 <IssuesOverTimeChart issues={filteredIssues} />
                 <CumulativeIssuesOverTimeChart issues={filteredIssues} />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <DetailedReleaseTable issues={filteredIssues} />
            </div>
        </div>
    );
}
