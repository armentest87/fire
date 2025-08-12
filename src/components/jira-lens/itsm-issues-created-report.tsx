'use client';
import { type JiraIssue, type JiraProject } from "@/lib/types";
import { ItsmKpiCards } from "./itsm-kpi-cards";
import { CreatedIssuesOverTimeChart } from "./created-issues-over-time-chart";
import { ItsmIssuesByType } from "./itsm-issues-by-type";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useMemo, useState } from "react";


export function ItsmIssuesCreatedReport({ issues, projects }: { issues: JiraIssue[], projects: JiraProject[] }) {
    const [selectedProject, setSelectedProject] = useState<string>('all');

    const availableProjects = useMemo(() => {
        const issueProjectKeys = [...new Set(issues.map(i => i.key.split('-')[0]))];
        return projects.filter(p => issueProjectKeys.includes(p.key));
    }, [issues, projects]);
    
    const filteredIssues = useMemo(() => {
        if (selectedProject === 'all') return issues;
        const projectKey = projects.find(p => p.id === selectedProject)?.key;
        if (!projectKey) return issues;
        return issues.filter(issue => issue.key.startsWith(`${projectKey}-`));
    }, [issues, selectedProject, projects]);
    
    if (!issues || issues.length === 0) {
        return <p>No issue data to display for ITSM Report.</p>;
    }
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
                 <h2 className="text-xl font-bold">ITSM Issues Created Report</h2>
                <div className="flex gap-4">
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Choose Project" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Projects</SelectItem>
                            {availableProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <ItsmKpiCards issues={filteredIssues} />
            
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                <div className="xl:col-span-3">
                    <CreatedIssuesOverTimeChart issues={filteredIssues} />
                </div>
                <div className="xl:col-span-2">
                    <ItsmIssuesByType issues={filteredIssues} />
                </div>
            </div>
        </div>
    );
}
