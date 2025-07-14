// Sharing Service
// Handles component sharing, public/private links, and access control

export interface ShareableComponent {
  id: string;
  componentId: string;
  ownerId: string;
  shareId: string;
  title: string;
  description?: string;
  visibility: 'public' | 'private' | 'unlisted';
  accessLevel: 'view' | 'comment' | 'edit' | 'clone';
  allowedUsers: string[];
  allowedDomains: string[];
  password?: string;
  expiresAt?: string;
  metadata: {
    createdAt: string;
    updatedAt: string;
    lastAccessed: string;
    accessCount: number;
    framework: string;
    language: string;
    tags: string[];
    category: string;
  };
  settings: ShareSettings;
}

export interface ShareSettings {
  allowComments: boolean;
  allowDownload: boolean;
  allowFork: boolean;
  allowEmbed: boolean;
  showOwnerInfo: boolean;
  trackAnalytics: boolean;
  requireAuth: boolean;
  watermarkEnabled: boolean;
  watermarkText?: string;
}

export interface ShareLink {
  id: string;
  shareId: string;
  url: string;
  type: 'public' | 'private' | 'embed';
  permissions: SharePermissions;
  restrictions: ShareRestrictions;
  metadata: {
    createdAt: string;
    createdBy: string;
    lastUsed: string;
    useCount: number;
    isActive: boolean;
  };
}

export interface SharePermissions {
  canView: boolean;
  canComment: boolean;
  canEdit: boolean;
  canDownload: boolean;
  canFork: boolean;
  canShare: boolean;
}

export interface ShareRestrictions {
  ipWhitelist: string[];
  ipBlacklist: string[];
  referrerWhitelist: string[];
  maxUses?: number;
  timeWindow?: number; // milliseconds
  rateLimitPerMinute?: number;
  geoblocking?: {
    allowedCountries: string[];
    blockedCountries: string[];
  };
}

export interface ShareAccess {
  id: string;
  shareId: string;
  userId?: string;
  sessionId: string;
  accessType: 'view' | 'download' | 'fork' | 'comment' | 'edit';
  timestamp: string;
  metadata: {
    ipAddress: string;
    userAgent: string;
    referrer?: string;
    location?: {
      country: string;
      region: string;
      city: string;
    };
    duration?: number;
  };
}

export interface ShareAnalytics {
  shareId: string;
  summary: {
    totalViews: number;
    uniqueViewers: number;
    totalDownloads: number;
    totalForks: number;
    totalComments: number;
    averageViewDuration: number;
    topReferrers: Array<{ domain: string; count: number }>;
    viewsByDay: Array<{ date: string; views: number }>;
    viewsByCountry: Array<{ country: string; views: number }>;
  };
  realtimeStats: {
    activeViewers: number;
    viewsLast24h: number;
    trendsLast7d: Array<{ date: string; views: number; downloads: number }>;
  };
}

export interface ShareTemplate {
  id: string;
  name: string;
  description: string;
  category: 'personal' | 'team' | 'organization' | 'public';
  settings: ShareSettings;
  permissions: SharePermissions;
  restrictions: ShareRestrictions;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
}

export interface ShareCollection {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  componentIds: string[];
  visibility: 'public' | 'private' | 'unlisted';
  shareSettings: ShareSettings;
  metadata: {
    createdAt: string;
    updatedAt: string;
    totalViews: number;
    tags: string[];
    category: string;
  };
}

class SharingService {
  private shareableComponents: Map<string, ShareableComponent> = new Map();
  private shareLinks: Map<string, ShareLink[]> = new Map();
  private shareAccess: Map<string, ShareAccess[]> = new Map();
  private shareTemplates: Map<string, ShareTemplate> = new Map();
  private shareCollections: Map<string, ShareCollection> = new Map();
  private isInitialized = false;

