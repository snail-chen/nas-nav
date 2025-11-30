export interface NavLink {
  id: string;
  name: string;
  port: string;
  iconUrl?: string;
}

export interface AppConfig {
  baseUrl: string; // IP or Domain
  links: NavLink[];
}
