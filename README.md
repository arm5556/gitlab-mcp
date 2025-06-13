# GitLab MCP Server - MR-focused Edition

## Enhanced Merge Request & Vulnerability Management

A specialized fork of the GitLab MCP(Model Context Protocol) Server, optimized for **AI effectiveness** in Merge Request management and Vulnerability analysis.

## Why This Fork Exists 🎯

This fork addresses key limitations that made the original less effective for AI agents:

- **🧠 AI-Optimized Responses**: Filtered, focused data instead of raw GitLab API bloat
- **🎯 Essential Tools Only**: 6 carefully selected tools vs 40+ scattered operations
- **🔍 Smart Filtering**: Only unresolved discussions, not resolved noise
- **🏗️ Clean Architecture**: 85% code reduction with modular structure
- **🐛 Bug Fixes**: npx compatibility, error handling, new GraphQL endpoints
- **📊 Enhanced Data**: Vulnerability location, CVE details, upgrade instructions

**Result**: More effective AI interactions with precise, actionable GitLab data.

## Smart Context Management 🧠💡

### The Problem: Missing Discussions in Large MRs

The original GitLab MCP server sends ALL discussions at once (100+ discussions = 50,000+ tokens), overwhelming LLM context windows and causing **missing critical code review comments**.

### Our Solution: Smart Pagination

```json
{
  "total_unresolved": 45,     ← LLM knows there are more
  "total_pages": 3,           ← Clear pagination info  
  "current_page": 1,          ← Current position
  "discussions": [...]        ← Only 20 discussions per page
}
```

**Benefits:** 🎯 No missing discussions • ⚡ 80% faster • 🧠 Better focus • 💰 Token efficient

**Result:** LLM naturally requests all pages (`page=1`, `page=2`, `page=3`) ensuring ALL discussions get reviewed vs missing 30+ in original!

## 🏗️ Clean Modular Architecture

This refactored version features a **clean, maintainable structure** optimized for AI effectiveness:

```
src/
├── index.ts              # Main entry point (~9 lines)
├── server.ts             # MCP server setup (~100 lines)
├── config/
│   └── gitlab.ts         # GitLab configuration and environment setup
├── utils/
│   ├── errors.ts         # Error handling utilities
│   ├── validation.ts     # Token validation
│   └── index.ts          # Re-exports
├── api/
│   ├── merge-requests.ts # MR-related API calls (4 tools)
│   ├── vulnerabilities.ts# Enhanced GraphQL vulnerability API
│   ├── pipelines.ts      # Test report API calls
│   └── index.ts          # Re-exports all API functions
├── tools/
│   ├── definitions.ts    # Tool definitions (6 tools only)
│   ├── handlers.ts       # Tool request handlers
│   └── index.ts          # Re-exports
└── schemas/
    ├── base.ts           # Common base schemas
    ├── merge-requests.ts # MR schemas (discussions, notes, etc.)
    ├── vulnerabilities.ts# Enhanced GraphQL vulnerability schemas
    ├── test-reports.ts   # Pipeline test report schemas
    └── index.ts          # Re-exports all schemas
```

**Benefits:**
- **85% code reduction** (3,490 lines → ~500 lines)
- **Focused modules** - Each file handles one specific domain
- **Type-safe** - Full TypeScript support with clean imports
- **AI-optimized** - Smaller, focused files for better LLM processing

## Usage

### Using with Claude App, Cline, Roo Code, Cursor

When using with the Claude App, you need to set up your API key and URLs directly.

#### Local Installation (Recommended)

```json
{
  "mcpServers": {
    "GitLab MR-focused server": {
      "command": "node",
      "args": ["/path/to/gitlab-mcp/build/src/index.js"],
      "env": {
        "GITLAB_PERSONAL_ACCESS_TOKEN": "your_gitlab_token",
        "GITLAB_API_URL": "your_gitlab_api_url",
        "GITLAB_READ_ONLY_MODE": "false"
      }
    }
  }
}
```

