'use client';
import { type JiraIssue } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface CustomAnalysisBuilderProps {
  issues: JiraIssue[];
}

const COLORS = ['#90CAF9', '#FFB74D', '#81C784', '#E57373', '#BA68C8', '#FFD54F', '#4DD0E1', '#F06292'];

export function CustomAnalysisBuilder({ issues }: CustomAnalysisBuilderProps) {
  const [groupBy, setGroupBy] = useState<string>('assignee');
  const [calculation, setCalculation] = useState<'count' | 'sum' | 'avg'>('count');
  const [numericField, setNumericField] = useState<string>('story_points');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [analysisResult, setAnalysisResult] = useState<any[] | null>(null);

  const { categoricalCols, numericalCols } = useMemo(() => {
    const cat: (keyof JiraIssue)[] = ['issuetype', 'status', 'status_category', 'priority', 'reporter', 'assignee', 'components', 'labels', 'fix_versions', 'sprint_names'];
    const num: (keyof JiraIssue)[] = ['story_points', 'time_original_estimate_hours', 'time_spent_hours'];
    return { categoricalCols: cat, numericalCols: num };
  }, []);

  const handleGenerate = () => {
    let df = issues.flatMap(issue => {
      const groupValue = (issue as any)[groupBy];
      if (Array.isArray(groupValue)) {
        return groupValue.map(val => ({ ...issue, [groupBy]: val }));
      }
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

    setAnalysisResult(result.sort((a,b) => b.value-a.value));
  };
  
  const chartConfig: ChartConfig = {
    value: { label: 'Value', color: 'hsl(var(--primary))' },
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
      
      {analysisResult && (
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
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
              <ResponsiveContainer>
                {chartType === 'bar' ? (
                  <BarChart data={analysisResult}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                  </BarChart>
                ) : (
                  <PieChart>
                    <RechartsTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie data={analysisResult} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                      {analysisResult.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                )}
              </ResponsiveContainer>
            </ChartContainer>
            <h3 className="font-semibold mt-6 mb-2">Chart Data</h3>
            <div className="max-h-60 overflow-y-auto border rounded-md">
                <Table>
                    <TableHeader><TableRow><TableHead>Category</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {analysisResult.map(row => <TableRow key={row.name}><TableCell>{row.name}</TableCell><TableCell className="text-right">{row.value.toFixed(2)}</TableCell></TableRow>)}
                    </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
