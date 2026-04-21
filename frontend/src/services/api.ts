import axios, { AxiosInstance } from 'axios';
import { ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');

class ApiClient {
  private client: AxiosInstance;
  private tenantId: string | null = null;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Inject JWT and tenant ID on every request
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers['Authorization'] = `Bearer ${this.token}`;
      }
      if (this.tenantId) {
        config.headers['X-Tenant-ID'] = this.tenantId;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Unauthorized - trigger logout
          window.dispatchEvent(new CustomEvent('unauthorized'));
        }
        return Promise.reject(error);
      }
    );
  }

  setTenantId(tenantId: string) {
    this.tenantId = tenantId;
  }

  setToken(token: string) {
    this.token = token;
  }

  clearAuth() {
    this.token = null;
    this.tenantId = null;
  }

  // Keep for backward compat
  getTenantId() { return this.tenantId; }
  clearTenantId() { this.tenantId = null; }

  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      return {
        error: error.response?.data?.error || error.message,
        stack: error.response?.data?.stack,
      };
    }
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }

  // Auth endpoints
  async login(email: string, password: string) {
    try {
      const response = await this.client.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin endpoints
  async getTrialAccounts() {
    try {
      const response = await this.client.get('/admin/trials');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createTrialAccount(data: { name: string; email: string; password: string; days?: number; max_calls?: number }) {
    try {
      const response = await this.client.post('/admin/trials', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateTrialAccount(id: string, data: { days?: number; is_active?: boolean; max_calls?: number }) {
    try {
      const response = await this.client.patch(`/admin/trials/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteTrialAccount(id: string) {
    try {
      const response = await this.client.delete(`/admin/trials/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      const response = await this.client.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyAuth() {
    try {
      const response = await this.client.get('/auth/verify');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Calls endpoints
  async initiateCall(operatorId: string, toNumber: string) {
    try {
      const response = await this.client.post('/calls/initiate', {
        operatorId,
        toNumber,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCallLogs(filters?: {
    operatorId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const response = await this.client.get('/calls/logs', { params: filters });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCallById(callId: string) {
    try {
      const response = await this.client.get(`/calls/${callId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Operators endpoints
  async getOperators() {
    try {
      const response = await this.client.get('/operators');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createOperator(data: any) {
    try {
      const response = await this.client.post('/operators', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOperator(operatorId: string) {
    try {
      const response = await this.client.get(`/operators/${operatorId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateOperator(operatorId: string, data: any) {
    try {
      const response = await this.client.put(`/operators/${operatorId}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteOperator(operatorId: string) {
    try {
      const response = await this.client.delete(`/operators/${operatorId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Scripts endpoints
  async getScripts() {
    try {
      const response = await this.client.get('/scripts');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createScript(data: any) {
    try {
      const response = await this.client.post('/scripts', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getScript(scriptId: string) {
    try {
      const response = await this.client.get(`/scripts/${scriptId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateScript(scriptId: string, data: any) {
    try {
      const response = await this.client.put(`/scripts/${scriptId}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteScript(scriptId: string) {
    try {
      const response = await this.client.delete(`/scripts/${scriptId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Analytics endpoints
  async getAnalyticsSummary(params?: { startDate?: string; endDate?: string }) {
    try {
      const response = await this.client.get('/analytics/summary', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAnalyticsOperators(params?: { startDate?: string; endDate?: string }) {
    try {
      const response = await this.client.get('/analytics/operator-stats', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAnalyticsDailyStats(params?: { startDate?: string; endDate?: string }) {
    try {
      const response = await this.client.get('/analytics/daily', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export const apiClient = new ApiClient();
