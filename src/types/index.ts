export interface NavLink {
  id: string;
  name: string;
  port: string;
  iconUrl?: string;
  isSystem?: boolean; // 系统应用，不可删除
}

export type UserRole = 'admin' | 'user';

export interface User {
  username: string;
  password?: string; // 可选，出于安全考虑不通过 API 返回
  role: UserRole;
  createdAt: number;
  token?: string; // 会话令牌
  allowConcurrent?: boolean;
  isOnline?: boolean;
}

export interface AppConfig {
  siteTitle: string;
  baseUrl: string; // IP 或域名
  sessionTimeout?: number; // 分钟
  links: NavLink[];
}
