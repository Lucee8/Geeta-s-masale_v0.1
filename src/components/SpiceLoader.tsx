/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';

interface SpiceLoaderProps {
  onComplete: () => void;
}

const particles = [
  { id: 1, char: '🌶️', x: -180, y: -140, delay: 0.05 },
  { id: 2, char: '🌟', x: 170, y: -130, delay: 0.12 },
  { id: 3, char: '🌾', x: -130, y: 160, delay: 0.18 },
  { id: 4, char: '🍂', x: 150, y: 150, delay: 0.08 },
  { id: 5, char: '✨', x: -210, y: 30, delay: 0.22 },
  { id: 6, char: '🔴', x: 210, y: -50, delay: 0.15 },
  { id: 7, char: '🔸', x: -70, y: -210, delay: 0.28 },
  { id: 8, char: '🌱', x: 80, y: -190, delay: 0.1 },
  { id: 9, char: '🌶️', x: 60, y: 200, delay: 0.32 },
  { id: 10, char: '✨', x: -190, y: -60, delay: 0.2 },
];

export default function SpiceLoader({ onComplete }: SpiceLoaderProps) {
  const [phase, setPhase] = useState<'burst' | 'reveal' | 'shine' | 'exit'>('burst');
  const [showText, setShowText] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const ringControls = useAnimation();

  useEffect(() => {
    // Phase 1: particles burst in (0ms)
    // Phase 2: logo reveals (600ms)
    const revealTimer = setTimeout(() => setPhase('reveal'), 600);

    // Phase 3: text slides in (1000ms)
    const textTimer = setTimeout(() => setShowText(true), 1000);

    // Phase 4: tagline fades (1400ms)
    const taglineTimer = setTimeout(() => setShowTagline(true), 1400);

    // Phase 5: ring pulse + footer (1600ms)
    const footerTimer = setTimeout(() => {
      setShowFooter(true);
      setPhase('shine');
      ringControls.start({
        scale: [1, 1.6, 1],
        opacity: [0.6, 0, 0.6],
        transition: { duration: 1.2, ease: 'easeOut' },
      });
    }, 1600);

    // Phase 6: complete (3000ms)
    const completeTimer = setTimeout(() => onComplete(), 3200);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(textTimer);
      clearTimeout(taglineTimer);
      clearTimeout(footerTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, ringControls]);

  return (
    <motion.div
      id="spice-loader-bg"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#A61B1B] text-white overflow-hidden"
      exit={{ opacity: 0, scale: 1.08, filter: 'blur(12px)' }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
    >

      {/* === LAYERED BACKGROUND === */}
      {/* Deep vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_40%,rgba(0,0,0,0.35)_100%)] pointer-events-none" />
      {/* Warm center glow */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_400px_at_50%_45%,rgba(255,200,100,0.12)_0%,transparent_70%)] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      />
      {/* Subtle noise grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* === MAIN CONTENT === */}
      <div className="relative flex flex-col items-center">

        {/* === LOGO ZONE === */}
        <div className="relative flex items-center justify-center mb-8">

          {/* Outer pulse ring — fires on shine phase */}
          <motion.div
            animate={ringControls}
            className="absolute w-48 h-48 rounded-full border border-white/20 pointer-events-none"
            initial={{ scale: 1, opacity: 0 }}
          />

          {/* Soft halo behind logo */}
          <motion.div
            className="absolute w-40 h-40 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255,220,150,0.18) 0%, transparent 70%)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.7, ease: 'easeOut' }}
          />

          {/* Particles burst inward */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute text-2xl select-none pointer-events-none"
              initial={{ x: p.x, y: p.y, opacity: 0, scale: 0.4, rotate: -20 }}
              animate={{
                x: [p.x, p.x * 0.3, 0],
                y: [p.y, p.y * 0.3, 0],
                opacity: [0, 1, 0],
                scale: [0.4, 1.1, 0],
                rotate: [-20, 10, 0],
              }}
              transition={{
                duration: 1.4,
                ease: [0.22, 1, 0.36, 1],
                delay: p.delay,
                times: [0, 0.5, 1],
              }}
            >
              {p.char}
            </motion.div>
          ))}

          {/* Logo — cinematic scale-in with overshoot */}
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -15 }}
            animate={
              phase === 'burst'
                ? { scale: 0, opacity: 0, rotate: -15 }
                : {
                    scale: [0, 1.15, 0.97, 1.04, 1],
                    opacity: [0, 1, 1, 1, 1],
                    rotate: [-15, 3, -2, 1, 0],
                  }
            }
            transition={{
              duration: 1.0,
              ease: [0.22, 1, 0.36, 1],
              times: [0, 0.5, 0.7, 0.85, 1],
            }}
          >
            <img
              src="assets/images/logo.png"
              alt="Geeta's Masale Logo"
              className="w-52 object-contain"
              style={{
                filter: 'drop-shadow(0 0 24px rgba(255,200,100,0.4)) drop-shadow(0 4px 20px rgba(0,0,0,0.4))',
              }}
            />
          </motion.div>
        </div>

        {/* === BRAND NAME === */}
        <div className="text-center flex flex-col items-center min-h-20">
          <AnimatePresence>
            {showText && (
              <motion.div className="flex flex-col items-center">

                {/* Thin line reveal before title */}
                <motion.div
                  className="h-px bg-gradient-to-r from-transparent via-rose-200/60 to-transparent mb-4"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '180px', opacity: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />

                {/* Title — letter stagger */}
                <motion.h1
                  id="loader-brand-title"
                  className="font-sans text-4xl md:text-5xl font-black uppercase"
                  style={{
                    letterSpacing: '0.18em',
                    background: 'linear-gradient(135deg, #ffffff 0%, #ffe4e4 40%, #ffffff 70%, #ffd6d6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: 'none',
                    filter: 'drop-shadow(0 2px 12px rgba(255,255,255,0.25))',
                  }}
                  initial={{ y: 30, opacity: 0, letterSpacing: '0.4em' }}
                  animate={{ y: 0, opacity: 1, letterSpacing: '0.18em' }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                  Geeta's Masale
                </motion.h1>

                {/* Tagline */}
                <AnimatePresence>
                  {showTagline && (
                    <motion.p
                      id="loader-brand-subtitle"
                      className="font-mono text-xs md:text-sm text-rose-200/80 mt-3 uppercase font-medium"
                      initial={{ opacity: 0, y: 8, letterSpacing: '0.3em' }}
                      animate={{ opacity: 1, y: 0, letterSpacing: '0.22em' }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                      Authentic Malvani Taste
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Bottom line mirror */}
                <motion.div
                  className="h-px bg-gradient-to-r from-transparent via-rose-200/40 to-transparent mt-4"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '120px', opacity: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* === FOOTER === */}
      <AnimatePresence>
        {showFooter && (
          <motion.div
            className="absolute bottom-8 font-mono text-[10px] tracking-[0.25em] text-rose-200/40 uppercase"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            Established with Heritage • Kasal, Malvan
          </motion.div>
        )}
      </AnimatePresence>

      {/* === PROGRESS BAR === */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-rose-300/0 via-white/60 to-rose-300/0"
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 3.0, ease: 'linear' }}
      />
    </motion.div>
  );
}