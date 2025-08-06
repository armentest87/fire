'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { parseISO as dateFnsParseISO } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TARGET_HOURS = {
    'Default': 48,
}

type GroupByKey = 'priority' | 'issuetype' | 'assignee';

const getData = (issues: JiraIssue[], groupBy: GroupByKey) => {
    const resolvedIssues = issues.filter(i => i.resolved && i.created);
    const grouped = resolvedIssues.reduce((acc, issue) => {
        let key: string | undefined;
        if (groupBy === 'assignee') {
            key = issue.assignee?.displayName;
        } else {
            key = issue[groupBy]?.name;
        }
        key = key || 'Unassigned';

        if (!acc[key]) {
            acc[key] = { totalHours: 0, count: 0 };
        }
        if (issue.resolved && issue.created) {
             const resolutionHours = (dateFnsParseISO(issue.resolved).getTime() - dateFnsParseISO(issue.created).getTime()) / (1000 * 3600);
             acc[key].totalHours += resolutionHours;
             acc[key].count++;
        }
        return acc;
    }, {} as Record<string, { totalHours: number, count: number }>);

    return Object.entries(grouped).map(([key, data]) => ({
        key,
        avgHours: data.totalHours / data.count,
    })).sort((a,b) => b.avgHours - a.avgHours).slice(0, 10);
}

export function TimeToResolutionChart({ issues }: { issues: JiraIssue[] }) {
    
  const chartData = useMemo(() => {
    const byAssignee = getData(issues, 'assignee');
    
    const actualData = byAssignee.map(d => d.avgHours);
    const targetData = byAssignee.map(() => TARGET_HOURS.Default);


    return {
      labels: byAssignee.map(d => d.key),
      datasets: [
        {
          label: 'Actual Hours',
          data: actualData,
          backgroundColor: '#fb8500',
          barThickness: 15,
        },
        {
          label: 'Target Hours',
          data: targetData,
          backgroundColor: '#219ebc',
          barThickness: 15,
        }
      ],
    };
  }, [issues]);

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: 'Average Hours to Resolution'},
        grid: { display: false }
      },
      y: {
        grid: { display: false }
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Average Time to Resolution</CardTitle>
            <CardDescription>Actual vs. target resolution times by assignee.</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
           <Bar data={chartData} options={options} />
        </CardContent>
    </Card>
  );
}

function parseISO(arg0: string): Date {
    return new Date(arg0);
}
