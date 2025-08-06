'use client';
import { type JiraIssue } from "@/lib/types";
import { useState, useMemo, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { UserWorkloadReport } from "./user-workload-report";
import { OpenIssuesReport } from "./open-issues-report";
import { IssuesByStatusChart } from "./issues-by-status-chart";
import { CreatedIssuesByTypePie } from "./created-issues-by-type-pie";
import { IssuesByPriorityChart } from "./issues-by-priority-chart";
import { TimeToResolutionChart } from "./time-to-resolution-chart";
import { cn } from "@/lib/utils";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const KpiCard = ({ title, value, description, descriptionColor }: { title: string; value: string | number; description?: string, descriptionColor?: string }) => (
    <Card className="shadow-sm">
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-2xl font-bold">{value}</p>
            {description && <p className={cn("text-xs", descriptionColor || "text-muted-foreground")}>{description}</p>}
        </CardContent>
    </Card>
);

const TimeSpentByTypeChart = ({issues}: {issues: JiraIssue[]}) => {
    const chartData = useMemo(() => {
         const timeByTpe = issues.reduce((acc, issue) => {
            const type = issue.issuetype?.name || 'Other';
            if (!acc[type]) {
                acc[type] = 0;
            }
            acc[type] += issue.time_spent_hours || 0;
            return acc;
        }, {} as Record<string, number>);

        const labels = Object.keys(timeByTpe);
        const data = Object.values(timeByTpe);

        return {
            labels,
            datasets: [{
                label: 'Time Spent (hours)',
                data,
                backgroundColor: ['#219ebc', '#fb8500', '#8ecae6', '#ffb703'],
            }]
        }
    }, [issues]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Time Spent by Issue Type</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
                <Bar data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false }}, scales: { y: { title: { text: 'Hours', display: true}}}}} />
            </CardContent>
        </Card>
    )
}

