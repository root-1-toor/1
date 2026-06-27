'use client';

import { useState } from 'react';
import { ApiKeys } from '@/types';

interface SettingsProps {
  keys: ApiKeys;
  onSave: (keys: ApiKeys) => void;
  onClose: () => void;
}

export function SettingsWindow({ keys, onSave, onClose }: SettingsProps) {
  const [draft, setDraft] = useState<ApiKeys>({ ...keys });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="wa-window wa-settings-win" role="dialog" aria-label="Settings">
      <div className="wa-titlebar">
        <span className="wa-title-text">WINAMP — PREFERENCES</span>
        <div className="wa-winbtns">
          <button className="wa-winbtn" onClick={onClose} aria-label="Close">×</button>
        </div>
      </div>

      <div className="wa-settings-body">

        {/* YouTube */}
        <div className="wa-settings-section">
          <div className="wa-settings-label">
            <span className="wa-settings-service">▶ YOUTUBE DATA API v3</span>
            <a
              className="wa-settings-link"
              href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              GET KEY ↗
            </a>
          </div>
          <div className="wa-settings-hint">
            console.cloud.google.com → Enable "YouTube Data API v3" → Credentials → Create API key
          </div>
          <input
            className="wa-settings-input"
            type="text"
            placeholder="AIza..."
            value={draft.youtubeApiKey}
            onChange={e => setDraft(d => ({ ...d, youtubeApiKey: e.target.value }))}
            spellCheck={false}
          />
        </div>

        {/* Apple Music */}
        <div className="wa-settings-section">
          <div className="wa-settings-label">
            <span className="wa-settings-service" style={{ color: '#fc3c44' }}>♫ APPLE MUSIC DEVELOPER TOKEN</span>
            <a
              className="wa-settings-link"
              href="https://developer.apple.com/documentation/applemusicapi/generating_developer_tokens"
              target="_blank"
              rel="noopener noreferrer"
            >
              DOCS ↗
            </a>
          </div>
          <div className="wa-settings-hint">
            Requires Apple Developer account ($99/yr). Generate a JWT signed with your MusicKit key.
            Without this, search still works via iTunes API with 30-sec previews.
          </div>
          <input
            className="wa-settings-input"
            type="text"
            placeholder="eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ii4uLiJ9..."
            value={draft.appleMusicDeveloperToken}
            onChange={e => setDraft(d => ({ ...d, appleMusicDeveloperToken: e.target.value }))}
            spellCheck={false}
          />
        </div>

        <div className="wa-settings-footer">
          <div className="wa-settings-hint" style={{ color: '#444' }}>
            Keys are saved in your browser only (localStorage). Never sent anywhere.
          </div>
          <button className="wa-pl-btn wa-settings-save" onClick={handleSave}>
            {saved ? '✓ SAVED' : 'SAVE'}
          </button>
        </div>
      </div>
    </div>
  );
}
