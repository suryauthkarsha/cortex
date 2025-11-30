import React from 'react';

export function JellyPhysicsLoader() {
  return (
    <div className="scene">
      <div className="loader-stage">
        {/* Ball 1 */}
        <div className="ball-wrapper">
          <div className="jelly-ball"></div>
          <div className="reflection"></div>
          <div className="shadow"></div>
        </div>
        {/* Ball 2 */}
        <div className="ball-wrapper">
          <div className="jelly-ball"></div>
          <div className="reflection"></div>
          <div className="shadow"></div>
        </div>
        {/* Ball 3 */}
        <div className="ball-wrapper">
          <div className="jelly-ball"></div>
          <div className="reflection"></div>
          <div className="shadow"></div>
        </div>
      </div>
    </div>
  );
}
