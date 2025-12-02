import { useState, useEffect } from 'react';
import { NavLink } from '../types';

export interface Config {
  siteTitle: string;
  baseUrl: string;
  sessionTimeout?: number;
  links: NavLink[];
}

const DEFAULT_CONFIG: Config = {
  siteTitle: 'Snail NAS',
  baseUrl: '192.168.1.100',
  sessionTimeout: 30,
  links: [
    { id: '1', name: 'Plex', port: '32400', iconUrl: '' },
    { id: '2', name: 'Sonarr', port: '8989', iconUrl: '' },
    { id: '3', name: 'Radarr', port: '7878', iconUrl: '' },
    { id: '4', name: 'Transmission', port: '9091', iconUrl: '' },
    { id: '5', name: 'Home Assistant', port: '8123', iconUrl: '' },
  ]
};

export const useConfig = () => {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  // Load config from API
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load config', err);
        setLoading(false);
      });
  }, []);

  const saveConfig = (newConfig: Config) => {
    setConfig(newConfig);
    fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig)
    }).catch(err => console.error('Failed to save config', err));
  };

  const updateSiteTitle = (title: string) => {
    const newConfig = { ...config, siteTitle: title };
    saveConfig(newConfig);
  };

  const updateBaseUrl = async (url: string) => {
    const newConfig = { ...config, baseUrl: url };
    await saveConfig(newConfig);
  };

  const updateSessionTimeout = async (minutes: number) => {
    const newConfig = { ...config, sessionTimeout: minutes };
    await saveConfig(newConfig);
  };

  const addLink = async (name: string, port: string) => {
    const newLink: NavLink = {
      id: Date.now().toString(),
      name,
      port,
    };
    const newConfig = { ...config, links: [...config.links, newLink] };
    saveConfig(newConfig);
  };

  const removeLink = (id: string) => {
    const newConfig = { ...config, links: config.links.filter(l => l.id !== id) };
    saveConfig(newConfig);
  };

  const updateLink = (id: string, name: string, port: string) => {
    const newConfig = {
      ...config,
      links: config.links.map(l => l.id === id ? { ...l, name, port } : l)
    };
    saveConfig(newConfig);
  };

  const updateLinkIcon = (id: string, iconUrl: string | undefined) => {
    const newConfig = {
        ...config,
        links: config.links.map(l => l.id === id ? { ...l, iconUrl } : l)
    };
    // Don't save to server for every icon load to avoid spam, 
    // but for now we save to persist it.
    saveConfig(newConfig);
  };

  return {
    config,
    loading,
    updateSiteTitle,
    updateBaseUrl,
    updateSessionTimeout,
    addLink,
    removeLink,
    updateLink,
    updateLinkIcon
  };
};
