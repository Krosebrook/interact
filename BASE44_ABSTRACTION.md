# Base44 Abstraction Layer - Implementation Guide

**Project:** Interact Platform  
**Date:** February 9, 2026  
**Status:** Design Phase  
**Purpose:** Create abstraction layer to reduce Base44 vendor lock-in  

---

## Overview

This document provides the architecture and implementation guide for abstracting Base44 SDK dependencies. The abstraction layer enables gradual migration to alternative services while maintaining production stability.

**Goals:**
- ✅ Decouple business logic from Base44 SDK
- ✅ Enable parallel running of multiple backends
- ✅ Support gradual migration with rollback capability
- ✅ Maintain type safety throughout migration
- ✅ Zero behavior changes during abstraction

---

## Architecture

### Adapter Pattern

We use the **Adapter Pattern** to abstract Base44 services:

```
Application Code
      ↓
  Service Interface  ← Abstract contract
      ↓
  ┌───────┴────────┐
  ↓                ↓
Base44 Adapter   Supabase Adapter  ← Concrete implementations
  ↓                ↓
Base44 SDK      Supabase Client
```

---

## Service Interfaces

### 1. Authentication Service

```typescript
// src/services/auth/types.ts

export interface IAuthService {
  // User authentication
  signIn(email: string, password: string): Promise<AuthResult>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  refreshToken(refreshToken: string): Promise<AuthResult>;
  
  // SSO integration
  ssoInitiate(provider: SSOProvider, config: SSOConfig): Promise<AuthRedirect>;
  ssoCallback(params: SSOCallbackParams): Promise<AuthResult>;
  
  // Session management
  validateSession(token: string): Promise<Session | null>;
  revokeSession(sessionId: string): Promise<void>;
}

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface AuthRedirect {
  redirectUrl: string;
  state: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'facilitator' | 'team_leader' | 'participant';

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}
```

### 2. Database Service

```typescript
// src/services/database/types.ts

export interface IDatabaseService {
  // CRUD operations
  create<T>(table: string, data: Partial<T>): Promise<T>;
  findById<T>(table: string, id: string): Promise<T | null>;
  findMany<T>(table: string, query: Query): Promise<T[]>;
  update<T>(table: string, id: string, data: Partial<T>): Promise<T>;
  delete(table: string, id: string): Promise<void>;
  
  // Advanced queries
  query<T>(table: string, options: QueryOptions): Promise<PaginatedResult<T>>;
  count(table: string, filter?: Filter): Promise<number>;
  
  // Transactions
  transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T>;
}

export interface Query {
  filter?: Filter;
  sort?: Sort;
  limit?: number;
  offset?: number;
}

export interface Filter {
  [key: string]: any;
}

export interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

export interface QueryOptions extends Query {
  page?: number;
  perPage?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
  hasMore: boolean;
}

export interface Transaction {
  create<T>(table: string, data: Partial<T>): Promise<T>;
  update<T>(table: string, id: string, data: Partial<T>): Promise<T>;
  delete(table: string, id: string): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
```

### 3. Storage Service

```typescript
// src/services/storage/types.ts

export interface IStorageService {
  // File operations
  upload(file: File, options?: UploadOptions): Promise<UploadResult>;
  download(fileId: string): Promise<Blob>;
  delete(fileId: string): Promise<void>;
  
  // URL generation
  getPublicUrl(fileId: string): string;
  getSignedUrl(fileId: string, expiresIn?: number): Promise<string>;
  
  // Metadata
  getMetadata(fileId: string): Promise<FileMetadata>;
  updateMetadata(fileId: string, metadata: Partial<FileMetadata>): Promise<void>;
}

export interface UploadOptions {
  folder?: string;
  fileName?: string;
  contentType?: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  fileId: string;
  url: string;
  size: number;
  contentType: string;
}

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  contentType: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, string>;
}
```

### 4. Functions Service

