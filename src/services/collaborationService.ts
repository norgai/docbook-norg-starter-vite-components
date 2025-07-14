// Collaborative Editing Service
// Enables real-time collaborative editing of components with conflict resolution

export interface CollaborationSession {
  id: string;
  componentId: string;
  hostUserId: string;
  participants: SessionParticipant[];
  status: 'active' | 'paused' | 'ended';
  permissions: SessionPermissions;
  settings: SessionSettings;
  metadata: {
    createdAt: string;
    lastActivity: string;
    totalEdits: number;
    duration: number;
  };
}

export interface SessionParticipant {
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  role: 'host' | 'editor' | 'viewer';
  status: 'active' | 'idle' | 'disconnected';
  permissions: ParticipantPermissions;
  cursor: {
    position: number;
    selection?: { start: number; end: number };
    color: string;
  };
  joinedAt: string;
  lastActivity: string;
}

export interface SessionPermissions {
  allowEdit: boolean;
  allowComment: boolean;
  allowInvite: boolean;
  allowExport: boolean;
  requireApproval: boolean;
  lockSections: string[];
}

export interface ParticipantPermissions {
  canEdit: boolean;
  canComment: boolean;
  canInvite: boolean;
  canViewHistory: boolean;
  allowedSections: string[];
}

export interface SessionSettings {
  autoSave: boolean;
  autoSaveInterval: number;
  conflictResolution: 'manual' | 'automatic' | 'vote';
  notificationLevel: 'all' | 'mentions' | 'none';
  maxParticipants: number;
  sessionTimeout: number;
}

export interface EditOperation {
  id: string;
  sessionId: string;
  userId: string;
  timestamp: string;
  type: 'insert' | 'delete' | 'replace' | 'format' | 'move';
  position: number;
  length?: number;
  content?: string;
  metadata: {
    component: string;
    section: string;
    cursor: { line: number; column: number };
    confidence: number;
  };
}

export interface EditConflict {
  id: string;
  sessionId: string;
  operations: EditOperation[];
  type: 'concurrent' | 'overlapping' | 'semantic';
  severity: 'low' | 'medium' | 'high';
  resolution: ConflictResolution;
  timestamp: string;
}

export interface ConflictResolution {
  strategy: 'accept_local' | 'accept_remote' | 'merge' | 'manual';
  resolvedBy?: string;
  resolvedAt?: string;
  resolvedContent?: string;
  reasoning?: string;
}

export interface Comment {
  id: string;
  sessionId: string;
  userId: string;
  position: number;
  content: string;
  type: 'general' | 'suggestion' | 'question' | 'issue';
  status: 'open' | 'resolved' | 'archived';
  replies: CommentReply[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    mentions: string[];
    attachments: string[];
  };
}

export interface CommentReply {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface SyncState {
  version: number;
  checksum: string;
  lastSync: string;
  operations: EditOperation[];
  participants: string[];
  conflicts: EditConflict[];
}

export interface PresenceUpdate {
  userId: string;
  sessionId: string;
  cursor: {
    position: number;
    selection?: { start: number; end: number };
  };
  status: 'active' | 'idle';
  timestamp: string;
}

class CollaborationService {
  private sessions: Map<string, CollaborationSession> = new Map();
  private operations: Map<string, EditOperation[]> = new Map();
  private conflicts: Map<string, EditConflict[]> = new Map();
  private comments: Map<string, Comment[]> = new Map();
  private syncStates: Map<string, SyncState> = new Map();
  private presenceMap: Map<string, Map<string, PresenceUpdate>> = new Map();
  private isInitialized = false;

  // Initialize service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.setupEventHandlers();
    this.isInitialized = true;
    console.log('Collaboration service initialized');
  }

  // Create collaboration session
  async createSession(
    componentId: string,
    hostUserId: string,
    settings: Partial<SessionSettings> = {}
  ): Promise<CollaborationSession> {
    await this.ensureInitialized();

    const sessionId = this.generateId('session');
    const session: CollaborationSession = {
      id: sessionId,
      componentId,
      hostUserId,
      participants: [{
        userId: hostUserId,
        username: 'host',
        displayName: 'Session Host',
        role: 'host',
        status: 'active',
        permissions: {
          canEdit: true,
          canComment: true,
          canInvite: true,
          canViewHistory: true,
          allowedSections: []
        },
        cursor: {
          position: 0,
          color: this.generateCursorColor()
        },
        joinedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      }],
      status: 'active',
      permissions: {
        allowEdit: true,
        allowComment: true,
        allowInvite: true,
        allowExport: true,
        requireApproval: false,
        lockSections: []
      },
      settings: {
        autoSave: true,
        autoSaveInterval: 5000,
        conflictResolution: 'automatic',
        notificationLevel: 'mentions',
        maxParticipants: 10,
        sessionTimeout: 3600000,
        ...settings
      },
      metadata: {
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        totalEdits: 0,
        duration: 0
      }
    };

    this.sessions.set(sessionId, session);
    this.operations.set(sessionId, []);
    this.conflicts.set(sessionId, []);
    this.comments.set(sessionId, []);
    this.presenceMap.set(sessionId, new Map());

    // Initialize sync state
    this.syncStates.set(sessionId, {
      version: 0,
      checksum: this.generateChecksum(''),
      lastSync: new Date().toISOString(),
      operations: [],
      participants: [hostUserId],
      conflicts: []
    });

    console.log(`Created collaboration session: ${sessionId}`);
    return session;
  }

