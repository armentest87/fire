'use client';
import { type JiraIssue } from "@/lib/types";
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
    { value: 'overview', label: 'Overview', icon: LayoutDashboard, component: Overview, description: "High-level project overview and metrics." },
    { value: 'cumulative-flow', label: 'Cumulative Flow', icon: AreaChart, component: CumulativeFlowDiagram, description: "Visualizes the flow of work through different stages over time." },
    { value: 'sprint-analysis', label: 'Sprint Analysis', icon: GanttChartSquare, component: SprintAnalysis, description: "Analyze sprint velocity, burndown, and scope changes." },
    { value: 'sprint-time-report', label: 'Sprint Time Report', icon: Hourglass, component: SprintTimeReport, description: "Tracks time estimates and actuals for sprints."},
    { value: 'timework-report', label: 'Timework Report', icon: Clock, component: TimeworkReport, description: "Detailed breakdown of time spent by user and issue." },
    { value: 'service-management', label: 'Service Management', icon: Server, component: ServiceManagement, description: "Monitor service desk performance and SLAs." },
    { value: 'itsm-report', label: 'ITSM Report', icon: Activity, component: ItsmIssuesCreatedReport, description: "Insights into issue creation trends for ITSM projects."},
    { value: 'releases-report', label: 'Releases Report', icon: GitMerge, component: ReleasesReport, description: "Track release versions, progress, and issue scope." }
];

type DashboardTabsProps = {
    activeTab: string;
    setActiveTab: (value: string) => void;
};

const NoIssuesPlaceholder = () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center p-8 bg-card rounded-lg shadow-sm border">
        <h2 className="text-2xl font-semibold mb-2">No Issues Found</h2>
        <p className="text-muted-foreground">Your filters did not match any issues. Try adjusting your filter criteria.</p>
      </div>
    </div>
);

export function DashboardTabs({ activeTab, setActiveTab }: DashboardTabsProps) {
    return (
        <aside className="w-64 flex flex-col p-4 border-r bg-card/20">
            <div className="flex items-center gap-2 mb-8">
                <BarChart className="h-8 w-8 text-primary-foreground bg-primary p-1.5 rounded-lg" />
                <h1 className="text-2xl font-bold">Jira Lens</h1>
            </div>
            <nav className="flex flex-col gap-2">
                {tabsConfig.map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                            "hover:bg-primary/80 hover:text-primary-foreground",
                            activeTab === tab.value ? "text-primary-foreground bg-primary shadow-md" : "text-muted-foreground"
                        )}
                    >
                        <tab.icon className="h-5 w-5" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
}

DashboardTabs.components = tabsConfig;
DashboardTabs.NoIssuesPlaceholder = NoIssuesPlaceholder;
