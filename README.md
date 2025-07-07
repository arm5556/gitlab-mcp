# GitLab MCP Server - AI-Optimized Edition

## An AI-Focused Fork for Better GitLab Integration

This fork of the GitLab MCP server addresses specific challenges when using AI agents with GitLab workflows, particularly around context management and response optimization.

**Key improvements:** Smart pagination for large discussions, streamlined responses with 65-80% token reduction, and enhanced vulnerability data.

---

## Why This Fork Was Created

### Context Management Challenge
The original GitLab MCP server can overwhelm AI assistants when dealing with large merge requests containing many discussions (100+ discussions can generate 50,000+ tokens), often resulting in missed comments due to context window limitations.

### Our Approach
- **Smart Pagination**: Discussions are served in manageable chunks with clear metadata
- **Focused Data**: Only essential information is included in responses
- **Enhanced Tools**: Improved vulnerability data and streamlined workflows
- **Token Optimization**: 65-80% reduction in response sizes across all operations

---

## Key Improvements

**Response Optimization:**
- Paginated discussions prevent context overflow
- Streamlined data format reduces token usage by 65-80%
- Only unresolved discussions are returned by default
- Removed unnecessary fields (avatars, SHA hashes, system metadata, color codes)
- Two-stage optimization: validate with full schema, return essential fields only

**Token Usage Reductions:**
- **Issue Operations**: ~80% reduction (getIssue, createIssue, updateIssue)
- **Note Creation**: ~75% reduction (createMergeRequestNote)
- **Thread Replies**: ~80% reduction (reply_to_thread - optimized for AI agents)
- **Merge Requests**: ~65% reduction (getMergeRequest, discussions)
- **Overall**: 65-80% fewer tokens across all operations

**Enhanced Features:**
- Better vulnerability data with remediation guidance
- Modular TypeScript architecture (500 vs 3,490 lines)
- 11 focused tools instead of 40+ comprehensive ones
- Complete issue management workflow coverage

**Pagination Example:**
```json
{
  "total_unresolved": 45,
  "current_page": 1,
  "total_pages": 3,
  "discussions": [...]  // 20 discussions per page
}
```

**Optimization Pattern:**
All responses follow a two-stage pattern:
1. **Validate** with full GitLab schema for safety
2. **Transform** to optimized format with essential fields only
3. **Return** streamlined response to AI agent

---

## Available Tools

**Merge Request Management:**
- `get_merge_request` - Retrieve MR details by ID or branch name
- `get_mr_discussions` - Get paginated unresolved discussions  
- `reply_to_thread` - Reply to existing discussion threads *(optimized - 80% token reduction)*
- `create_merge_request_note` - Add new notes to MRs *(optimized - 75% token reduction)*
- `update_merge_request` - Modify MR properties and labels
- `create_merge_request` - Create new merge requests

**Issue Management:**
- `get_issue` - Get issue details *(optimized - 80% token reduction)*
- `create_issue` - Create new issues *(optimized - 80% token reduction)*
- `update_issue` - Update existing issues *(optimized - 80% token reduction)*

**Security & Testing:**
- `get_vulnerabilities_by_ids` - Enhanced vulnerability information with fix guidance
- `get_failed_test_cases` - Pipeline test failure analysis

---

## Setup Options

### NPX Installation (Recommended)
```bash
npx @arm5556/gitlab-mcp-ai
```

Configuration for `mcp.json`:
```json
{
  "mcpServers": {
    "gitlab-ai-optimized": {
      "command": "npx",
      "args": ["-y", "@arm5556/gitlab-mcp-ai"],
      "env": {
        "GITLAB_PERSONAL_ACCESS_TOKEN": "your_token_here",
        "GITLAB_API_URL": "https://your-gitlab.com/api/v4"
      }
    }
  }
}
```

### Local Installation
```bash
git clone https://github.com/arm5556/gitlab-mcp.git
cd gitlab-mcp
npm install && npm run build
```

Alternative configuration for `mcp.json`:
```json
{
  "mcpServers": {
    "gitlab-ai-optimized": {
      "command": "node",
      "args": ["./build/src/index.js"],
      "env": {
        "GITLAB_PERSONAL_ACCESS_TOKEN": "your_token_here",
        "GITLAB_API_URL": "https://your-gitlab.com/api/v4"
      }
    }
  }
}
```

### Original Package (For Comparison)
```json
{
  "mcpServers": {
    "gitlab-original": {
      "command": "npx",
      "args": ["-y", "@zereight/mcp-gitlab"],
      "env": {
        "GITLAB_PERSONAL_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

---

## Technical Comparison

| Aspect | This Fork | Original |
|--------|-----------|----------|
| Discussion Handling | Paginated responses | All-at-once |
| Response Size | 65-80% token reduction | Full GitLab API response |
| Code Size | ~500 lines | ~3,490 lines |
| Tool Count | 11 focused | 40+ comprehensive |
| Architecture | Modular TypeScript | Monolithic |
| Vulnerability Data | Enhanced with fixes | Standard GitLab data |
| Issue Operations | Optimized (80% reduction) | Full API response |
| Note Creation | Optimized (75% reduction) | Full API response |
| Optimization Pattern | Two-stage validation | Direct API passthrough |

Both versions serve different use cases - this fork specifically optimizes for AI agent workflows.

---

## Token Usage Examples

**Before Optimization (Full GitLab API Response):**
```json
{
  "id": 123,
  "iid": 42,
  "project_id": 456,
  "title": "Fix authentication bug",
  "author": {
    "id": 789, "username": "dev", "name": "Developer",
    "avatar_url": "https://...", "web_url": "https://...",
    "state": "active", "email": "dev@example.com"
  },
  "labels": [
    {
      "id": 101, "name": "bug", "color": "#d73a4a",
      "description": "Something isn't working",
      "open_issues_count": 15, "closed_issues_count": 8
    }
  ],
  // ... 15+ more fields
}
```

**After Optimization (Essential Fields Only):**
```json
{
  "iid": 42,
  "title": "Fix authentication bug",
  "author": { "username": "dev" },
  "labels": ["bug"],
  "state": "opened",
  "created_at": "2024-01-15T10:30:00.000Z",
  "web_url": "https://gitlab.com/project/issues/42"
}
```

---

## Use Cases

This fork may be helpful if you're:
- Using AI assistants for code review workflows
- Working with large merge requests (many discussions)
- Focused on security vulnerability management
- Looking for more efficient token usage with LLM APIs
- Wanting a simpler, more maintainable codebase
- Processing high-volume GitLab operations

---

## Contributing

Contributions are welcome! The modular architecture makes it easier to add features or make improvements. Each component is focused on a specific functionality.

---

## Credits

Built upon the excellent foundation of the [original GitLab MCP server](https://github.com/zereight/mcp-gitlab) by [@zereight](https://github.com/zereight). This fork adapts the codebase for specific AI workflow optimizations.

---

## License

Same license as the original project.
