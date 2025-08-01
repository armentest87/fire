'use client';
import { type JiraIssue } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useMemo } from "react";
import { eachDayOfInterval, format, startOfDay } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);


interface CfdChartProps {
  issues: JiraIssue[];
}

const STATUS_ORDER: ('To Do' | 'In Progress' | 'Done')[] = ['To Do', 'In Progress', 'Done'];
const STATUS_COLORS: Record<string, { border: string; background: string; }> = {
    'To Do':       { border: 'rgba(100, 255, 218, 1)', background: 'rgba(100, 255, 218, 0.5)' }, // Mint
    'In Progress': { border: 'rgba(167, 139, 250, 1)', background: 'rgba(167, 139, 250, 0.5)' }, // Lavender
    'Done':        { border: 'rgba(96, 165, 250, 1)', background: 'rgba(96, 165, 250, 0.5)' }, // Soft Blue
};

export function CfdChart({ issues }: CfdChartProps) {

  const chartData = useMemo(() => {
    if (!issues || issues.length === 0) return null;

    let allChanges: { date: Date; key: string; status_category: 'To Do' | 'In Progress' | 'Done' }[] = [];
    
    issues.forEach(issue => {
      allChanges.push({
        date: startOfDay(new Date(issue.created)),
        key: issue.key,
        status_category: 'To Do',
      });

      issue.changelog.histories.forEach(history => {
        history.items.forEach(item => {
          if (item.field === 'status') {
             const statusCategory = item.toString === 'Done' || item.toString === 'Closed' ? 'Done' : (item.toString === 'In Progress' || item.toString === 'In Review' ? 'In Progress' : 'To Do');
             allChanges.push({
               date: startOfDay(new Date(history.created)),
               key: issue.key,
               status_category: statusCategory,
             });
          }
        });
      });
    });

    if (allChanges.length === 0) return null;
    
    allChanges.sort((a, b) => a.date.getTime() - b.date.getTime());

    const minDate = allChanges[0].date;
    const maxDate = startOfDay(new Date());
    
    if (minDate > maxDate) return null;
    
    const dateRange = eachDayOfInterval({ start: minDate, end: maxDate });

    const dailySnapshots: Record<string, Record<string, number>> = {};

    for (const day of dateRange) {
        const dayStr = format(day, 'yyyy-MM-dd');
        if (!dailySnapshots[dayStr]) dailySnapshots[dayStr] = { 'To Do': 0, 'In Progress': 0, 'Done': 0 };

        for(const issue of issues) {
            if (startOfDay(new Date(issue.created)) > day) continue;

            let statusForDay: 'To Do' | 'In Progress' | 'Done' = 'To Do';
            for(const change of allChanges.filter(c => c.key === issue.key)) {
                if(change.date <= day) {
                    statusForDay = change.status_category;
                } else {
                    break;
                }
            }
            dailySnapshots[dayStr][statusForDay]++;
        }
    }


    const dataByStatus: Record<string, number[]> = {
        'To Do': [],
        'In Progress': [],
        'Done': [],
    };

    dateRange.forEach(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const snapshot = dailySnapshots[dayStr] || {};
        STATUS_ORDER.forEach(status => {
            dataByStatus[status].push(snapshot[status] || 0);
        })
    });


    const labels = dateRange.map(day => format(day, 'MMM d'));
    const datasets = STATUS_ORDER.map(status => {
        return {
            label: status,
            data: dataByStatus[status],
            borderColor: STATUS_COLORS[status].border,
            backgroundColor: STATUS_COLORS[status].background,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: STATUS_COLORS[status].border,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: STATUS_COLORS[status].border,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBorderWidth: 2,
        };
    });

    return {
      labels,
      datasets,
    };
  }, [issues]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
            font: {
                family: 'Inter, sans-serif'
            }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        font: {
            family: 'Inter, sans-serif'
        }
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
            display: false,
        },
        ticks: {
             font: {
                family: 'Inter, sans-serif'
            }
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
            color: 'rgba(0,0,0,0.05)'
        },
        ticks: {
             font: {
                family: 'Inter, sans-serif'
            }
        }
      },
    },
  };

  if (!chartData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cumulative Flow Diagram (CFD)</CardTitle>
          <CardDescription>Visualizes workflow health and helps identify bottlenecks over time.</CardDescription>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
            <p className="text-muted-foreground">Not enough changelog data to generate the CFD.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cumulative Flow Diagram (CFD)</CardTitle>
        <CardDescription>Visualizes workflow health and helps identify bottlenecks over time.</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <Line options={options as any} data={chartData} />
      </CardContent>
    </Card>
  );
}
