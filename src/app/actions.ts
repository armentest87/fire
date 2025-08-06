
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

// Helper to parse the complex sprint string from Jira custom fields.
// Example string: "com.atlassian.greenhopper.service.sprint.Sprint@...[id=1,rapidViewId=1,state=CLOSED,name=Sprint 1,startDate=...,endDate=...]"
function parseSprintNames(sprintField: any): string[] {
    if (!sprintField || !Array.isArray(sprintField)) {
        return [];
    }
    return sprintField.map((sprintString: string) => {
        const nameMatch = sprintString.match(/name=([^,]+)/);
        return nameMatch ? nameMatch[1] : 'Unnamed Sprint';
    });
}

function transformJiraIssue(issue: any): JiraIssue {
    // Dynamically find the sprint field
    let sprintNames: string[] = [];
    for (const key in issue.fields) {
        if (key.startsWith('customfield_')) {
            const fieldValue = issue.fields[key];
            if (Array.isArray(fieldValue) && fieldValue.length > 0 && typeof fieldValue[0] === 'string' && fieldValue[0].includes('com.atlassian.greenhopper.service.sprint.Sprint')) {
                sprintNames = parseSprintNames(fieldValue);
                break; // Found it, no need to check other fields
            }
        }
    }


    return {
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
        
        story_points: issue.fields.customfield_10016 || null, 
        sprint_names: sprintNames,

        time_original_estimate_hours: issue.fields.timeoriginalestimate ? issue.fields.timeoriginalestimate / 3600 : null,
        time_spent_hours: issue.fields.timespent ? issue.fields.timespent / 3600 : null,
        
        changelog: issue.changelog || { histories: [] },
    };
}


export async function fetchJiraData(credentials: JiraCredentials, jql: string): Promise<JiraIssue[]> {
    const fullUrl = `${credentials.url}/rest/api/3/search`;
    const { email, token } = credentials;
    const authToken = Buffer.from(`${email}:${token}`).toString('base64');
    
    let allIssues: JiraIssue[] = [];
    let startAt = 0;
    let isLastPage = false;
    const maxResults = 100;

    while (!isLastPage) {
        const body = {
            jql: jql,
            startAt: startAt,
            maxResults: maxResults,
            fields: ["*all", "created"], // Ensure created is explicitly requested for sorting
            expand: ["changelog"],
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
            
            const fetchedIssues = data.issues.map(transformJiraIssue);
            allIssues = allIssues.concat(fetchedIssues);
            
            if ((data.startAt + data.issues.length) >= data.total) {
                isLastPage = true;
            } else {
                startAt += data.issues.length;
            }

        } catch (error) {
            console.error("Failed to fetch Jira issues:", error);
            throw new Error("Could not fetch issues. Please check your JQL query and permissions.");
        }
    } 

    return allIssues;
}
