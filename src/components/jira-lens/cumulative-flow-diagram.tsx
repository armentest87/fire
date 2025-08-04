'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ChartOptions } from 'chart.js';
import { eachDayOfInterval, format, parseISO, startOfDay } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

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

export function CumulativeFlowDiagram({ issues }: { issues: JiraIssue[] }) {
    const { chartData, kpis } = useMemo(() => {
        if (!issues || issues.length === 0) {
            return { chartData: { labels: [], datasets: [] }, kpis: null };
        }

        const statusTransitions: { date: Date; issueKey: string; from: string | null; to: string }[] = [];
        const statusCategories: Record<string, 'To Do' | 'In Progress' | 'Done'> = {
            'To Do': 'To Do', 'Backlog': 'To Do',
            'In Progress': 'In Progress', 'In Review': 'In Progress', 'Implementing': 'In Progress',
            'Done': 'Done', 'Closed': 'Done', 'Resolved': 'Done', 'Completed': 'Done',
        };

        issues.forEach(issue => {
            issue.changelog.histories.forEach(history => {
                history.items.forEach(item => {
                    if (item.field === 'status') {
                        const fromCategory = item.fromString ? (statusCategories[item.fromString] || 'To Do') : null;
                        const toCategory = item.toString ? (statusCategories[item.toString] || 'To Do') : 'To Do';

                        if(fromCategory !== toCategory) {
                             statusTransitions.push({
                                date: startOfDay(parseISO(history.created)),
                                issueKey: issue.key,
                                from: fromCategory,
                                to: toCategory,
                            });
                        }
                    }
                });
            });
        });

        statusTransitions.sort((a, b) => a.date.getTime() - b.date.getTime());

        const startDate = statusTransitions[0]?.date || new Date();
        const endDate = new Date();
        const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
        const dateLabels = dateRange.map(d => format(d, 'yyyy-MM-dd'));

        const dailyCounts: Record<string, { 'To Do': number; 'In Progress': number; 'Done': number }> = {};
        const issueState: Record<string, 'To Do' | 'In Progress' | 'Done'> = {};

        issues.forEach(issue => {
            issueState[issue.key] = 'To Do';
        });
        
        let transitionIndex = 0;
        dateRange.forEach(day => {
            const dayString = format(day, 'yyyy-MM-dd');

            while(transitionIndex < statusTransitions.length && statusTransitions[transitionIndex].date <= day) {
                const transition = statusTransitions[transitionIndex];
                issueState[transition.issueKey] = transition.to;
                transitionIndex++;
            }
            
            const counts = { 'To Do': 0, 'In Progress': 0, 'Done': 0 };
            Object.values(issueState).forEach(state => {
                counts[state]++;
            });
            dailyCounts[dayString] = counts;
        });

        const toDoData = dateLabels.map(d => dailyCounts[d]['To Do']);
        const inProgressData = dateLabels.map(d => dailyCounts[d]['In Progress']);
        const doneData = dateLabels.map(d => dailyCounts[d]['Done']);
        
        const latestCounts = dailyCounts[dateLabels[dateLabels.length - 1]];
        const totalIssues = issues.length;

        const calculatedKpis = {
            totalIssues,
            currentToDo: latestCounts['To Do'],
            currentToDoPercent: ((latestCounts['To Do'] / totalIssues) * 100).toFixed(1) + '%',
            currentInProgress: latestCounts['In Progress'],
            currentInProgressPercent: ((latestCounts['In Progress'] / totalIssues) * 100).toFixed(1) + '%',
            currentDone: latestCounts['Done'],
            currentDonePercent: ((latestCounts['Done'] / totalIssues) * 100).toFixed(1) + '%',
        };


        return {
            kpis: calculatedKpis,
            chartData: {
                labels: dateLabels,
                datasets: [
                    {
                        label: 'Done',
                        data: doneData,
                        backgroundColor: 'rgba(102, 187, 106, 0.6)', // hsl(var(--secondary)) with opacity
                        borderColor: 'hsl(var(--secondary-foreground))',
                        fill: true,
                        pointRadius: 0,
                        tension: 0.1,
                    },
                    {
                        label: 'In Progress',
                        data: inProgressData,
                        backgroundColor: 'rgba(66, 165, 245, 0.6)', // hsl(var(--primary)) with opacity
                        borderColor: 'hsl(var(--primary-foreground))',
                        fill: true,
                        pointRadius: 0,
                        tension: 0.1,
                    },
                     {
                        label: 'To Do',
                        data: toDoData,
                        backgroundColor: 'rgba(255, 167, 38, 0.6)', // Orange
                        borderColor: '#FF9800',
                        fill: true,
                        pointRadius: 0,
                        tension: 0.1,
                    },
                ],
            }
        };

    }, [issues]);

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'category',
                ticks: {
                     maxRotation: 90,
                     minRotation: 45,
                     autoSkip: true,
                     maxTicksLimit: 20
                },
                 grid: {
                    display: false,
                 }
            },
            y: {
                stacked: true,
                 grid: {
                    color: 'rgba(200, 200, 200, 0.1)'
                 }
            },
        },
        plugins: {
            filler: {
                propagate: true
            },
            legend: {
                position: 'top',
                align: 'end'
            },
        },
        interaction: {
            mode: 'index',
            intersect: false,
        }
    };

    if (!kpis) {
         return (
            <div className="flex items-center justify-center h-full p-8 bg-card rounded-lg shadow-md border">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Not Enough Data</h2>
                <p className="text-muted-foreground">Cannot generate a Cumulative Flow Diagram without any issues.</p>
              </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard title="Total Issues" value={kpis.totalIssues} />
                <KpiCard title="Current To Do" value={kpis.currentToDo} description={kpis.currentToDoPercent}/>
                <KpiCard title="Current In Progress" value={kpis.currentInProgress} description={kpis.currentInProgressPercent}/>
                <KpiCard title="Current Done" value={kpis.currentDone} description={kpis.currentDonePercent}/>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Cumulative Flow Diagram</CardTitle>
                    <CardDescription>Visualizes the flow of work through different stages over time.</CardDescription>
                </CardHeader>
                <CardContent className="h-[500px]">
                    <Line data={chartData} options={options} />
                </CardContent>
            </Card>
        </div>
    );
}
