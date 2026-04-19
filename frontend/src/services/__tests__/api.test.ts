import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient } from '../api';

describe('ApiClient', () => {
  beforeEach(() => {
    apiClient.clearTenantId();
  });

  it('should set and get tenant ID', () => {
    const tenantId = 'test-tenant-123';
    apiClient.setTenantId(tenantId);
    expect(apiClient.getTenantId()).toBe(tenantId);
  });

  it('should clear tenant ID', () => {
    apiClient.setTenantId('test-tenant-123');
    apiClient.clearTenantId();
    expect(apiClient.getTenantId()).toBeNull();
  });

  it('should handle API errors gracefully', async () => {
    try {
      // This will fail because we're not mocking the API
      await apiClient.login('invalid-key');
    } catch (error: any) {
      expect(error.error).toBeDefined();
    }
  });
});
