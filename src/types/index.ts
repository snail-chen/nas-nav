export interface NavLink {
  id: string;
  name: string;
  port: string;
  iconUrl?: string;
}

export type UserRole = 'admin' | 'user';

export interface User {
  username: string;
  password: string; // In a real app, this should be hashed. Here just plain text for demo/localStorage
  role: UserRole;
  createdAt: number;
}

export interface AppConfig {
  siteTitle: string;
  baseUrl: string; // IP or Domain
  links: NavLink[];
}
