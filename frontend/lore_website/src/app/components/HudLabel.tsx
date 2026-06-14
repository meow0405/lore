import React from 'react';

/**
 * Small decorative label used throughout the landing page.
 * It applies the .hud-label utility defined in index.css.
 */
export const HudLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <span className="hud-label">
      {children}
    </span>
  );
};
