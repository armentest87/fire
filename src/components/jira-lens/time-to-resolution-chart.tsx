'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { parseISO as dateFnsParseISO } from 'date-fns';
import { ScrollArea } from "../ui/scroll-area";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TARGET_HOURS = {
    'Default': 48,
    'Highest': 12,
    'High': 24,
    'Medium': 72,
    'Low': 168,
    'Lowest': 336,
    'Bug': 30,
    'New Feature': 25,
    'Support': 50
}

type GroupByKey = 'priority' | 'issuetype' | 'assignee';

const getTargetHours = (groupBy: GroupByKey, key: string): number => {
    if (groupBy === 'priority' || groupBy === 'issuetype') {
        const specificTarget = (TARGET_HOURS as Record<string, number>)[key];
        if(specificTarget) return specificTarget;
    }
    // Default target for assignees or if specific target not found
    return TARGET_HOURS.Default;
}

const getData = (issues: JiraIssue[], groupBy: GroupByKey) => {
    const resolvedIssues = issues.filter(i => i.resolved && i.created);
    const grouped = resolvedIssues.reduce((acc, issue) => {
        let key: string | undefined;
        if (groupBy === 'assignee') {
            key = issue.assignee?.displayName;
        } else {
            // This handles both 'priority' and 'issuetype'
            const groupObject = issue[groupBy];
            if(groupObject && 'name' in groupObject) {
                 key = groupObject.name;
            }
        }
        key = key || 'Unassigned';

        if (!acc[key]) {
            acc[key] = { totalHours: 0, count: 0 };
        }
        if (issue.resolved && issue.created) {
             const resolutionHours = (dateFnsParseISO(issue.resolved).getTime() - dateFnsParseISO(issue.created).getTime()) / (1000 * 3600);
             if (resolutionHours >= 0) { // Ensure no negative resolution times
                acc[key].totalHours += resolutionHours;
                acc[key].count++;
             }
        }
        return acc;
    }, {} as Record<string, { totalHours: number, count: number }>);

    return Object.entries(grouped)
    .filter(([_, data]) => data.count > 0) // Only include groups with resolved issues
    .map(([key, data]) => ({
        key,
        avgHours: data.totalHours / data.count,
    })).sort((a,b) => b.avgHours - a.avgHours).slice(0, 20); // Limit to top 20
}

export function TimeToResolutionChart({ issues, groupBy, title = "Average Time to Resolution" }: { issues: JiraIssue[], groupBy: GroupByKey, title?: string }) {
    
  const chartData = useMemo(() => {
    const groupedData = getData(issues, groupBy);
    
    const actualData = groupedData.map(d => d.avgHours);
    const targetData = groupedData.map(d => getTargetHours(groupBy, d.key));
    const labels = groupedData.map(d => d.key)

    return {
      labels: labels,
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
  }, [issues, groupBy]);
  
  const barHeight = 60; // Height per item in pixels
  const chartHeight = Math.max(320, chartData.labels.length * barHeight);


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
       tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.x !== null) {
              label += context.parsed.x.toFixed(2) + ' hours';
            }

            // Add comparison to target
            if (context.dataset.label === 'Actual Hours') {
                const target = chartData.datasets[1].data[context.dataIndex] || 0;
                const actual = context.parsed.x;
                if (target > 0) {
                    const percentage = ((actual - target) / target * 100);
                    const sign = percentage > 0 ? '+' : '';
                    label += ` (${sign}${percentage.toFixed(2)}% vs target)`;
                }
            }
            return label;
          }
        }
      }
    },
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Actual vs. target resolution times by {groupBy}.</CardDescription>
        </CardHeader>
        <CardContent>
           <ScrollArea className="h-80 w-full">
              <div style={{ height: `${chartHeight}px`, position: 'relative' }}>
                {chartData.labels.length > 0 ? (
                  <Bar data={chartData} options={options} />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No data available for this chart.
                  </div>
                )}
              </div>
            </ScrollArea>
        </CardContent>
    </Card>
  );
}

function parseISO(arg0: string): Date {
    return new Date(arg0);
}
