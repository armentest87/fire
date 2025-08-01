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
const SPRINTS = ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4'];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomSubset<T>(arr: T[]): T[] {
  return arr.filter(() => Math.random() > 0.7);
}

function createChangelog(createdDate: Date, resolvedDate: Date | null, finalStatus: keyof typeof STATUSES) {
  const histories = [];
  
  // Initial state
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

      for (let i = 0; i < 150; i++) {
        const createdDate = subDays(now, Math.floor(Math.random() * 90));
        const status = getRandomElement(Object.keys(STATUSES)) as keyof typeof STATUSES;
        const statusCategory = STATUSES[status];
        const resolvedDate = statusCategory === 'Done' ? addDays(createdDate, Math.floor(Math.random() * 14) + 1) : null;
        
        issues.push({
          key: `PROJ-${i + 1}`,
          summary: `Issue summary number ${i + 1}`,
          issuetype: getRandomElement(ISSUE_TYPES),
          status: status,
          status_category: statusCategory,
          priority: getRandomElement(PRIORITIES),
          reporter: getRandomElement(USERS),
          assignee: getRandomElement([...USERS, 'Unassigned']),
          created: createdDate.toISOString(),
          updated: (resolvedDate || addDays(createdDate, 1)).toISOString(),
          resolved: resolvedDate ? resolvedDate.toISOString() : null,
          components: getRandomSubset(COMPONENTS),
          labels: ['refactor', 'ui', 'backend', 'bugfix'].filter(() => Math.random() > 0.8),
          fix_versions: ['v1.0', 'v1.1', 'v2.0'].filter(() => Math.random() > 0.8),
          story_points: Math.random() > 0.3 ? getRandomElement([1, 2, 3, 5, 8, 13]) : null,
          sprint_names: getRandomSubset(SPRINTS),
          time_original_estimate_hours: Math.random() > 0.3 ? (Math.random() * 16) + 1 : null,
          time_spent_hours: statusCategory !== 'To Do' && Math.random() > 0.2 ? (Math.random() * 20) + 1 : null,
          changelog: createChangelog(createdDate, resolvedDate, status),
        });
      }
      resolve(issues);
    }, 1000 + Math.random() * 1000); // Simulate network delay
  });
};
