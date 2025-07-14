// Authentication Service
// Handles user authentication, session management, and authorization

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  preferences: UserPreferences;
  metadata: {
    createdAt: string;
    lastLoginAt: string;
    loginCount: number;
    isEmailVerified: boolean;
    isActive: boolean;
  };
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  level: number;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    shareUsageData: boolean;
  };
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: string;
  createdAt: string;
  lastActivityAt: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  displayName: string;
  acceptTerms: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  session?: AuthSession;
  token?: string;
  refreshToken?: string;
  error?: string;
  requiresVerification?: boolean;
}

export interface PasswordResetRequest {
  email: string;
  token?: string;
  newPassword?: string;
}

export interface TokenValidationResult {
  isValid: boolean;
  user?: User;
  session?: AuthSession;
  error?: string;
}

class AuthService {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, AuthSession> = new Map();
  private roles: Map<string, UserRole> = new Map();
  private permissions: Map<string, Permission> = new Map();
  private currentUser: User | null = null;
  private currentSession: AuthSession | null = null;
  private isInitialized = false;

  // Initialize service with default roles and permissions
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.initializeRolesAndPermissions();
    await this.loadPersistedData();
    await this.restoreSession();
    
    this.isInitialized = true;
    console.log('Auth service initialized');
  }

  // Register new user
  async register(userData: RegisterData): Promise<AuthResult> {
    await this.ensureInitialized();

    try {
      // Validate input
      const validation = await this.validateRegistrationData(userData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Check if user already exists
      const existingUser = Array.from(this.users.values())
        .find(u => u.email === userData.email || u.username === userData.username);
      
      if (existingUser) {
        return {
          success: false,
          error: 'User with this email or username already exists'
        };
      }

      // Create new user
      const userId = this.generateId('user');
      const hashedPassword = await this.hashPassword(userData.password);
      
      const user: User = {
        id: userId,
        email: userData.email,
        username: userData.username,
        displayName: userData.displayName,
        role: this.roles.get('user')!,
        permissions: this.getPermissionsForRole('user'),
        preferences: this.getDefaultPreferences(),
        metadata: {
          createdAt: new Date().toISOString(),
          lastLoginAt: '',
          loginCount: 0,
          isEmailVerified: false,
          isActive: true
        }
      };

      this.users.set(userId, user);
      
      // Store password separately (in real app, this would be in secure storage)
      await this.storeUserCredentials(userId, hashedPassword);
      
      // Auto-login after registration
      const loginResult = await this.login({
        email: userData.email,
        password: userData.password
      });

      return {
        ...loginResult,
        requiresVerification: true
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    await this.ensureInitialized();

    try {
      // Find user by email
      const user = Array.from(this.users.values())
        .find(u => u.email === credentials.email);

      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      if (!user.metadata.isActive) {
        return {
          success: false,
          error: 'Account is deactivated'
        };
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(user.id, credentials.password);
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Create session
      const session = await this.createSession(user, credentials.rememberMe);

      // Update user metadata
      user.metadata.lastLoginAt = new Date().toISOString();
      user.metadata.loginCount++;
      this.users.set(user.id, user);

      // Set current user and session
      this.currentUser = user;
      this.currentSession = session;

      // Persist session
      await this.persistSession(session);

      return {
        success: true,
        user,
        session,
        token: session.token,
        refreshToken: session.refreshToken
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  }

  // Logout user
  async logout(): Promise<void> {
    await this.ensureInitialized();

    if (this.currentSession) {
      // Deactivate session
      this.currentSession.isActive = false;
      this.sessions.set(this.currentSession.id, this.currentSession);
      
      // Clear persisted session
      await this.clearPersistedSession();
    }

    this.currentUser = null;
    this.currentSession = null;
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Get current session
  getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.currentSession !== null && this.currentSession.isActive;
  }

  // Validate token
  async validateToken(token: string): Promise<TokenValidationResult> {
    await this.ensureInitialized();

    try {
      // Find session by token
      const session = Array.from(this.sessions.values())
        .find(s => s.token === token && s.isActive);

      if (!session) {
        return {
          isValid: false,
          error: 'Invalid or expired token'
        };
      }

      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        session.isActive = false;
        this.sessions.set(session.id, session);
        
        return {
          isValid: false,
          error: 'Token expired'
        };
      }

      // Get user
      const user = this.users.get(session.userId);
      if (!user) {
        return {
          isValid: false,
          error: 'User not found'
        };
      }

      // Update last activity
      session.lastActivityAt = new Date().toISOString();
      this.sessions.set(session.id, session);

      return {
        isValid: true,
        user,
        session
      };

    } catch (error: any) {
      return {
        isValid: false,
        error: error.message || 'Token validation failed'
      };
    }
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    await this.ensureInitialized();

    try {
      // Find session by refresh token
      const session = Array.from(this.sessions.values())
        .find(s => s.refreshToken === refreshToken && s.isActive);

      if (!session) {
        return {
          success: false,
          error: 'Invalid refresh token'
        };
      }

      // Get user
      const user = this.users.get(session.userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Generate new tokens
      const newToken = this.generateToken();
      const newRefreshToken = this.generateToken();

      // Update session
      session.token = newToken;
      session.refreshToken = newRefreshToken;
      session.expiresAt = this.getTokenExpirationDate().toISOString();
      session.lastActivityAt = new Date().toISOString();

      this.sessions.set(session.id, session);

      return {
        success: true,
        user,
        session,
        token: newToken,
        refreshToken: newRefreshToken
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Token refresh failed'
      };
    }
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    await this.ensureInitialized();

    try {
      const user = Array.from(this.users.values())
        .find(u => u.email === email);

      if (!user) {
        // Don't reveal if email exists for security
        return { success: true };
      }

      // Generate reset token (in real app, this would be sent via email)
      const resetToken = this.generateToken();
      console.log(`Password reset token for ${email}: ${resetToken}`);

      // Store reset token (with expiration)
      await this.storePasswordResetToken(user.id, resetToken);

      return { success: true };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Password reset request failed'
      };
    }
  }

  // Reset password
  async resetPassword(request: PasswordResetRequest): Promise<{ success: boolean; error?: string }> {
    await this.ensureInitialized();

    try {
      if (!request.token || !request.newPassword) {
        return {
          success: false,
          error: 'Token and new password are required'
        };
      }

      // Validate reset token
      const userId = await this.validatePasswordResetToken(request.token);
      if (!userId) {
        return {
          success: false,
          error: 'Invalid or expired reset token'
        };
      }

      // Update password
      const hashedPassword = await this.hashPassword(request.newPassword);
      await this.storeUserCredentials(userId, hashedPassword);

      // Clear reset token
      await this.clearPasswordResetToken(userId);

      // Invalidate all sessions for this user
      await this.invalidateUserSessions(userId);

      return { success: true };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Password reset failed'
      };
    }
  }

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    await this.ensureInitialized();

    try {
      const user = this.users.get(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Validate updates
      if (updates.email && updates.email !== user.email) {
        const emailExists = Array.from(this.users.values())
          .some(u => u.id !== userId && u.email === updates.email);
        
        if (emailExists) {
          return {
            success: false,
            error: 'Email already in use'
          };
        }
      }

      if (updates.username && updates.username !== user.username) {
        const usernameExists = Array.from(this.users.values())
          .some(u => u.id !== userId && u.username === updates.username);
        
        if (usernameExists) {
          return {
            success: false,
            error: 'Username already in use'
          };
        }
      }

      // Update user
      const updatedUser = { ...user, ...updates };
      this.users.set(userId, updatedUser);

      // Update current user if it's the same user
      if (this.currentUser?.id === userId) {
        this.currentUser = updatedUser;
      }

      return {
        success: true,
        user: updatedUser
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Profile update failed'
      };
    }
  }

  // Check user permissions
  hasPermission(permission: string): boolean {
    if (!this.currentUser) return false;

    return this.currentUser.permissions.some(p => 
      p.id === permission || 
      `${p.resource}:${p.action}` === permission
    );
  }

  // Check user role
  hasRole(roleId: string): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.role.id === roleId;
  }

  // Private helper methods
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  private generateToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private getTokenExpirationDate(rememberMe: boolean = false): Date {
    const now = new Date();
    const expirationHours = rememberMe ? 24 * 30 : 24; // 30 days vs 1 day
    return new Date(now.getTime() + expirationHours * 60 * 60 * 1000);
  }

  private async createSession(user: User, rememberMe: boolean = false): Promise<AuthSession> {
    const sessionId = this.generateId('session');
    const token = this.generateToken();
    const refreshToken = this.generateToken();
    
    const session: AuthSession = {
      id: sessionId,
      userId: user.id,
      token,
      refreshToken,
      expiresAt: this.getTokenExpirationDate(rememberMe).toISOString(),
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      ipAddress: '127.0.0.1', // Would get real IP in production
      userAgent: navigator.userAgent,
      isActive: true
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  private async validateRegistrationData(data: RegisterData): Promise<{ isValid: boolean; error?: string }> {
    if (!data.email || !data.username || !data.password || !data.displayName) {
      return { isValid: false, error: 'All fields are required' };
    }

    if (!data.acceptTerms) {
      return { isValid: false, error: 'You must accept the terms and conditions' };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    // Username validation
    if (data.username.length < 3 || data.username.length > 20) {
      return { isValid: false, error: 'Username must be between 3 and 20 characters' };
    }

    // Password validation
    if (data.password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters' };
    }

    return { isValid: true };
  }

  private async hashPassword(password: string): Promise<string> {
    // Simple hash for demo (use bcrypt in production)
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async verifyPassword(userId: string, password: string): Promise<boolean> {
    const hashedPassword = await this.hashPassword(password);
    const storedPassword = await this.getStoredPassword(userId);
    return hashedPassword === storedPassword;
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'system',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notifications: {
        email: true,
        push: true,
        inApp: true
      },
      privacy: {
        profileVisibility: 'public',
        shareUsageData: true
      }
    };
  }

  private getPermissionsForRole(roleId: string): Permission[] {
    const role = this.roles.get(roleId);
    if (!role) return [];

    return role.permissions.map(permId => this.permissions.get(permId)!).filter(Boolean);
  }

  private async initializeRolesAndPermissions(): Promise<void> {
    // Create permissions
    const permissions: Permission[] = [
      {
        id: 'components:read',
        name: 'Read Components',
        description: 'View components',
        resource: 'components',
        action: 'read'
      },
      {
        id: 'components:write',
        name: 'Write Components',
        description: 'Create and modify components',
        resource: 'components',
        action: 'write'
      },
      {
        id: 'components:delete',
        name: 'Delete Components',
        description: 'Delete components',
        resource: 'components',
        action: 'delete'
      },
      {
        id: 'chat:use',
        name: 'Use Chat',
        description: 'Use AI chat features',
        resource: 'chat',
        action: 'use'
      },
      {
        id: 'export:use',
        name: 'Export Components',
        description: 'Export components in various formats',
        resource: 'export',
        action: 'use'
      },
      {
        id: 'admin:manage',
        name: 'Admin Management',
        description: 'Manage system settings and users',
        resource: 'admin',
        action: 'manage'
      }
    ];

    permissions.forEach(permission => {
      this.permissions.set(permission.id, permission);
    });

    // Create roles
    const roles: UserRole[] = [
      {
        id: 'guest',
        name: 'Guest',
        description: 'Guest user with read-only access',
        permissions: ['components:read'],
        level: 0
      },
      {
        id: 'user',
        name: 'User',
        description: 'Regular user with component access',
        permissions: ['components:read', 'components:write', 'chat:use', 'export:use'],
        level: 1
      },
      {
        id: 'premium',
        name: 'Premium User',
        description: 'Premium user with extended features',
        permissions: ['components:read', 'components:write', 'components:delete', 'chat:use', 'export:use'],
        level: 2
      },
      {
        id: 'admin',
        name: 'Administrator',
        description: 'System administrator with full access',
        permissions: permissions.map(p => p.id),
        level: 10
      }
    ];

    roles.forEach(role => {
      this.roles.set(role.id, role);
    });
  }

  // Mock storage methods (would use real storage in production)
  private async storeUserCredentials(userId: string, hashedPassword: string): Promise<void> {
    localStorage.setItem(`auth:password:${userId}`, hashedPassword);
  }

  private async getStoredPassword(userId: string): Promise<string | null> {
    return localStorage.getItem(`auth:password:${userId}`);
  }

  private async storePasswordResetToken(userId: string, token: string): Promise<void> {
    const expiration = Date.now() + (60 * 60 * 1000); // 1 hour
    localStorage.setItem(`auth:reset:${userId}`, JSON.stringify({ token, expiration }));
  }

  private async validatePasswordResetToken(token: string): Promise<string | null> {
    for (const userId of this.users.keys()) {
      const stored = localStorage.getItem(`auth:reset:${userId}`);
      if (stored) {
        const { token: storedToken, expiration } = JSON.parse(stored);
        if (storedToken === token && Date.now() < expiration) {
          return userId;
        }
      }
    }
    return null;
  }

  private async clearPasswordResetToken(userId: string): Promise<void> {
    localStorage.removeItem(`auth:reset:${userId}`);
  }

  private async invalidateUserSessions(userId: string): Promise<void> {
    for (const session of this.sessions.values()) {
      if (session.userId === userId) {
        session.isActive = false;
        this.sessions.set(session.id, session);
      }
    }
  }

  private async persistSession(session: AuthSession): Promise<void> {
    localStorage.setItem('auth:session', JSON.stringify({
      sessionId: session.id,
      token: session.token,
      refreshToken: session.refreshToken
    }));
  }

  private async clearPersistedSession(): Promise<void> {
    localStorage.removeItem('auth:session');
  }

  private async restoreSession(): Promise<void> {
    const stored = localStorage.getItem('auth:session');
    if (!stored) return;

    try {
      const { sessionId, token } = JSON.parse(stored);
      const validation = await this.validateToken(token);
      
      if (validation.isValid && validation.user && validation.session) {
        this.currentUser = validation.user;
        this.currentSession = validation.session;
      } else {
        await this.clearPersistedSession();
      }
    } catch (error) {
      await this.clearPersistedSession();
    }
  }

  private async loadPersistedData(): Promise<void> {
    // Load users, sessions, etc. from persistent storage
    // This is a mock implementation
  }
}

// Export singleton instance
export const authService = new AuthService();
export default AuthService;