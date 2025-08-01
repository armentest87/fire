'use client';
import { type JiraIssue } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface SprintAnalysisProps {
  issues: JiraIssue[];
}

export function SprintAnalysis({ issues }: SprintAnalysisProps) {
  const [unit, setUnit] = useState<'story_points' | 'time_spent_hours'>('story_points');
  const unitLabel = unit === 'story_points' ? 'Story Points' : 'Hours';

  const { allSprints, sprintData, selectedSprint, setSelectedSprint } = useMemo(() => {
    const sprints = new Set<string>();
    issues.forEach(issue => {
      issue.sprint_names.forEach(sprint => sprints.add(sprint));
    });
    const sortedSprints = Array.from(sprints).sort();
    
    const [selected, setSelected] = useState<string>(sortedSprints[sortedSprints.length - 1] || '');

    const data = sortedSprints.map(sprintName => {
      const sprintIssues = issues.filter(i => i.sprint_names.includes(sprintName));
      const completedIssues = sprintIssues.filter(i => i.status_category === 'Done');
      const committed = sprintIssues.reduce((acc, i) => acc + (i[unit] || 0), 0);
      const completed = completedIssues.reduce((acc, i) => acc + (i[unit] || 0), 0);
      
      const resolvedAndSorted = completedIssues
        .filter(i => i.resolved)
        .sort((a, b) => new Date(a.resolved!).getTime() - new Date(b.resolved!).getTime());
      
      const burndown = resolvedAndSorted.map((issue, index) => ({
        date: new Date(issue.resolved!).toLocaleDateString(),
        remaining: committed - resolvedAndSorted.slice(0, index + 1).reduce((acc, i) => acc + (i[unit] || 0), 0)
      }));
      burndown.unshift({ date: 'Start', remaining: committed });

      return {
        name: sprintName,
        committed,
        completed,
        burndown,
      };
    });

    return { allSprints: sortedSprints, sprintData: data, selectedSprint: selected, setSelectedSprint };
  }, [issues, unit]);

  const velocityData = sprintData.map(s => ({ name: s.name, [unitLabel]: s.completed }));
  const currentSprintData = sprintData.find(s => s.name === selectedSprint);

  const chartConfig: ChartConfig = {
    [unitLabel]: { label: unitLabel, color: 'hsl(var(--primary))' },
    remaining: { label: `Remaining ${unitLabel}`, color: 'hsl(var(--accent))' },
  };
  
  if (allSprints.length === 0) {
    return <Card><CardHeader><CardTitle>Sprint Analysis</CardTitle></CardHeader><CardContent><p>No sprint data found in the fetched issues.</p></CardContent></Card>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sprint Velocity</CardTitle>
          <CardDescription>Measures the amount of work a team completes during a sprint.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <RadioGroup defaultValue="story_points" onValueChange={(v) => setUnit(v as any)} className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="story_points" id="sp" />
                <Label htmlFor="sp">Story Points</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="time_spent_hours" id="time" />
                <Label htmlFor="time">Time Spent (Hours)</Label>
              </div>
            </RadioGroup>
          </div>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer>
              <BarChart data={velocityData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey={unitLabel} fill={`var(--color-${unitLabel})`} radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Detailed Sprint Analysis</CardTitle>
              <CardDescription>Burndown chart for a selected sprint.</CardDescription>
            </div>
            <Select value={selectedSprint} onValueChange={setSelectedSprint}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select a sprint" />
              </SelectTrigger>
              <SelectContent>
                {allSprints.map(sprint => <SelectItem key={sprint} value={sprint}>{sprint}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {currentSprintData && currentSprintData.burndown.length > 1 ? (
             <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <ResponsiveContainer>
                <LineChart data={currentSprintData.burndown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 'dataMax']} />
                  <RechartsTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <Legend />
                  <Line type="monotone" dataKey="remaining" stroke={`var(--color-remaining)`} strokeWidth={2} dot={{r: 4, fill: `var(--color-remaining)`}} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              <p>Not enough data to draw a burndown for this sprint.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
