'use client';
import { type JiraIssue } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);


interface CustomAnalysisBuilderProps {
  issues: JiraIssue[];
}

const CHART_COLORS = ['#2563EB', '#0D9488', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];

export function CustomAnalysisBuilder({ issues }: CustomAnalysisBuilderProps) {
  const [groupBy, setGroupBy] = useState<string>('assignee');
  const [calculation, setCalculation] = useState<'count' | 'sum' | 'avg'>('count');
  const [numericField, setNumericField] = useState<string>('story_points');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [analysisResult, setAnalysisResult] = useState<{ labels: string[], data: number[] } | null>(null);
  const [tableData, setTableData] = useState<{name: string, value: number}[] | null>(null);

  const { categoricalCols, numericalCols } = useMemo(() => {
    const cat: (keyof JiraIssue)[] = ['issuetype', 'status', 'status_category', 'priority', 'reporter', 'assignee', 'components', 'labels', 'fix_versions', 'sprint_names'];
    const num: (keyof JiraIssue)[] = ['story_points', 'time_original_estimate_hours', 'time_spent_hours'];
    return { categoricalCols: cat, numericalCols: num };
  }, []);

  const handleGenerate = () => {
    let df = issues.flatMap(issue => {
      const groupValue = (issue as any)[groupBy];
      if (Array.isArray(groupValue)) {
        if(groupValue.length === 0) return [{ ...issue, [groupBy]: 'None' }];
        return groupValue.map(val => ({ ...issue, [groupBy]: val }));
      }
       if(!groupValue) return { ...issue, [groupBy]: 'Unassigned' };
      return { ...issue };
    });
    
    const aggregation = df.reduce((acc, issue) => {
      const key = (issue as any)[groupBy] || 'Unassigned';
      if (!acc[key]) {
        acc[key] = { count: 0, sum: 0, values: [] };
      }
      acc[key].count++;
      const numValue = (issue as any)[numericField];
      if (typeof numValue === 'number') {
        acc[key].sum += numValue;
        acc[key].values.push(numValue);
      }
      return acc;
    }, {} as Record<string, { count: number; sum: number, values: number[] }>);

    const result = Object.entries(aggregation).map(([name, data]) => {
      let value;
      if (calculation === 'count') {
        value = data.count;
      } else if (calculation === 'sum') {
        value = data.sum;
      } else { // avg
        value = data.values.length > 0 ? data.sum / data.values.length : 0;
      }
      return { name, value };
    });

    const sortedResult = result.sort((a,b) => b.value-a.value);
    setTableData(sortedResult);
    setAnalysisResult({
        labels: sortedResult.map(item => item.name),
        data: sortedResult.map(item => item.value)
    });
  };
  
  const chartData = {
    labels: analysisResult?.labels || [],
    datasets: [
      {
        label: `${calculation} of ${calculation === 'count' ? 'issues' : numericField}`,
        data: analysisResult?.data || [],
        backgroundColor: chartType === 'pie' 
          ? analysisResult?.labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length])
          : CHART_COLORS[0],
        borderColor: '#ffffff',
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' as const } },
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Custom Analysis Builder</CardTitle>
          <CardDescription>Create your own visuals by selecting the fields and calculations you need.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-4">
          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger><SelectValue placeholder="Group By..." /></SelectTrigger>
            <SelectContent>{categoricalCols.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={calculation} onValueChange={v => setCalculation(v as any)}>
            <SelectTrigger><SelectValue placeholder="Calculate..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="count">Count of Issues</SelectItem>
              <SelectItem value="sum">Sum of...</SelectItem>
              <SelectItem value="avg">Average of...</SelectItem>
            </SelectContent>
          </Select>
          <Select value={numericField} onValueChange={setNumericField} disabled={calculation === 'count'}>
            <SelectTrigger><SelectValue placeholder="Numeric Field..." /></SelectTrigger>
            <SelectContent>{numericalCols.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={handleGenerate} className="w-full bg-accent hover:bg-accent/90">Generate Visual</Button>
        </CardContent>
      </Card>
      
      {analysisResult && tableData && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Your Custom Visual</CardTitle>
              <RadioGroup value={chartType} onValueChange={v => setChartType(v as any)} className="flex items-center gap-4">
                 <div className="flex items-center space-x-2"><RadioGroupItem value="bar" id="bar" /><Label htmlFor="bar">Bar</Label></div>
                 <div className="flex items-center space-x-2"><RadioGroupItem value="pie" id="pie" /><Label htmlFor="pie">Pie</Label></div>
              </RadioGroup>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              {chartType === 'bar' ? (
                <Bar data={chartData} options={barOptions} />
              ) : (
                <Pie data={chartData} options={pieOptions} />
              )}
            </div>
            <h3 className="font-semibold mt-6 mb-2">Chart Data</h3>
            <div className="max-h-60 overflow-y-auto border rounded-md">
                <Table>
                    <TableHeader><TableRow><TableHead>Category</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {tableData.map(row => <TableRow key={row.name}><TableCell>{row.name}</TableCell><TableCell className="text-right">{row.value.toFixed(2)}</TableCell></TableRow>)}
                    </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
