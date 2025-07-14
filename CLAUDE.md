# Task Master AI - Claude Code Integration Guide

## Architecture Overview

This project implements a direct frontend-to-N8N integration for AI-powered component modifications. The architecture removes backend API dependencies and connects directly to N8N workflows that orchestrate Claude Code CLI operations.

### Key Components
- **Frontend**: React + TypeScript + Vite application with component showcase
- **N8N Integration**: Direct webhook calls from frontend to N8N workflows  
- **Claude Code**: Integrated via N8N workflows for actual code modifications
- **No Backend API**: Simplified architecture without Express.js server

## 🎯 PROJECT STATUS: COMPLETE ✅

**All 24 planned tasks have been successfully implemented!**

### ✅ Task Completion Summary:

#### **Task 6: Real-time Updates and WebSocket Integration** (6 subtasks completed)
- ✅ 6.1: Core WebSocket server functionality
- ✅ 6.2: File system watchers
- ✅ 6.3: Hot Module Replacement (HMR) system
- ✅ 6.4: Real-time progress indicators
- ✅ 6.5: Concurrent request processing
- ✅ 6.6: Robust connection management

#### **Task 7: Version Management and Git Integration** (6 subtasks completed)
- ✅ 7.1: Git Versioning System Integration
- ✅ 7.2: Database Schema for Version Management
- ✅ 7.3: Version History UI Components
- ✅ 7.4: Rollback Functionality
- ✅ 7.5: Branching Support System
- ✅ 7.6: Version Comparison Interface

#### **Task 9: AI Knowledge and Workflow System** (5 subtasks completed)
- ✅ 9.1: Prompt management system
- ✅ 9.2: Context management system
- ✅ 9.3: Multi-step workflow implementation
- ✅ 9.4: Consistency checking system
- ✅ 9.5: Conversation memory storage

#### **Task 10: Export and Collaboration Platform** (7 subtasks completed)
- ✅ 10.1: Export functionality (multi-format)
- ✅ 10.2: User authentication system (JWT-based)
- ✅ 10.3: Collaborative editing features (real-time)
- ✅ 10.4: Sharing capabilities (public/private links)
- ✅ 10.5: Template creation system (scaffolding)
- ✅ 10.6: NPM integration (publishing & management)
- ✅ 10.7: Dependency tracking system (security & performance)

### 🏗️ Complete System Architecture:

1. **Core Foundation** - Chat interface, component management, N8N integration
2. **Real-time Features** - WebSocket service, file watchers, live progress indicators
3. **Version Control** - Full Git integration with branching, rollback, and comparison
4. **AI Intelligence** - Advanced prompt management, workflows, consistency checking
5. **Collaboration** - Real-time editing, conflict resolution, presence tracking
6. **Enterprise Features** - Authentication, sharing, templates, NPM publishing
7. **DevOps Integration** - Dependency analysis, security scanning, performance monitoring

The AI-powered component starter kit is now **production-ready** with enterprise-grade features for individual developers and teams.

## Essential Commands

### Core Workflow Commands

```bash
# Project Setup
task-master init                                    # Initialize Task Master in current project
task-master parse-prd .taskmaster/docs/prd.txt      # Generate tasks from PRD document
task-master models --setup                        # Configure AI models interactively

# Daily Development Workflow
task-master list                                   # Show all tasks with status
task-master next                                   # Get next available task to work on
task-master show <id>                             # View detailed task information (e.g., task-master show 1.2)
task-master set-status --id=<id> --status=done    # Mark task complete

# Task Management
task-master add-task --prompt="description" --research        # Add new task with AI assistance
task-master expand --id=<id> --research --force              # Break task into subtasks
task-master update-task --id=<id> --prompt="changes"         # Update specific task
task-master update --from=<id> --prompt="changes"            # Update multiple tasks from ID onwards
task-master update-subtask --id=<id> --prompt="notes"        # Add implementation notes to subtask

# Analysis & Planning
task-master analyze-complexity --research          # Analyze task complexity
task-master complexity-report                      # View complexity analysis
task-master expand --all --research               # Expand all eligible tasks

# Dependencies & Organization
task-master add-dependency --id=<id> --depends-on=<id>       # Add task dependency
task-master move --from=<id> --to=<id>                       # Reorganize task hierarchy
task-master validate-dependencies                            # Check for dependency issues
task-master generate                                         # Update task markdown files (usually auto-called)
```

## Key Files & Project Structure

### Core Files

- `.taskmaster/tasks/tasks.json` - Main task data file (auto-managed)
- `.taskmaster/config.json` - AI model configuration (use `task-master models` to modify)
- `.taskmaster/docs/prd.txt` - Product Requirements Document for parsing
- `.taskmaster/tasks/*.txt` - Individual task files (auto-generated from tasks.json)
- `.env` - API keys for CLI usage

