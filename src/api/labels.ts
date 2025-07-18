import fetch from 'node-fetch';
import { handleGitLabError, validateGitLabToken } from '../utils/index.js';
import { GITLAB_API_URL, DEFAULT_FETCH_CONFIG } from '../config/gitlab.js';
import type { GitLabLabelSchema } from '../schemas/issues.js';
import type { ListLabelsOptions, CreateLabelOptions, UpdateLabelOptions, DeleteLabelOptions } from '../schemas/index.js';
import * as z from 'zod';

// Type alias for GitLab Label using the existing schema from issues
type GitLabLabel = z.infer<typeof GitLabLabelSchema>;

/**
 * List labels for a project
 *
 * @param projectId The ID or URL-encoded path of the project
 * @param options Optional parameters for listing labels
 * @returns Array of GitLab labels
 */
export async function listLabels(
  projectId: string,
  options: Omit<ListLabelsOptions, "project_id"> = {}
): Promise<GitLabLabel[]> {
  validateGitLabToken();
  projectId = decodeURIComponent(projectId); // Decode project ID
  
  // Construct the URL with project path
  const url = new URL(
    `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}/labels`
  );

  // Add query parameters
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined) {
      if (typeof value === "boolean") {
        url.searchParams.append(key, value ? "true" : "false");
      } else {
        url.searchParams.append(key, String(value));
      }
    }
  });

  // Make the API request
  const response = await fetch(url.toString(), DEFAULT_FETCH_CONFIG);

  // Handle errors
  await handleGitLabError(response);

  // Parse and return the data
  const data = await response.json();
  return data as GitLabLabel[];
}

/**
 * Create a new label in a project
 *
 * @param projectId The ID or URL-encoded path of the project
 * @param options Options for creating the label
 * @returns Created GitLab label
 */
export async function createLabel(
  projectId: string,
  options: Omit<CreateLabelOptions, "project_id">
): Promise<GitLabLabel> {
  validateGitLabToken();
  projectId = decodeURIComponent(projectId); // Decode project ID
  
  // Make the API request
  const response = await fetch(
    `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}/labels`,
    {
      ...DEFAULT_FETCH_CONFIG,
      method: "POST",
      body: JSON.stringify(options),
    }
  );

  // Handle errors
  await handleGitLabError(response);

  // Parse and return the data
  const data = await response.json();
  return data as GitLabLabel;
}

/**
 * Update an existing label in a project
 *
 * @param projectId The ID or URL-encoded path of the project
 * @param labelId The ID or name of the label to update
 * @param options Options for updating the label
 * @returns Updated GitLab label
 */
export async function updateLabel(
  projectId: string,
  labelId: number | string,
  options: Omit<UpdateLabelOptions, "project_id" | "label_id">
): Promise<GitLabLabel> {
  validateGitLabToken();
  projectId = decodeURIComponent(projectId); // Decode project ID
  
  // Make the API request
  const response = await fetch(
    `${GITLAB_API_URL}/projects/${encodeURIComponent(
      projectId
    )}/labels/${encodeURIComponent(String(labelId))}`,
    {
      ...DEFAULT_FETCH_CONFIG,
      method: "PUT",
      body: JSON.stringify(options),
    }
  );

  // Handle errors
  await handleGitLabError(response);

  // Parse and return the data
  const data = await response.json();
  return data as GitLabLabel;
}

/**
 * Delete a label from a project
 *
 * @param projectId The ID or URL-encoded path of the project
 * @param labelId The ID or name of the label to delete
 */
export async function deleteLabel(
  projectId: string,
  labelId: number | string
): Promise<void> {
  validateGitLabToken();
  projectId = decodeURIComponent(projectId); // Decode project ID
  
  // Make the API request
  const response = await fetch(
    `${GITLAB_API_URL}/projects/${encodeURIComponent(
      projectId
    )}/labels/${encodeURIComponent(String(labelId))}`,
    {
      ...DEFAULT_FETCH_CONFIG,
      method: "DELETE",
    }
  );

  // Handle errors
  await handleGitLabError(response);
} 