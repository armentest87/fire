'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, ListTodo } from "lucide-react";
import { differenceInDays, parseISO } from 'date-fns';


interface KpiCardsProps {
  issues: JiraIssue[];
}

export function KpiCards({ issues }: KpiCardsProps) {
  const kpis = useMemo(() => {
    const total = issues.length;
    const doneIssues = issues.filter(i => i.status?.statusCategory?.name === 'Done');
    const inProgressIssues = issues.filter(i => i.status?.statusCategory?.name === 'In Progress');
    const todoIssues = issues.filter(i => i.status?.statusCategory?.name === 'To Do');

    const doneCount = doneIssues.length;
    const completionRate = total > 0 ? (doneCount / total) * 100 : 0;
    
    const resolvedIssues = doneIssues.filter(i => i.resolved && i.created);
    const totalResolutionDays = resolvedIssues.reduce((acc, i) => {
        if (!i.resolved || !i.created) return acc;
        return acc + differenceInDays(parseISO(i.resolved), parseISO(i.created));
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
     <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard title="Total Issues" value={kpis.totalIssues} icon={<ListTodo className="h-6 w-6"/>} />
        <KpiCard title="Completed" value={kpis.doneCount} icon={<CheckCircle className="h-6 w-6"/>} />
        <KpiCard title="In Progress" value={kpis.inProgressCount} icon={<Clock className="h-6 w-6"/>} />
        <KpiCard title="To Do" value={kpis.todoCount} icon={<ListTodo className="h-6 w-6"/>} />
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
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-4">
                {icon && <div className="text-primary">{icon}</div>}
                <div className="text-2xl lg:text-3xl font-bold">{value}</div>
            </div>
        </CardContent>
    </Card>
)
