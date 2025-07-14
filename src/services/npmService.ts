// NPM Integration Service
// Handles package publishing, dependency management, and npm registry integration

export interface NpmPackage {
  id: string;
  name: string;
  version: string;
  description: string;
  componentId: string;
  authorId: string;
  repository?: {
    type: string;
    url: string;
  };
  homepage?: string;
  bugs?: {
    url: string;
  };
  license: string;
  keywords: string[];
  files: string[];
  main: string;
  types?: string;
  exports?: Record<string, any>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  scripts: Record<string, string>;
  publishConfig: {
    access: 'public' | 'restricted';
    registry?: string;
    tag?: string;
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    lastPublishedVersion?: string;
    downloadCount: number;
    publishCount: number;
    status: 'draft' | 'published' | 'deprecated' | 'unpublished';
  };
}

export interface NpmPublishConfig {
  packageName: string;
  version: string;
  description: string;
  keywords: string[];
  license: string;
  access: 'public' | 'restricted';
  registry?: string;
  tag?: string;
  dryRun?: boolean;
  includeDevDependencies?: boolean;
  buildBeforePublish?: boolean;
  runTests?: boolean;
  generateDocs?: boolean;
}

export interface NpmPublishResult {
  success: boolean;
  packageName: string;
  version: string;
  publishedAt?: string;
  registryUrl?: string;
  tarballUrl?: string;
  size: number;
  files: string[];
  warnings: string[];
  errors: string[];
  metadata: {
    buildTime: number;
    publishTime: number;
    totalTime: number;
    dryRun: boolean;
  };
}

export interface DependencyInfo {
  name: string;
  version: string;
  installedVersion?: string;
  latestVersion?: string;
  type: 'runtime' | 'development' | 'peer' | 'optional';
  description?: string;
  homepage?: string;
  repository?: string;
  license?: string;
  author?: string;
  deprecated?: boolean;
  vulnerabilities: DependencyVulnerability[];
  size: {
    bundled: number;
    unpacked: number;
  };
  dependencies: string[];
  dependents: string[];
  lastUpdated: string;
}

export interface DependencyVulnerability {
  id: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  description: string;
  references: string[];
  patchedVersions?: string;
  vulnerableVersions: string;
  publishedAt: string;
}

export interface DependencyAnalysis {
  packageId: string;
  summary: {
    totalDependencies: number;
    outdatedDependencies: number;
    vulnerableDependencies: number;
    deprecatedDependencies: number;
    totalSize: number;
    duplicates: number;
  };
  dependencies: DependencyInfo[];
  recommendations: DependencyRecommendation[];
  securityReport: SecurityReport;
  bundleAnalysis: BundleAnalysis;
  licenseCompliance: LicenseCompliance;
}

export interface DependencyRecommendation {
  type: 'update' | 'remove' | 'replace' | 'audit' | 'optimize';
  package: string;
  currentVersion?: string;
  recommendedVersion?: string;
  reason: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'easy' | 'moderate' | 'difficult';
  autoFixable: boolean;
}

export interface SecurityReport {
  vulnerabilityCount: {
    low: number;
    moderate: number;
    high: number;
    critical: number;
  };
  vulnerabilities: DependencyVulnerability[];
  recommendations: Array<{
    package: string;
    action: 'update' | 'replace' | 'remove';
    details: string;
  }>;
  auditScore: number;
}

export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  largestDependencies: Array<{
    name: string;
    size: number;
    percentage: number;
  }>;
  duplicates: Array<{
    name: string;
    versions: string[];
    totalSize: number;
  }>;
  treeShaking: {
    supported: boolean;
    unusedExports: string[];
    potentialSavings: number;
  };
}

export interface LicenseCompliance {
  status: 'compliant' | 'issues' | 'unknown';
  licenses: Array<{
    name: string;
    packages: string[];
    compatible: boolean;
    issues?: string[];
  }>;
  conflicts: Array<{
    package1: string;
    license1: string;
    package2: string;
    license2: string;
    issue: string;
  }>;
  recommendations: string[];
}

