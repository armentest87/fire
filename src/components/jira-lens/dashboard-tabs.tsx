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
import { LayoutDashboard, GanttChartSquare, Clock, Hourglass, AreaChart, Server, Activity, GitMerge, BarChart } from 'lucide-react';
import { cn } from "@/lib/utils";

const tabsConfig = [
    { value: 'overview', label: 'Overview', icon: LayoutDashboard, description: "High-level project overview and metrics." },
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
        <aside className="w-64 flex flex-col p-4 border-r bg-card/50">
            <div className="flex items-center gap-3 mb-8 px-2">
                <BarChart className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">Jira Lens</h1>
            </div>
            <nav className="flex flex-col gap-2">
                {tabsConfig.map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
                            activeTab === tab.value 
                                ? "bg-gradient-to-r from-purple-500 to-teal-400 text-white shadow-md" 
                                : "text-muted-foreground hover:bg-muted/50"
                        )}
                    >
                        <tab.icon className={cn(
                            "h-5 w-5 transition-colors",
                             activeTab === tab.value ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                            )} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
}

DashboardTabs.components = tabsConfig;
DashboardTabs.NoIssuesPlaceholder = NoIssuesPlaceholder;
