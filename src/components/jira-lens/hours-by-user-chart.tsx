'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function HoursByUserChart({ issues }: { issues: JiraIssue[] }) {
  const chartData = useMemo(() => {
    const hoursByAssignee = issues.reduce((acc, issue) => {
      if (issue.assignee && issue.time_spent_hours) {
        acc[issue.assignee] = (acc[issue.assignee] || 0) + issue.time_spent_hours;
      }
      return acc;
    }, {} as Record<string, number>);

    const sortedAssignees = Object.entries(hoursByAssignee).sort(([, a], [, b]) => b - a);
    
    const labels = sortedAssignees.map(([assignee]) => assignee);
    const data = sortedAssignees.map(([, hours]) => hours);

    return {
      labels,
      datasets: [
        {
          label: 'Hours Logged',
          data,
          backgroundColor: '#219ebc',
          borderColor: '#219ebc',
          borderWidth: 1,
          barThickness: 15,
        },
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
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 10 }
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
            font: { size: 10 }
        }
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw.toFixed(2)} hours`,
        },
      },
    },
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Users' Worktime</CardTitle>
            <CardDescription>Total hours logged by each team member.</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
           <Bar data={chartData} options={options} />
        </CardContent>
    </Card>
  );
}