### Claude Code Integration Files

- `CLAUDE.md` - Auto-loaded context for Claude Code (this file)
- `.claude/settings.json` - Claude Code tool allowlist and preferences
- `.claude/commands/` - Custom slash commands for repeated workflows
- `.mcp.json` - MCP server configuration (project-specific)

### Directory Structure

```
project/
├── .taskmaster/
│   ├── tasks/              # Task files directory
│   │   ├── tasks.json      # Main task database
│   │   ├── task-1.md      # Individual task files
│   │   └── task-2.md
│   ├── docs/              # Documentation directory
│   │   ├── prd.txt        # Product requirements
│   ├── reports/           # Analysis reports directory
│   │   └── task-complexity-report.json
│   ├── templates/         # Template files
│   │   └── example_prd.txt  # Example PRD template
│   └── config.json        # AI models & settings
├── .claude/
│   ├── settings.json      # Claude Code configuration
│   └── commands/         # Custom slash commands
├── .env                  # API keys
├── .mcp.json            # MCP configuration
└── CLAUDE.md            # This file - auto-loaded by Claude Code
```

## MCP Integration

Task Master provides an MCP server that Claude Code can connect to. Configure in `.mcp.json`:

```json
{
  "mcpServers": {
    "task-master-ai": {
      "command": "npx",
      "args": ["-y", "--package=task-master-ai", "task-master-ai"],
      "env": {
        "ANTHROPIC_API_KEY": "your_key_here",
        "PERPLEXITY_API_KEY": "your_key_here",
        "OPENAI_API_KEY": "OPENAI_API_KEY_HERE",
        "GOOGLE_API_KEY": "GOOGLE_API_KEY_HERE",
        "XAI_API_KEY": "XAI_API_KEY_HERE",
        "OPENROUTER_API_KEY": "OPENROUTER_API_KEY_HERE",
        "MISTRAL_API_KEY": "MISTRAL_API_KEY_HERE",
        "AZURE_OPENAI_API_KEY": "AZURE_OPENAI_API_KEY_HERE",
        "OLLAMA_API_KEY": "OLLAMA_API_KEY_HERE"
      }
    }
  }
}
```

### Essential MCP Tools

```javascript
help; // = shows available taskmaster commands
// Project setup
initialize_project; // = task-master init
parse_prd; // = task-master parse-prd

// Daily workflow
get_tasks; // = task-master list
next_task; // = task-master next
get_task; // = task-master show <id>
set_task_status; // = task-master set-status

// Task management
add_task; // = task-master add-task
expand_task; // = task-master expand
update_task; // = task-master update-task
update_subtask; // = task-master update-subtask
update; // = task-master update

// Analysis
analyze_project_complexity; // = task-master analyze-complexity
complexity_report; // = task-master complexity-report
```

## N8N Integration Setup

