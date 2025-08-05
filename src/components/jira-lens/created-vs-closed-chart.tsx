'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ChartOptions } from 'chart.js';
import { eachDayOfInterval, format, parseISO, startOfDay } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export function CreatedVsClosedChart({ issues }: { issues: JiraIssue[] }) {
    const chartData = useMemo(() => {
        if (!issues || issues.length === 0) {
            return { labels: [], datasets: [] };
        }

        const dates = issues.flatMap(i => {
            const created = i.created ? parseISO(i.created) : null;
            const resolved = i.resolved ? parseISO(i.resolved) : null;
            return [created, resolved];
        }).filter(Boolean) as Date[];
        
        if (dates.length === 0) {
            return { labels: [], datasets: [] };
        }

        const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const endDate = new Date(Math.max(...dates.map(d => d.getTime())));
        
        const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
        const dateLabels = dateRange.map(d => format(d, 'yyyy-MM-dd'));

        const dailyCreated: Record<string, number> = {};
        const dailyClosed: Record<string, number> = {};

        issues.forEach(issue => {
            if (issue.created) {
                const createdDay = format(startOfDay(parseISO(issue.created)), 'yyyy-MM-dd');
                dailyCreated[createdDay] = (dailyCreated[createdDay] || 0) + 1;
            }

            if (issue.resolved) {
                const closedDay = format(startOfDay(parseISO(issue.resolved)), 'yyyy-MM-dd');
                dailyClosed[closedDay] = (dailyClosed[closedDay] || 0) + 1;
            }
        });

        let cumulativeCreated = 0;
        let cumulativeClosed = 0;
        const createdData = dateLabels.map(day => {
            cumulativeCreated += (dailyCreated[day] || 0);
            return cumulativeCreated;
        });
        const closedData = dateLabels.map(day => {
            cumulativeClosed += (dailyClosed[day] || 0);
            return cumulativeClosed;
        });
        

        return {
            labels: dateLabels,
            datasets: [
                {
                    label: 'Cumulative Created',
                    data: createdData,
                    borderColor: '#219ebc',
                    backgroundColor: 'rgba(33, 158, 188, 0.2)',
                    fill: true,
                    tension: 0.1,
                    pointRadius: 0,
                },
                {
                    label: 'Cumulative Closed',
                    data: closedData,
                    borderColor: '#023047',
                    backgroundColor: 'rgba(2, 48, 71, 0.2)',
                    fill: true,
                    tension: 0.1,
                    pointRadius: 0,
                },
            ],
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
                 grid: { display: false }
            },
            y: {
                 grid: { color: 'rgba(200, 200, 200, 0.1)' }
            },
        },
        plugins: {
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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cumulative Created vs. Closed Issues</CardTitle>
                <CardDescription>Tracks the trend of incoming vs. resolved issues over time.</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
                <Line data={chartData} options={options} />
            </CardContent>
        </Card>
    );
}
