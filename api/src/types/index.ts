import { Request } from 'express';
import { PlanType, UserStatus } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string; planType: PlanType; status: UserStatus };
  apiKey?: { keyId: string; userId: string; planType: PlanType };
  requestId: string;
  startTime: number;
  responseTimeMs?: number;
  cacheHit?: boolean;
}

export interface StandardResponse<T> {
  success: true;
  count?: number;
  data: T;
  meta: {
    requestId: string;
    responseTime: number;
    rateLimit?: { remaining: number; limit: number; reset: number };
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export type ApiErrorCode = 
  | 'INVALID_QUERY'
  | 'INVALID_API_KEY'
  | 'ACCESS_DENIED'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR';

export interface ApiError {
  success: false;
  error: { code: ApiErrorCode; message: string; details?: unknown };
}

export interface AutocompleteResult {
  value: string;
  label: string;
  fullAddress: string;
  hierarchy: {
    village: { id: string; name: string };
    subDistrict: { id: string; name: string };
    district: { id: string; name: string };
    state: { id: string; name: string };
    country: string;
  };
  codes: {
    villageCode: string;
    subDistrictCode: string;
    districtCode: string;
    stateCode: string;
  };
}

export const PLAN_LIMITS: Record<PlanType, { dailyRequests: number; perMinute: number }> = {
  FREE: { dailyRequests: 5000, perMinute: 100 },
  PREMIUM: { dailyRequests: 50000, perMinute: 500 },
  PRO: { dailyRequests: 300000, perMinute: 2000 },
  UNLIMITED: { dailyRequests: 1000000, perMinute: 5000 }
};
