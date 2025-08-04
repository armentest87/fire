'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ChartOptions } from 'chart.js';
import { eachDayOfInterval, format, parseISO, startOfDay } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export function CreatedIssuesOverTimeChart({ issues }: { issues: JiraIssue[] }) {
    const chartData = useMemo(() => {
        if (!issues || issues.length === 0) {
            return { labels: [], datasets: [] };
        }

        const dates = issues.map(i => parseISO(i.created));
        const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const endDate = new Date(Math.max(...dates.map(d => d.getTime())));
        
        const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
        const dateLabels = dateRange.map(d => format(d, 'yyyy-MM-dd'));

        const dailyCreated: Record<string, number> = {};

        issues.forEach(issue => {
            const createdDay = format(startOfDay(parseISO(issue.created)), 'yyyy-MM-dd');
            dailyCreated[createdDay] = (dailyCreated[createdDay] || 0) + 1;
        });

        const createdData = dateLabels.map(day => dailyCreated[day] || 0);

        return {
            labels: dateLabels,
            datasets: [
                {
                    label: 'Issues Created',
                    data: createdData,
                    borderColor: 'hsl(var(--primary))',
                    backgroundColor: 'hsla(var(--primary), 0.2)',
                    fill: false,
                    tension: 0.1,
                    pointRadius: 1,
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
                 grid: { color: 'rgba(200, 200, 200, 0.1)' },
                 title: {
                     display: true,
                     text: 'Number of Issues Created'
                 }
            },
        },
        plugins: {
            legend: {
                display: false
            },
        },
        interaction: {
            mode: 'index',
            intersect: false,
        }
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Issues Created Over Time</CardTitle>
                <CardDescription>Tracks the daily volume of incoming issues.</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
                <Line data={chartData} options={options} />
            </CardContent>
        </Card>
    );
}