```typescript
// src/services/functions/types.ts

export interface IFunctionsService {
  // Invoke serverless function
  invoke<TInput, TOutput>(
    functionName: string,
    data: TInput,
    options?: InvokeOptions
  ): Promise<TOutput>;
  
  // Batch invocations
  invokeBatch<TInput, TOutput>(
    functionName: string,
    dataArray: TInput[]
  ): Promise<TOutput[]>;
}

export interface InvokeOptions {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}
```

---

## Adapter Implementations

### Base44 Auth Adapter

```typescript
// src/services/auth/adapters/base44.adapter.ts

import { base44 } from '@base44/sdk';
import type { IAuthService, AuthResult, User, Session } from '../types';

export class Base44AuthAdapter implements IAuthService {
  async signIn(email: string, password: string): Promise<AuthResult> {
    const result = await base44.auth.signIn({ email, password });
    
    return {
      user: this.mapUser(result.user),
      accessToken: result.session.access_token,
      refreshToken: result.session.refresh_token,
      expiresAt: new Date(result.session.expires_at)
    };
  }
  
  async signOut(): Promise<void> {
    await base44.auth.signOut();
  }
  
  async getCurrentUser(): Promise<User | null> {
    const user = await base44.auth.getUser();
    return user ? this.mapUser(user) : null;
  }
  
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    const result = await base44.auth.refreshSession({ refreshToken });
    
    return {
      user: this.mapUser(result.user),
      accessToken: result.session.access_token,
      refreshToken: result.session.refresh_token,
      expiresAt: new Date(result.session.expires_at)
    };
  }
  
  async ssoInitiate(provider: SSOProvider, config: SSOConfig) {
    // Base44 SSO implementation
    throw new Error('SSO not implemented in Base44 adapter');
  }
  
  async ssoCallback(params: SSOCallbackParams) {
    throw new Error('SSO not implemented in Base44 adapter');
  }
  
  async validateSession(token: string): Promise<Session | null> {
    const session = await base44.auth.getSession(token);
    return session ? this.mapSession(session) : null;
  }
  
  async revokeSession(sessionId: string): Promise<void> {
    await base44.auth.signOut();
  }
  
  private mapUser(base44User: any): User {
    return {
      id: base44User.id,
      email: base44User.email,
      name: base44User.user_metadata?.name || base44User.email,
      role: base44User.user_metadata?.role || 'participant',
      organizationId: base44User.user_metadata?.organization_id,
      avatarUrl: base44User.user_metadata?.avatar_url,
      createdAt: new Date(base44User.created_at),
      updatedAt: new Date(base44User.updated_at)
    };
  }
  
  private mapSession(base44Session: any): Session {
    return {
      id: base44Session.access_token, // Use token as session ID
      userId: base44Session.user.id,
      token: base44Session.access_token,
      expiresAt: new Date(base44Session.expires_at),
      createdAt: new Date()
    };
  }
}
```

### Supabase Auth Adapter

