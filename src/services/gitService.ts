// Git Service for Version Management
// Handles git operations, commit tracking, and version tagging

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
  files: string[];
}

export interface GitStatus {
  staged: string[];
  modified: string[];
  untracked: string[];
  deleted: string[];
  clean: boolean;
}

export interface GitConfig {
  repositoryPath?: string;
  autoCommit?: boolean;
  commitPrefix?: string;
  excludePatterns?: string[];
}

class GitService {
  private config: GitConfig;
  private isInitialized = false;

  constructor(config: GitConfig = {}) {
    this.config = {
      repositoryPath: (typeof process !== 'undefined') ? process.cwd() : '.',
      autoCommit: false,
      commitPrefix: '[AI-Generated]',
      excludePatterns: ['node_modules', '.git', 'dist', 'build'],
      ...config
    };
  }

  // Initialize git repository if not exists
  async initializeRepository(): Promise<boolean> {
    try {
      const hasGit = await this.hasGitRepository();
      
      if (!hasGit) {
        console.log('Initializing git repository...');
        // In a real implementation, this would run: git init
        // For now, we'll simulate git initialization
        await this.simulateCommand('git init');
        await this.simulateCommand('git config user.name "AI Component Builder"');
        await this.simulateCommand('git config user.email "ai@componentbuilder.local"');
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize git repository:', error);
      return false;
    }
  }

  // Check if git repository exists
  async hasGitRepository(): Promise<boolean> {
    try {
      // In a real implementation: git rev-parse --git-dir
      // For demo purposes, assume git exists if we're in a project
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get current git status
  async getStatus(): Promise<GitStatus> {
    try {
      await this.ensureInitialized();
      
      // Mock git status for demo
      return {
        staged: [],
        modified: ['src/components/Button.tsx', 'src/styles/button.css'],
        untracked: ['src/components/NewComponent.tsx'],
        deleted: [],
        clean: false
      };
    } catch (error) {
      console.error('Failed to get git status:', error);
      return {
        staged: [],
        modified: [],
        untracked: [],
        deleted: [],
        clean: true
      };
    }
  }

  // Stage files for commit
  async stageFiles(files: string[] | 'all'): Promise<boolean> {
    try {
      await this.ensureInitialized();
      
      if (files === 'all') {
        await this.simulateCommand('git add .');
        console.log('Staged all files');
      } else {
        for (const file of files) {
          await this.simulateCommand(`git add "${file}"`);
        }
        console.log(`Staged ${files.length} files`);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to stage files:', error);
      return false;
    }
  }

  // Create a commit
  async createCommit(message: string, options: {
    includePrefix?: boolean;
    autoStage?: boolean;
    componentId?: string;
  } = {}): Promise<string | null> {
    try {
      await this.ensureInitialized();

      const { includePrefix = true, autoStage = true, componentId } = options;

      // Auto-stage if requested
      if (autoStage) {
        const status = await this.getStatus();
        if (status.modified.length > 0 || status.untracked.length > 0) {
          await this.stageFiles('all');
        }
      }

      // Format commit message
      const prefix = includePrefix ? `${this.config.commitPrefix} ` : '';
      const componentInfo = componentId ? `[${componentId}] ` : '';
      const fullMessage = `${prefix}${componentInfo}${message}`;

      // Create commit
      const commitHash = await this.simulateCommand(`git commit -m "${fullMessage}"`);
      
      console.log(`Created commit: ${commitHash} - ${fullMessage}`);
      return commitHash;
    } catch (error) {
      console.error('Failed to create commit:', error);
      return null;
    }
  }

  // Get commit history
  async getCommitHistory(options: {
    limit?: number;
    since?: string;
    componentId?: string;
    author?: string;
  } = {}): Promise<GitCommit[]> {
    try {
      await this.ensureInitialized();

      const { limit = 20, componentId } = options;

      // Mock commit history for demo
      const mockCommits: GitCommit[] = [
        {
          hash: 'abc123',
          message: '[AI-Generated] [Button] Updated button styling with rounded corners',
          author: 'AI Component Builder',
          date: new Date(Date.now() - 3600000).toISOString(),
          files: ['src/components/Button.tsx', 'src/styles/button.css']
        },
        {
          hash: 'def456',
          message: '[AI-Generated] [Card] Added shadow effect to card component',
          author: 'AI Component Builder',
          date: new Date(Date.now() - 7200000).toISOString(),
          files: ['src/components/Card.tsx']
        },
        {
          hash: 'ghi789',
          message: '[AI-Generated] [Form] Implemented form validation logic',
          author: 'AI Component Builder',
          date: new Date(Date.now() - 10800000).toISOString(),
          files: ['src/components/Form.tsx', 'src/utils/validation.ts']
        }
      ];

      // Filter by component if specified
      let filteredCommits = componentId 
        ? mockCommits.filter(commit => commit.message.includes(`[${componentId}]`))
        : mockCommits;

      return filteredCommits.slice(0, limit);
    } catch (error) {
      console.error('Failed to get commit history:', error);
      return [];
    }
  }

  // Create a tag for versioning
  async createTag(tagName: string, message?: string): Promise<boolean> {
    try {
      await this.ensureInitialized();

      const tagMessage = message || `Version ${tagName}`;
      await this.simulateCommand(`git tag -a "${tagName}" -m "${tagMessage}"`);
      
      console.log(`Created tag: ${tagName} - ${tagMessage}`);
      return true;
    } catch (error) {
      console.error('Failed to create tag:', error);
      return false;
    }
  }

  // Get all tags
  async getTags(): Promise<string[]> {
    try {
      await this.ensureInitialized();
      
      // Mock tags for demo
      return ['v1.0.0', 'v1.1.0', 'v1.2.0', 'v2.0.0-beta'];
    } catch (error) {
      console.error('Failed to get tags:', error);
      return [];
    }
  }

  // Get diff between commits
  async getDiff(_fromCommit: string, _toCommit: string = 'HEAD'): Promise<string> {
    try {
      await this.ensureInitialized();
      
      // Mock diff for demo
      return `diff --git a/src/components/Button.tsx b/src/components/Button.tsx
index 1234567..abcdefg 100644
--- a/src/components/Button.tsx
+++ b/src/components/Button.tsx
@@ -10,7 +10,7 @@ export function Button({ children, variant = 'primary', ...props }: ButtonProps
   return (
     <button
       {...props}
-      className={\`btn btn-\${variant}\`}
+      className={\`btn btn-\${variant} rounded-lg shadow-md\`}
     >
       {children}
     </button>`;
    } catch (error) {
      console.error('Failed to get diff:', error);
      return '';
    }
  }

  // Reset to specific commit
  async resetToCommit(commitHash: string, mode: 'soft' | 'mixed' | 'hard' = 'mixed'): Promise<boolean> {
    try {
      await this.ensureInitialized();

      await this.simulateCommand(`git reset --${mode} ${commitHash}`);
      console.log(`Reset to commit ${commitHash} (${mode} mode)`);
      
      return true;
    } catch (error) {
      console.error('Failed to reset to commit:', error);
      return false;
    }
  }

  // Create a branch
  async createBranch(branchName: string, fromCommit?: string): Promise<boolean> {
    try {
      await this.ensureInitialized();

      const baseRef = fromCommit || 'HEAD';
      await this.simulateCommand(`git checkout -b "${branchName}" ${baseRef}`);
      
      console.log(`Created branch: ${branchName} from ${baseRef}`);
      return true;
    } catch (error) {
      console.error('Failed to create branch:', error);
      return false;
    }
  }

  // Get current branch
  async getCurrentBranch(): Promise<string> {
    try {
      await this.ensureInitialized();
      
      // Mock current branch
      return 'feature/component-modifications';
    } catch (error) {
      console.error('Failed to get current branch:', error);
      return 'main';
    }
  }

  // Get all branches
  async getBranches(): Promise<string[]> {
    try {
      await this.ensureInitialized();
      
      // Mock branches
      return ['main', 'feature/component-modifications', 'develop', 'hotfix/button-fix'];
    } catch (error) {
      console.error('Failed to get branches:', error);
      return ['main'];
    }
  }

  // Switch to branch
  async switchBranch(branchName: string): Promise<boolean> {
    try {
      await this.ensureInitialized();

      await this.simulateCommand(`git checkout "${branchName}"`);
      console.log(`Switched to branch: ${branchName}`);
      
      return true;
    } catch (error) {
      console.error('Failed to switch branch:', error);
      return false;
    }
  }

  // Get file history for specific file
  async getFileHistory(filePath: string, limit: number = 10): Promise<GitCommit[]> {
    try {
      await this.ensureInitialized();

      const allCommits = await this.getCommitHistory({ limit: limit * 2 });
      
      // Filter commits that modified the specific file
      return allCommits.filter(commit => 
        commit.files.some(file => file.includes(filePath))
      ).slice(0, limit);
    } catch (error) {
      console.error('Failed to get file history:', error);
      return [];
    }
  }

  // Private helper methods
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeRepository();
    }
  }

  private async simulateCommand(command: string): Promise<string> {
    // Simulate git command execution with a short delay
    return new Promise((resolve) => {
      console.log(`Executing: ${command}`);
      setTimeout(() => {
        // Generate mock hash for commit commands
        if (command.includes('git commit')) {
          resolve(`commit_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`);
        } else {
          resolve('success');
        }
      }, 100);
    });
  }

  // Utility methods for component versioning
  async createComponentVersion(componentId: string, changes: string[]): Promise<string | null> {
    const message = `Updated component with ${changes.length} changes: ${changes.join(', ')}`;
    return this.createCommit(message, { componentId, autoStage: true });
  }

  async getComponentHistory(componentId: string, limit: number = 10): Promise<GitCommit[]> {
    return this.getCommitHistory({ componentId, limit });
  }

  async createComponentBranch(componentId: string, featureName: string): Promise<boolean> {
    const branchName = `component/${componentId}/${featureName}`;
    return this.createBranch(branchName);
  }
}

// Default git service instance
const defaultGitConfig: GitConfig = {
  autoCommit: false,
  commitPrefix: '[AI-Generated]',
  excludePatterns: ['node_modules', '.git', 'dist', 'build', '.env*']
};

export const gitService = new GitService(defaultGitConfig);
export default GitService;