# Chatbot Component API Documentation

## Base URL
```
POST /chatbot
```

## Overview
This API provides 25 operations divided into 6 main resources for managing the chatbot component queue system.

## Request Format
All requests are sent via POST method with the action specified in URL query parameters:

**URL Format:**
```
POST /chatbot?action=operation_name
```

**Request Body (for CREATE/UPDATE operations):**
```json
{
  // operation-specific parameters only
}
```

**Query Parameters (for GET/LIST/STATUS operations):**
```
POST /chatbot?action=operation_name&param1=value1&param2=value2
```

> **Note:** Operations containing "get", "list", or "status" in their names use query parameters instead of request body.

## Response Format
All responses follow this format:
```json
{
  "success": true|false,
  "data": {
    // operation-specific response data
  },
  "error": "error message (if any)"
}
```

---

## 1. Queue Operations

### 1.1 queue_enqueue
Add new item to queue

**URL:**
```
POST /chatbot?action=queue_enqueue
```

**Request Body:**
```json
{
  "componentId": "string",        // required
  "conversationId": "string",     // required
  "messageId": "string",          // required
  "message": "string",            // required
  "messageType": "text|image|file", // optional, default: "text"
  "priority": number,             // optional, default: 1
  "metadata": {                   // optional
    "key": "value"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "queueId": number
  }
}
```

### 1.2 queue_dequeue
Get next item from queue

**URL:**
```
POST /chatbot?action=queue_dequeue
```

**Request Body:**
```json
{
  "componentId": "string"  // optional - filter by component
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": number,
    "componentId": "string",
    "conversationId": "string",
    "messageId": "string",
    "message": "string",
    "messageType": "text|image|file",
    "status": "pending|processing|completed|failed",
    "priority": number,
    "createdAt": "ISO string",
    "startedAt": "ISO string",
    "completedAt": "ISO string",
    "prUrl": "string",
    "branchName": "string",
    "errorMessage": "string",
    "retryCount": number,
    "metadata": {}
  }
}
```

### 1.3 queue_update
Update queue item

**Request Body:**
```json
{
  "query": {
    "action": "queue_update"
  },
  "body": {
    "queueId": number,              // required
    "status": "pending|processing|completed|failed", // optional
    "prUrl": "string",              // optional
    "branchName": "string",         // optional
    "errorMessage": "string"        // optional
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated": true
  }
}
```

### 1.4 queue_get
Get queue item by ID

**URL:**
```
POST /chatbot?action=queue_get&queueId=1
```

**Query Parameters:**
- `queueId` (required): Queue item ID

**Response:** Same as queue_dequeue response

### 1.5 queue_getByComponentId
Get queue items by component ID

**URL:**
```
POST /chatbot?action=queue_getByComponentId&componentId=comp-001
```

**Query Parameters:**
- `componentId` (required): Component ID

**Response:**
```json
{
  "success": true,
  "data": [
    // Array of queue items (same format as queue_dequeue)
  ]
}
```

### 1.6 queue_getStatus
Get queue status statistics

**URL:**
```
POST /chatbot?action=queue_getStatus
```

**Query Parameters:** No parameters needed

**Response:**
```json
{
  "success": true,
  "data": {
    "pending": number,
    "processing": number,
    "completed": number,
    "failed": number,
    "total": number
  }
}
```

---

## 2. Processing History Operations

### 2.1 history_add
Add processing history entry

**Request Body:**
```json
{
  "query": {
    "action": "history_add"
  },
  "body": {
    "queueId": number,      // required
    "action": "string",     // required
    "details": {            // optional
      "key": "value"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "historyId": number
  }
}
```

### 2.2 history_get
Get processing history

**Request Body:**
```json
{
  "query": {
    "action": "history_get"
  },
  "body": {
    "queueId": number  // optional - filter by queue ID
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": number,
      "queueId": number,
      "action": "string",
      "details": {},
      "timestamp": "ISO string"
    }
  ]
}
```

---

## 3. Health Operations

### 3.1 health_getStatus
Check system health status

**Request Body:**
```json
{
  "query": {
    "action": "health_getStatus"
  },
  "body": {}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": number,
    "check_name": "string",
    "status": "healthy|unhealthy|warning",
    "message": "string",
    "checked_at": "ISO string"
  }
}
```

---

## 4. Conversation Operations

### 4.1 conversation_create
Create new conversation

**URL:**
```
POST /chatbot?action=conversation_create
```

**Request Body:**
```json
{
  "conversationId": "string",     // required
  "componentId": "string",        // required
  "title": "string",              // required
  "status": "active|completed|archived", // optional, default: "active"
  "metadata": {                   // optional
    "key": "value"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "string"
  }
}
```

### 4.2 conversation_get
Get conversation information

**Request Body:**
```json
{
  "query": {
    "action": "conversation_get"
  },
  "body": {
    "conversationId": "string"  // required
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "componentId": "string",
    "title": "string",
    "status": "active|completed|archived",
    "createdAt": "ISO string",
    "updatedAt": "ISO string",
    "metadata": {}
  }
}
```

### 4.3 conversation_list
List conversations

**Request Body:**
```json
{
  "query": {
    "action": "conversation_list"
  },
  "body": {
    "componentId": "string"  // optional - filter by component
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    // Array of conversation objects (same format as conversation_get)
  ]
}
```

### 4.4 conversation_update
Update conversation

**Request Body:**
```json
{
  "query": {
    "action": "conversation_update"
  },
  "body": {
    "conversationId": "string",     // required
    "title": "string",              // optional
    "status": "active|completed|archived", // optional
    "metadata": {                   // optional
      "key": "value"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated": true
  }
}
```