  // Join collaboration session
  async joinSession(
    sessionId: string,
    userId: string,
    userInfo: {
      username: string;
      displayName: string;
      avatar?: string;
    }
  ): Promise<SessionParticipant> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (session.status !== 'active') {
      throw new Error(`Session ${sessionId} is not active`);
    }

    if (session.participants.length >= session.settings.maxParticipants) {
      throw new Error('Session is full');
    }

    // Check if user is already in session
    const existingParticipant = session.participants.find(p => p.userId === userId);
    if (existingParticipant) {
      existingParticipant.status = 'active';
      existingParticipant.lastActivity = new Date().toISOString();
      return existingParticipant;
    }

    const participant: SessionParticipant = {
      userId,
      username: userInfo.username,
      displayName: userInfo.displayName,
      avatar: userInfo.avatar,
      role: 'editor',
      status: 'active',
      permissions: {
        canEdit: session.permissions.allowEdit,
        canComment: session.permissions.allowComment,
        canInvite: session.permissions.allowInvite,
        canViewHistory: true,
        allowedSections: []
      },
      cursor: {
        position: 0,
        color: this.generateCursorColor()
      },
      joinedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    session.participants.push(participant);
    session.metadata.lastActivity = new Date().toISOString();

    // Update sync state
    const syncState = this.syncStates.get(sessionId);
    if (syncState) {
      syncState.participants.push(userId);
    }

    this.sessions.set(sessionId, session);

    console.log(`User ${userId} joined session ${sessionId}`);
    return participant;
  }

  // Leave collaboration session
  async leaveSession(sessionId: string, userId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participantIndex = session.participants.findIndex(p => p.userId === userId);
    if (participantIndex === -1) return;

    // If host is leaving, transfer ownership or end session
    if (session.participants[participantIndex].role === 'host') {
      const nextHost = session.participants.find(p => p.userId !== userId && p.status === 'active');
      if (nextHost) {
        nextHost.role = 'host';
        session.hostUserId = nextHost.userId;
      } else {
        // End session if no other participants
        session.status = 'ended';
      }
    }

    session.participants.splice(participantIndex, 1);
    session.metadata.lastActivity = new Date().toISOString();

    // Remove from presence map
    const presenceMap = this.presenceMap.get(sessionId);
    if (presenceMap) {
      presenceMap.delete(userId);
    }

    // Update sync state
    const syncState = this.syncStates.get(sessionId);
    if (syncState) {
      const userIndex = syncState.participants.indexOf(userId);
      if (userIndex !== -1) {
        syncState.participants.splice(userIndex, 1);
      }
    }

    console.log(`User ${userId} left session ${sessionId}`);
  }

  // Apply edit operation
  async applyEdit(sessionId: string, operation: Omit<EditOperation, 'id' | 'timestamp'>): Promise<EditOperation> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const participant = session.participants.find(p => p.userId === operation.userId);
    if (!participant || !participant.permissions.canEdit) {
      throw new Error('User does not have edit permissions');
    }

    const fullOperation: EditOperation = {
      ...operation,
      id: this.generateId('edit'),
      timestamp: new Date().toISOString()
    };

    // Check for conflicts
    const conflicts = await this.detectConflicts(sessionId, fullOperation);
    if (conflicts.length > 0) {
      await this.handleConflicts(sessionId, conflicts);
    }

    // Apply operation
    const operations = this.operations.get(sessionId) || [];
    operations.push(fullOperation);
    this.operations.set(sessionId, operations);

    // Update session metadata
    session.metadata.totalEdits++;
    session.metadata.lastActivity = new Date().toISOString();
    participant.lastActivity = new Date().toISOString();

    // Update sync state
    const syncState = this.syncStates.get(sessionId);
    if (syncState) {
      syncState.version++;
      syncState.operations.push(fullOperation);
      syncState.lastSync = new Date().toISOString();
      
      // Limit operation history
      if (syncState.operations.length > 100) {
        syncState.operations = syncState.operations.slice(-100);
      }
    }