export interface NpmRegistry {
  id: string;
  name: string;
  url: string;
  type: 'public' | 'private' | 'mirror';
  authentication?: {
    token?: string;
    username?: string;
    password?: string;
    email?: string;
  };
  scopes: string[];
  isDefault: boolean;
  metadata: {
    createdAt: string;
    lastUsed: string;
    packageCount: number;
    isActive: boolean;
  };
}

export interface PackageSearch {
  query?: string;
  author?: string;
  keywords?: string[];
  license?: string;
  minDownloads?: number;
  updatedSince?: string;
  sortBy: 'relevance' | 'downloads' | 'updated' | 'created';
  sortOrder: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface PackageSearchResult {
  packages: Array<{
    name: string;
    version: string;
    description: string;
    author: string;
    keywords: string[];
    license: string;
    downloads: number;
    lastUpdated: string;
    repository?: string;
    homepage?: string;
  }>;
  total: number;
  hasMore: boolean;
}

class NpmService {
  private packages: Map<string, NpmPackage> = new Map();
  private registries: Map<string, NpmRegistry> = new Map();
  private dependencyCache: Map<string, DependencyInfo> = new Map();
  private publishHistory: Map<string, NpmPublishResult[]> = new Map();
  private isInitialized = false;

  // Initialize service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.loadDefaultRegistries();
    await this.setupDependencyTracking();
    this.isInitialized = true;
    console.log('NPM service initialized');
  }

  // Create NPM package from component
  async createPackage(
    componentId: string,
    authorId: string,
    config: {
      name: string;
      description: string;
      version?: string;
      license?: string;
      keywords?: string[];
      homepage?: string;
      repository?: { type: string; url: string };
      includeFiles?: string[];
    }
  ): Promise<NpmPackage> {
    await this.ensureInitialized();

    // Validate package name
    if (!this.isValidPackageName(config.name)) {
      throw new Error(`Invalid package name: ${config.name}`);
    }

    // Check if package name is available
    const existingPackage = Array.from(this.packages.values())
      .find(pkg => pkg.name === config.name);
    
    if (existingPackage) {
      throw new Error(`Package name ${config.name} already exists`);
    }

    const npmPackage: NpmPackage = {
      id: this.generateId('package'),
      name: config.name,
      version: config.version || '1.0.0',
      description: config.description,
      componentId,
      authorId,
      repository: config.repository,
      homepage: config.homepage,
      license: config.license || 'MIT',
      keywords: config.keywords || [],
      files: config.includeFiles || ['dist/', 'src/', 'README.md', 'package.json'],
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      exports: {
        '.': {
          import: './dist/index.esm.js',
          require: './dist/index.js',
          types: './dist/index.d.ts'
        }
      },
      dependencies: {},
      devDependencies: {},
      peerDependencies: {
        'react': '>=16.8.0',
        'react-dom': '>=16.8.0'
      },
      scripts: {
        build: 'rollup -c',
        test: 'jest',
        prepublishOnly: 'npm run build && npm test'
      },
      publishConfig: {
        access: 'public'
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        downloadCount: 0,
        publishCount: 0,
        status: 'draft'
      }
    };

    this.packages.set(npmPackage.id, npmPackage);
    console.log(`Created NPM package: ${npmPackage.name}`);
    return npmPackage;
  }

