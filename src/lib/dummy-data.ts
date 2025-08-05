
import { type JiraIssue } from './types';
import { subDays, addDays } from 'date-fns';

const ISSUE_TYPES = ['Story', 'Bug', 'Task', 'Epic'];
const STATUSES = {
  'To Do': 'To Do',
  'In Progress': 'In Progress',
  'In Review': 'In Progress',
  'Done': 'Done',
  'Closed': 'Done',
  'Backlog': 'To Do',
};
const PRIORITIES = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
const USERS = ['Alice', 'Bob', 'Charlie', 'Dana', 'Eve', 'Frank'];
const COMPONENTS = ['Backend', 'Frontend', 'Database', 'API'];
const SPRINTS = [
    { id: 1, name: 'Sprint 1', state: 'closed' },
    { id: 2, name: 'Sprint 2', state: 'closed' },
    { id: 3, name: 'Sprint 3', state: 'closed' },
    { id: 4, name: 'Sprint 4', state: 'active' },
    { id: 5, name: 'Sprint 5', state: 'future' },
];
const VERSIONS = ['v1.0.0', 'v1.1.0', 'v2.0.0', 'v2.0.1'];


function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomSubset<T>(arr: T[]): T[] {
  return arr.filter(() => Math.random() > 0.7);
}

function createChangelog(createdDate: Date, resolvedDate: Date | null, finalStatus: keyof typeof STATUSES) {
  const histories = [];
  
  histories.push({
    created: createdDate.toISOString(),
    items: [{ field: 'status', fromString: null, toString: 'To Do' }]
  });

  const inProgressDate = addDays(createdDate, Math.floor(Math.random() * 3) + 1);
  if (resolvedDate && inProgressDate < resolvedDate) {
    histories.push({
      created: inProgressDate.toISOString(),
      items: [{ field: 'status', fromString: 'To Do', toString: 'In Progress' }]
    });
  }

  if (resolvedDate) {
    histories.push({
      created: resolvedDate.toISOString(),
      items: [{ field: 'status', fromString: 'In Progress', toString: finalStatus }]
    });
  }

  return { histories };
}

export const fetchJiraData = (jql: string): Promise<JiraIssue[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const issues: JiraIssue[] = [];
      const now = new Date();
      const HOURLY_RATE = 75.0;

      for (let i = 0; i < 150; i++) {
        const createdDate = subDays(now, Math.floor(Math.random() * 90));
        const statusName = getRandomElement(Object.keys(STATUSES)) as keyof typeof STATUSES;
        const statusCategoryName = STATUSES[statusName];
        
        let resolvedDate: Date | null = null;
        let lead_time_days: number | null = null;
        let cycle_time_days: number | null = null;

        if (statusCategoryName === 'Done') {
            resolvedDate = addDays(createdDate, Math.floor(Math.random() * 14) + 2);
            lead_time_days = (resolvedDate.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
            const inProgressDate = addDays(createdDate, 1);
            cycle_time_days = (resolvedDate.getTime() - inProgressDate.getTime()) / (1000 * 3600 * 24);
        }
        
        const time_spent_seconds = statusCategoryName !== 'To Do' && Math.random() > 0.2 ? ((Math.random() * 20) + 1) * 3600 : null;
        const labor_cost = time_spent_seconds ? (time_spent_seconds / 3600) * HOURLY_RATE : null;
        const other_expenses = Math.random() > 0.5 ? Math.random() * 500 : 0;
        const reporterName = getRandomElement(USERS);
        const assigneeName = getRandomElement([...USERS, null]);

        issues.push({
          key: `PROJ-${i + 1}`,
          fields: {
            summary: `Issue summary number ${i + 1}`,
            issuetype: {
                name: getRandomElement(ISSUE_TYPES)
            },
            status: {
                name: statusName,
                statusCategory: {
                    name: statusCategoryName
                }
            },
            priority: {
                name: getRandomElement(PRIORITIES)
            },
            reporter: {
                displayName: reporterName,
            },
            assignee: assigneeName ? {
                displayName: assigneeName
            } : null,
            created: createdDate.toISOString(),
            updated: (resolvedDate || addDays(createdDate, 1)).toISOString(),
            resolutiondate: resolvedDate ? resolvedDate.toISOString() : null,
            components: getRandomSubset(COMPONENTS).map(name => ({ name })),
            labels: ['refactor', 'ui', 'backend', 'bugfix'].filter(() => Math.random() > 0.8),
            fixVersions: getRandomSubset(VERSIONS).map(name => ({ name })),
            customfield_10016: Math.random() > 0.3 ? getRandomElement([1, 2, 3, 5, 8, 13]) : null, // Story Points
            sprint: getRandomSubset(SPRINTS),
            timeoriginalestimate: Math.random() > 0.3 ? ((Math.random() * 16) + 1) * 3600 : null, // in seconds
            timespent: time_spent_seconds, // in seconds

            // These are not standard Jira fields but calculated for our dashboard
            lead_time_days,
            cycle_time_days: cycle_time_days && cycle_time_days > 0 ? cycle_time_days : null,
            sla_met: Math.random() > 0.3 ? true : false,
            budget: Math.random() > 0.4 ? Math.random() * 5000 + 1000 : null,
            labor_cost,
            other_expenses,
            actual_cost: (labor_cost || 0) + other_expenses,
            revenue: Math.random() > 0.6 ? Math.random() * 10000 : null,
          },
          changelog: createChangelog(createdDate, resolvedDate, statusName),
        });
      }
      resolve(issues);
    }, 1000 + Math.random() * 1000); // Simulate network delay
  });
};
