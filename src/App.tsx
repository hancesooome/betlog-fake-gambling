/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HomePage } from './components/HomePage';
import { BaccaratPage } from './components/BaccaratPage';
import { AudioProvider } from './audio/AudioContext';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'baccarat'>('home');

  return (
    <AudioProvider config={{ voiceVolume: 0.9, sfxVolume: 0.7, ambianceVolume: 0.18 }}>
      <div className="w-full min-h-screen bg-[#07080a] text-white">
        {currentView === 'home' ? (
          <HomePage onOpenBaccarat={() => setCurrentView('baccarat')} />
        ) : (
          <BaccaratPage onBackToHome={() => setCurrentView('home')} />
        )}
      </div>
    </AudioProvider>
  );
}
