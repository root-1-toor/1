'use client';

import { useState, useRef, useEffect } from 'react';

interface MenuItem {
  label: string;
  shortcut?: string;
  divider?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

interface Menu {
  label: string;
  items: MenuItem[];
}

interface MenuBarProps {
  onOpenPlaylist: () => void;
  onOpenEq: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onAddFiles: () => void;
}

export function MenuBar({ onOpenPlaylist, onOpenEq, onOpenSearch, onOpenSettings, onAddFiles }: MenuBarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const menus: Menu[] = [
    {
      label: 'FILE',
      items: [
        { label: 'Play File...', shortcut: 'L', onClick: onAddFiles },
        { label: 'Add File to Playlist...', onClick: onAddFiles },
        { label: 'Add Directory to Playlist...', onClick: onAddFiles },
        { divider: true, label: '' },
        { label: 'Open URL...', shortcut: 'Ctrl+L', onClick: onOpenSearch },
        { divider: true, label: '' },
        { label: 'Preferences', shortcut: 'Ctrl+P', onClick: onOpenSettings },
      ],
    },
    {
      label: 'PLAY',
      items: [
        { label: 'Play', shortcut: 'X' },
        { label: 'Pause', shortcut: 'C' },
        { label: 'Stop', shortcut: 'V' },
        { divider: true, label: '' },
        { label: 'Previous Track', shortcut: 'Z' },
        { label: 'Next Track', shortcut: 'B' },
        { divider: true, label: '' },
        { label: 'Seek +5 sec', shortcut: '→' },
        { label: 'Seek -5 sec', shortcut: '←' },
      ],
    },
    {
      label: 'OPTIONS',
      items: [
        { label: 'Shuffle', shortcut: 'S' },
        { label: 'Repeat', shortcut: 'R' },
        { divider: true, label: '' },
        { label: 'Equalizer', shortcut: 'Ctrl+G', onClick: onOpenEq },
        { label: 'Playlist Editor', shortcut: 'Ctrl+E', onClick: onOpenPlaylist },
        { divider: true, label: '' },
        { label: 'Preferences...', onClick: onOpenSettings },
      ],
    },
    {
      label: 'VIEW',
      items: [
        { label: 'Main Player', shortcut: 'Alt+W' },
        { label: 'Equalizer', shortcut: 'Alt+G', onClick: onOpenEq },
        { label: 'Playlist', shortcut: 'Alt+E', onClick: onOpenPlaylist },
        { divider: true, label: '' },
        { label: 'Search / YouTube', onClick: onOpenSearch },
        { label: 'Settings', onClick: onOpenSettings },
      ],
    },
  ];

  // Close on outside click
  useEffect(() => {
    if (!openMenu) return;
    const handler = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenu]);

  const toggle = (label: string) => setOpenMenu(prev => prev === label ? null : label);

  return (
    <nav className="wa-menubar" ref={barRef} aria-label="Menu">
      {menus.map(menu => (
        <div key={menu.label} className="wa-menu-root">
          <div
            className={`wa-menuitem ${openMenu === menu.label ? 'active' : ''}`}
            onClick={() => toggle(menu.label)}
          >
            {menu.label}
          </div>

          {openMenu === menu.label && (
            <div className="wa-dropdown" role="menu">
              {menu.items.map((item, i) =>
                item.divider ? (
                  <div key={i} className="wa-dropdown-divider" />
                ) : (
                  <div
                    key={i}
                    className={`wa-dropdown-item ${item.disabled ? 'disabled' : ''}`}
                    role="menuitem"
                    onClick={() => {
                      setOpenMenu(null);
                      item.onClick?.();
                    }}
                  >
                    <span>{item.label}</span>
                    {item.shortcut && <span className="wa-shortcut">{item.shortcut}</span>}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      ))}

      <div className="wa-menuitem wa-menuitem-yt" onClick={onOpenSearch}>▶ SEARCH</div>
      <div className="wa-menuitem" onClick={onOpenSettings} style={{ marginLeft: 'auto', color: '#777' }}>⚙</div>
    </nav>
  );
}
