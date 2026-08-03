export interface TaskTemplate {
  title: string;
  description: string;
  estimatedEffortHours: number;
}

export const TASK_TEMPLATES: Readonly<Record<string, readonly TaskTemplate[]>> = {
  "git-and-github-basics": [
    {
      title: "Set up Git and GitHub",
      description: "Install Git, configure your identity, and create your first GitHub account.",
      estimatedEffortHours: 1,
    },
    {
      title: "Learn the core Git workflow",
      description: "Practice init, add, commit, branch, merge, and resolving merge conflicts.",
      estimatedEffortHours: 2,
    },
    {
      title: "Open a pull request",
      description: "Fork a repository, create a branch, push changes, and open a pull request.",
      estimatedEffortHours: 2,
    },
    {
      title: "Review GitHub collaboration features",
      description: "Explore issues, code reviews, and project boards with another person.",
      estimatedEffortHours: 1,
    },
  ],
  "modern-javascript-essentials": [
    {
      title: "Learn modern syntax and types",
      description: "Cover variables, functions, destructuring, template literals, and modules.",
      estimatedEffortHours: 4,
    },
    {
      title: "Master core data structures",
      description: "Work through arrays, objects, sets, maps, and iteration patterns.",
      estimatedEffortHours: 4,
    },
    {
      title: "Practice asynchronous JavaScript",
      description: "Use promises, async/await, and fetch with real API calls.",
      estimatedEffortHours: 3,
    },
    {
      title: "Build a small JavaScript project",
      description: "Combine what you learned into a self-contained script or browser app.",
      estimatedEffortHours: 1,
    },
  ],
  "typescript-fundamentals": [
    {
      title: "Learn the type system",
      description: "Understand primitives, unions, interfaces, and type inference.",
      estimatedEffortHours: 4,
    },
    {
      title: "Type functions and classes",
      description: "Add types to functions, generics, and class-based code.",
      estimatedEffortHours: 4,
    },
    {
      title: "Configure a TypeScript project",
      description: "Set up tsconfig, strict mode, and a build step for a small app.",
      estimatedEffortHours: 4,
    },
    {
      title: "Convert a JavaScript file to TypeScript",
      description: "Port an existing module and resolve the type errors it reveals.",
      estimatedEffortHours: 3,
    },
  ],
  "http-and-rest-fundamentals": [
    {
      title: "Learn HTTP request and response structure",
      description: "Study methods, status codes, headers, and bodies.",
      estimatedEffortHours: 3,
    },
    {
      title: "Design a small REST API",
      description: "Model resources, endpoints, and payloads on paper first.",
      estimatedEffortHours: 3,
    },
    {
      title: "Exercise endpoints with a client",
      description: "Use curl or an API client against a public test API.",
      estimatedEffortHours: 2,
    },
    {
      title: "Document the API contract",
      description: "Write a short API reference with examples for each endpoint.",
      estimatedEffortHours: 2,
    },
  ],
  "python-programming-essentials": [
    {
      title: "Learn Python fundamentals",
      description: "Cover syntax, data types, functions, and standard libraries.",
      estimatedEffortHours: 4,
    },
    {
      title: "Practice data structures",
      description: "Work with lists, dictionaries, sets, and comprehensions.",
      estimatedEffortHours: 3,
    },
    {
      title: "Write file and error handling code",
      description: "Read and write files, raise and catch exceptions, and structure modules.",
      estimatedEffortHours: 3,
    },
    {
      title: "Build a small Python script",
      description: "Automate a daily task with a single-file script.",
      estimatedEffortHours: 2,
    },
  ],
  "react-fundamentals": [
    {
      title: "Learn components and JSX",
      description: "Compose elements, props, and component hierarchies.",
      estimatedEffortHours: 5,
    },
    {
      title: "Master hooks and state",
      description: "Use useState, useEffect, and derived state patterns.",
      estimatedEffortHours: 5,
    },
    {
      title: "Handle lists, forms, and events",
      description: "Build interactive UI with controlled inputs and list rendering.",
      estimatedEffortHours: 5,
    },
    {
      title: "Build a component-driven app",
      description: "Assemble a small app that consumes an external API.",
      estimatedEffortHours: 5,
    },
  ],
  "node-and-express-apis": [
    {
      title: "Set up an Express server",
      description: "Create a project, wire middleware, and run a development server.",
      estimatedEffortHours: 5,
    },
    {
      title: "Implement CRUD routes",
      description: "Build resource endpoints with validation and error handling.",
      estimatedEffortHours: 6,
    },
    {
      title: "Persist data in a database",
      description: "Connect a data layer and wire the routes to real storage.",
      estimatedEffortHours: 5,
    },
    {
      title: "Write automated tests for the API",
      description: "Cover the happy path and key failure cases with a test runner.",
      estimatedEffortHours: 4,
    },
  ],
  "mern-ecommerce-app": [
    {
      title: "Design the storefront data model",
      description: "Model products, users, orders, and cart state.",
      estimatedEffortHours: 6,
    },
    {
      title: "Build the product catalog and cart",
      description: "Implement browsing, filtering, and cart interactions.",
      estimatedEffortHours: 12,
    },
    {
      title: "Add authentication and checkout",
      description: "Secure accounts and complete a payment or mock checkout flow.",
      estimatedEffortHours: 12,
    },
    {
      title: "Polish and deploy the store",
      description: "Refine the UI, write a README, and ship the app to production.",
      estimatedEffortHours: 5,
    },
  ],
  "algorithms-and-data-structures": [
    {
      title: "Practice arrays, strings, and hashing",
      description: "Solve classic problems using basic data structures.",
      estimatedEffortHours: 5,
    },
    {
      title: "Learn recursion and trees",
      description: "Implement traversals and tree-based algorithms.",
      estimatedEffortHours: 5,
    },
    {
      title: "Practice dynamic programming",
      description: "Solve a set of classic DP problems by pattern.",
      estimatedEffortHours: 5,
    },
    {
      title: "Run timed mock interviews",
      description: "Solve problems under time pressure and review your solutions.",
      estimatedEffortHours: 5,
    },
  ],
  "system-design-basics": [
    {
      title: "Learn the core design vocabulary",
      description: "Cover scaling, caching, queues, and storage trade-offs.",
      estimatedEffortHours: 3,
    },
    {
      title: "Design a simple service end to end",
      description: "Produce a diagram and written walkthrough for a known product.",
      estimatedEffortHours: 3,
    },
    {
      title: "Practice capacity and trade-off discussions",
      description: "Run through estimation and constraint conversations aloud.",
      estimatedEffortHours: 2,
    },
    {
      title: "Review real system design examples",
      description: "Study one published architecture and explain its choices.",
      estimatedEffortHours: 2,
    },
  ],
  "behavioral-storytelling": [
    {
      title: "Collect your project stories",
      description: "Write down 5-8 experiences with concrete outcomes.",
      estimatedEffortHours: 2,
    },
    {
      title: "Structure stories with STAR",
      description: "Draft Situation, Task, Action, and Result for each story.",
      estimatedEffortHours: 2,
    },
    {
      title: "Practice mock behavioral interviews",
      description: "Deliver your stories aloud and tighten the weak spots.",
      estimatedEffortHours: 2,
    },
  ],
};
