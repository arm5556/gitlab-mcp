// Issue-related API functions for GitLab MCP

import fetch from 'node-fetch';
import { GITLAB_API_URL, DEFAULT_FETCH_CONFIG } from '../config/gitlab.js';
import { handleGitLabError } from '../utils/index.js';
import { 
  GitLabIssue, 
  GitLabIssueSchema, 
  OptimizedGitLabIssue,
  OptimizedGitLabIssueSchema,
  streamlineIssue,
  CreateIssueOptions, 
  UpdateIssueOptions,
  ListIssuesOptions 
} from '../schemas/index.js';
import { z } from 'zod';

/**
 * List issues in a GitLab project with filtering support
 * (for list_issues tool)
 */
export async function listIssues(
  projectId: string,
  options: Omit<ListIssuesOptions, 'project_id'> = {}
): Promise<OptimizedGitLabIssue[]> {
  projectId = decodeURIComponent(projectId);
  const url = new URL(
    `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}/issues`
  );

  // Add supported query parameters
  if (options.labels && options.labels.length > 0) {
    url.searchParams.append('labels', options.labels.join(','));
  }
  
  if (options.search) {
    url.searchParams.append('search', options.search);
  }

  const response = await fetch(url.toString(), DEFAULT_FETCH_CONFIG);
  await handleGitLabError(response);
  const issues = await response.json();

  // Parse and validate the response
  const parsedIssues = z.array(GitLabIssueSchema).parse(issues);
  
  // Transform to optimized format
  return parsedIssues.map(streamlineIssue);
}

/**
 * Create a new issue in a GitLab project
 */
export async function createIssue(
  projectId: string,
  options: Omit<CreateIssueOptions, 'project_id'>
): Promise<OptimizedGitLabIssue> {
  projectId = decodeURIComponent(projectId);
  const url = new URL(
    `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}/issues`
  );

  const response = await fetch(url.toString(), {
    ...DEFAULT_FETCH_CONFIG,
    method: "POST",
    body: JSON.stringify(options),
  });

  await handleGitLabError(response);
  const data = await response.json();
  const fullIssue = GitLabIssueSchema.parse(data);
  return streamlineIssue(fullIssue);
}

/**
 * Get a specific issue by its IID
 */
export async function getIssue(
  projectId: string,
  issueIid: number
): Promise<OptimizedGitLabIssue> {
  projectId = decodeURIComponent(projectId);
  const url = new URL(
    `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}/issues/${issueIid}`
  );

  const response = await fetch(url.toString(), DEFAULT_FETCH_CONFIG);

  await handleGitLabError(response);
  const data = await response.json();
  const fullIssue = GitLabIssueSchema.parse(data);
  return streamlineIssue(fullIssue);
}

/**
 * Update an existing issue
 */
export async function updateIssue(
  projectId: string,
  issueIid: number,
  options: Omit<UpdateIssueOptions, 'project_id' | 'issue_iid'>
): Promise<OptimizedGitLabIssue> {
  projectId = decodeURIComponent(projectId);
  const url = new URL(
    `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}/issues/${issueIid}`
  );

  const response = await fetch(url.toString(), {
    ...DEFAULT_FETCH_CONFIG,
    method: "PUT",
    body: JSON.stringify(options),
  });

  await handleGitLabError(response);
  const data = await response.json();
  const fullIssue = GitLabIssueSchema.parse(data);
  return streamlineIssue(fullIssue);
}