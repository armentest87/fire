
'use server';

import { type JiraIssue, type JiraProject, type JiraCredentials, type JiraIssueType, type JiraStatus } from '@/lib/types';
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

export async function fetchJiraIssueTypes(credentials: JiraCredentials, projectId: string): Promise<JiraIssueType[]> {
    const fullUrl = `${credentials.url}/rest/api/3/issuetype/project?projectId=${projectId}`;
    try {
        const data = await jiraFetch(fullUrl, credentials) as JiraIssueType[];
        return data.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error(`Failed to fetch issue types for project ${projectId}:`, error);
        throw new Error("Could not fetch issue types.");
    }
}


export async function fetchJiraStatuses(credentials: JiraCredentials, projectId: string): Promise<JiraStatus[]> {
    const fullUrl = `${credentials.url}/rest/api/3/project/${projectId}/statuses`;
    try {
        const data = await jiraFetch(fullUrl, credentials) as any[];
        // The API returns a list of issue types, each with its own list of statuses.
        // We need to flatten this into a single list of unique statuses.
        const allStatuses: Record<string, JiraStatus> = {};
        data.forEach((issueType: any) => {
            issueType.statuses.forEach((status: JiraStatus) => {
                if (!allStatuses[status.id]) {
                    allStatuses[status.id] = status;
                }
            });
        });
        return Object.values(allStatuses).sort((a,b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error(`Failed to fetch statuses for project ${projectId}:`, error);
        throw new Error("Could not fetch statuses.");
    }
}


// Helper to parse the complex sprint string from Jira custom fields.
// It handles two common formats: an array of objects or an array of strings.
function parseSprintNames(sprintField: any): string[] {
    if (!sprintField || !Array.isArray(sprintField)) {
        return [];
    }

    // Check if the array contains objects with a 'name' property (modern API response)
    if (sprintField.length > 0 && typeof sprintField[0] === 'object' && sprintField[0] !== null && 'name' in sprintField[0]) {
        return sprintField.map((sprintObject: { name: string }) => sprintObject.name).filter(Boolean);
    }
    
    // Fallback to parsing the complex string format (older API response)
    // Example string: "com.atlassian.greenhopper.service.sprint.Sprint@...[id=1,rapidViewId=1,state=CLOSED,name=Sprint 1,startDate=...]"
    if (sprintField.length > 0 && typeof sprintField[0] === 'string') {
        return sprintField.map((sprintString: string) => {
            const nameMatch = sprintString.match(/name=([^,]+)/);
            return nameMatch ? nameMatch[1] : null;
        }).filter(Boolean) as string[];
    }

    return [];
}


function transformJiraIssue(issue: any): JiraIssue {
    let sprintNames: string[] = [];
    
    // Dynamically find the sprint field by checking its content.
    // The sprint field is usually an array of strings or objects containing sprint details.
    for (const key in issue.fields) {
        if (key.startsWith('customfield_')) {
            const fieldValue = issue.fields[key];
            if (Array.isArray(fieldValue) && fieldValue.length > 0) {
                 // Check if it's the sprint field by inspecting the content of the first element
                 const firstElement = fieldValue[0];
                 if (
                    (typeof firstElement === 'string' && firstElement.includes('com.atlassian.greenhopper.service.sprint.Sprint')) ||
                    (typeof firstElement === 'object' && firstElement !== null && 'id' in firstElement && 'name' in firstElement && 'state' in firstElement)
                 ) {
                    sprintNames = parseSprintNames(fieldValue);
                    break; // Found and parsed the sprint field, no need to check further.
                 }
            }
        }
    }


    return {
        key: issue.key,
        summary: issue.fields.summary,
        issuetype: {
            id: issue.fields.issuetype?.id,
            name: issue.fields.issuetype?.name || 'N/A',
        },
        status: {
            id: issue.fields.status?.id,
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
