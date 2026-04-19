// Auth types
export interface AuthResponse {
  success: boolean;
  tenant: {
    id: string;
    name: string;
  };
}

export interface AuthVerifyResponse {
  authenticated: boolean;
  tenantId?: string;
}

// Tenant types
export interface Tenant {
  id: string;
  name: string;
  monthly_budget?: number;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

// Operator types
export interface Operator {
  id: string;
  tenant_id: string;
  name: string;
  twilio_number: string;
  sip_uri: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOperatorRequest {
  name: string;
  twilioNumber: string;
  sipUri: string;
}

export interface UpdateOperatorRequest {
  name?: string;
  twilioNumber?: string;
  sipUri?: string;
}

// Sales Script types
export interface SalesScript {
  id: string;
  tenant_id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScriptRequest {
  title: string;
  content: string;
}

export interface UpdateScriptRequest {
  title?: string;
  content?: string;
}

// Call types
export interface CallRecord {
  id: string;
  tenant_id: string;
  operator_id: string;
  twilio_call_sid: string;
  from_number: string;
  to_number: string;
  duration_seconds: number;
  price_per_minute?: number;
  total_cost: number;
  status: 'initiated' | 'ringing' | 'answered' | 'completed' | 'failed';
  recording_url?: string;
  started_at?: string;
  ended_at?: string;
  createdAt: string;
  updatedAt: string;
  Operator?: Operator;
}

export interface InitiateCallRequest {
  operatorId: string;
  toNumber: string;
}

export interface InitiateCallResponse {
  callSid: string;
  from: string;
  to: string;
  status: string;
}

export interface CallLogsResponse {
  calls: CallRecord[];
  total: number;
}

// Analytics types
export interface AnalyticsSummary {
  today: {
    calls: number;
    minutes: number;
    cost: number;
  };
  monthToDate: {
    cost: number;
    budget?: number;
  };
}

export interface OperatorAnalytics {
  operator_id: string;
  callsCount: string;
  totalDurationSeconds: string;
  totalCost: string;
  Operator: {
    name: string;
  };
}

export interface CostBreakdown {
  date: string;
  callsCount: string;
  totalCost: string;
}

export interface BudgetAlert {
  alert: boolean;
  monthCost: number;
  budget?: number;
  percentage: number;
}

// API Error types
export interface ApiError {
  error: string;
  stack?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
