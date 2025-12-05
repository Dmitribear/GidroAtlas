import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Background3D } from './components/Background3D';
import { Contacts } from './components/Contacts';
import { About } from './components/About';
import { LoginModal } from './components/LoginModal';
import { AmbientRays } from './components/AmbientRays';

const App: React.FC = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="relative w-full min-h-screen bg-warm-50 text-gray-900 selection:bg-warm-400 selection:text-gray-900 overflow-x-hidden font-sans">
      {/* 3D Background Layer */}
      <div className="fixed inset-0 z-0">
        <Background3D />
      </div>
      {/* Subtle gradient bloom anchored to screen edges */}
      <div className="pointer-events-none fixed inset-0 z-[1]">
        <div className="absolute -left-1/3 top-[-50%] h-2/3 w-2/3 bg-[radial-gradient(circle_at_25%_20%,rgba(251,191,36,0.35),transparent_55%)] blur-3xl" />
        <div className="absolute right-[-25%] bottom-[-10%] h-3/4 w-1/2 bg-[radial-gradient(circle_at_70%_70%,rgba(245,158,11,0.25),transparent_100%)] blur-3xl" />
      </div>
      <AmbientRays />

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onLoginClick={() => setIsLoginOpen(true)} />
        <main className="flex-grow flex flex-col">
          <Hero />
          <About />
          <Contacts />
        </main>
      </div>

      {/* Modals */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default App;
