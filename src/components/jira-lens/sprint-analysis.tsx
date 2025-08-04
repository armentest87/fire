'use client';
import { type JiraIssue } from "@/lib/types";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Info } from "lucide-react";
import { UserWorkloadReport } from "./user-workload-report";
import { OpenIssuesReport } from "./open-issues-report";
import { IssuesByPriorityChart } from "./issues-by-priority-chart";
import { IssuesByTypeChart } from "./issues-by-type-chart";
import { IssuesByStatusChart } from "./issues-by-status-chart";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

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

export function SprintAnalysis({ issues }: { issues: JiraIssue[] }) {
    const sprints = useMemo(() => {
        const sprintSet = new Set<string>();
        issues.forEach(issue => {
            issue.sprint_names?.forEach(sprint => sprintSet.add(sprint));
        });
        // Sort sprints, assuming a "Sprint X" format
        return Array.from(sprintSet).sort((a, b) => {
            const aNum = parseInt(a.split(' ')[1] || '0');
            const bNum = parseInt(b.split(' ')[1] || '0');
            return aNum - bNum;
        });
    }, [issues]);

    const [selectedSprint, setSelectedSprint] = useState<string | null>(sprints.length > 0 ? sprints[sprints.length-1] : null);

    const sprintIssues = useMemo(() => {
        if (!selectedSprint) return [];
        return issues.filter(issue => issue.sprint_names?.includes(selectedSprint));
    }, [selectedSprint, issues]);


    const sprintData = useMemo(() => {
        if (!selectedSprint || sprintIssues.length === 0) return null;
        
        const committedStoryPoints = sprintIssues.reduce((sum, i) => sum + (i.story_points || 0), 0);
        const completedIssues = sprintIssues.filter(i => i.status_category === 'Done');
        const completedStoryPoints = completedIssues.reduce((sum, i) => sum + (i.story_points || 0), 0);

        const originalEstimate = sprintIssues.reduce((sum, i) => sum + (i.time_original_estimate_hours || 0), 0);
        const remainingEstimate = sprintIssues.reduce((sum, i) => {
             const remaining = i.time_spent_hours ? Math.max(0, (i.time_original_estimate_hours || 0) - i.time_spent_hours) : (i.time_original_estimate_hours || 0);
             return sum + remaining;
        }, 0);


        return {
            totalIssues: sprintIssues.length,
            completedIssues: completedIssues.length,
            committedStoryPoints,
            completedStoryPoints,
            originalEstimate: `${originalEstimate.toFixed(0)}h`,
            remainingEstimate: `${remainingEstimate.toFixed(1)}h`,
            percentComplete: originalEstimate > 0 ? ((originalEstimate - remainingEstimate) / originalEstimate * 100).toFixed(1) : 0
        };
    }, [selectedSprint, sprintIssues]);


    const historicalVelocityData = useMemo(() => {
        const velocityBySprint: Record<string, number> = {};
        sprints.forEach(sprint => {
            const aSprintIssues = issues.filter(issue => issue.sprint_names?.includes(sprint) && issue.status_category === 'Done');
            velocityBySprint[sprint] = aSprintIssues.reduce((sum, i) => sum + (i.story_points || 0), 0);
        });
        const labels = Object.keys(velocityBySprint);
        return {
            labels,
            datasets: [{
                label: 'Completed Story Points',
                data: labels.map(l => velocityBySprint[l]),
                backgroundColor: 'hsl(var(--primary))',
                barThickness: 20,
            }]
        }
    }, [issues, sprints]);
    
    const burndownData = useMemo(() => {
        if (!sprintData) return null;
        // This is a simplified burndown. A real one would track remaining points day-by-day.
        const totalPoints = sprintData.committedStoryPoints;
        const labels = ['Start', 'End'];
        const data = [totalPoints, totalPoints - sprintData.completedStoryPoints];
        
        return {
            labels,
            datasets: [
                {
                    label: 'Ideal Burndown',
                    data: [totalPoints, 0],
                    borderColor: 'hsl(var(--destructive))',
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.1,
                    type: 'line' as const
                },
                {
                    label: 'Actual Burndown',
                    data,
                    backgroundColor: 'hsl(var(--primary))',
                    borderColor: 'hsl(var(--primary))',
                    fill: false,
                    tension: 0.1,
                    type: 'line' as const
                },
            ]
        }
    }, [sprintData]);

    if(sprints.length === 0) {
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
                    {/* Placeholder for Sprint State filter */}
                    <Select defaultValue="active">
                        <SelectTrigger className="w-48"><SelectValue placeholder="Sprint State" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Active Sprints</SelectItem>
                            <SelectItem value="completed">Completed Sprints</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
           
            {selectedSprint && sprintData ? (
                <div className="space-y-6">
                     <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                        <KpiCard title="Start Date" value="02.08.2023" />
                        <KpiCard title="End Date" value="17.08.2023" />
                        <KpiCard title="Sprint Duration" value="15 days" />
                        <KpiCard title="Overdue" value="1 day" />
                        <KpiCard title="Original Estimate" value={sprintData.originalEstimate} />
                        <KpiCard title="Remaining Estimate" value={sprintData.remainingEstimate} description={`${sprintData.percentComplete}% complete`} />
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
                                </CardHeader>
                                <CardContent className="h-72">
                                    <Line data={burndownData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, title: {display: true, text: 'Story Points Remaining'}}} }} />
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <IssuesByStatusChart issues={sprintIssues} />
                        <IssuesByTypeChart issues={sprintIssues} />
                        <IssuesByPriorityChart issues={sprintIssues} />
                    </div>
                    
                    <div className="space-y-6">
                        <UserWorkloadReport issues={sprintIssues} />
                        <OpenIssuesReport issues={sprintIssues} />
                    </div>
                </div>
            ) : (
                 <div className="text-center p-8">
                    <p className="text-muted-foreground">Select a sprint to see the detailed analysis.</p>
                 </div>
            )}
        </div>
    )
}
