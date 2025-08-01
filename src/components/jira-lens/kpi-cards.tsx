'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, CheckCircle2 } from "lucide-react";

interface KpiCardsProps {
  issues: JiraIssue[];
}

export function KpiCards({ issues }: KpiCardsProps) {
  const { totalIssues, doneIssues, donePercentage } = useMemo(() => {
    const total = issues.length;
    const done = issues.filter(i => i.status_category === 'Done').length;
    const percentage = total > 0 ? (done / total) * 100 : 0;
    return {
      totalIssues: total,
      doneIssues: done,
      donePercentage: percentage.toFixed(2),
    };
  }, [issues]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Issues</CardTitle>
          <Info className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{totalIssues}</p>
          <p className="text-xs text-gray-500">Number of Issues</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Current Done Issues</CardTitle>
          <Info className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent className="flex items-center gap-4">
            <div className="relative h-16 w-16">
                 <svg className="h-full w-full" width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-200" strokeWidth="2"></circle>
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-green-500" strokeWidth="2" strokeDasharray={`${donePercentage}, 100`} strokeDashoffset="25" transform="rotate(-90 18 18)"></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">{donePercentage}%</span>
                </div>
            </div>
            <div>
                 <p className="text-4xl font-bold">{doneIssues}</p>
                 <p className="text-xs text-gray-500">Number of Issues</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
