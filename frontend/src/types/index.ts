// Auth types
export interface TrialInfo {
  expiresAt: string;
  maxCalls: number;
  callsUsed: number;
  callsRemaining: number;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'master' | 'trial';
  tenantId: string;
  trialInfo: TrialInfo | null;
}

export interface AuthResponse {
  success: boolean;
  user: AppUser;
}

export interface AuthVerifyResponse {
  authenticated: boolean;
  tenantId?: string;
  user?: AppUser | null;
}

export interface TrialAccount {
  id: string;
  name: string;
  email: string;
  role: 'trial';
  trial_expires_at: string;
  max_calls: number;
  calls_used: number;
  is_active: boolean;
  createdAt: string;
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

// Analytics types — shapes match backend /api/analytics/* responses
export interface AnalyticsSummary {
  totalCalls: number;
  totalCost: number | string;
  totalDuration: number | string; // seconds
  statusBreakdown: Array<{ status: string; count: number | string }>;
}

// Sequelize raw:true flattens the Operator join → "Operator.name" key
export interface OperatorStats {
  operator_id: string;
  callCount: string;
  totalDuration: string; // seconds
  totalCost: string;
  'Operator.id'?: string;
  'Operator.name'?: string;
}

export interface DailyStat {
  date: string;
  callCount: string;
  totalCost: string;
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
