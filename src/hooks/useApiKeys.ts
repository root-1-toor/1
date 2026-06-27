'use client';

import { useState, useEffect } from 'react';
import { ApiKeys } from '@/types';

const STORAGE_KEY = 'winamp_api_keys';

const DEFAULT: ApiKeys = {
  youtubeApiKey: '',
  appleMusicDeveloperToken: '',
};

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKeys>(DEFAULT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setKeys({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {}
    setLoaded(true);
  }, []);

  const saveKeys = (next: ApiKeys) => {
    setKeys(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  return { keys, saveKeys, loaded };
}
