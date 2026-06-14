import React from 'react';
import './HudOverlay.css'; // optional if extra styles are needed

/**
 * HudOverlay renders subtle decorative HUD elements such as orbital lines
 * and abstract sigils. It is positioned absolutely via the .hud-overlay
 * class defined in index.css / theme.css and does not interfere with content.
 */
export const HudOverlay: React.FC = () => {
  // Helper to generate an orbital line with size and position
  const line = (size: number, top: string, left: string, rotation: number) => (
    <div
      className="orbital-line"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        top,
        left,
        transform: `rotate(${rotation}deg)`,
      }}
    />
  );

  return (
    <div className="hud-overlay" aria-hidden="true">
      {/* Example orbital lines – positions and sizes are tuned for a balanced look */}
      {line(200, '10%', '15%', 0)}
      {line(150, '30%', '70%', 45)}
      {line(250, '60%', '20%', 90)}
      {line(180, '80%', '80%', 135)}
      {/* Additional tiny sigils could be added here as needed */}
    </div>
  );
};
