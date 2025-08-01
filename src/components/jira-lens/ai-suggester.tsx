'use client';
import { useState } from 'react';
import { visualizationSuggestion } from '@/ai/flows/visualization-suggestion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Loader2 } from 'lucide-react';
import { Textarea } from '../ui/textarea';

interface AiSuggesterProps {
  jql: string;
}

export function AiSuggester({ jql: initialJql }: AiSuggesterProps) {
  const [jql, setJql] = useState(initialJql);
  const [projectType, setProjectType] = useState('Software');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuggestions([]);
    try {
      const result = await visualizationSuggestion({ jqlQuery: jql, projectType });
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error('AI suggestion error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI suggestions. Please check the console.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 items-start">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>AI Visualization Suggester</CardTitle>
            <CardDescription>Get smart suggestions for charts that could reveal insights or problem areas in your project.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ai-jql">JQL Query</Label>
              <Textarea id="ai-jql" value={jql} onChange={(e) => setJql(e.target.value)} className="font-code text-sm h-32" />
            </div>
            <div>
              <Label htmlFor="ai-project-type">Project Type</Label>
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger id="ai-project-type">
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Service Management">Service Management</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="mr-2 h-4 w-4" />
              )}
              Get Suggestions
            </Button>
          </CardFooter>
        </form>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Suggestions</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[280px]">
          {isLoading && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {!isLoading && suggestions.length === 0 && (
            <div className="text-center text-muted-foreground py-10">
              <Lightbulb className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4">Your suggestions will appear here.</p>
            </div>
          )}
          {suggestions.length > 0 && (
            <ul className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-sm text-foreground pt-0.5">{suggestion}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
