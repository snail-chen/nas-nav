import { useState, useEffect } from 'react';
import { AppConfig, NavLink } from '../types';

const STORAGE_KEY = 'nas-nav-config';

const DEFAULT_CONFIG: AppConfig = {
  siteTitle: 'NAS OS',
  baseUrl: '192.168.1.100',
  links: [
    { id: '1', name: 'NAS Dashboard', port: '5000' },
    { id: '2', name: 'Plex', port: '32400' },
    { id: '3', name: 'Portainer', port: '9000' },
  ],
};

export const useConfig = () => {
  const [config, setConfig] = useState<AppConfig>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Merge with default to ensure new fields (like siteTitle) exist for old configs
    const parsed = stored ? JSON.parse(stored) : DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...parsed };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const updateSiteTitle = (title: string) => {
    setConfig(prev => ({ ...prev, siteTitle: title }));
  };

  const updateBaseUrl = (url: string) => {
    setConfig(prev => ({ ...prev, baseUrl: url }));
  };

  const addLink = (name: string, port: string) => {
    const newLink: NavLink = {
      id: crypto.randomUUID(),
      name,
      port,
    };
    setConfig(prev => ({ ...prev, links: [...prev.links, newLink] }));
  };

  const removeLink = (id: string) => {
    setConfig(prev => ({ ...prev, links: prev.links.filter(l => l.id !== id) }));
  };

  const updateLink = (id: string, name: string, port: string) => {
    setConfig(prev => ({
      ...prev,
      links: prev.links.map(l => (l.id === id ? { ...l, name, port } : l)),
    }));
  };

  const updateLinkIcon = (id: string, iconUrl: string | undefined) => {
    setConfig(prev => ({
      ...prev,
      links: prev.links.map(l => (l.id === id ? { ...l, iconUrl } : l)),
    }));
  };

  return { config, updateSiteTitle, updateBaseUrl, addLink, removeLink, updateLink, updateLinkIcon };
};