  // Publish package to NPM
  async publishPackage(
    packageId: string,
    config: NpmPublishConfig
  ): Promise<NpmPublishResult> {
    await this.ensureInitialized();

    const npmPackage = this.packages.get(packageId);
    if (!npmPackage) {
      throw new Error(`Package ${packageId} not found`);
    }

    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // Update package configuration
      npmPackage.version = config.version;
      npmPackage.description = config.description;
      npmPackage.keywords = config.keywords;
      npmPackage.license = config.license;
      npmPackage.publishConfig.access = config.access;
      npmPackage.publishConfig.registry = config.registry;
      npmPackage.publishConfig.tag = config.tag;

      // Validate package before publish
      const validationResult = await this.validatePackage(npmPackage);
      if (!validationResult.valid) {
        errors.push(...validationResult.errors);
        warnings.push(...validationResult.warnings);
      }

      // Build package if requested
      let buildTime = 0;
      if (config.buildBeforePublish) {
        const buildStart = Date.now();
        await this.buildPackage(npmPackage);
        buildTime = Date.now() - buildStart;
      }

      // Run tests if requested
      if (config.runTests) {
        const testResult = await this.runPackageTests(npmPackage);
        if (!testResult.success) {
          errors.push('Tests failed');
          warnings.push(...testResult.warnings);
        }
      }

      // Generate documentation if requested
      if (config.generateDocs) {
        await this.generatePackageDocs(npmPackage);
      }

      // Create tarball and calculate size
      const tarball = await this.createTarball(npmPackage);
      const size = tarball.size;
      const files = tarball.files;

      if (config.dryRun) {
        warnings.push('Dry run mode - package not actually published');
      } else {
        // Simulate publishing to registry
        const publishStart = Date.now();
        await this.publishToRegistry(npmPackage, tarball, config);
        // Track publish time (not used currently)
        Date.now() - publishStart;

        // Update package metadata
        npmPackage.metadata.publishedAt = new Date().toISOString();
        npmPackage.metadata.lastPublishedVersion = npmPackage.version;
        npmPackage.metadata.publishCount++;
        npmPackage.metadata.status = 'published';
        npmPackage.metadata.updatedAt = new Date().toISOString();
      }

      const result: NpmPublishResult = {
        success: errors.length === 0,
        packageName: npmPackage.name,
        version: npmPackage.version,
        publishedAt: config.dryRun ? undefined : new Date().toISOString(),
        registryUrl: config.registry || 'https://registry.npmjs.org',
        tarballUrl: `${config.registry || 'https://registry.npmjs.org'}/${npmPackage.name}/-/${npmPackage.name}-${npmPackage.version}.tgz`,
        size,
        files,
        warnings,
        errors,
        metadata: {
          buildTime,
          publishTime: Date.now() - startTime - buildTime,
          totalTime: Date.now() - startTime,
          dryRun: config.dryRun || false
        }
      };

      // Store publish result
      const history = this.publishHistory.get(packageId) || [];
      history.push(result);
      this.publishHistory.set(packageId, history);

      console.log(`${config.dryRun ? 'Dry run' : 'Published'} package: ${npmPackage.name}@${npmPackage.version}`);
      return result;

    } catch (error: any) {
      return {
        success: false,
        packageName: npmPackage.name,
        version: npmPackage.version,
        size: 0,
        files: [],
        warnings,
        errors: [...errors, error.message],
        metadata: {
          buildTime: 0,
          publishTime: 0,
          totalTime: Date.now() - startTime,
          dryRun: config.dryRun || false
        }
      };
    }
  }

  // Analyze package dependencies
  async analyzeDependencies(packageId: string): Promise<DependencyAnalysis> {
    await this.ensureInitialized();

    const npmPackage = this.packages.get(packageId);
    if (!npmPackage) {
      throw new Error(`Package ${packageId} not found`);
    }

    const dependencies: DependencyInfo[] = [];
    const allDeps = {
      ...npmPackage.dependencies,
      ...npmPackage.devDependencies,
      ...npmPackage.peerDependencies
    };

    // Analyze each dependency
    for (const [name, version] of Object.entries(allDeps)) {
      const depInfo = await this.getDependencyInfo(name, version);
      dependencies.push(depInfo);
    }

    // Calculate summary statistics
    const summary = {
      totalDependencies: dependencies.length,
      outdatedDependencies: dependencies.filter(dep => dep.version !== dep.latestVersion).length,
      vulnerableDependencies: dependencies.filter(dep => dep.vulnerabilities.length > 0).length,
      deprecatedDependencies: dependencies.filter(dep => dep.deprecated).length,
      totalSize: dependencies.reduce((sum, dep) => sum + dep.size.bundled, 0),
      duplicates: this.findDuplicateDependencies(dependencies).length
    };

    // Generate recommendations
    const recommendations = this.generateDependencyRecommendations(dependencies);

    // Security analysis
    const securityReport = this.generateSecurityReport(dependencies);

    // Bundle analysis
    const bundleAnalysis = this.analyzeBundleSize(dependencies);

    // License compliance
    const licenseCompliance = this.checkLicenseCompliance(dependencies, npmPackage.license);

    return {
      packageId,
      summary,
      dependencies,
      recommendations,
      securityReport,
      bundleAnalysis,
      licenseCompliance
    };
  }

  // Search NPM packages
  async searchPackages(search: PackageSearch): Promise<PackageSearchResult> {
    await this.ensureInitialized();

    // Simulate package search - in production would call NPM API
    const mockPackages = [
      {
        name: '@types/react',
        version: '18.2.0',
        description: 'TypeScript definitions for React',
        author: 'DefinitelyTyped',
        keywords: ['react', 'typescript', 'types'],
        license: 'MIT',
        downloads: 1000000,
        lastUpdated: '2023-06-01',
        repository: 'https://github.com/DefinitelyTyped/DefinitelyTyped',
        homepage: 'https://github.com/DefinitelyTyped/DefinitelyTyped'
      },
      {
        name: 'react-router-dom',
        version: '6.8.0',
        description: 'DOM bindings for React Router',
        author: 'React Training',
        keywords: ['react', 'router', 'routing'],
        license: 'MIT',
        downloads: 500000,
        lastUpdated: '2023-05-15',
        repository: 'https://github.com/remix-run/react-router'
      }
    ];

    let filteredPackages = mockPackages;

    // Apply filters
    if (search.query) {
      const query = search.query.toLowerCase();
      filteredPackages = filteredPackages.filter(pkg =>
        pkg.name.toLowerCase().includes(query) ||
        pkg.description.toLowerCase().includes(query) ||
        pkg.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    }

    if (search.keywords && search.keywords.length > 0) {
      filteredPackages = filteredPackages.filter(pkg =>
        search.keywords!.some(keyword => pkg.keywords.includes(keyword))
      );
    }

    if (search.license) {
      filteredPackages = filteredPackages.filter(pkg => pkg.license === search.license);
    }

    if (search.minDownloads) {
      filteredPackages = filteredPackages.filter(pkg => pkg.downloads >= search.minDownloads!);
    }

    // Sort packages
    filteredPackages.sort((a, b) => {
      let comparison = 0;
      
      switch (search.sortBy) {
        case 'relevance':
          // Simple relevance scoring
          comparison = b.downloads - a.downloads;
          break;
        case 'downloads':
          comparison = a.downloads - b.downloads;
          break;
        case 'updated':
          comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
          break;
        case 'created':
          comparison = 0; // Would use creation date
          break;
      }

      return search.sortOrder === 'desc' ? -comparison : comparison;
    });

    const total = filteredPackages.length;
    const offset = search.offset || 0;
    const limit = search.limit || 20;
    const paginatedPackages = filteredPackages.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      packages: paginatedPackages,
      total,
      hasMore
    };
  }

  // Update package dependencies
  async updateDependencies(
    packageId: string,
    updates: Array<{
      name: string;
      version: string;
      type: 'dependencies' | 'devDependencies' | 'peerDependencies';
    }>
  ): Promise<{ success: boolean; updated: string[]; errors: string[] }> {
    const npmPackage = this.packages.get(packageId);
    if (!npmPackage) {
      throw new Error(`Package ${packageId} not found`);
    }

    const updated: string[] = [];
    const errors: string[] = [];

    for (const update of updates) {
      try {
        // Validate version
        if (!this.isValidVersion(update.version)) {
          errors.push(`Invalid version for ${update.name}: ${update.version}`);
          continue;
        }

        // Update dependency
        switch (update.type) {
          case 'dependencies':
            npmPackage.dependencies[update.name] = update.version;
            break;
          case 'devDependencies':
            npmPackage.devDependencies[update.name] = update.version;
            break;
          case 'peerDependencies':
            npmPackage.peerDependencies[update.name] = update.version;
            break;
        }

        updated.push(`${update.name}@${update.version}`);
      } catch (error: any) {
        errors.push(`Failed to update ${update.name}: ${error.message}`);
      }
    }

    if (updated.length > 0) {
      npmPackage.metadata.updatedAt = new Date().toISOString();
      this.packages.set(packageId, npmPackage);
    }

    return {
      success: errors.length === 0,
      updated,
      errors
    };
  }

  // Private helper methods
  private async getDependencyInfo(name: string, version: string): Promise<DependencyInfo> {
    const cacheKey = `${name}@${version}`;
    
    if (this.dependencyCache.has(cacheKey)) {
      return this.dependencyCache.get(cacheKey)!;
    }

    // Simulate fetching dependency info from NPM registry
    const depInfo: DependencyInfo = {
      name,
      version,
      installedVersion: version,
      latestVersion: this.generateLatestVersion(version),
      type: 'runtime',
      description: `${name} package`,
      homepage: `https://npmjs.com/package/${name}`,
      repository: `https://github.com/user/${name}`,
      license: 'MIT',
      author: 'Package Author',
      deprecated: false,
      vulnerabilities: this.generateMockVulnerabilities(name),
      size: {
        bundled: Math.floor(Math.random() * 1000000),
        unpacked: Math.floor(Math.random() * 2000000)
      },
      dependencies: [],
      dependents: [],
      lastUpdated: new Date().toISOString()
    };

    this.dependencyCache.set(cacheKey, depInfo);
    return depInfo;
  }

  private generateMockVulnerabilities(packageName: string): DependencyVulnerability[] {
    // Randomly generate vulnerabilities for demo
    if (Math.random() > 0.1) return []; // 90% chance of no vulnerabilities

    return [{
      id: `VULN-${Date.now()}`,
      severity: ['low', 'moderate', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
      title: `Security vulnerability in ${packageName}`,
      description: `Mock vulnerability description for ${packageName}`,
      references: [`https://security.example.com/vuln/${packageName}`],
      patchedVersions: '>=1.2.3',
      vulnerableVersions: '<1.2.3',
      publishedAt: new Date().toISOString()
    }];
  }

  private generateLatestVersion(currentVersion: string): string {
    const parts = currentVersion.split('.');
    const patch = parseInt(parts[2] || '0') + Math.floor(Math.random() * 5);
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  private findDuplicateDependencies(dependencies: DependencyInfo[]): Array<{ name: string; versions: string[] }> {
    const nameGroups = new Map<string, string[]>();
    
    dependencies.forEach(dep => {
      const versions = nameGroups.get(dep.name) || [];
      if (!versions.includes(dep.version)) {
        versions.push(dep.version);
      }
      nameGroups.set(dep.name, versions);
    });

    return Array.from(nameGroups.entries())
      .filter(([_name, versions]) => versions.length > 1)
      .map(([name, versions]) => ({ name, versions }));
  }

  private generateDependencyRecommendations(dependencies: DependencyInfo[]): DependencyRecommendation[] {
    const recommendations: DependencyRecommendation[] = [];

    dependencies.forEach(dep => {
      // Recommend updates for outdated packages
      if (dep.version !== dep.latestVersion) {
        recommendations.push({
          type: 'update',
          package: dep.name,
          currentVersion: dep.version,
          recommendedVersion: dep.latestVersion,
          reason: 'Package has newer version available',
          impact: 'low',
          effort: 'easy',
          autoFixable: true
        });
      }

      // Recommend fixes for vulnerable packages
      if (dep.vulnerabilities.length > 0) {
        recommendations.push({
          type: 'audit',
          package: dep.name,
          currentVersion: dep.version,
          reason: `Package has ${dep.vulnerabilities.length} security vulnerabilities`,
          impact: dep.vulnerabilities.some(v => v.severity === 'critical') ? 'high' : 'medium',
          effort: 'moderate',
          autoFixable: false
        });
      }

      // Recommend removing deprecated packages
      if (dep.deprecated) {
        recommendations.push({
          type: 'replace',
          package: dep.name,
          currentVersion: dep.version,
          reason: 'Package is deprecated',
          impact: 'medium',
          effort: 'difficult',
          autoFixable: false
        });
      }
    });

    return recommendations;
  }

  private generateSecurityReport(dependencies: DependencyInfo[]): SecurityReport {
    const vulnerabilities = dependencies.flatMap(dep => dep.vulnerabilities);
    
    const vulnerabilityCount = {
      low: vulnerabilities.filter(v => v.severity === 'low').length,
      moderate: vulnerabilities.filter(v => v.severity === 'moderate').length,
      high: vulnerabilities.filter(v => v.severity === 'high').length,
      critical: vulnerabilities.filter(v => v.severity === 'critical').length
    };

    const recommendations = dependencies
      .filter(dep => dep.vulnerabilities.length > 0)
      .map(dep => ({
        package: dep.name,
        action: 'update' as const,
        details: `Update to resolve ${dep.vulnerabilities.length} vulnerabilities`
      }));

    const auditScore = Math.max(0, 100 - (vulnerabilityCount.critical * 25 + vulnerabilityCount.high * 10 + vulnerabilityCount.moderate * 5 + vulnerabilityCount.low * 1));

    return {
      vulnerabilityCount,
      vulnerabilities,
      recommendations,
      auditScore
    };
  }

  private analyzeBundleSize(dependencies: DependencyInfo[]): BundleAnalysis {
    const totalSize = dependencies.reduce((sum, dep) => sum + dep.size.bundled, 0);
    const gzippedSize = Math.floor(totalSize * 0.3); // Estimate

    const largestDependencies = dependencies
      .sort((a, b) => b.size.bundled - a.size.bundled)
      .slice(0, 10)
      .map(dep => ({
        name: dep.name,
        size: dep.size.bundled,
        percentage: (dep.size.bundled / totalSize) * 100
      }));

    const duplicates = this.findDuplicateDependencies(dependencies)
      .map(dup => ({
        name: dup.name,
        versions: dup.versions,
        totalSize: dup.versions.length * 50000 // Estimate
      }));

    return {
      totalSize,
      gzippedSize,
      largestDependencies,
      duplicates,
      treeShaking: {
        supported: true,
        unusedExports: [],
        potentialSavings: Math.floor(totalSize * 0.1)
      }
    };
  }

  private checkLicenseCompliance(dependencies: DependencyInfo[], packageLicense: string): LicenseCompliance {
    const licenses = new Map<string, string[]>();
    
    dependencies.forEach(dep => {
      const license = dep.license || 'Unknown';
      const packages = licenses.get(license) || [];
      packages.push(dep.name);
      licenses.set(license, packages);
    });

    const licenseArray = Array.from(licenses.entries()).map(([name, packages]) => ({
      name,
      packages,
      compatible: this.isLicenseCompatible(name, packageLicense)
    }));

    const incompatibleLicenses = licenseArray.filter(l => !l.compatible);
    const status: LicenseCompliance['status'] = incompatibleLicenses.length > 0 ? 'issues' : 'compliant';

    return {
      status,
      licenses: licenseArray,
      conflicts: [],
      recommendations: incompatibleLicenses.length > 0 
        ? [`Review ${incompatibleLicenses.length} license compatibility issues`]
        : ['All licenses are compatible']
    };
  }

  private isLicenseCompatible(depLicense: string, packageLicense: string): boolean {
    // Simplified license compatibility check
    const permissiveLicenses = ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause'];
    const copyleftLicenses = ['GPL-2.0', 'GPL-3.0', 'LGPL-2.1', 'LGPL-3.0'];

    if (permissiveLicenses.includes(depLicense)) return true;
    if (packageLicense === depLicense) return true;
    if (copyleftLicenses.includes(packageLicense) && copyleftLicenses.includes(depLicense)) return true;

    return false;
  }

  private async validatePackage(npmPackage: NpmPackage): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate package name
    if (!this.isValidPackageName(npmPackage.name)) {
      errors.push('Invalid package name format');
    }

    // Validate version
    if (!this.isValidVersion(npmPackage.version)) {
      errors.push('Invalid version format');
    }

    // Check required fields
    if (!npmPackage.description) {
      warnings.push('Package description is missing');
    }

    if (!npmPackage.keywords.length) {
      warnings.push('Package keywords are missing');
    }

    if (!npmPackage.repository) {
      warnings.push('Repository information is missing');
    }

    // Validate files
    if (!npmPackage.files.includes('package.json')) {
      warnings.push('package.json should be included in files array');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private async buildPackage(npmPackage: NpmPackage): Promise<void> {
    // Simulate package build process
    console.log(`Building package: ${npmPackage.name}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  private async runPackageTests(npmPackage: NpmPackage): Promise<{
    success: boolean;
    warnings: string[];
  }> {
    // Simulate running tests
    console.log(`Running tests for package: ${npmPackage.name}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: Math.random() > 0.1, // 90% success rate
      warnings: []
    };
  }

  private async generatePackageDocs(npmPackage: NpmPackage): Promise<void> {
    // Simulate documentation generation
    console.log(`Generating documentation for package: ${npmPackage.name}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private async createTarball(npmPackage: NpmPackage): Promise<{
    size: number;
    files: string[];
  }> {
    // Simulate tarball creation
    const files = [...npmPackage.files];
    const size = files.length * 1000 + Math.floor(Math.random() * 50000);
    
    return { size, files };
  }

  private async publishToRegistry(
    npmPackage: NpmPackage,
    _tarball: { size: number; files: string[] },
    _config: NpmPublishConfig
  ): Promise<void> {
    // Simulate publishing to NPM registry
    console.log(`Publishing ${npmPackage.name}@${npmPackage.version} to registry`);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  private isValidPackageName(name: string): boolean {
    // Simplified NPM package name validation
    const npmNameRegex = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
    return npmNameRegex.test(name) && name.length <= 214;
  }

  private isValidVersion(version: string): boolean {
    // Simplified semantic version validation
    const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9-.]+)?(\+[a-zA-Z0-9-.]+)?$/;
    return semverRegex.test(version);
  }

  private async loadDefaultRegistries(): Promise<void> {
    const defaultRegistries: Omit<NpmRegistry, 'id' | 'metadata'>[] = [
      {
        name: 'NPM Registry',
        url: 'https://registry.npmjs.org',
        type: 'public',
        scopes: ['@'],
        isDefault: true
      },
      {
        name: 'GitHub Packages',
        url: 'https://npm.pkg.github.com',
        type: 'private',
        scopes: ['@github'],
        isDefault: false
      }
    ];

    for (const registryData of defaultRegistries) {
      const registry: NpmRegistry = {
        ...registryData,
        id: this.generateId('registry'),
        metadata: {
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
          packageCount: 0,
          isActive: true
        }
      };
      this.registries.set(registry.id, registry);
    }

    console.log(`Loaded ${defaultRegistries.length} default registries`);
  }

  private async setupDependencyTracking(): Promise<void> {
    // Set up periodic dependency updates
    setInterval(() => {
      this.updateDependencyCache();
    }, 3600000); // Every hour
  }

  private updateDependencyCache(): void {
    // Clear old cache entries
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [key, dep] of this.dependencyCache.entries()) {
      const cacheTime = new Date(dep.lastUpdated).getTime();
      if (cacheTime < cutoffTime) {
        this.dependencyCache.delete(key);
      }
    }
    
    console.log('Updated dependency cache');
  }

  // Public API methods
  async getPackage(packageId: string): Promise<NpmPackage | null> {
    await this.ensureInitialized();
    return this.packages.get(packageId) || null;
  }

  async getUserPackages(authorId: string): Promise<NpmPackage[]> {
    await this.ensureInitialized();
    return Array.from(this.packages.values())
      .filter(pkg => pkg.authorId === authorId);
  }

  async getPublishHistory(packageId: string): Promise<NpmPublishResult[]> {
    await this.ensureInitialized();
    return this.publishHistory.get(packageId) || [];
  }

  async getRegistries(): Promise<NpmRegistry[]> {
    await this.ensureInitialized();
    return Array.from(this.registries.values());
  }

  async deletePackage(packageId: string, authorId: string): Promise<boolean> {
    const npmPackage = this.packages.get(packageId);
    if (!npmPackage || npmPackage.authorId !== authorId) {
      return false;
    }

    this.packages.delete(packageId);
    this.publishHistory.delete(packageId);
    
    console.log(`Deleted package: ${npmPackage.name}`);
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
    this.packages.clear();
    this.registries.clear();
    this.dependencyCache.clear();
    this.publishHistory.clear();
  }
}

// Export singleton instance
export const npmService = new NpmService();
export default NpmService;