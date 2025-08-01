'use client';
import { type JiraIssue } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { useMemo } from "react";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);


const CHART_COLORS = ['#2563EB', '#0D9488', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

interface OverviewProps {
  issues: JiraIssue[];
}

export function Overview({ issues }: OverviewProps) {
  const { stats, statusDist, typeDist } = useMemo(() => {
    const totalIssues = issues.length;
    const doneIssues = issues.filter(i => i.status_category === 'Done').length;
    const completionRate = totalIssues > 0 ? (doneIssues / totalIssues) * 100 : 0;
    const resolvedIssues = issues.filter(i => i.resolved);
    const avgResolutionTime = resolvedIssues.length > 0 
      ? resolvedIssues.reduce((acc, i) => acc + (new Date(i.resolved!).getTime() - new Date(i.created).getTime()), 0) / resolvedIssues.length / (1000 * 60 * 60 * 24)
      : 0;

    const statusCounts = issues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeCounts = issues.reduce((acc, issue) => {
      acc[issue.issuetype] = (acc[issue.issuetype] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedStatus = Object.entries(statusCounts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    const sortedTypes = Object.entries(typeCounts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

    return {
      stats: {
        totalIssues,
        doneIssues,
        completionRate,
        avgResolutionTime,
      },
      statusDist: {
        labels: sortedStatus.map(s => s.name),
        datasets: [{
          label: 'Issues by Status',
          data: sortedStatus.map(s => s.value),
          backgroundColor: sortedStatus.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
          borderColor: '#ffffff',
          borderWidth: 1,
        }]
      },
      typeDist: {
        labels: sortedTypes.map(t => t.name),
        datasets: [{
          label: 'Issues by Type',
          data: sortedTypes.map(t => t.value),
          backgroundColor: CHART_COLORS[0],
        }]
      },
    };
  }, [issues]);

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">{stats.totalIssues}</p>
            </CardContent>
        </Card>
        <div className="metric-card bg-blue-50 border-l-4 border-primary">
            <h3 className="text-blue-800">Completed Issues</h3>
            <p className="text-3xl font-bold text-blue-900">{stats.doneIssues}</p>
        </div>
        <div className="metric-card bg-green-50 border-l-4 border-success-green">
            <h3 className="text-green-800">Completion Rate</h3>
            <p className="text-3xl font-bold text-green-900">{stats.completionRate.toFixed(1)}%</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Resolution (Days)</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">{stats.avgResolutionTime > 0 ? stats.avgResolutionTime.toFixed(1) : 'N/A'}</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Issues by Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Pie data={statusDist} options={pieOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issues by Type</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
             <Bar data={typeDist} options={barOptions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
