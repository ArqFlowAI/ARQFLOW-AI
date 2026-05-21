export type AuthActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export const initialAuthState: AuthActionState = {};