export function SprintAnalysis({ issues, allIssues }: { issues: JiraIssue[]; allIssues: JiraIssue[] }) {
    const sprints = useMemo(() => {
        const sprintSet = new Set<string>();
        allIssues.forEach(issue => {
            issue.sprint_names?.forEach(sprint => sprintSet.add(sprint));
        });
        return Array.from(sprintSet).sort((a, b) => {
             const aNum = parseInt(a.match(/\d+$/)?.[0] || '0');
             const bNum = parseInt(b.match(/\d+$/)?.[0] || '0');
             if (aNum !== bNum) return aNum - bNum;
             return a.localeCompare(b);
        });
    }, [allIssues]);

    const [selectedSprint, setSelectedSprint] = useState<string | null>(null);
    
    useEffect(() => {
        if (!selectedSprint && sprints.length > 0) {
            setSelectedSprint(sprints[sprints.length - 1]);
        } else if (sprints.length === 0) {
            setSelectedSprint(null);
        }
    }, [sprints, selectedSprint]);

    const sprintIssues = useMemo(() => {
        if (!selectedSprint) return [];
        return issues.filter(issue => issue.sprint_names?.includes(selectedSprint));
    }, [selectedSprint, issues]);


    const sprintData = useMemo(() => {
        if (!selectedSprint || sprintIssues.length === 0) return null;
        
        const committedStoryPoints = sprintIssues.reduce((sum, i) => sum + (i.story_points || 0), 0);
        const completedIssues = sprintIssues.filter(i => i.status?.statusCategory?.name === 'Done');
        const completedStoryPoints = completedIssues.reduce((sum, i) => sum + (i.story_points || 0), 0);

        const originalEstimate = sprintIssues.reduce((sum, i) => sum + (i.time_original_estimate_hours || 0), 0);
        const remainingEstimate = sprintIssues.reduce((sum, i) => {
             const remaining = i.time_spent_hours ? Math.max(0, (i.time_original_estimate_hours || 0) - i.time_spent_hours) : (i.time_original_estimate_hours || 0);
             return sum + remaining;
        }, 0);
        const percentComplete = originalEstimate > 0 ? ((originalEstimate - remainingEstimate) / originalEstimate * 100) : 0;

        return {
            totalIssues: sprintIssues.length,
            completedIssues: completedIssues.length,
            committedStoryPoints,
            completedStoryPoints,
            originalEstimate: `${originalEstimate.toFixed(0)}h`,
            remainingEstimate: `${remainingEstimate.toFixed(1)}h`,
            percentComplete: percentComplete
        };
    }, [selectedSprint, sprintIssues]);


    const historicalVelocityData = useMemo(() => {
        const velocityBySprint: Record<string, number> = {};
        sprints.forEach(sprint => {
            const sprintIssuesForVelocity = allIssues.filter(issue => issue.sprint_names?.includes(sprint) && issue.status?.statusCategory?.name === 'Done');
            velocityBySprint[sprint] = sprintIssuesForVelocity.reduce((sum, i) => sum + (i.story_points || 0), 0);
        });
        const labels = Object.keys(velocityBySprint);
        return {
            labels,
            datasets: [{
                label: 'Completed Story Points',
                data: labels.map(l => velocityBySprint[l]),
                backgroundColor: '#219ebc',
                borderColor: '#219ebc',
            }]
        }
    }, [allIssues, sprints]);
    
    const burndownData = useMemo(() => {
        if (!sprintData) return null;
        const totalPoints = sprintData.committedStoryPoints;
        const labels = ['Start', 'End'];
        const data = [totalPoints, totalPoints - sprintData.completedStoryPoints];
        
        return {
            labels,
            datasets: [
                {
                    label: 'Ideal Burndown',
                    data: [totalPoints, 0],
                    borderColor: '#fb8500',
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.1,
                    type: 'line' as const,
                    pointRadius: 0,
                },
                {
                    label: 'Actual Burndown',
                    data,
                    backgroundColor: '#219ebc',
                    borderColor: '#219ebc',
                    fill: false,
                    tension: 0.1,
                    type: 'line' as const
                },
            ]
        }
    }, [sprintData]);

    if (sprints.length === 0) {
        return (
            <div className="flex items-center justify-center h-full p-8 bg-card rounded-lg shadow-md border">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">No Sprint Data</h2>
                <p className="text-muted-foreground">The current issues do not contain any sprint information.</p>
              </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
                 <h2 className="text-xl font-bold">Sprint Analysis</h2>
                <div className="flex gap-4">
                     <Select value={selectedSprint || undefined} onValueChange={setSelectedSprint}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Select a sprint" /></SelectTrigger>
                        <SelectContent>
                            {sprints.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
           
            {selectedSprint && sprintData ? (
                <div className="space-y-6 animate-fade-in">
                     <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                        <KpiCard title="Start Date" value="02.08.2023" />
                        <KpiCard title="End Date" value="17.08.2023" />
                        <KpiCard title="Sprint Duration" value="15 days" />
                        <KpiCard title="Overdue" value="1 day" description="overdue" descriptionColor="text-red-500" />
                        <KpiCard title="Original Estimate" value={sprintData.originalEstimate} />
                        <KpiCard 
                            title="Remaining Estimate" 
                            value={sprintData.remainingEstimate} 
                            description={`${sprintData.percentComplete.toFixed(1)}% complete`}
                            descriptionColor={sprintData.percentComplete > 50 ? "text-green-500" : "text-orange-500"}
                        />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                         <Card>
                            <CardHeader>
                                <CardTitle>Historical Sprint Velocity</CardTitle>
                                <CardDescription>Completed story points from previous sprints.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-72">
                                <Bar data={historicalVelocityData} options={{ maintainAspectRatio: false, scales: {y: {beginAtZero: true, title: {display: true, text: 'Story Points'}}} }} />
                            </CardContent>
                        </Card>
                        {burndownData && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sprint Burndown Chart</CardTitle>
                                     <CardDescription>Ideal vs. actual burndown of story points.</CardDescription>
                                </Header>
                                <CardContent className="h-72">
                                    <Line data={burndownData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, title: {display: true, text: 'Story Points Remaining'}}} }} />
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <IssuesByStatusChart issues={sprintIssues} />
                        <CreatedIssuesByTypePie issues={sprintIssues} />
                        <IssuesByPriorityChart issues={sprintIssues} />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <TimeSpentByTypeChart issues={sprintIssues} />
                        <TimeToResolutionChart issues={sprintIssues} />
                    </div>
                    
                    <div className="space-y-6">
                        <UserWorkloadReport issues={sprintIssues} />
                        <OpenIssuesReport issues={sprintIssues} />
                    </div>
                </div>
            ) : (
                 <div className="flex items-center justify-center h-full p-8 bg-card rounded-lg shadow-md border">
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold mb-2">No Sprint Selected</h2>
                        <p className="text-muted-foreground">Select a sprint from the dropdown to see the detailed analysis.</p>
                    </div>
                 </div>
            )}
        </div>
    );
}
