# **App Name**: Jira Lens

## Core Features:

- Jira Connection: Connect to a Jira instance using URL, email, and API token.
- JQL Filtering: Specify a JQL query to filter and fetch Jira issues.
- Project Overview Dashboard: Display a high-level project overview with key metrics like total issues, completion rate, and average resolution time.
- Cumulative Flow Diagram: Generate and display a cumulative flow diagram (CFD) to visualize workflow bottlenecks based on issue status changes.
- Sprint Analysis: Provide detailed sprint analysis, including velocity charts and burndown charts, based on selected estimation units (story points or time spent).
- Custom Analysis Builder: Create custom charts by selecting fields for X and Y axes to perform count, sum, or average calculations.
- AI Visualization Suggester: Based on JQL and project type provide smart prompts tool, where the tool can suggest visualizations to highlight, areas where code quality has likely decreased, or key problem areas in development team productivity.

## Style Guidelines:

- Primary color: Soft blue (#90CAF9) to evoke a sense of clarity and reliability.
- Background color: Light gray (#F5F5F5) for a clean, neutral interface.
- Accent color: Subtle orange (#FFB74D) to highlight key metrics and interactive elements without being distracting.
- Body and headline font: 'Inter', sans-serif, for a clean and modern user interface.
- Use a consistent set of icons from a library like FontAwesome to represent different issue types and actions.
- Implement a tabbed layout to organize different dashboards and analysis views.
- Use subtle transitions when loading new data or updating charts to enhance user experience.