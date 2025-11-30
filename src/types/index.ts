export interface NavLink {
  id: string;
  name: string;
  port: string;
  // Optional: Icon name or custom path if needed later
}

export interface AppConfig {
  baseUrl: string; // IP or Domain
  links: NavLink[];
}