```typescript
// src/services/auth/adapters/supabase.adapter.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { IAuthService, AuthResult, User, Session } from '../types';

export class SupabaseAuthAdapter implements IAuthService {
  private client: SupabaseClient;
  
  constructor(url: string, key: string) {
    this.client = createClient(url, key);
  }
  
  async signIn(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    if (!data.session || !data.user) {
      throw new Error('Authentication failed');
    }
    
    return {
      user: this.mapUser(data.user),
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: new Date(data.session.expires_at! * 1000)
    };
  }
  
  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }
  
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.client.auth.getUser();
    return user ? this.mapUser(user) : null;
  }
  
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    const { data, error } = await this.client.auth.refreshSession({
      refresh_token: refreshToken
    });
    
    if (error) throw error;
    if (!data.session || !data.user) {
      throw new Error('Token refresh failed');
    }
    
    return {
      user: this.mapUser(data.user),
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: new Date(data.session.expires_at! * 1000)
    };
  }
  
  async ssoInitiate(provider: SSOProvider, config: SSOConfig) {
    // Implement SSO with Supabase
    const { data, error } = await this.client.auth.signInWithOAuth({
      provider: provider.toLowerCase() as any,
      options: {
        redirectTo: config.callbackUrl
      }
    });
    
    if (error) throw error;
    
    return {
      redirectUrl: data.url!,
      state: data.provider!
    };
  }
  
  async ssoCallback(params: SSOCallbackParams) {
    const { data, error } = await this.client.auth.exchangeCodeForSession(
      params.code
    );
    
    if (error) throw error;
    if (!data.session || !data.user) {
      throw new Error('SSO callback failed');
    }
    
    return {
      user: this.mapUser(data.user),
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: new Date(data.session.expires_at! * 1000)
    };
  }
  
  async validateSession(token: string): Promise<Session | null> {
    const { data: { user }, error } = await this.client.auth.getUser(token);
    
    if (error || !user) return null;
    
    return {
      id: token,
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
      createdAt: new Date()
    };
  }
  
  async revokeSession(sessionId: string): Promise<void> {
    await this.signOut();
  }
  
  private mapUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      name: supabaseUser.user_metadata?.name || supabaseUser.email!,
      role: supabaseUser.user_metadata?.role || 'participant',
      organizationId: supabaseUser.user_metadata?.organization_id,
      avatarUrl: supabaseUser.user_metadata?.avatar_url,
      createdAt: new Date(supabaseUser.created_at),
      updatedAt: new Date(supabaseUser.updated_at || supabaseUser.created_at)
    };
  }
}
```

### Base44 Database Adapter

```typescript
// src/services/database/adapters/base44.adapter.ts

import { base44 } from '@base44/sdk';
import type { IDatabaseService, Query, QueryOptions, PaginatedResult } from '../types';

export class Base44DatabaseAdapter implements IDatabaseService {
  async create<T>(table: string, data: Partial<T>): Promise<T> {
    const result = await base44.entities[table].create(data);
    return result as T;
  }
  
  async findById<T>(table: string, id: string): Promise<T | null> {
    try {
      const result = await base44.entities[table].get(id);
      return result as T;
    } catch (error) {
      if ((error as any).status === 404) return null;
      throw error;
    }
  }
  
  async findMany<T>(table: string, query: Query): Promise<T[]> {
    let entityQuery = base44.entities[table].query();
    
    // Apply filters
    if (query.filter) {
      Object.entries(query.filter).forEach(([key, value]) => {
        entityQuery = entityQuery.where(key, '==', value);
      });
    }
    
    // Apply sorting
    if (query.sort) {
      entityQuery = entityQuery.orderBy(query.sort.field, query.sort.order);
    }
    
    // Apply pagination
    if (query.limit) {
      entityQuery = entityQuery.limit(query.limit);
    }
    
    if (query.offset) {
      entityQuery = entityQuery.offset(query.offset);
    }
    
    const results = await entityQuery.fetch();
    return results as T[];
  }
  
  async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    const result = await base44.entities[table].update(id, data);
    return result as T;
  }
  
  async delete(table: string, id: string): Promise<void> {
    await base44.entities[table].delete(id);
  }
  
  async query<T>(
    table: string,
    options: QueryOptions
  ): Promise<PaginatedResult<T>> {
    const page = options.page || 1;
    const perPage = options.perPage || 30;
    const offset = (page - 1) * perPage;
    
    const data = await this.findMany<T>(table, {
      ...options,
      limit: perPage,
      offset
    });
    
    const total = await this.count(table, options.filter);
    
    return {
      data,
      page,
      perPage,
      total,
      hasMore: offset + data.length < total
    };
  }
  
  async count(table: string, filter?: any): Promise<number> {
    let query = base44.entities[table].query();
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        query = query.where(key, '==', value);
      });
    }
    
    const results = await query.count();
    return results;
  }
  
  async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    // Base44 transactions implementation
    // This is a simplified version
    return await callback({
      create: this.create.bind(this),
      update: this.update.bind(this),
      delete: this.delete.bind(this),
      commit: async () => {},
      rollback: async () => {}
    });
  }
}
```

