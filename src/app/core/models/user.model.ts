export type UserStatus = 'active' | 'blocked';

export interface User {
  id?: string | number;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  status?: UserStatus;
}

export type SafeUser = Omit<User, 'password'>;