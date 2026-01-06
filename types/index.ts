export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface Conversation {
  id: number;
  user_id: number;
  title: string | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
  message_count?: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata: Record<string, any>;
  // File metadata from database (populated from metadata.files)
  fileMetadata?: Array<{
    name: string;
    type: string;
    size?: number;
  }>;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  auth_mode?: string;
  message?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  role?: string;
}

export interface StreamChunk {
  references?: Array<{
    reference_id: string;
    file_path: string;
  }>;
  inferred_filters?: string[];
  conversation_id?: number;
  response?: string;
  error?: string;
}

export interface QueryRequest {
  query: string;
  mode?: 'local' | 'global' | 'hybrid' | 'naive' | 'mix' | 'bypass';
  stream?: boolean;
  include_references?: boolean;
  local_k?: number;
  global_k?: number;
  conversation_id?: number;
  conversation_history?: Array<{
    role: string;
    content: string;
  }>;
  division_filter?: string[];
  access_filter?: string[];
}
