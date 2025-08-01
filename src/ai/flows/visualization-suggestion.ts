// visualization-suggestion.ts
'use server';
/**
 * @fileOverview Provides visualization suggestions based on JQL query and project type.
 *
 * - visualizationSuggestion - A function that suggests visualizations.
 * - VisualizationSuggestionInput - The input type for the visualizationSuggestion function.
 * - VisualizationSuggestionOutput - The return type for the visualizationSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisualizationSuggestionInputSchema = z.object({
  jqlQuery: z.string().describe('The JQL query used to fetch Jira issues.'),
  projectType: z.string().describe('The type of the Jira project (e.g., Software, Business).'),
});
export type VisualizationSuggestionInput = z.infer<typeof VisualizationSuggestionInputSchema>;

const VisualizationSuggestionOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of visualization suggestions.'),
});
export type VisualizationSuggestionOutput = z.infer<typeof VisualizationSuggestionOutputSchema>;

export async function visualizationSuggestion(input: VisualizationSuggestionInput): Promise<VisualizationSuggestionOutput> {
  return visualizationSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'visualizationSuggestionPrompt',
  input: {schema: VisualizationSuggestionInputSchema},
  output: {schema: VisualizationSuggestionOutputSchema},
  prompt: `You are an expert in data visualization for Jira projects. Given a JQL query and the type of project, you will suggest visualizations that can highlight potential problem areas such as decreased code quality or development team productivity issues.

  JQL Query: {{{jqlQuery}}}
  Project Type: {{{projectType}}}

  Provide a numbered list of visualization suggestions.  Be specific about the type of chart and what fields to use for the axes.  For example:

  1.  Burndown chart showing story points completed over time to identify scope creep.
  2.  Velocity chart comparing planned vs. actual story points completed per sprint to identify productivity trends.

  Limit your response to three suggestions.`,
});

const visualizationSuggestionFlow = ai.defineFlow(
  {
    name: 'visualizationSuggestionFlow',
    inputSchema: VisualizationSuggestionInputSchema,
    outputSchema: VisualizationSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