### 4.5 conversation_delete
Delete conversation

**Request Body:**
```json
{
  "query": {
    "action": "conversation_delete"
  },
  "body": {
    "conversationId": "string"  // required
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

### 4.6 conversation_getStatus
Get conversation status statistics

**Request Body:**
```json
{
  "query": {
    "action": "conversation_getStatus"
  },
  "body": {}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "active": number,
    "completed": number,
    "archived": number,
    "total": number
  }
}
```

---

## 5. Message Operations

### 5.1 message_create
Create new message

**Request Body:**
```json
{
  "query": {
    "action": "message_create"
  },
  "body": {
    "messageId": "string",          // required
    "conversationId": "string",     // required
    "content": "string",            // required
    "role": "user|assistant|system", // required
    "type": "text|code|image|component|error|system", // optional, default: "text"
    "status": "sending|sent|received|error|processing", // optional, default: "sent"
    "metadata": {                   // optional
      "key": "value"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "string"
  }
}
```

### 5.2 message_get
Get message information

**Request Body:**
```json
{
  "query": {
    "action": "message_get"
  },
  "body": {
    "messageId": "string"  // required
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "conversationId": "string",
    "content": "string",
    "role": "user|assistant|system",
    "type": "text|code|image|component|error|system",
    "status": "sending|sent|received|error|processing",
    "createdAt": "ISO string",
    "updatedAt": "ISO string",
    "metadata": {}
  }
}
```

### 5.3 message_list
List messages

**Request Body:**
```json
{
  "query": {
    "action": "message_list"
  },
  "body": {
    "conversationId": "string"  // optional - filter by conversation
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    // Array of message objects (same format as message_get)
  ]
}
```

### 5.4 message_update
Update message

**Request Body:**
```json
{
  "query": {
    "action": "message_update"
  },
  "body": {
    "messageId": "string",          // required
    "content": "string",            // optional
    "status": "sending|sent|received|error|processing", // optional
    "metadata": {                   // optional
      "key": "value"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated": true
  }
}
```

### 5.5 message_delete
Delete message

**Request Body:**
```json
{
  "query": {
    "action": "message_delete"
  },
  "body": {
    "messageId": "string"  // required
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

---

## 6. Message Attachment Operations

### 6.1 attachment_create
Create new message attachment

**Request Body:**
```json
{
  "query": {
    "action": "attachment_create"
  },
  "body": {
    "messageId": "string",          // required
    "fileName": "string",           // required
    "fileType": "string",           // required
    "fileSize": number,             // optional
    "fileUrl": "string",            // optional
    "uploadStatus": "pending|uploading|complete|error", // optional, default: "pending"
    "metadata": {                   // optional
      "key": "value"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attachmentId": number
  }
}
```

### 6.2 attachment_get
Get attachment information

**Request Body:**
```json
{
  "query": {
    "action": "attachment_get"
  },
  "body": {
    "attachmentId": number  // required
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": number,
    "messageId": "string",
    "fileName": "string",
    "fileType": "string",
    "fileSize": number,
    "fileUrl": "string",
    "uploadStatus": "pending|uploading|complete|error",
    "createdAt": "ISO string",
    "metadata": {}
  }
}
```

### 6.3 attachment_getByMessageId
Get attachments by message ID

**Request Body:**
```json
{
  "query": {
    "action": "attachment_getByMessageId"
  },
  "body": {
    "messageId": "string"  // required
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    // Array of attachment objects (same format as attachment_get)
  ]
}
```

### 6.4 attachment_update
Update attachment

**Request Body:**
```json
{
  "query": {
    "action": "attachment_update"
  },
  "body": {
    "attachmentId": number,         // required
    "fileName": "string",           // optional
    "fileType": "string",           // optional
    "fileSize": number,             // optional
    "fileUrl": "string",            // optional
    "uploadStatus": "pending|uploading|complete|error", // optional
    "metadata": {                   // optional
      "key": "value"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated": true
  }
}
```

### 6.5 attachment_delete
Delete attachment

**Request Body:**
```json
{
  "query": {
    "action": "attachment_delete"
  },
  "body": {
    "attachmentId": number  // required
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

---

## Error Responses

When errors occur, the API will return:
```json
{
  "success": false,
  "error": "Detailed error message"
}
```

## Data Types Reference

### Enums

**QueueStatus:**
- `pending` - Waiting to be processed
- `processing` - Currently processing
- `completed` - Completed successfully
- `failed` - Failed

**MessageType:**
- `text` - Text message
- `image` - Image message
- `file` - File message

**ConversationStatus:**
- `active` - Active
- `completed` - Completed
- `archived` - Archived

**MessageRole:**
- `user` - Message from user
- `assistant` - Message from assistant
- `system` - System message

**MessageChatType:**
- `text` - Text message
- `code` - Code snippet
- `image` - Image message
- `component` - UI component
- `error` - Error message
- `system` - System message

**MessageStatus:**
- `sending` - Sending
- `sent` - Sent
- `received` - Received
- `error` - Error
- `processing` - Processing

**MessageAttachmentUploadStatus:**
- `pending` - Pending upload
- `uploading` - Uploading
- `complete` - Upload complete
- `error` - Upload error

**HealthStatus:**
- `healthy` - Healthy
- `unhealthy` - Unhealthy
- `warning` - Warning

## Notes
- All timestamps are returned as ISO 8601 strings
- Metadata fields can contain any valid JSON object
- IDs may be strings or numbers depending on resource type
- Optional fields may be omitted in request body