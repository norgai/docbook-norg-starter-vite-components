# N8N Workflow Templates for Component AI Chat

This directory contains N8N workflow templates that integrate with the React component showcase application to provide AI-powered component modification capabilities.

## Overview

The N8N workflows act as a bridge between the frontend chat interface and Claude Code CLI, providing:

- **Webhook Reception**: Receives chat messages from the frontend
- **Text Processing**: Parses and analyzes user requests
- **Conditional Logic**: Routes requests based on modification type
- **Claude API Integration**: Processes requests with Claude AI
- **Claude Code Execution**: Executes actual code modifications
- **Response Formatting**: Returns structured responses to frontend

## Prerequisites

### N8N Server Requirements
- N8N v1.0+ installed and running
- Node.js 18+ environment
- Access to external APIs (Claude, webhooks)
- File system access for Claude Code CLI execution

### API Keys Required
- **Anthropic API Key**: For Claude AI integration
- **Optional**: Additional AI provider keys for redundancy

### System Requirements
- Claude Code CLI installed and accessible
- Git repository with proper permissions
- Network access for webhook communication

## Installation Steps

### 1. N8N Server Setup

```bash
# Install N8N globally
npm install -g n8n

# Or run with npx
npx n8n

# Or use Docker
docker run -d --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
```

### 2. Environment Configuration

Create `.env` file in N8N directory:

```env
# N8N Configuration
N8N_HOST=localhost
N8N_PORT=5678
N8N_PROTOCOL=http

# API Keys
ANTHROPIC_API_KEY=your_anthropic_key_here
N8N_ENCRYPTION_KEY=your_encryption_key_here

# Claude Code CLI Path
CLAUDE_CODE_CLI_PATH=/usr/local/bin/claude-code

# Security Settings
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_secure_password

# Webhook Security
N8N_WEBHOOK_URL=http://localhost:5678/
```

### 3. Import Workflow Templates

1. Start N8N server
2. Open N8N interface (http://localhost:5678)
3. Go to **Workflows** → **Import from JSON**
4. Import each workflow file from the `templates/` directory

### 4. Configure Workflow Variables

For each imported workflow, update the following variables:

#### Component Chat Main Workflow
- **FRONTEND_URL**: Your Vite app URL (default: http://localhost:5173)
- **ANTHROPIC_API_KEY**: Your Claude API key
- **CLAUDE_CODE_PATH**: Path to Claude Code CLI
- **REPOSITORY_PATH**: Path to your component repository

#### Error Handling Workflow
- **WEBHOOK_ERROR_URL**: Error notification endpoint
- **MAX_RETRIES**: Maximum retry attempts (default: 3)
- **TIMEOUT_MS**: Request timeout in milliseconds (default: 30000)

## Workflow Templates

### 1. Component Chat Main Workflow (`component-chat-main.json`)
**Purpose**: Primary workflow for handling component modification requests

**Trigger**: Webhook POST `/webhook/chat`

**Flow**:
1. **Webhook Trigger** → Receives frontend requests
2. **Input Validation** → Validates request structure
3. **Request Type Detection** → Analyzes modification type
4. **Claude Processing** → Sends request to Claude API
5. **Response Parsing** → Extracts code changes
6. **Claude Code Execution** → Applies changes to codebase
7. **Response Formatting** → Returns structured response

### 2. Error Handling Workflow (`error-handling.json`)
**Purpose**: Handles errors and implements retry logic

**Trigger**: HTTP request from main workflow

**Flow**:
1. **Error Classification** → Categorizes error types
2. **Retry Logic** → Implements exponential backoff
3. **Fallback Responses** → Provides user-friendly error messages
4. **Logging** → Records error details for debugging

### 3. Code Validation Workflow (`code-validation.json`)
**Purpose**: Validates generated code before application

**Trigger**: HTTP request from main workflow

**Flow**:
1. **Syntax Check** → Validates TypeScript/JavaScript syntax
2. **Linting** → Runs ESLint checks
3. **Type Check** → Validates TypeScript types
4. **Test Execution** → Runs relevant tests
5. **Approval Gate** → Confirms changes are safe

## Testing the Integration

### 1. Test Webhook Endpoint

```bash
curl -X POST http://localhost:5678/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{
    "componentId": "test-component",
    "conversationId": "test-conv-1",
    "message": "Change the button color to blue",
    "messageType": "text",
    "context": {
      "framework": "react",
      "language": "typescript"
    }
  }'
```

### 2. Expected Response Format

```json
{
  "success": true,
  "content": "I've updated the button color to blue.",
  "type": "text",
  "codeChanges": [
    {
      "file": "src/components/Button.tsx",
      "content": "// Updated component code...",
      "description": "Changed button color to blue"
    }
  ]
}
```

## Security Considerations

### Authentication
- Enable N8N basic authentication
- Use strong passwords
- Consider OAuth for production

### API Key Management
- Store API keys in N8N credentials
- Rotate keys regularly
- Monitor API usage

### Code Execution Safety
- Validate all user inputs
- Sanitize file paths
- Run in isolated environment
- Implement rollback mechanisms

## Troubleshooting

### Common Issues

#### Webhook Not Receiving Requests
- Check N8N server status
- Verify webhook URL configuration
- Test with curl command
- Check firewall settings

#### Claude API Errors
- Verify API key validity
- Check request rate limits
- Monitor API usage quotas
- Implement proper error handling

#### Claude Code CLI Issues
- Ensure CLI is installed correctly
- Check file permissions
- Verify repository access
- Test CLI commands manually

### Debug Mode
Enable N8N debug logging:

```env
N8N_LOG_LEVEL=debug
N8N_LOG_OUTPUT=file
N8N_LOG_FILE=n8n.log
```

### Monitoring
- Monitor workflow execution times
- Track error rates
- Log all API calls
- Set up alerts for failures

## Production Deployment

### Scaling Considerations
- Use Redis for queue management
- Implement horizontal scaling
- Set up load balancing
- Monitor resource usage

### Backup and Recovery
- Export workflow configurations
- Backup execution data
- Document recovery procedures
- Test restore processes

### Maintenance
- Regular security updates
- API key rotation
- Performance monitoring
- Workflow optimization

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review N8N documentation
3. Check Claude Code CLI documentation
4. Create GitHub issue for bugs

## Version History

- **v1.0.0**: Initial workflow templates
- **v1.1.0**: Added error handling workflow
- **v1.2.0**: Added code validation workflow
- **v2.0.0**: Enhanced security and monitoring