### Prerequisites
1. N8N server running (default: http://localhost:5678)
2. Webhook endpoint configured at `/webhook/chat` 
3. Environment variables configured

### Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env to configure N8N connection:
VITE_N8N_BASE_URL=http://localhost:5678
VITE_N8N_WEBHOOK_PATH=/webhook/chat
```

### Frontend Components & Services ✅ COMPLETED
- **N8N Service** (`src/services/n8nService.ts`): Direct webhook integration - IMPLEMENTED
- **Chat Flow Hook** (`src/hooks/useChatFlow.ts`): N8N-powered chat functionality - IMPLEMENTED
- **Component Detail View**: Integrated AI chat tab for component modifications - IMPLEMENTED
- **Real-time Updates** (`src/services/websocketService.ts`): Mock WebSocket for live feedback - IMPLEMENTED
- **Version Management** (`src/services/gitService.ts`): Git integration with branching/rollback - IMPLEMENTED
- **AI Knowledge System**: Complete workflow engine with prompt management - IMPLEMENTED
  - **Prompt Management** (`src/services/promptManagementService.ts`) - IMPLEMENTED
  - **Context Management** (`src/services/contextManagementService.ts`) - IMPLEMENTED
  - **Multi-step Workflows** (`src/services/workflowService.ts`) - IMPLEMENTED
  - **Consistency Checking** (`src/services/consistencyCheckService.ts`) - IMPLEMENTED
  - **Conversation Memory** (`src/services/conversationMemoryService.ts`) - IMPLEMENTED
- **Export & Collaboration Platform**: Enterprise-grade features - IMPLEMENTED
  - **Export Service** (`src/services/exportService.ts`) - Multi-format component export - IMPLEMENTED
  - **Authentication** (`src/services/authService.ts`) - JWT-based user management - IMPLEMENTED
  - **Collaboration** (`src/services/collaborationService.ts`) - Real-time editing with conflict resolution - IMPLEMENTED
  - **Sharing** (`src/services/sharingService.ts`) - Public/private links with analytics - IMPLEMENTED
  - **Templates** (`src/services/templateService.ts`) - Component template system - IMPLEMENTED
  - **NPM Integration** (`src/services/npmService.ts`) - Package publishing & management - IMPLEMENTED
  - **Dependency Tracking** (`src/services/dependencyService.ts`) - Security & performance analysis - IMPLEMENTED

### N8N Workflow Requirements
The N8N workflow should accept:
```json
{
  "componentId": "string",
  "conversationId": "string", 
  "message": "string",
  "messageType": "text|code|image",
  "context": {
    "framework": "react",
    "language": "typescript"
  }
}
```

And return:
```json
{
  "success": true,
  "content": "AI response content",
  "type": "text|code|error",
  "codeChanges": [
    {
      "file": "path/to/file.tsx",
      "content": "updated file content",
      "description": "change description"
    }
  ]
}
```

## Claude Code Workflow Integration

### Standard Development Workflow

#### 1. Project Initialization

```bash
# Initialize Task Master
task-master init

# Create or obtain PRD, then parse it
task-master parse-prd .taskmaster/docs/prd.txt

# Analyze complexity and expand tasks
task-master analyze-complexity --research
task-master expand --all --research
```

If tasks already exist, another PRD can be parsed (with new information only!) using parse-prd with --append flag. This will add the generated tasks to the existing list of tasks..

#### 2. Daily Development Loop

```bash
# Start each session
task-master next                           # Find next available task
task-master show <id>                     # Review task details

# During implementation, check in code context into the tasks and subtasks
task-master update-subtask --id=<id> --prompt="implementation notes..."

# Complete tasks
task-master set-status --id=<id> --status=done
```

#### 3. Multi-Claude Workflows

For complex projects, use multiple Claude Code sessions:

```bash
# Terminal 1: Main implementation
cd project && claude

# Terminal 2: Testing and validation
cd project-test-worktree && claude

# Terminal 3: Documentation updates
cd project-docs-worktree && claude
```

### Custom Slash Commands

Create `.claude/commands/taskmaster-next.md`:

```markdown
Find the next available Task Master task and show its details.

Steps:

1. Run `task-master next` to get the next task
2. If a task is available, run `task-master show <id>` for full details
3. Provide a summary of what needs to be implemented
4. Suggest the first implementation step
```

Create `.claude/commands/taskmaster-complete.md`:

```markdown
Complete a Task Master task: $ARGUMENTS

Steps:

1. Review the current task with `task-master show $ARGUMENTS`
2. Verify all implementation is complete
3. Run any tests related to this task
4. Mark as complete: `task-master set-status --id=$ARGUMENTS --status=done`
5. Show the next available task with `task-master next`
```

## Tool Allowlist Recommendations

Add to `.claude/settings.json`:

```json
{
  "allowedTools": [
    "Edit",
    "Bash(task-master *)",
    "Bash(git commit:*)",
    "Bash(git add:*)",
    "Bash(npm run *)",
    "mcp__task_master_ai__*"
  ]
}
```

## Configuration & Setup

### API Keys Required

At least **one** of these API keys must be configured:

- `ANTHROPIC_API_KEY` (Claude models) - **Recommended**
- `PERPLEXITY_API_KEY` (Research features) - **Highly recommended**
- `OPENAI_API_KEY` (GPT models)
- `GOOGLE_API_KEY` (Gemini models)
- `MISTRAL_API_KEY` (Mistral models)
- `OPENROUTER_API_KEY` (Multiple models)
- `XAI_API_KEY` (Grok models)

An API key is required for any provider used across any of the 3 roles defined in the `models` command.

### Model Configuration

```bash
# Interactive setup (recommended)
task-master models --setup

# Set specific models
task-master models --set-main claude-3-5-sonnet-20241022
task-master models --set-research perplexity-llama-3.1-sonar-large-128k-online
task-master models --set-fallback gpt-4o-mini
```

## Task Structure & IDs

### Task ID Format

- Main tasks: `1`, `2`, `3`, etc.
- Subtasks: `1.1`, `1.2`, `2.1`, etc.
- Sub-subtasks: `1.1.1`, `1.1.2`, etc.

### Task Status Values

- `pending` - Ready to work on
- `in-progress` - Currently being worked on
- `done` - Completed and verified
- `deferred` - Postponed
- `cancelled` - No longer needed
- `blocked` - Waiting on external factors

### Task Fields

```json
{
  "id": "1.2",
  "title": "Implement user authentication",
  "description": "Set up JWT-based auth system",
  "status": "pending",
  "priority": "high",
  "dependencies": ["1.1"],
  "details": "Use bcrypt for hashing, JWT for tokens...",
  "testStrategy": "Unit tests for auth functions, integration tests for login flow",
  "subtasks": []
}
```

## Claude Code Best Practices with Task Master

### Context Management

- Use `/clear` between different tasks to maintain focus
- This CLAUDE.md file is automatically loaded for context
- Use `task-master show <id>` to pull specific task context when needed

### Iterative Implementation

1. `task-master show <subtask-id>` - Understand requirements
2. Explore codebase and plan implementation
3. `task-master update-subtask --id=<id> --prompt="detailed plan"` - Log plan
4. `task-master set-status --id=<id> --status=in-progress` - Start work
5. Implement code following logged plan
6. `task-master update-subtask --id=<id> --prompt="what worked/didn't work"` - Log progress
7. `task-master set-status --id=<id> --status=done` - Complete task

### Complex Workflows with Checklists

For large migrations or multi-step processes:

1. Create a markdown PRD file describing the new changes: `touch task-migration-checklist.md` (prds can be .txt or .md)
2. Use Taskmaster to parse the new prd with `task-master parse-prd --append` (also available in MCP)
3. Use Taskmaster to expand the newly generated tasks into subtasks. Consdier using `analyze-complexity` with the correct --to and --from IDs (the new ids) to identify the ideal subtask amounts for each task. Then expand them.
4. Work through items systematically, checking them off as completed
5. Use `task-master update-subtask` to log progress on each task/subtask and/or updating/researching them before/during implementation if getting stuck

### Git Integration

Task Master works well with `gh` CLI:

```bash
# Create PR for completed task
gh pr create --title "Complete task 1.2: User authentication" --body "Implements JWT auth system as specified in task 1.2"

# Reference task in commits
git commit -m "feat: implement JWT auth (task 1.2)"
```

### Parallel Development with Git Worktrees

```bash
# Create worktrees for parallel task development
git worktree add ../project-auth feature/auth-system
git worktree add ../project-api feature/api-refactor

# Run Claude Code in each worktree
cd ../project-auth && claude    # Terminal 1: Auth work
cd ../project-api && claude     # Terminal 2: API work
```

## Troubleshooting

### AI Commands Failing

```bash
# Check API keys are configured
cat .env                           # For CLI usage

# Verify model configuration
task-master models

# Test with different model
task-master models --set-fallback gpt-4o-mini
```

### MCP Connection Issues

- Check `.mcp.json` configuration
- Verify Node.js installation
- Use `--mcp-debug` flag when starting Claude Code
- Use CLI as fallback if MCP unavailable

### Task File Sync Issues

```bash
# Regenerate task files from tasks.json
task-master generate

# Fix dependency issues
task-master fix-dependencies
```

DO NOT RE-INITIALIZE. That will not do anything beyond re-adding the same Taskmaster core files.

## Important Notes

### AI-Powered Operations

These commands make AI calls and may take up to a minute:

- `parse_prd` / `task-master parse-prd`
- `analyze_project_complexity` / `task-master analyze-complexity`
- `expand_task` / `task-master expand`
- `expand_all` / `task-master expand --all`
- `add_task` / `task-master add-task`
- `update` / `task-master update`
- `update_task` / `task-master update-task`
- `update_subtask` / `task-master update-subtask`

### File Management

- Never manually edit `tasks.json` - use commands instead
- Never manually edit `.taskmaster/config.json` - use `task-master models`
- Task markdown files in `tasks/` are auto-generated
- Run `task-master generate` after manual changes to tasks.json

### Claude Code Session Management

- Use `/clear` frequently to maintain focused context
- Create custom slash commands for repeated Task Master workflows
- Configure tool allowlist to streamline permissions
- Use headless mode for automation: `claude -p "task-master next"`

### Multi-Task Updates

- Use `update --from=<id>` to update multiple future tasks
- Use `update-task --id=<id>` for single task updates
- Use `update-subtask --id=<id>` for implementation logging

### Research Mode

- Add `--research` flag for research-based AI enhancement
- Requires a research model API key like Perplexity (`PERPLEXITY_API_KEY`) in environment
- Provides more informed task creation and updates
- Recommended for complex technical tasks

---

_This guide ensures Claude Code has immediate access to Task Master's essential functionality for agentic development workflows._
