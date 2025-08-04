'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { format, parseISO } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function WorktimeByDateChart({ issues }: { issues: JiraIssue[] }) {
  const chartData = useMemo(() => {
    const hoursByDate = issues.reduce((acc, issue) => {
      if (issue.time_spent_hours && issue.time_spent_hours > 0) {
        const date = format(parseISO(issue.updated), 'yyyy-MM-dd');
        acc[date] = (acc[date] || 0) + issue.time_spent_hours;
      }
      return acc;
    }, {} as Record<string, number>);

    const sortedDates = Object.entries(hoursByDate).sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime());
    
    const labels = sortedDates.map(([date]) => format(new Date(date), 'MMM dd, eee'));
    const data = sortedDates.map(([, hours]) => hours);

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
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 10 }
        }
      },
      y: {
        beginAtZero: true,
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
          label: (context) => `${context.dataset.label}: ${Number(context.raw).toFixed(2)} hours`,
        },
      },
    },
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Worktime</CardTitle>
            <CardDescription>Total hours logged per day.</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
           <Bar data={chartData} options={options} />
        </CardContent>
    </Card>
  );
}
