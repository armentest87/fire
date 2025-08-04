'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ChartOptions } from 'chart.js';
import { eachMonthOfInterval, format, parseISO, startOfMonth, endOfDay } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const TYPE_COLORS: Record<string, string> = {
    'Support': 'hsl(var(--primary))',
    'Bug': 'hsl(var(--destructive))',
    'New Feature': '#8CC152',
    'Task': '#F6BB42',
    'Story': '#37BC9B',
    'Epic': '#967ADC'
};

export function CreatedIssuesByTypeOverTimeChart({ issues }: { issues: JiraIssue[] }) {
    const chartData = useMemo(() => {
        if (!issues || issues.length === 0) {
            return { labels: [], datasets: [] };
        }

        const dates = issues.map(i => parseISO(i.created));
        const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const endDate = new Date();

        const monthInterval = eachMonthOfInterval({ start: startDate, end: endDate });
        const monthLabels = monthInterval.map(d => format(d, 'MMM yyyy'));

        const monthlyTypedCounts: Record<string, Record<string, number>> = {};

        issues.forEach(issue => {
            const monthKey = format(startOfMonth(parseISO(issue.created)), 'MMM yyyy');
            const type = issue.issuetype || 'Other';

            if (!monthlyTypedCounts[type]) {
                monthlyTypedCounts[type] = {};
            }
            monthlyTypedCounts[type][monthKey] = (monthlyTypedCounts[type][monthKey] || 0) + 1;
        });

        const issueTypes = Object.keys(monthlyTypedCounts);

        const datasets = issueTypes.map((type, index) => {
            const data = monthLabels.map(label => monthlyTypedCounts[type][label] || 0);
            return {
                label: type,
                data,
                borderColor: TYPE_COLORS[type] || `hsl(${220 + index * 40}, 70%, 60%)`,
                backgroundColor: (TYPE_COLORS[type] || `hsl(${220 + index * 40}, 70%, 60%)`).replace(')', ', 0.2)').replace('hsl', 'hsla'),
                fill: false,
                tension: 0.1,
                pointRadius: 2,
            };
        });

        return {
            labels: monthLabels,
            datasets,
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
                     maxTicksLimit: 12
                },
                 grid: { display: false }
            },
            y: {
                 beginAtZero: true,
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
                <CardTitle>Created Issues by Type Over Time</CardTitle>
                <CardDescription>Tracks the volume of different issue types created each month.</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
                <Line data={chartData} options={options} />
            </CardContent>
        </Card>
    );
}
