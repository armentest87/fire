'use client';
import { type JiraIssue } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area } from 'react-chartjs-2';
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
const STATUS_COLORS: Record<string, string> = {
    'To Do': '#F59E0B',
    'In Progress': '#2563EB',
    'Done': '#10B981',
};

export function CfdChart({ issues }: CfdChartProps) {

  const chartData = useMemo(() => {
    if (!issues || issues.length === 0) return null;

    let allChanges: { date: Date; key: string; status_category: 'To Do' | 'In Progress' | 'Done' }[] = [];
    
    issues.forEach(issue => {
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
    const dateRange = eachDayOfInterval({ start: minDate, end: maxDate });

    const dailySnapshots: Record<string, Record<string, 'To Do' | 'In Progress' | 'Done'>> = {};

    for (const issue of issues) {
      const issueChanges = allChanges.filter(c => c.key === issue.key);
      if(issueChanges.length === 0) continue;

      let currentStatus = issueChanges[0].status_category;
      let changeIndex = 0;
      
      for(const day of dateRange) {
        if (!dailySnapshots[issue.key]) dailySnapshots[issue.key] = {};
        while(changeIndex < issueChanges.length - 1 && issueChanges[changeIndex + 1].date <= day) {
          changeIndex++;
          currentStatus = issueChanges[changeIndex].status_category;
        }
        if (issueChanges[0].date <= day) {
          dailySnapshots[issue.key][format(day, 'yyyy-MM-dd')] = currentStatus;
        }
      }
    }

    const labels = dateRange.map(day => format(day, 'MMM d'));
    const datasets = STATUS_ORDER.map(status => {
        const data = dateRange.map(day => {
            const dayStr = format(day, 'yyyy-MM-dd');
            let count = 0;
            Object.keys(dailySnapshots).forEach(key => {
                if (dailySnapshots[key][dayStr] === status) {
                    count++;
                }
            });
            return count;
        });

        return {
            label: status,
            data: data,
            borderColor: STATUS_COLORS[status],
            backgroundColor: `${STATUS_COLORS[status]}80`,
            fill: true,
            tension: 0.3
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
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
            display: false,
        }
      },
      y: {
        stacked: true,
        beginAtZero: true
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
        <Area options={options} data={chartData} />
      </CardContent>
    </Card>
  );
}
