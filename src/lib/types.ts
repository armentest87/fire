export interface JiraIssue {
  key: string;
  summary: string;
  issuetype: string;
  status: string;
  status_category: 'To Do' | 'In Progress' | 'Done';
  priority: string;
  reporter: string;
  assignee: string;
  created: string; // ISO string
  updated: string; // ISO string
  resolved: string | null; // ISO string
  components: string[];
  labels: string[];
  fix_versions: string[];
  story_points: number | null;
  sprint_names: string[];
  time_original_estimate_hours: number | null;
  time_spent_hours: number | null;
  changelog: {
    histories: {
      created: string; // ISO string
      items: {
        field: string;
        fromString: string | null;
        toString: string | null;
      }[];
    }[];
  };
}


export interface JiraCredentials {
    url: string;
    email: string;
    token: string;
}