---

## Service Factory

```typescript
// src/services/factory.ts

import type { IAuthService } from './auth/types';
import type { IDatabaseService } from './database/types';
import type { IStorageService } from './storage/types';
import type { IFunctionsService } from './functions/types';

import { Base44AuthAdapter } from './auth/adapters/base44.adapter';
import { SupabaseAuthAdapter } from './auth/adapters/supabase.adapter';
import { Base44DatabaseAdapter } from './database/adapters/base44.adapter';
// ... other adapters

type ServiceProvider = 'base44' | 'supabase';

class ServiceFactory {
  private provider: ServiceProvider;
  private rolloutPercentage: number = 0; // 0-100
  
  constructor() {
    this.provider = (import.meta.env.VITE_SERVICE_PROVIDER as ServiceProvider) || 'base44';
    this.rolloutPercentage = parseInt(import.meta.env.VITE_ROLLOUT_PERCENTAGE || '0');
  }
  
  /**
   * Get auth service instance
   * Routes to new service based on rollout percentage
   */
  getAuthService(): IAuthService {
    const useNewService = this.shouldUseNewService();
    
    if (useNewService && this.provider === 'supabase') {
      return new SupabaseAuthAdapter(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_KEY!
      );
    }
    
    // Default to Base44
    return new Base44AuthAdapter();
  }
  
  /**
   * Get database service instance
   */
  getDatabaseService(): IDatabaseService {
    const useNewService = this.shouldUseNewService();
    
    if (useNewService && this.provider === 'supabase') {
      // return new SupabaseDatabaseAdapter(...);
    }
    
    return new Base44DatabaseAdapter();
  }
  
  /**
   * Get storage service instance
   */
  getStorageService(): IStorageService {
    // Always use Cloudinary for storage
    // return new CloudinaryStorageAdapter();
    throw new Error('Not implemented');
  }
  
  /**
   * Get functions service instance
   */
  getFunctionsService(): IFunctionsService {
    // Migrate to Vercel Functions
    // return new VercelFunctionsAdapter();
    throw new Error('Not implemented');
  }
  
  /**
   * Determine if new service should be used
   * Based on rollout percentage (feature flag)
   */
  private shouldUseNewService(): boolean {
    if (this.rolloutPercentage === 0) return false;
    if (this.rolloutPercentage === 100) return true;
    
    // Use deterministic random based on session
    const userId = this.getCurrentUserId();
    if (!userId) return false;
    
    // Hash user ID to get consistent result
    const hash = this.simpleHash(userId);
    const bucket = hash % 100;
    
    return bucket < this.rolloutPercentage;
  }
  
  private getCurrentUserId(): string | null {
    // Get from session storage or cookie
    return sessionStorage.getItem('userId');
  }
  
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// Export singleton instance
export const serviceFactory = new ServiceFactory();

// Export individual service getters
export const authService = serviceFactory.getAuthService();
export const databaseService = serviceFactory.getDatabaseService();
```

---

## Usage in Application Code

### Before (Direct Base44 Usage)

```typescript
// src/hooks/useAuth.js
import { base44 } from '@base44/sdk';

export function useAuth() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);
  
  const signIn = async (email, password) => {
    const result = await base44.auth.signIn({ email, password });
    setUser(result.user);
  };
  
  return { user, signIn };
}
```

### After (Using Abstraction Layer)

```typescript
// src/hooks/useAuth.ts
import { authService } from '@/services/factory';
import type { User } from '@/services/auth/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);
  
  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password);
    setUser(result.user);
    
    // Store session
    sessionStorage.setItem('userId', result.user.id);
    sessionStorage.setItem('token', result.accessToken);
  };
  
  return { user, signIn };
}
```

