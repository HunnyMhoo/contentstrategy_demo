// Rules API service layer
import type { Rule } from '../lib/mockData';
import type { 
  AudienceCondition, 
  ContentConfiguration, 
  FallbackConfiguration 
} from '../features/rules/types';

const API_BASE_URL = 'http://localhost:3001/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RulesListResponse {
  rules: Rule[];
  meta: {
    lastId: number;
    version: string;
    updatedAt: string;
  };
}

export interface CreateRuleRequest {
  name?: string;
  priority?: number;
  status?: 'Draft' | 'Active' | 'Inactive';
  audienceSummary?: string;
  contentSources?: string[];
  startDate?: string;
  endDate?: string;
  audience?: AudienceCondition | null;
  content?: ContentConfiguration | null;
  fallback?: FallbackConfiguration | null;
}

export interface UpdateRuleRequest extends CreateRuleRequest {
  id?: string; // Will be ignored by API, but useful for type safety
}

class RulesApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      // If the response has a 'data' field, it's a single resource response
      if ('data' in data) {
        return data;
      }
      // If it has a 'rules' field, it's a list response
      if ('rules' in data) {
        return {
          success: true,
          data: {
            rules: data.rules,
            meta: data.meta
          }
        };
      }
      // Otherwise just return the response as is
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Get all rules
  async getAllRules(): Promise<ApiResponse<RulesListResponse>> {
    return this.request<RulesListResponse>('/rules');
  }

  // Get a specific rule by ID
  async getRule(id: string): Promise<ApiResponse<Rule>> {
    return this.request<Rule>(`/rules/${id}`);
  }

  // Create a new rule
  async createRule(ruleData: CreateRuleRequest): Promise<ApiResponse<Rule>> {
    return this.request<Rule>('/rules', {
      method: 'POST',
      body: JSON.stringify(ruleData),
    });
  }

  // Update an existing rule
  async updateRule(id: string, ruleData: UpdateRuleRequest): Promise<ApiResponse<Rule>> {
    return this.request<Rule>(`/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ruleData),
    });
  }

  // Delete a rule
  async deleteRule(id: string): Promise<ApiResponse<Rule>> {
    return this.request<Rule>(`/rules/${id}`, {
      method: 'DELETE',
    });
  }

  // Duplicate a rule
  async duplicateRule(id: string): Promise<ApiResponse<Rule>> {
    return this.request<Rule>(`/rules/${id}/duplicate`, {
      method: 'POST',
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ message: string; timestamp: string }>> {
    return this.request<{ message: string; timestamp: string }>('/health');
  }
}

// Export singleton instance
export const rulesApi = new RulesApiService();

// Export individual methods for easier importing
export const {
  getAllRules,
  getRule,
  createRule,
  updateRule,
  deleteRule,
  duplicateRule,
  healthCheck,
} = rulesApi;
