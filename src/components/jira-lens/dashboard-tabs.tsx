'use client';
import { type JiraIssue } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "./overview";
import { SprintAnalysis } from "./sprint-analysis";
import { TimeworkReport } from "./timework-report";
import { SprintTimeReport } from "./sprint-time-report";
import { CumulativeFlowDiagram } from "./cumulative-flow-diagram";
import { ServiceManagement } from "./service-management";
import { ItsmIssuesCreatedReport } from "./itsm-issues-created-report";
import { ReleasesReport } from "./releases-report";
import { useState } from "react";
import { LayoutDashboard, GanttChartSquare, Clock, Hourglass, AreaChart, Server, Activity, GitMerge, BarChart } from 'lucide-react';
import { cn } from "@/lib/utils";

const tabsConfig = [
    { value: 'overview', label: 'Overview', icon: LayoutDashboard, component: Overview },
    { value: 'cumulative-flow', label: 'Cumulative Flow', icon: AreaChart, component: CumulativeFlowDiagram },
    { value: 'sprint-analysis', label: 'Sprint Analysis', icon: GanttChartSquare, component: SprintAnalysis },
    { value: 'sprint-time-report', label: 'Sprint Time Report', icon: Hourglass, component: SprintTimeReport },
    { value: 'timework-report', label: 'Timework Report', icon: Clock, component: TimeworkReport },
    { value: 'service-management', label: 'Service Management', icon: Server, component: ServiceManagement },
    { value: 'itsm-report', label: 'ITSM Report', icon: Activity, component: ItsmIssuesCreatedReport },
    { value: 'releases-report', label: 'Releases Report', icon: GitMerge, component: ReleasesReport }
];

type DashboardTabsProps = {
    issues: JiraIssue[] | null;
};

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (value: string) => void }) => (
    <aside className="w-64 flex flex-col p-4 border-r bg-card/50">
        <div className="flex items-center gap-2 mb-8">
            <BarChart className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Jira Lens</h1>
        </div>
        <nav className="flex flex-col gap-2">
            {tabsConfig.map(tab => (
                <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                        "hover:bg-primary/10 hover:text-primary",
                        activeTab === tab.value ? "text-primary-foreground bg-gradient-to-r from-primary to-accent shadow-md" : "text-muted-foreground"
                    )}
                >
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                </button>
            ))}
        </nav>
    </aside>
);

const NoIssuesPlaceholder = () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center p-8 bg-card rounded-lg shadow-sm border">
        <h2 className="text-2xl font-semibold mb-2">No Issues Found</h2>
        <p className="text-muted-foreground">Your filters did not match any issues. Try adjusting your filter criteria.</p>
      </div>
    </div>
);

export function DashboardTabs({ issues }: DashboardTabsProps) {
    const [activeTab, setActiveTab] = useState('overview');
    
    if (!issues || issues.length === 0) {
        return (
            <>
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <div className="flex-1 p-6">
                    <NoIssuesPlaceholder />
                </div>
            </>
        );
    }
    
    const ActiveComponent = tabsConfig.find(tab => tab.value === activeTab)?.component || Overview;

    return (
        <>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <DashboardTabs.Content>
                <ActiveComponent issues={issues} />
            </DashboardTabs.Content>
        </>
    );
}

DashboardTabs.Content = ({ children }: { children?: React.ReactNode }) => {
    return <>{children}</>
}
