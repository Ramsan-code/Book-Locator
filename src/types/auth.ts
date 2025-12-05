// User role type - reader model
export type UserRole = 'user' | 'admin';

// User data interface
export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isApproved?: boolean;
  createdAt?: string;
  
  // Location fields
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  
  // Contact info
  phone_no?: string;
  image?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role?: UserRole;
}

export interface RegisterData {
  role: UserRole;
  name: string;
  email: string;
  password: string;
  phone_no?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}