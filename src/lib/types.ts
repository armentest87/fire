export interface JiraIssue {
  key: string;
  fields: {
    summary: string;
    issuetype: {
      name: string;
    };
    status: {
      name: string;
      statusCategory: {
        name: 'To Do' | 'In Progress' | 'Done';
      };
    };
    priority: {
      name: string;
    };
    reporter: {
      displayName: string;
    };
    assignee: {
      displayName: string;
    } | null;
    created: string; // ISO string
    updated: string; // ISO string
    resolutiondate: string | null; // ISO string
    components: { name: string }[];
    labels: string[];
    fixVersions: { name: string }[];
    // Note: This is a sample custom field ID. You will need to find the correct ID for your Jira instance.
    customfield_10016: number | null; // Story Points
    sprint: { name: string } | null;
    timeoriginalestimate: number | null; // in seconds
    timespent: number | null; // in seconds
    // These fields are not standard and would need to be calculated or come from other custom fields.
    lead_time_days?: number | null;
    cycle_time_days?: number | null;
    sla_met?: boolean | null;
    budget?: number | null;
    actual_cost?: number | null;
    revenue?: number | null;
    other_expenses?: number | null;
    labor_cost?: number | null;
  };
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
