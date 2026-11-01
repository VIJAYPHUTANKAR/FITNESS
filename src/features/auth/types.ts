/**
 * Authentication feature domain types.
 */

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthState {
  loading: boolean;
  error: string | null;
  success: boolean;
}
