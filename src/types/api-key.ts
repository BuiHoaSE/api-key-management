export interface ApiKey {
  id: string;
  name: string;
  key: string;
  type: 'dev' | 'prod';
  description?: string;
  user_id: string;
  usage: number;
  rate_limit: number;
  created_at: string;
  updated_at: string;
  expires_at?: string | null;
}

export interface CreateApiKeyDto {
  name: string;
  type: 'dev' | 'prod';
  description?: string;
  expiresIn?: number; // Duration in seconds
  rate_limit?: number; // Optional, will use default if not provided
}

export interface UpdateApiKeyDto {
  name?: string;
  type?: 'dev' | 'prod';
  description?: string;
  rate_limit?: number;
} 