    console.log(`Applied edit operation ${fullOperation.id} in session ${sessionId}`);
    return fullOperation;
  }

  // Update user presence
  async updatePresence(sessionId: string, presence: Omit<PresenceUpdate, 'timestamp'>): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.find(p => p.userId === presence.userId);
    if (!participant) return;

    // Update participant cursor
    participant.cursor.position = presence.cursor.position;
    participant.cursor.selection = presence.cursor.selection;
    participant.status = presence.status;
    participant.lastActivity = new Date().toISOString();

    // Store presence update
    const presenceMap = this.presenceMap.get(sessionId) || new Map();
    presenceMap.set(presence.userId, {
      ...presence,
      timestamp: new Date().toISOString()
    });
    this.presenceMap.set(sessionId, presenceMap);

    session.metadata.lastActivity = new Date().toISOString();
    this.sessions.set(sessionId, session);
  }

  // Add comment
  async addComment(
    sessionId: string,
    userId: string,
    position: number,
    content: string,
    type: Comment['type'] = 'general'
  ): Promise<Comment> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const participant = session.participants.find(p => p.userId === userId);
    if (!participant || !participant.permissions.canComment) {
      throw new Error('User does not have comment permissions');
    }

    const comment: Comment = {
      id: this.generateId('comment'),
      sessionId,
      userId,
      position,
      content,
      type,
      status: 'open',
      replies: [],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mentions: this.extractMentions(content),
        attachments: []
      }
    };

    const comments = this.comments.get(sessionId) || [];
    comments.push(comment);
    this.comments.set(sessionId, comments);

    console.log(`Added comment ${comment.id} in session ${sessionId}`);
    return comment;
  }

  // Get session state
  async getSessionState(sessionId: string): Promise<{
    session: CollaborationSession;
    operations: EditOperation[];
    comments: Comment[];
    syncState: SyncState;
    presence: Map<string, PresenceUpdate>;
  } | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return {
      session,
      operations: this.operations.get(sessionId) || [],
      comments: this.comments.get(sessionId) || [],
      syncState: this.syncStates.get(sessionId) || this.createDefaultSyncState(),
      presence: this.presenceMap.get(sessionId) || new Map()
    };
  }

  // Sync with remote state
  async syncWithRemote(sessionId: string, remoteOperations: EditOperation[]): Promise<SyncState> {
    const syncState = this.syncStates.get(sessionId);
    if (!syncState) {
      throw new Error(`Sync state for session ${sessionId} not found`);
    }

    const localOperations = this.operations.get(sessionId) || [];
    const conflicts: EditConflict[] = [];

    // Detect conflicts between local and remote operations
    for (const remoteOp of remoteOperations) {
      const conflictingOps = localOperations.filter(localOp => 
        this.operationsConflict(localOp, remoteOp)
      );

      if (conflictingOps.length > 0) {
        const conflict: EditConflict = {
          id: this.generateId('conflict'),
          sessionId,
          operations: [remoteOp, ...conflictingOps],
          type: 'concurrent',
          severity: 'medium',
          resolution: { strategy: 'merge' },
          timestamp: new Date().toISOString()
        };
        conflicts.push(conflict);
      }
    }

    // Merge operations
    const mergedOperations = this.mergeOperations(localOperations, remoteOperations);
    this.operations.set(sessionId, mergedOperations);

    // Update sync state
    syncState.version++;
    syncState.operations = mergedOperations.slice(-50); // Keep recent operations
    syncState.conflicts = conflicts;
    syncState.lastSync = new Date().toISOString();

    if (conflicts.length > 0) {
      const sessionConflicts = this.conflicts.get(sessionId) || [];
      sessionConflicts.push(...conflicts);
      this.conflicts.set(sessionId, sessionConflicts);
    }

    return syncState;
  }

  // Private helper methods
  private async detectConflicts(sessionId: string, operation: EditOperation): Promise<EditConflict[]> {
    const recentOperations = (this.operations.get(sessionId) || [])
      .filter(op => 
        op.userId !== operation.userId &&
        Date.now() - new Date(op.timestamp).getTime() < 10000 // Last 10 seconds
      );

    const conflicts: EditConflict[] = [];

    for (const recentOp of recentOperations) {
      if (this.operationsConflict(operation, recentOp)) {
        const conflict: EditConflict = {
          id: this.generateId('conflict'),
          sessionId,
          operations: [operation, recentOp],
          type: this.determineConflictType(operation, recentOp),
          severity: this.determineConflictSeverity(operation, recentOp),
          resolution: { strategy: 'automatic' },
          timestamp: new Date().toISOString()
        };
        conflicts.push(conflict);
      }
    }

    return conflicts;
  }

  private operationsConflict(op1: EditOperation, op2: EditOperation): boolean {
    // Check for overlapping positions
    const op1End = op1.position + (op1.length || 0);
    const op2End = op2.position + (op2.length || 0);

    return !(op1End <= op2.position || op2End <= op1.position);
  }

  private determineConflictType(op1: EditOperation, op2: EditOperation): EditConflict['type'] {
    if (Math.abs(new Date(op1.timestamp).getTime() - new Date(op2.timestamp).getTime()) < 1000) {
      return 'concurrent';
    }
    return 'overlapping';
  }

  private determineConflictSeverity(op1: EditOperation, op2: EditOperation): EditConflict['severity'] {
    // Simple heuristic based on operation types and overlap
    if (op1.type === 'delete' || op2.type === 'delete') {
      return 'high';
    }
    return 'medium';
  }

  private async handleConflicts(sessionId: string, conflicts: EditConflict[]): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    for (const conflict of conflicts) {
      switch (session.settings.conflictResolution) {
        case 'automatic':
          await this.resolveConflictAutomatically(conflict);
          break;
        case 'manual':
          // Store for manual resolution
          const sessionConflicts = this.conflicts.get(sessionId) || [];
          sessionConflicts.push(conflict);
          this.conflicts.set(sessionId, sessionConflicts);
          break;
        case 'vote':
          // Implement voting mechanism
          await this.initiateConflictVote(sessionId, conflict);
          break;
      }
    }
  }

  private async resolveConflictAutomatically(conflict: EditConflict): Promise<void> {
    // Simple automatic resolution: last operation wins
    const lastOperation = conflict.operations.reduce((latest, op) => 
      new Date(op.timestamp) > new Date(latest.timestamp) ? op : latest
    );

    conflict.resolution = {
      strategy: 'accept_remote',
      resolvedBy: 'system',
      resolvedAt: new Date().toISOString(),
      reasoning: 'Last operation wins strategy'
    };
  }

  private async initiateConflictVote(sessionId: string, conflict: EditConflict): Promise<void> {
    // Placeholder for voting implementation
    console.log(`Initiated conflict vote for conflict ${conflict.id} in session ${sessionId}`);
  }

  private mergeOperations(local: EditOperation[], remote: EditOperation[]): EditOperation[] {
    // Simple merge: combine and sort by timestamp
    const combined = [...local, ...remote];
    return combined.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    
    return mentions;
  }

  private generateCursorColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private generateChecksum(content: string): string {
    // Simple checksum implementation
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  private createDefaultSyncState(): SyncState {
    return {
      version: 0,
      checksum: this.generateChecksum(''),
      lastSync: new Date().toISOString(),
      operations: [],
      participants: [],
      conflicts: []
    };
  }

  private async setupEventHandlers(): Promise<void> {
    // Set up cleanup intervals
    setInterval(() => {
      this.cleanupInactiveSessions();
    }, 300000); // Every 5 minutes

    setInterval(() => {
      this.cleanupOldOperations();
    }, 3600000); // Every hour
  }

  private cleanupInactiveSessions(): void {
    const now = Date.now();
    
    for (const [sessionId, session] of this.sessions.entries()) {
      const lastActivity = new Date(session.metadata.lastActivity).getTime();
      const isExpired = now - lastActivity > session.settings.sessionTimeout;
      
      if (isExpired || session.participants.every(p => p.status === 'disconnected')) {
        session.status = 'ended';
        console.log(`Cleaned up inactive session: ${sessionId}`);
      }
    }
  }

  private cleanupOldOperations(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [sessionId, operations] of this.operations.entries()) {
      const recentOperations = operations.filter(op => 
        new Date(op.timestamp).getTime() > cutoffTime
      );
      
      if (recentOperations.length !== operations.length) {
        this.operations.set(sessionId, recentOperations);
        console.log(`Cleaned up old operations for session: ${sessionId}`);
      }
    }
  }

  // Public API methods
  async getSession(sessionId: string): Promise<CollaborationSession | null> {
    await this.ensureInitialized();
    return this.sessions.get(sessionId) || null;
  }

  async listActiveSessions(userId?: string): Promise<CollaborationSession[]> {
    await this.ensureInitialized();
    
    let sessions = Array.from(this.sessions.values())
      .filter(session => session.status === 'active');

    if (userId) {
      sessions = sessions.filter(session => 
        session.participants.some(p => p.userId === userId)
      );
    }

    return sessions;
  }

  async endSession(sessionId: string, userId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session || session.hostUserId !== userId) {
      return false;
    }

    session.status = 'ended';
    session.metadata.duration = Date.now() - new Date(session.metadata.createdAt).getTime();
    
    this.sessions.set(sessionId, session);
    console.log(`Ended session: ${sessionId}`);
    return true;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  // Clear all data (for testing)
  async clearAllData(): Promise<void> {
    this.sessions.clear();
    this.operations.clear();
    this.conflicts.clear();
    this.comments.clear();
    this.syncStates.clear();
    this.presenceMap.clear();
  }
}

// Export singleton instance
export const collaborationService = new CollaborationService();
export default CollaborationService;