#### Alternative: npx (Original Package)

If you want to use the original package with all tools:

```json
{
  "mcpServers": {
    "GitLab communication server": {
      "command": "npx",
      "args": ["-y", "@zereight/mcp-gitlab"],
      "env": {
        "GITLAB_PERSONAL_ACCESS_TOKEN": "your_gitlab_token",
        "GITLAB_API_URL": "your_gitlab_api_url",
        "GITLAB_READ_ONLY_MODE": "true"
      }
    }
  }
}
```

> **Note**: This fork is specifically optimized for AI effectiveness. For the full original feature set, use the command above with `GITLAB_READ_ONLY_MODE: "true"` to limit to essential tools.

## AI-Assisted Installation

### Quick Setup with AI Agent

Clone this repository and navigate to the project folder, then use this prompt with your AI agent (like Claude/Cursor):

```
@mcp.json 
current open folder is GitLab MCP fork. build and add this optimized MR-focused server with name gitlab-mr-focused
```

**What this does:**
1. **Builds the project** - Installs dependencies and compiles TypeScript
2. **Adds to mcp.json** - Automatically configures the MCP server in your client
3. **Ready to use** - Server will be available after restarting your MCP client

### Manual Configuration (Alternative)

If you prefer manual setup, ensure you have Node.js installed and add this to your mcp.json:

```json
{
  "mcpServers": {
    "gitlab-mr-focused": {
      "command": "node",
      "args": ["/path/to/gitlab-mcp/build/src/index.js"],
      "env": {
        "GITLAB_PERSONAL_ACCESS_TOKEN": "your_gitlab_token",
        "GITLAB_API_URL": "https://your-gitlab-instance.com/api/v4",
        "GITLAB_READ_ONLY_MODE": "false"
      }
    }
  }
}
```

### Environment Variables

- `GITLAB_PERSONAL_ACCESS_TOKEN`: Your GitLab personal access token (required)
- `GITLAB_API_URL`: Your GitLab API URL (Default: `https://gitlab.com/api/v4`)
- `GITLAB_READ_ONLY_MODE`: When set to 'true', restricts to read-only operations (`get_merge_request`, `mr_discussions`, `get_vulnerabilities_by_ids`, `get_failed_test_cases`). Useful for enhanced security or when write access is not needed.

## Tools 🛠️

This is a specialized **MR-focused version** with enhanced vulnerability support:

<!-- TOOLS-START -->
1. `get_merge_request` - Get MR metadata - details of a merge request (Either mergeRequestIid or branchName must be provided)
2. `mr_discussions` - List unresolved diff discussions with pagination - List discussion items for a merge request filtered for unresolved diff notes (DiffNote type, resolvable=true, resolved=false). Returns paginated results with metadata.
3. `create_merge_request_note` - Add MR notes - Add a reply note to an existing merge request thread
4. `update_merge_request` - Append label in MR - Update a merge request including adding labels (Either mergeRequestIid or branchName must be provided)
5. `get_vulnerabilities_by_ids` - Get vulnerabilities by IDs - Fetch detailed information about multiple vulnerabilities using GraphQL
6. `get_failed_test_cases` - Get failed test cases from a pipeline's test report (requires project_id and pipeline_id)
<!-- TOOLS-END -->

## Enhanced Vulnerability Data 🔍

The `get_vulnerabilities_by_ids` tool provides comprehensive vulnerability information including:

- **File Location**: Exact file paths and line numbers (e.g., `src/frontend/package-lock.json:1117`)
- **Package Details**: Affected package names and versions
- **CVE Information**: CVE identifiers with external reference links
- **Solution Instructions**: Specific upgrade commands and version recommendations
- **Scanner Data**: Information about the security scanner that detected the vulnerability
- **Dependency Context**: Complete dependency chain analysis for vulnerability impact assessment

This enhanced data enables precise vulnerability remediation by providing all the context needed to understand and fix security issues.
