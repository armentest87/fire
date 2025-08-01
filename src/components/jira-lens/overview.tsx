'use client';
import { type JiraIssue } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { useMemo } from "react";

const COLORS = ['#90CAF9', '#FFB74D', '#81C784', '#E57373', '#BA68C8', '#FFD54F', '#4DD0E1', '#F06292'];

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

    return {
      stats: {
        totalIssues,
        doneIssues,
        completionRate,
        avgResolutionTime,
      },
      statusDist: Object.entries(statusCounts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
      typeDist: Object.entries(typeCounts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
    };
  }, [issues]);

  const barChartConfig = {
    count: {
      label: 'Count',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIssues}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.doneIssues}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Resolution (Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResolutionTime > 0 ? stats.avgResolutionTime.toFixed(1) : 'N/A'}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Issues by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <RechartsTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                  <Pie data={statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                      const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                      return (percent > 0.05) ? <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                          {`${(percent * 100).toFixed(0)}%`}
                        </text> : null;
                    }}>
                    {statusDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issues by Type</CardTitle>
          </CardHeader>
          <CardContent>
             <ChartContainer config={barChartConfig} className="min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeDist} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="value" name="count" fill="var(--color-count)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
