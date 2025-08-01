'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, CheckCircle, Clock, ListTodo } from "lucide-react";
import { differenceInDays, parseISO } from 'date-fns';


interface KpiCardsProps {
  issues: JiraIssue[];
}

export function KpiCards({ issues }: KpiCardsProps) {
  const kpis = useMemo(() => {
    const total = issues.length;
    const doneIssues = issues.filter(i => i.status_category === 'Done');
    const inProgressIssues = issues.filter(i => i.status_category === 'In Progress');
    const todoIssues = issues.filter(i => i.status_category === 'To Do');

    const doneCount = doneIssues.length;
    const completionRate = total > 0 ? (doneCount / total) * 100 : 0;
    
    const resolvedIssues = doneIssues.filter(i => i.resolved);
    const totalResolutionDays = resolvedIssues.reduce((acc, i) => {
        return acc + differenceInDays(parseISO(i.resolved!), parseISO(i.created));
    }, 0);
    const avgResolutionTime = resolvedIssues.length > 0 ? totalResolutionDays / resolvedIssues.length : 0;

    return {
      totalIssues: total,
      doneCount,
      inProgressCount: inProgressIssues.length,
      todoCount: todoIssues.length,
      completionRate: completionRate.toFixed(1),
      avgResolutionTime: avgResolutionTime.toFixed(1)
    };
  }, [issues]);

  return (
     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard title="Total Issues" value={kpis.totalIssues} icon={<ListTodo />} />
        <KpiCard title="Completed" value={kpis.doneCount} icon={<CheckCircle />} />
        <KpiCard title="In Progress" value={kpis.inProgressCount} icon={<Clock />} />
        <KpiCard title="To Do" value={kpis.todoCount} icon={<ListTodo />} />
        <KpiCard title="Completion Rate" value={`${kpis.completionRate}%`} />
        <KpiCard title="Avg. Resolution" value={`${kpis.avgResolutionTime} days`} />
     </div>
  );
}


interface KpiCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
}

const KpiCard = ({ title, value, icon }: KpiCardProps) => (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-4">
                {icon && <div className="text-primary">{icon}</div>}
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </CardContent>
    </Card>
)
