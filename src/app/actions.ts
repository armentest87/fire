
'use server';

import { type JiraIssue, type JiraProject, type JiraCredentials } from '@/lib/types';
import fetch from 'node-fetch';

async function jiraFetch(url: string, credentials: JiraCredentials) {
    const { email, token } = credentials;
    const authToken = Buffer.from(`${email}:${token}`).toString('base64');

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Basic ${authToken}`,
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Jira API Error:", errorText);
        throw new Error(`Jira API request failed with status ${response.status}: ${errorText}`);
    }

    return response.json();
}

export async function fetchJiraProjects(credentials: JiraCredentials): Promise<JiraProject[]> {
    const fullUrl = `${credentials.url}/rest/api/3/project`;
    try {
        const data = await jiraFetch(fullUrl, credentials) as any[];
        // Transform the received data into the JiraProject[] format.
        const projects: JiraProject[] = data.map(project => ({
            id: project.id,
            key: project.key,
            name: project.name,
        }));
        return projects;
    } catch (error) {
        console.error("Failed to fetch Jira projects:", error);
        throw new Error("Could not fetch projects. Please check your Jira URL, credentials, and permissions.");
    }
}


export async function fetchJiraData(credentials: JiraCredentials, jql: string): Promise<JiraIssue[]> {
    // We must use POST for potentially long JQL queries.
    const fullUrl = `${credentials.url}/rest/api/3/search`;
    const { email, token } = credentials;
    const authToken = Buffer.from(`${email}:${token}`).toString('base64');
    
    // Request all fields and expand changelog for detailed analysis.
    const body = {
        jql: jql,
        startAt: 0,
        maxResults: 200, // Limiting to 200 issues for performance
        fields: ["*all"], // Fetch all fields
        expand: ["changelog"], // Expand changelog for status history
    };

    try {
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Jira API Error on issue fetch:", errorText);
            throw new Error(`Jira API request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json() as any;
        
        // Transform the rich Jira API response to our simplified JiraIssue model
        return data.issues.map((issue: any) => ({
            key: issue.key,
            summary: issue.fields.summary,
            issuetype: {
                name: issue.fields.issuetype?.name || 'N/A',
            },
            status: {
                name: issue.fields.status?.name || 'N/A',
                statusCategory: {
                    name: issue.fields.status?.statusCategory?.name || 'To Do',
                },
            },
            priority: issue.fields.priority ? { name: issue.fields.priority.name } : null,
            reporter: issue.fields.reporter ? { displayName: issue.fields.reporter.displayName } : null,
            assignee: issue.fields.assignee ? { displayName: issue.fields.assignee.displayName } : null,
            created: issue.fields.created,
            updated: issue.fields.updated,
            resolved: issue.fields.resolutiondate,
            components: issue.fields.components?.map((c: any) => ({ name: c.name })) || [],
            labels: issue.fields.labels || [],
            fix_versions: issue.fields.fixVersions?.map((v: any) => ({ name: v.name })) || [],
            
            // Note: Custom field IDs (like for story points) can vary between Jira instances.
            // You may need to find the correct ID (e.g., 'customfield_10016') in your instance settings.
            story_points: issue.fields.customfield_10016 || null, 
            
            sprint_names: issue.fields.sprint?.name ? [issue.fields.sprint.name] : (issue.fields.closedSprints?.map((s:any) => s.name) || []),

            time_original_estimate_hours: issue.fields.timeoriginalestimate ? issue.fields.timeoriginalestimate / 3600 : null,
            time_spent_hours: issue.fields.timespent ? issue.fields.timespent / 3600 : null,
            
            changelog: issue.changelog || { histories: [] },
        }));

    } catch (error) {
        console.error("Failed to fetch Jira issues:", error);
        throw new Error("Could not fetch issues. Please check your JQL query and permissions.");
    }
}
