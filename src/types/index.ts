export interface NavLink {
  id: string;
  name: string;
  port: string;
  iconUrl?: string;
}

export type UserRole = 'admin' | 'user';

export interface User {
  username: string;
  password?: string; // Optional, not returned by API for security
  role: UserRole;
  createdAt: number;
  token?: string; // Session token
  allowConcurrent?: boolean;
  isOnline?: boolean;
}

export interface AppConfig {
  siteTitle: string;
  baseUrl: string; // IP or Domain
  sessionTimeout?: number; // Minutes
  links: NavLink[];
}