  // Initialize service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.loadDefaultTemplates();
    await this.setupAnalyticsTracking();
    this.isInitialized = true;
    console.log('Sharing service initialized');
  }

  // Create shareable component
  async createShare(
    componentId: string,
    ownerId: string,
    config: {
      title: string;
      description?: string;
      visibility: ShareableComponent['visibility'];
      accessLevel: ShareableComponent['accessLevel'];
      settings?: Partial<ShareSettings>;
      allowedUsers?: string[];
      allowedDomains?: string[];
      password?: string;
      expiresAt?: string;
    }
  ): Promise<ShareableComponent> {
    await this.ensureInitialized();

    const shareId = this.generateShareId();
    const shareableComponent: ShareableComponent = {
      id: this.generateId('share'),
      componentId,
      ownerId,
      shareId,
      title: config.title,
      description: config.description,
      visibility: config.visibility,
      accessLevel: config.accessLevel,
      allowedUsers: config.allowedUsers || [],
      allowedDomains: config.allowedDomains || [],
      password: config.password,
      expiresAt: config.expiresAt,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        accessCount: 0,
        framework: 'react', // Would be determined from component
        language: 'typescript',
        tags: [],
        category: 'component'
      },
      settings: {
        allowComments: true,
        allowDownload: true,
        allowFork: true,
        allowEmbed: true,
        showOwnerInfo: true,
        trackAnalytics: true,
        requireAuth: false,
        watermarkEnabled: false,
        ...config.settings
      }
    };

    this.shareableComponents.set(shareableComponent.id, shareableComponent);
    this.shareLinks.set(shareableComponent.id, []);
    this.shareAccess.set(shareableComponent.id, []);

    console.log(`Created shareable component: ${shareableComponent.id}`);
    return shareableComponent;
  }

  // Generate share link
  async generateShareLink(
    shareId: string,
    linkType: ShareLink['type'],
    permissions?: Partial<SharePermissions>,
    restrictions?: Partial<ShareRestrictions>,
    createdBy?: string
  ): Promise<ShareLink> {
    const shareableComponent = Array.from(this.shareableComponents.values())
      .find(sc => sc.shareId === shareId);
    
    if (!shareableComponent) {
      throw new Error(`Shareable component with shareId ${shareId} not found`);
    }

    const linkId = this.generateId('link');
    const baseUrl = 'https://component-builder.app/share';
    
    let url: string;
    switch (linkType) {
      case 'public':
        url = `${baseUrl}/${shareId}`;
        break;
      case 'private':
        url = `${baseUrl}/${shareId}?token=${this.generateToken()}`;
        break;
      case 'embed':
        url = `${baseUrl}/embed/${shareId}`;
        break;
    }

    const shareLink: ShareLink = {
      id: linkId,
      shareId,
      url,
      type: linkType,
      permissions: {
        canView: true,
        canComment: shareableComponent.settings.allowComments,
        canEdit: shareableComponent.accessLevel === 'edit',
        canDownload: shareableComponent.settings.allowDownload,
        canFork: shareableComponent.settings.allowFork,
        canShare: true,
        ...permissions
      },
      restrictions: {
        ipWhitelist: [],
        ipBlacklist: [],
        referrerWhitelist: [],
        ...restrictions
      },
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: createdBy || shareableComponent.ownerId,
        lastUsed: '',
        useCount: 0,
        isActive: true
      }
    };

    const links = this.shareLinks.get(shareableComponent.id) || [];
    links.push(shareLink);
    this.shareLinks.set(shareableComponent.id, links);

    console.log(`Generated share link: ${url}`);
    return shareLink;
  }

  // Access shared component
  async accessSharedComponent(
    shareId: string,
    accessType: ShareAccess['accessType'],
    context: {
      userId?: string;
      sessionId: string;
      ipAddress: string;
      userAgent: string;
      referrer?: string;
      password?: string;
    }
  ): Promise<{
    component: ShareableComponent;
    permissions: SharePermissions;
    content?: any;
  }> {
    const shareableComponent = Array.from(this.shareableComponents.values())
      .find(sc => sc.shareId === shareId);
    
    if (!shareableComponent) {
      throw new Error(`Shared component not found: ${shareId}`);
    }

    // Check if share has expired
    if (shareableComponent.expiresAt && new Date() > new Date(shareableComponent.expiresAt)) {
      throw new Error('Share link has expired');
    }

    // Check password if required
    if (shareableComponent.password && shareableComponent.password !== context.password) {
      throw new Error('Invalid password');
    }

    // Check access permissions
    const hasAccess = await this.checkAccess(shareableComponent, context, accessType);
    if (!hasAccess) {
      throw new Error('Access denied');
    }

    // Find applicable share link to get permissions
    const links = this.shareLinks.get(shareableComponent.id) || [];
    const applicableLink = links.find(link => link.shareId === shareId && link.metadata.isActive);
    
    const permissions: SharePermissions = applicableLink?.permissions || {
      canView: true,
      canComment: shareableComponent.settings.allowComments,
      canEdit: shareableComponent.accessLevel === 'edit',
      canDownload: shareableComponent.settings.allowDownload,
      canFork: shareableComponent.settings.allowFork,
      canShare: true
    };

    // Log access
    await this.logAccess(shareableComponent.id, shareId, accessType, context);

    // Update access metadata
    shareableComponent.metadata.lastAccessed = new Date().toISOString();
    shareableComponent.metadata.accessCount++;
    this.shareableComponents.set(shareableComponent.id, shareableComponent);

    // Get component content based on permissions
    let content = undefined;
    if (permissions.canView) {
      content = await this.getComponentContent(shareableComponent.componentId, permissions);
    }

    return {
      component: shareableComponent,
      permissions,
      content
    };
  }

  // Update share settings
  async updateShareSettings(
    shareId: string,
    updates: Partial<ShareableComponent>,
    updatedBy: string
  ): Promise<ShareableComponent> {
    const shareableComponent = Array.from(this.shareableComponents.values())
      .find(sc => sc.shareId === shareId);
    
    if (!shareableComponent) {
      throw new Error(`Shareable component not found: ${shareId}`);
    }

    if (shareableComponent.ownerId !== updatedBy) {
      throw new Error('Only the owner can update share settings');
    }

    // Apply updates
    const updatedComponent = {
      ...shareableComponent,
      ...updates,
      metadata: {
        ...shareableComponent.metadata,
        updatedAt: new Date().toISOString()
      }
    };

    this.shareableComponents.set(shareableComponent.id, updatedComponent);
    console.log(`Updated share settings for: ${shareId}`);
    return updatedComponent;
  }

  // Get share analytics
  async getShareAnalytics(shareId: string): Promise<ShareAnalytics> {
    const shareableComponent = Array.from(this.shareableComponents.values())
      .find(sc => sc.shareId === shareId);
    
    if (!shareableComponent) {
      throw new Error(`Shareable component not found: ${shareId}`);
    }

    const accessLogs = this.shareAccess.get(shareableComponent.id) || [];
    
    // Calculate analytics
    const totalViews = accessLogs.filter(log => log.accessType === 'view').length;
    const uniqueViewers = new Set(accessLogs.map(log => log.userId || log.sessionId)).size;
    const totalDownloads = accessLogs.filter(log => log.accessType === 'download').length;
    const totalForks = accessLogs.filter(log => log.accessType === 'fork').length;
    const totalComments = accessLogs.filter(log => log.accessType === 'comment').length;

    // Get referrer stats
    const referrerCounts = new Map<string, number>();
    accessLogs.forEach(log => {
      if (log.metadata.referrer) {
        const domain = new URL(log.metadata.referrer).hostname;
        referrerCounts.set(domain, (referrerCounts.get(domain) || 0) + 1);
      }
    });

    const topReferrers = Array.from(referrerCounts.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get views by day (last 30 days)
    const viewsByDay = this.getViewsByDay(accessLogs, 30);

    // Get views by country
    const countryViews = new Map<string, number>();
    accessLogs.forEach(log => {
      if (log.metadata.location?.country) {
        const country = log.metadata.location.country;
        countryViews.set(country, (countryViews.get(country) || 0) + 1);
      }
    });

    const viewsByCountry = Array.from(countryViews.entries())
      .map(([country, views]) => ({ country, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Realtime stats
    const last24h = Date.now() - (24 * 60 * 60 * 1000);
    const viewsLast24h = accessLogs.filter(log => 
      new Date(log.timestamp).getTime() > last24h && log.accessType === 'view'
    ).length;

    const trendsLast7d = this.getTrendsLast7Days(accessLogs);

    return {
      shareId,
      summary: {
        totalViews,
        uniqueViewers,
        totalDownloads,
        totalForks,
        totalComments,
        averageViewDuration: 0, // Would calculate from duration data
        topReferrers,
        viewsByDay,
        viewsByCountry
      },
      realtimeStats: {
        activeViewers: 0, // Would track active sessions
        viewsLast24h,
        trendsLast7d
      }
    };
  }

  // Create share collection
  async createShareCollection(
    name: string,
    ownerId: string,
    componentIds: string[],
    config: {
      description?: string;
      visibility: ShareCollection['visibility'];
      shareSettings?: Partial<ShareSettings>;
      tags?: string[];
      category?: string;
    }
  ): Promise<ShareCollection> {
    const collection: ShareCollection = {
      id: this.generateId('collection'),
      name,
      description: config.description,
      ownerId,
      componentIds,
      visibility: config.visibility,
      shareSettings: {
        allowComments: true,
        allowDownload: true,
        allowFork: true,
        allowEmbed: true,
        showOwnerInfo: true,
        trackAnalytics: true,
        requireAuth: false,
        watermarkEnabled: false,
        ...config.shareSettings
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalViews: 0,
        tags: config.tags || [],
        category: config.category || 'collection'
      }
    };

    this.shareCollections.set(collection.id, collection);
    console.log(`Created share collection: ${collection.id}`);
    return collection;
  }

  // Private helper methods
  private async checkAccess(
    shareableComponent: ShareableComponent,
    context: {
      userId?: string;
      sessionId: string;
      ipAddress: string;
      userAgent: string;
      referrer?: string;
    },
    accessType: ShareAccess['accessType']
  ): Promise<boolean> {
    // Check visibility
    if (shareableComponent.visibility === 'private') {
      if (!context.userId || !shareableComponent.allowedUsers.includes(context.userId)) {
        return false;
      }
    }

    // Check domain restrictions
    if (shareableComponent.allowedDomains.length > 0 && context.referrer) {
      const referrerDomain = new URL(context.referrer).hostname;
      if (!shareableComponent.allowedDomains.includes(referrerDomain)) {
        return false;
      }
    }

    // Check access level
    switch (accessType) {
      case 'edit':
        return shareableComponent.accessLevel === 'edit';
      case 'comment':
        return ['comment', 'edit'].includes(shareableComponent.accessLevel);
      default:
        return true;
    }
  }

  private async logAccess(
    shareableComponentId: string,
    shareId: string,
    accessType: ShareAccess['accessType'],
    context: {
      userId?: string;
      sessionId: string;
      ipAddress: string;
      userAgent: string;
      referrer?: string;
    }
  ): Promise<void> {
    const access: ShareAccess = {
      id: this.generateId('access'),
      shareId,
      userId: context.userId,
      sessionId: context.sessionId,
      accessType,
      timestamp: new Date().toISOString(),
      metadata: {
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        referrer: context.referrer,
        location: await this.getLocationFromIP(context.ipAddress)
      }
    };

    const accessLogs = this.shareAccess.get(shareableComponentId) || [];
    accessLogs.push(access);
    
    // Keep only last 10000 access logs per component
    if (accessLogs.length > 10000) {
      accessLogs.splice(0, accessLogs.length - 10000);
    }
    
    this.shareAccess.set(shareableComponentId, accessLogs);
  }

  private async getComponentContent(componentId: string, permissions: SharePermissions): Promise<any> {
    // Mock component content based on permissions
    const baseContent = {
      id: componentId,
      name: 'SharedComponent',
      framework: 'react',
      language: 'typescript'
    };

    if (permissions.canView) {
      return {
        ...baseContent,
        code: permissions.canEdit ? 'Full editable code...' : 'Read-only code preview...',
        metadata: {
          canEdit: permissions.canEdit,
          canDownload: permissions.canDownload,
          canFork: permissions.canFork
        }
      };
    }

    return null;
  }

  private async getLocationFromIP(ipAddress: string): Promise<ShareAccess['metadata']['location']> {
    // Mock geolocation - in production would use a service like MaxMind
    const mockLocations = [
      { country: 'US', region: 'CA', city: 'San Francisco' },
      { country: 'UK', region: 'London', city: 'London' },
      { country: 'DE', region: 'Berlin', city: 'Berlin' },
      { country: 'JP', region: 'Tokyo', city: 'Tokyo' }
    ];
    
    return mockLocations[Math.floor(Math.random() * mockLocations.length)];
  }

  private getViewsByDay(accessLogs: ShareAccess[], days: number): Array<{ date: string; views: number }> {
    const result: Array<{ date: string; views: number }> = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const views = accessLogs.filter(log => 
        log.accessType === 'view' && 
        log.timestamp.startsWith(dateStr)
      ).length;
      
      result.push({ date: dateStr, views });
    }
    
    return result;
  }

  private getTrendsLast7Days(accessLogs: ShareAccess[]): Array<{ date: string; views: number; downloads: number }> {
    const result: Array<{ date: string; views: number; downloads: number }> = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const views = accessLogs.filter(log => 
        log.accessType === 'view' && 
        log.timestamp.startsWith(dateStr)
      ).length;
      
      const downloads = accessLogs.filter(log => 
        log.accessType === 'download' && 
        log.timestamp.startsWith(dateStr)
      ).length;
      
      result.push({ date: dateStr, views, downloads });
    }
    
    return result;
  }

  private generateShareId(): string {
    // Generate a URL-friendly share ID
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private async loadDefaultTemplates(): Promise<void> {
    const defaultTemplates: Omit<ShareTemplate, 'id' | 'createdAt'>[] = [
      {
        name: 'Public Share',
        description: 'Open public sharing with full permissions',
        category: 'public',
        settings: {
          allowComments: true,
          allowDownload: true,
          allowFork: true,
          allowEmbed: true,
          showOwnerInfo: true,
          trackAnalytics: true,
          requireAuth: false,
          watermarkEnabled: false
        },
        permissions: {
          canView: true,
          canComment: true,
          canEdit: false,
          canDownload: true,
          canFork: true,
          canShare: true
        },
        restrictions: {
          ipWhitelist: [],
          ipBlacklist: [],
          referrerWhitelist: []
        },
        isDefault: true,
        createdBy: 'system'
      },
      {
        name: 'Team Share',
        description: 'Internal team sharing with edit permissions',
        category: 'team',
        settings: {
          allowComments: true,
          allowDownload: true,
          allowFork: false,
          allowEmbed: false,
          showOwnerInfo: true,
          trackAnalytics: true,
          requireAuth: true,
          watermarkEnabled: false
        },
        permissions: {
          canView: true,
          canComment: true,
          canEdit: true,
          canDownload: true,
          canFork: false,
          canShare: false
        },
        restrictions: {
          ipWhitelist: [],
          ipBlacklist: [],
          referrerWhitelist: []
        },
        isDefault: false,
        createdBy: 'system'
      }
    ];

    for (const templateData of defaultTemplates) {
      const template: ShareTemplate = {
        ...templateData,
        id: this.generateId('template'),
        createdAt: new Date().toISOString()
      };
      this.shareTemplates.set(template.id, template);
    }

    console.log(`Loaded ${defaultTemplates.length} default share templates`);
  }

  private async setupAnalyticsTracking(): Promise<void> {
    // Set up analytics tracking intervals
    setInterval(() => {
      this.aggregateAnalytics();
    }, 300000); // Every 5 minutes

    setInterval(() => {
      this.cleanupOldAccessLogs();
    }, 3600000); // Every hour
  }

  private aggregateAnalytics(): void {
    // Aggregate analytics data for performance
    console.log('Aggregating share analytics...');
  }

  private cleanupOldAccessLogs(): void {
    const cutoffTime = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    for (const [componentId, accessLogs] of this.shareAccess.entries()) {
      const recentLogs = accessLogs.filter(log => 
        new Date(log.timestamp).getTime() > cutoffTime
      );
      
      if (recentLogs.length !== accessLogs.length) {
        this.shareAccess.set(componentId, recentLogs);
      }
    }
  }

  // Public API methods
  async getShareableComponent(shareId: string): Promise<ShareableComponent | null> {
    await this.ensureInitialized();
    return Array.from(this.shareableComponents.values())
      .find(sc => sc.shareId === shareId) || null;
  }

  async listUserShares(userId: string): Promise<ShareableComponent[]> {
    await this.ensureInitialized();
    return Array.from(this.shareableComponents.values())
      .filter(sc => sc.ownerId === userId);
  }

  async getShareTemplates(): Promise<ShareTemplate[]> {
    await this.ensureInitialized();
    return Array.from(this.shareTemplates.values());
  }

  async deleteShare(shareId: string, userId: string): Promise<boolean> {
    const shareableComponent = Array.from(this.shareableComponents.values())
      .find(sc => sc.shareId === shareId);
    
    if (!shareableComponent || shareableComponent.ownerId !== userId) {
      return false;
    }

    this.shareableComponents.delete(shareableComponent.id);
    this.shareLinks.delete(shareableComponent.id);
    this.shareAccess.delete(shareableComponent.id);
    
    console.log(`Deleted share: ${shareId}`);
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
    this.shareableComponents.clear();
    this.shareLinks.clear();
    this.shareAccess.clear();
    this.shareTemplates.clear();
    this.shareCollections.clear();
  }
}

// Export singleton instance
export const sharingService = new SharingService();
export default SharingService;