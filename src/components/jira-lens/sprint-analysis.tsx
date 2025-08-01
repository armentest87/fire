'use client';
import { type JiraIssue } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SprintAnalysisProps {
  issues: JiraIssue[];
}

export function SprintAnalysis({ issues }: SprintAnalysisProps) {
  const [unit, setUnit] = useState<'story_points' | 'time_spent_hours'>('story_points');
  const unitLabel = unit === 'story_points' ? 'Story Points' : 'Hours';
  const [selectedSprint, setSelectedSprint] = useState<string>('');


  const { allSprints, sprintData } = useMemo(() => {
    const sprints = new Set<string>();
    issues.forEach(issue => {
      issue.sprint_names.forEach(sprint => sprints.add(sprint));
    });
    const sortedSprints = Array.from(sprints).sort();

    if (sortedSprints.length > 0 && !selectedSprint) {
      setSelectedSprint(sortedSprints[sortedSprints.length - 1]);
    }

    const data = sortedSprints.map(sprintName => {
      const sprintIssues = issues.filter(i => i.sprint_names.includes(sprintName));
      const completedIssues = sprintIssues.filter(i => i.status_category === 'Done');
      const committed = sprintIssues.reduce((acc, i) => acc + (i[unit] || 0), 0);
      const completed = completedIssues.reduce((acc, i) => acc + (i[unit] || 0), 0);
      
      const resolvedAndSorted = completedIssues
        .filter(i => i.resolved)
        .sort((a, b) => new Date(a.resolved!).getTime() - new Date(b.resolved!).getTime());
      
      const burndownData: { [key: string]: number } = {};
      resolvedAndSorted.forEach(issue => {
        const date = new Date(issue.resolved!).toLocaleDateString();
        burndownData[date] = (burndownData[date] || 0) + (issue[unit] || 0);
      });

      const burndownLabels = ['Start', ...Object.keys(burndownData)];
      let remaining = committed;
      const burndownValues = [committed];
      
      Object.values(burndownData).forEach(value => {
        remaining -= value;
        burndownValues.push(remaining);
      });
      
      return {
        name: sprintName,
        committed,
        completed,
        burndown: {
          labels: burndownLabels,
          datasets: [{
            label: `Remaining ${unitLabel}`,
            data: burndownValues,
            borderColor: '#F59E0B',
            backgroundColor: '#FEF3C7',
            tension: 0.1
          }]
        },
      };
    });

    return { allSprints: sortedSprints, sprintData: data };
  }, [issues, unit, selectedSprint]);

  const velocityChartData = {
    labels: sprintData.map(s => s.name),
    datasets: [{
      label: unitLabel,
      data: sprintData.map(s => s.completed),
      backgroundColor: '#2563EB',
    }]
  };
  
  const currentSprintData = sprintData.find(s => s.name === selectedSprint);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
            <RadioGroup value={unit} onValueChange={(v) => setUnit(v as any)} className="flex items-center gap-4">
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
          <div className="h-[250px] w-full">
            <Bar data={velocityChartData} options={chartOptions} />
          </div>
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
          {currentSprintData && currentSprintData.burndown.datasets[0].data.length > 1 ? (
             <div className="h-[350px] w-full">
               <Line data={currentSprintData.burndown} options={chartOptions}/>
            </div>
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
