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
    'To Do': '#ffb703',
    'In Progress': '#219ebc',
    'Done': '#8ecae6',
    'Authorize': '#a8dadc',
    'Awaiting...': '#d9ed92',
    'Backlog': '#023047',
    'Canceled': '#fb8500',
    'Closed': '#9E9E9E',
    'Completed': '#8ecae6',
    'Implementing': '#1a759f',
    'Pending': '#ffb703',
    'Work in progress': '#219ebc'
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
    }).filter(d => d.data.some(v => v > 0));

    const statusData = Object.keys(STATUS_COLORS).map(status => {
      return {
        label: status,
        data: [issues.filter(i => i.status === status).length],
        backgroundColor: STATUS_COLORS[status]
      }
    }).filter(d => d.data[0] > 0);

    return {
        labels: ['Issues'],
        datasets: statusData
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
