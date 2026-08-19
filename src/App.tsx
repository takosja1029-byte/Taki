import React, { useState } from 'react';
import { AppDataProvider } from './context/AppDataContext';
import { AuthProvider } from './context/AuthContext';
import { BackgroundEffects } from './components/BackgroundEffects';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { PersonalitySection } from './components/PersonalitySection';
import { GallerySection } from './components/GallerySection';
import { FunFactsSection } from './components/FunFactsSection';
import { QuotesSection } from './components/QuotesSection';
import { AdminModal } from './components/AdminModal';
import { AuthModal } from './components/AuthModal';
import { ScrollReveal } from './components/ScrollReveal';
import { SectionDivider } from './components/SectionDivider';

export default function App() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // If the URL has a section hash (e.g. #personality) on load/refresh, scroll to it
  // instead of always landing on the top of the page.
  React.useEffect(() => {
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        // Slight delay lets layout/images settle first so the scroll position is accurate
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'auto' });
        }, 100);
      }
    }
  }, []);

  return (
    <AuthProvider>
      <AppDataProvider>
        <div className="relative min-h-screen bg-[#120a0a] text-[#f5e6e6] selection:bg-[#d63838] selection:text-white font-sans overflow-x-hidden">
          {/* Dynamic Background Effects (Drifting Petals, Embers, Lanterns, Glows) */}
          <BackgroundEffects />

          {/* Sticky Navigation Bar with Admin & Auth triggers */}
          <Navbar 
            onOpenAdmin={() => setAdminOpen(true)} 
            onOpenAuth={() => setAuthOpen(true)}
          />

          {/* Main Content Sections with Reveal on Scroll */}
          <main className="relative z-10 pb-16 space-y-12 sm:space-y-16">
            <HeroSection />

            <SectionDivider variant="talisman" />

            <ScrollReveal direction="up" distance={45} duration={0.8} margin="-80px">
              <AboutSection />
            </ScrollReveal>

            <SectionDivider variant="butterfly" />

            <ScrollReveal direction="up" distance={45} duration={0.8} margin="-80px">
              <QuotesSection />
            </ScrollReveal>

            <SectionDivider variant="flame" />

            <ScrollReveal direction="up" distance={45} duration={0.8} margin="-80px">
              <PersonalitySection />
            </ScrollReveal>

            <SectionDivider variant="talisman" />

            <ScrollReveal direction="up" distance={45} duration={0.8} margin="-80px">
              <GallerySection />
            </ScrollReveal>

            <SectionDivider variant="lantern" />

            <ScrollReveal direction="up" distance={45} duration={0.8} margin="-80px">
              <FunFactsSection />
            </ScrollReveal>
          </main>

          {/* Admin Login & Content Upload Dashboard Modal */}
          <AdminModal isOpen={adminOpen} onClose={() => setAdminOpen(false)} />

          {/* Firebase Auth Sign In / Sign Up Modal */}
          <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
        </div>
      </AppDataProvider>
    </AuthProvider>
  );
}

