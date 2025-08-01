'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Info } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ProjectProgressChartProps {
  issues: JiraIssue[];
}

const STATUS_COLORS: Record<string, string> = {
    'To Do': '#F9A825',
    'In Progress': '#2196F3',
    'Done': '#4CAF50',
    'Authorize': '#9C27B0',
    'Awaiting...': '#FF9800',
    'Backlog': '#607D8B',
    'Canceled': '#F44336',
    'Closed': '#9E9E9E',
    'Completed': '#4CAF50',
    'Implementing': '#00BCD4',
    'Pending': '#FFC107',
    'Work in progress': '#2196F3'
};


export function ProjectProgressChart({ issues }: ProjectProgressChartProps) {
  const chartData = useMemo(() => {
    const statusCounts = issues.reduce((acc, issue) => {
      const status = issue.status;
      if (!acc[status]) {
        acc[status] = { 'To Do': 0, 'In Progress': 0, 'Done': 0 };
      }
      acc[status][issue.status_category]++;
      return acc;
    }, {} as Record<string, Record<'To Do' | 'In Progress' | 'Done', number>>);

    const labels = Object.keys(statusCounts);
    const datasets = Object.keys(STATUS_COLORS).map(status => {
        return {
            label: status,
            data: labels.map(label => statusCounts[label]?.[status as any] ?? 0),
            backgroundColor: STATUS_COLORS[status],
            barThickness: 20,
        };
    }).filter(d => d.data.some(v => v > 0)); // Only include statuses that have data

    const statusTotals = labels.map(label => {
        return Object.values(statusCounts[label]).reduce((sum, val) => sum + val, 0);
    });

    const toDoTotals = labels.map(label => statusCounts[label]['To Do']);
    const inProgressTotals = labels.map(label => statusCounts[label]['In Progress']);
    const doneTotals = labels.map(label => statusCounts[label]['Done']);

    return {
        labels: ['To Do', 'In Progress', 'Done'],
        datasets: [
            {
                label: 'To Do',
                data: [issues.filter(i => i.status === 'To Do').length],
                backgroundColor: '#FFA726'
            },
            {
                label: 'In Progress',
                data: [issues.filter(i => i.status === 'In Progress').length],
                backgroundColor: '#42A5F5'
            },
            {
                label: 'Done',
                data: [issues.filter(i => i.status === 'Done').length],
                backgroundColor: '#66BB6A'
            },
            {
                label: 'Authorize',
                data: [issues.filter(i => i.status === 'Authorize').length],
                backgroundColor: STATUS_COLORS['Authorize']
            },
             {
                label: 'Awaiting...',
                data: [issues.filter(i => i.status === 'Awaiting...').length],
                backgroundColor: STATUS_COLORS['Awaiting...']
            },
             {
                label: 'Backlog',
                data: [issues.filter(i => i.status === 'Backlog').length],
                backgroundColor: STATUS_COLORS['Backlog']
            },
            {
                label: 'Canceled',
                data: [issues.filter(i => i.status === 'Canceled').length],
                backgroundColor: STATUS_COLORS['Canceled']
            },
             {
                label: 'Closed',
                data: [issues.filter(i => i.status === 'Closed').length],
                backgroundColor: STATUS_COLORS['Closed']
            },
             {
                label: 'Completed',
                data: [issues.filter(i => i.status === 'Completed').length],
                backgroundColor: STATUS_COLORS['Completed']
            },
             {
                label: 'Implementing',
                data: [issues.filter(i => i.status === 'Implementing').length],
                backgroundColor: STATUS_COLORS['Implementing']
            }
        ]
    };
  }, [issues]);

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
         ticks: {
            font: { size: 10 }
        }
      },
      y: {
        stacked: true,
        grid: { display: false },
         ticks: {
            font: { size: 12, weight: 'bold' as const }
        }
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { boxWidth: 12, font: {size: 10} }
      },
      tooltip: {
        callbacks: {
           label: function(context: any) {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed.x !== null) {
                    label += context.parsed.x;
                }
                return label;
            }
        }
      }
    },
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Project Progress</CardTitle>
        <Info className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent className="h-[240px]">
        <Bar data={chartData as any} options={options as any} />
      </CardContent>
    </Card>
  );
}