---

## Migration Strategy

### Phase 1: Implement Abstraction Layer (Weeks 3-6)

1. Define service interfaces
2. Implement Base44 adapters
3. Replace direct Base44 calls with service calls
4. Verify behavior is unchanged
5. Deploy to production

### Phase 2: Implement Alternative Adapters (Weeks 7-10)

1. Implement Supabase/alternative adapters
2. Add comprehensive tests
3. Deploy to staging
4. Parallel testing

### Phase 3: Gradual Rollout (Weeks 11-14)

1. Enable for 10% of users
2. Monitor metrics
3. Increase to 50%
4. Monitor metrics
5. Increase to 100%
6. Decommission Base44

### Phase 4: Cleanup (Weeks 15-16)

1. Remove Base44 SDK dependency
2. Remove Base44 adapters
3. Simplify service factory
4. Update documentation

---

## Testing Strategy

### Unit Tests

```typescript
// src/services/auth/__tests__/base44.adapter.test.ts
import { describe, it, expect, vi } from 'vitest';
import { Base44AuthAdapter } from '../adapters/base44.adapter';

vi.mock('@base44/sdk', () => ({
  base44: {
    auth: {
      signIn: vi.fn(),
      getCurrentUser: vi.fn(),
    }
  }
}));

describe('Base44AuthAdapter', () => {
  it('should sign in user', async () => {
    const adapter = new Base44AuthAdapter();
    const result = await adapter.signIn('test@example.com', 'password');
    
    expect(result.user).toBeDefined();
    expect(result.accessToken).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// src/services/__tests__/integration/auth.test.ts
import { describe, it, expect } from 'vitest';
import { authService } from '@/services/factory';

describe('Auth Service Integration', () => {
  it('should complete sign-in flow', async () => {
    const result = await authService.signIn(
      'test@example.com',
      'testpassword'
    );
    
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('test@example.com');
    expect(result.accessToken).toBeDefined();
  });
});
```

---

## Monitoring & Observability

### Metrics to Track

1. **Service Usage**
   - Requests to Base44 vs. new service
   - Track by service type (auth, database, etc.)

2. **Performance**
   - Response times for each adapter
   - Error rates by adapter

3. **Cost**
   - Base44 API calls
   - Supabase usage
   - Total cost comparison

### Implementation

```typescript
// src/services/monitoring.ts

export class ServiceMonitoring {
  static trackServiceCall(
    service: string,
    adapter: string,
    duration: number,
    success: boolean
  ) {
    // Send to analytics
    console.log('[Service Monitor]', {
      service,
      adapter,
      duration,
      success,
      timestamp: new Date()
    });
    
    // TODO: Send to monitoring service (Datadog, New Relic, etc.)
  }
}

// Usage in adapter
async signIn(email: string, password: string): Promise<AuthResult> {
  const startTime = Date.now();
  
  try {
    const result = await base44.auth.signIn({ email, password });
    
    ServiceMonitoring.trackServiceCall(
      'auth',
      'base44',
      Date.now() - startTime,
      true
    );
    
    return this.mapResult(result);
  } catch (error) {
    ServiceMonitoring.trackServiceCall(
      'auth',
      'base44',
      Date.now() - startTime,
      false
    );
    throw error;
  }
}
```

---

## Related Documents

- [MIGRATION_STRATEGY.md](./MIGRATION_STRATEGY.md) - Overall migration strategy
- [ADR-001: Use Base44 Backend](./ADR/001-use-base44-backend.md) - Original decision
- [TypeScript Migration Guide](./TYPESCRIPT_MIGRATION.md) - TypeScript conversion

---

**Document Owner:** Platform Architecture Team  
**Last Updated:** February 9, 2026  
**Next Review:** March 2026 (after Phase 1 complete)
