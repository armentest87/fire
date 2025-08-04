'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Info } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

const TYPE_COLORS = ["#219ebc", "#8ecae6", "#023047", "#ffb703", "#fb8500", "#a8dadc"];


export function IssuesByTypeChart({ issues }: { issues: JiraIssue[] }) {
  const chartData = useMemo(() => {
    const typeCounts = issues.reduce((acc, issue) => {
      acc[issue.issuetype] = (acc[issue.issuetype] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(typeCounts);
    const data = Object.values(typeCounts);

    return {
      labels,
      datasets: [{
        label: 'Issues by Type',
        data,
        backgroundColor: labels.map((_,i) => TYPE_COLORS[i % TYPE_COLORS.length]),
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 4
      }]
    };
  }, [issues]);
  
  const totalIssues = issues.length;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        display: false
      },
       tooltip: {
            callbacks: {
                label: function(context: any) {
                    let label = context.label || '';
                    if (label) {
                        label += ': ';
                    }
                    const value = context.parsed;
                    const percentage = ((value / totalIssues) * 100).toFixed(2);
                    return `${label} ${value} issues (${percentage}%)`;
                }
            }
       }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issues by Type</CardTitle>
        <Info className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent className="h-64">
         <Doughnut data={chartData} options={options as any} />
      </CardContent>
    </Card>
  );
}
