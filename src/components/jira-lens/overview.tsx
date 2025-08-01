'use client';
import { type JiraIssue } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
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
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Users, CheckCircle, Clock, FileText } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);


const CHART_COLORS = ["#6366F1", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

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
          label: 'Issues',
          data: sortedStatus.map(s => s.value),
          backgroundColor: sortedStatus.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
          borderColor: '#FFFFFF',
          borderWidth: 4,
          hoverBorderWidth: 4,
          hoverBorderColor: '#F7F7FA'
        }]
      },
      typeDist: {
        labels: sortedTypes.map(t => t.name),
        datasets: [{
          label: 'Issues',
          data: sortedTypes.map(t => t.value),
          backgroundColor: sortedTypes.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
          borderRadius: 4,
        }]
      },
    };
  }, [issues]);

  const commonOptions = {
     responsive: true,
     maintainAspectRatio: false,
     plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            backgroundColor: "#FFFFFF",
            titleColor: "#111827",
            bodyColor: "#374151",
            borderColor: "#E5E7EB",
            borderWidth: 1,
            titleFont: { family: "Inter, sans-serif", size: 13, weight: '600' },
            bodyFont: { family: "Inter, sans-serif", size: 12 },
            padding: 12,
            cornerRadius: 8
        }
     }
  };

  const doughnutOptions = {
    ...commonOptions,
    cutout: '70%',
    plugins: {
        ...commonOptions.plugins,
      legend: {
        position: 'bottom' as const,
        display: true,
        labels: {
            font: { family: "Inter, sans-serif", size: 12 },
            color: "#6B7280",
            boxWidth: 12,
            padding: 15,
        }
      },
    },
  };

  const barOptions = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
            drawOnChartArea: false,
        },
        ticks: { color: "#6B7280", font: { family: "Inter, sans-serif" }}
      },
      x: {
        grid: {
            display: false,
        },
        ticks: { color: "#6B7280", font: { family: "Inter, sans-serif" }}
      }
    },
  };

  const MetricCard = ({ icon: Icon, iconBg, title, value, delta, deltaColor }: { icon: React.ElementType, iconBg: string, title: string, value: string, delta?: string, deltaColor?: string }) => (
    <Card className="shadow-sm border-border/60 hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-5 flex items-center gap-5">
        <div className={cn("p-3 rounded-lg", iconBg)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {delta && (
          <div className={cn("ml-auto flex items-center text-sm font-semibold", deltaColor)}>
            {delta.startsWith('+') ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            {delta.substring(1)}
          </div>
        )}
      </CardContent>
    </Card>
  );


  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={FileText} iconBg="bg-pink-500" title="Total Issues" value={`${stats.totalIssues}`} />
        <MetricCard icon={CheckCircle} iconBg="bg-green-500" title="Completed" value={`${stats.doneIssues}`} />
        <MetricCard icon={Users} iconBg="bg-indigo-500" title="Completion Rate" value={`${stats.completionRate.toFixed(1)}%`} />
        <MetricCard icon={Clock} iconBg="bg-orange-500" title="Avg. Resolution" value={`${stats.avgResolutionTime > 0 ? stats.avgResolutionTime.toFixed(1) : 'N/A'}d`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 shadow-sm border-border/60 hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Issues by Type</CardTitle>
             <CardDescription>Distribution of various issue types.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
             <Bar data={typeDist} options={barOptions as any} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 shadow-sm border-border/60 hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Issues by Status</CardTitle>
            <CardDescription>Current status of all issues.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center">
            <Doughnut data={statusDist} options={doughnutOptions as any} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
