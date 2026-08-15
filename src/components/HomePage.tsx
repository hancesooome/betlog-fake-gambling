/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Bell,
  Gift,
  ArrowRight,
  Plus,
  Crown,
  Home,
  Gamepad2,
  Tv,
  Dices,
  User,
} from 'lucide-react';

interface HomePageProps {
  onOpenBaccarat: () => void;
  onOpenParlays: () => void;
}

const ASSETS = {
  logoIcon: 'https://zdveyurydayysazasvdq.supabase.co/storage/v1/object/public/assets/icon.png',
  baccarat: 'https://zdveyurydayysazasvdq.supabase.co/storage/v1/object/public/assets/baccarat.png',
  parlay: 'https://zdveyurydayysazasvdq.supabase.co/storage/v1/object/public/assets/parlay.png',
  scatter: 'https://zdveyurydayysazasvdq.supabase.co/storage/v1/object/public/assets/scatter.png',
  crash: 'https://zdveyurydayysazasvdq.supabase.co/storage/v1/object/public/assets/crash.png',
  mines: 'https://zdveyurydayysazasvdq.supabase.co/storage/v1/object/public/assets/mines.png',
  roulette: 'https://zdveyurydayysazasvdq.supabase.co/storage/v1/object/public/assets/roulette.png',
  dice: 'https://zdveyurydayysazasvdq.supabase.co/storage/v1/object/public/assets/dice.png',
  avatar1: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  avatar2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  avatar3: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  avatar4: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  avatar5: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
};

export const HomePage: React.FC<HomePageProps> = ({ onOpenBaccarat, onOpenParlays }) => {
  return (
    <div className="min-h-screen bg-black text-white antialiased flex flex-col font-sans select-none pb-20 md:pb-8">
      {/* Top Navigation Bar */}
      <header className="w-full bg-black px-4 md:px-8 py-4 flex items-center justify-between border-b border-zinc-900 sticky top-0 z-40">
        {/* Left: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-10">
          {/* Brand Logo */}
          <div className="flex items-center cursor-pointer select-none">
            <img
              src={ASSETS.logoIcon}
              alt="BETLOG"
              referrerPolicy="no-referrer"
              className="h-7 md:h-8 object-contain"
            />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-[15px] font-medium text-zinc-400">
            <a href="#games" className="hover:text-white transition-colors">Games</a>
            <button
              onClick={onOpenBaccarat}
              className="hover:text-white transition-colors text-left cursor-pointer"
            >
              Live Casino
            </button>
            <button
              onClick={onOpenParlays}
              className="hover:text-white transition-colors text-left cursor-pointer"
            >
              Sports
            </button>
            <a href="#bonanza" className="hover:text-white transition-colors">Bonanza</a>
            <a href="#promos" className="hover:text-white transition-colors">Promos</a>
            <a href="#vip" className="text-amber-400 flex items-center gap-1 font-semibold hover:text-amber-300 transition-colors">
              <Crown className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>VIP</span>
            </a>
          </nav>
        </div>

        {/* Right: Balance, Notifications, Profile */}
        <div className="flex items-center gap-4">
          {/* Balance Pill */}
          <div className="bg-[#0f0e0a]/80 border border-amber-500/20 rounded-lg pl-3 pr-1 py-1 flex items-center gap-3">
            <span className="text-amber-400 font-extrabold text-sm tracking-wide">
              ₱1,250 CR
            </span>
            <button className="bg-amber-400 hover:bg-amber-500 text-black w-6 h-6 rounded flex items-center justify-center font-bold transition-all cursor-pointer">
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Bell Icon with orange dot */}
          <button className="text-zinc-400 hover:text-white transition-colors p-1 relative cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#ef4444] rounded-full" />
          </button>

          {/* Gift Icon with Badge (Desktop only) */}
          <button className="hidden md:block text-zinc-400 hover:text-white transition-colors p-1 relative cursor-pointer">
            <Gift className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#ef4444] rounded-full" />
          </button>

          {/* User Profile Avatar */}
          <div className="relative cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="User Profile"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500 ring-offset-2 ring-offset-black"
            />
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-8 pt-6 flex flex-col gap-6">
        {/* Hero Section Banner */}
        <section className="w-full bg-zinc-950/40 border border-zinc-900 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative shadow-2xl">
          {/* Hero Left Content & Live Dealer Display */}
          <div className="lg:col-span-9 relative flex flex-col justify-between p-6 md:p-10 min-h-[260px] md:min-h-[320px] overflow-hidden">
            {/* Background Dealer Image with Vignette Gradient */}
            <div className="absolute inset-0 z-0 flex items-center justify-end">
              <img
                src={ASSETS.baccarat}
                alt="Live Baccarat Dealer"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-right"
              />
              {/* Dark Gradient Overlay on left to keep text crisp */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent w-[75%] sm:w-[60%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
            </div>

            {/* Top Badge & Titles */}
            <div className="relative z-10">
              <div className="inline-block bg-[#ef4444] text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded uppercase mb-4 tracking-wider">
                LIVE
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">
                <span className="text-white">LIVE </span>
                <span className="text-amber-400">BACCARAT</span>
              </h1>

              <p className="text-zinc-400 text-sm font-normal mt-4">
                Real games. Fake money. Real lessons.
              </p>
            </div>

            {/* Play Now CTA Button */}
            <div className="relative z-10 mt-6">
              <button
                onClick={onOpenBaccarat}
                className="bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs md:text-sm px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-all shadow-lg tracking-wider uppercase cursor-pointer"
              >
                <span>PLAY NOW</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Hero Right Metrics (Desktop Only) - Glassmorphism style */}
          <div className="hidden lg:flex lg:col-span-3 bg-zinc-950/60 backdrop-blur-md border-l border-zinc-900/60 p-8 flex-col justify-between z-10">
            <div>
              <div className="mb-8">
                <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
                  Players Online
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-3xl font-black text-white tracking-tight">
                    1,248
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_#10b981]" />
                </div>
              </div>

              <div>
                <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
                  Biggest Win Today
                </span>
                <div className="text-2xl font-black text-amber-400 tracking-tight mt-1">
                  ₱24,560 CR
                </div>
              </div>
            </div>

            <div className="flex items-center mt-6 pt-2">
              <div className="flex items-center -space-x-2">
                <img
                  src={ASSETS.avatar2}
                  alt="Player"
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border-2 border-black"
                />
                <img
                  src={ASSETS.avatar1}
                  alt="Player"
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border-2 border-black"
                />
                <img
                  src={ASSETS.avatar3}
                  alt="Player"
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border-2 border-black"
                />
                <img
                  src={ASSETS.avatar4}
                  alt="Player"
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border-2 border-black"
                />
              </div>
              <span className="text-[11px] text-zinc-500 font-bold ml-2.5">
                +1245
              </span>
            </div>
          </div>
        </section>

        {/* Middle Section: Continue Playing & Popular Games */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Continue Playing */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-bold text-base md:text-[17px] tracking-wide">
                Continue Playing
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-3.5 flex-1">
              {/* Card 1: BACCARAT */}
              <div
                onClick={onOpenBaccarat}
                className="group relative h-40 sm:h-48 rounded-2xl overflow-hidden flex flex-col justify-between p-4 cursor-pointer border border-zinc-800/80 bg-zinc-950/40 hover:border-amber-400/40 transition-all duration-300 shadow-xl"
              >
                <div className="absolute inset-0 z-0">
                  <img
                    src={ASSETS.baccarat}
                    alt="Baccarat"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>

                <div className="relative z-10">
                  <span className="bg-[#ef4444] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase inline-block">
                    LIVE
                  </span>
                </div>

                <div className="relative z-10 mt-auto">
                  <div className="text-amber-400 font-black text-sm uppercase tracking-wider">
                    BACCARAT
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    Last played 2m ago
                  </div>
                </div>
              </div>

              {/* Card 2: BETLOG BONANZA */}
              <div className="group relative h-40 sm:h-48 rounded-2xl overflow-hidden flex flex-col justify-end p-4 cursor-pointer border border-zinc-800/80 bg-zinc-950/40 hover:border-purple-500/40 transition-all duration-300 shadow-xl">
                <div className="absolute inset-0 z-0">
                  <img
                    src={ASSETS.scatter}
                    alt="Bonanza"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>

                <div className="relative z-10">
                  <div className="text-white font-black text-[11px] tracking-wider uppercase leading-none opacity-80">
                    BETLOG
                  </div>
                  <div className="text-amber-400 font-black text-sm uppercase tracking-wider leading-none mt-0.5">
                    BONANZA
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    Last played 1h ago
                  </div>
                </div>
              </div>

              {/* Card 3: SPORTS PARLAYS */}
              <div
                onClick={onOpenParlays}
                className="group relative h-40 sm:h-48 rounded-2xl overflow-hidden flex flex-col justify-end p-4 cursor-pointer border border-zinc-800/80 bg-zinc-950/40 hover:border-emerald-500/40 transition-all duration-300 shadow-xl"
              >
                <div className="absolute inset-0 z-0">
                  <img
                    src={ASSETS.parlay}
                    alt="Sports Parlays"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>

                <div className="relative z-10">
                  <div className="text-white font-black text-[11px] tracking-wider uppercase leading-none opacity-80">
                    SPORTS
                  </div>
                  <div className="text-amber-400 font-black text-sm uppercase tracking-wider leading-none mt-0.5">
                    PARLAYS
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    Last played 3h ago
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Games */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-bold text-base md:text-[17px] tracking-wide">
                Popular Games
              </h2>
              <a
                href="#all-games"
                className="text-amber-400 font-semibold text-xs hover:underline cursor-pointer transition-colors"
              >
                See All
              </a>
            </div>

            <div className="grid grid-cols-4 gap-3.5 flex-1">
              {/* Game 1: MINES */}
              <div className="bg-[#0b0e14]/40 border border-zinc-900 rounded-2xl p-4 h-40 sm:h-48 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-blue-500/30 transition-all duration-300 shadow-xl relative backdrop-blur-sm">
                <div className="w-14 h-14 flex items-center justify-center">
                  <img
                    src={ASSETS.mines}
                    alt="Mines"
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  />
                </div>
                <span className="text-zinc-400 group-hover:text-white font-bold text-xs uppercase tracking-wider text-center transition-colors">
                  MINES
                </span>
              </div>

              {/* Game 2: CRASH */}
              <div className="bg-[#0b0e14]/40 border border-zinc-900 rounded-2xl p-4 h-40 sm:h-48 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-amber-500/30 transition-all duration-300 shadow-xl relative backdrop-blur-sm">
                <div className="w-14 h-14 flex items-center justify-center">
                  <img
                    src={ASSETS.crash}
                    alt="Crash"
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                  />
                </div>
                <span className="text-zinc-400 group-hover:text-white font-bold text-xs uppercase tracking-wider text-center transition-colors">
                  CRASH
                </span>
              </div>

              {/* Game 3: DICE */}
              <div className="bg-[#0b0e14]/40 border border-zinc-900 rounded-2xl p-4 h-40 sm:h-48 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-purple-500/30 transition-all duration-300 shadow-xl relative backdrop-blur-sm">
                <div className="w-14 h-14 flex items-center justify-center">
                  <img
                    src={ASSETS.dice}
                    alt="Dice"
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                  />
                </div>
                <span className="text-zinc-400 group-hover:text-white font-bold text-xs uppercase tracking-wider text-center transition-colors">
                  DICE
                </span>
              </div>

              {/* Game 4: ROULETTE */}
              <div className="bg-[#0b0e14]/40 border border-zinc-900 rounded-2xl p-4 h-40 sm:h-48 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-emerald-500/30 transition-all duration-300 shadow-xl relative backdrop-blur-sm">
                <div className="w-14 h-14 flex items-center justify-center">
                  <img
                    src={ASSETS.roulette}
                    alt="Roulette"
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  />
                </div>
                <span className="text-zinc-400 group-hover:text-white font-bold text-xs uppercase tracking-wider text-center transition-colors">
                  ROULETTE
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Section: Live Activity */}
        <section className="w-full bg-[#0b0e14]/30 border border-zinc-900 rounded-2xl p-5 shadow-2xl backdrop-blur-sm">
          <h2 className="text-amber-400 font-bold text-sm md:text-base mb-4 tracking-wide uppercase">
            Live Activity
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {/* Feed Item 1 */}
            <div className="flex items-center gap-3">
              <img
                src={ASSETS.avatar2}
                alt="KuyaT0l"
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500 ring-offset-2 ring-offset-black"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-white font-semibold text-[13px] truncate leading-tight">
                  KuyaT0l
                </span>
                <span className="text-[11px] leading-tight mt-0.5">
                  <span className="text-zinc-400">Won </span>
                  <span className="text-emerald-500 font-bold">₱2,450 CR</span>
                </span>
                <span className="text-[10px] text-zinc-500 leading-tight">
                  Baccarat
                </span>
              </div>
            </div>

            {/* Feed Item 2 */}
            <div className="flex items-center gap-3">
              <img
                src={ASSETS.avatar4}
                alt="sugal_lang"
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500 ring-offset-2 ring-offset-black"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-white font-semibold text-[13px] truncate leading-tight">
                  sugal_lang
                </span>
                <span className="text-[11px] leading-tight mt-0.5">
                  <span className="text-zinc-400">Won </span>
                  <span className="text-emerald-500 font-bold">₱1,200 CR</span>
                </span>
                <span className="text-[10px] text-zinc-500 leading-tight">
                  Bonanza
                </span>
              </div>
            </div>

            {/* Feed Item 3 */}
            <div className="flex items-center gap-3">
              <img
                src={ASSETS.avatar3}
                alt="PoorBoy06"
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-rose-500 ring-offset-2 ring-offset-black"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-white font-semibold text-[13px] truncate leading-tight">
                  PoorBoy06
                </span>
                <span className="text-[11px] leading-tight mt-0.5">
                  <span className="text-zinc-400">Loot </span>
                  <span className="text-rose-500 font-bold">₱980 CR</span>
                </span>
                <span className="text-[10px] text-zinc-500 leading-tight">
                  Parlays
                </span>
              </div>
            </div>

            {/* Feed Item 4 */}
            <div className="flex items-center gap-3">
              <img
                src={ASSETS.avatar5}
                alt="MangKanor"
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500 ring-offset-2 ring-offset-black"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-white font-semibold text-[13px] truncate leading-tight">
                  MangKanor
                </span>
                <span className="text-[11px] leading-tight mt-0.5">
                  <span className="text-zinc-400">Won </span>
                  <span className="text-emerald-500 font-bold">₱6,540 CR</span>
                </span>
                <span className="text-[10px] text-zinc-500 leading-tight">
                  Baccarat
                </span>
              </div>
            </div>

            {/* Feed Item 5 */}
            <div className="flex items-center gap-3">
              <img
                src={ASSETS.avatar4}
                alt="SleepyJuan"
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500 ring-offset-2 ring-offset-black"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-white font-semibold text-[13px] truncate leading-tight">
                  SleepyJuan
                </span>
                <span className="text-[11px] leading-tight mt-0.5">
                  <span className="text-zinc-400">Won </span>
                  <span className="text-emerald-500 font-bold">₱2,150 CR</span>
                </span>
                <span className="text-[10px] text-zinc-500 leading-tight">
                  Bonanza
                </span>
              </div>
            </div>

            {/* Feed Item 6 */}
            <div className="flex items-center gap-3">
              <img
                src={ASSETS.avatar3}
                alt="ChillLang"
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-rose-500 ring-offset-2 ring-offset-black"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-white font-semibold text-[13px] truncate leading-tight">
                  ChillLang
                </span>
                <span className="text-[11px] leading-tight mt-0.5">
                  <span className="text-zinc-400">Loot </span>
                  <span className="text-rose-500 font-bold">₱560 CR</span>
                </span>
                <span className="text-[10px] text-zinc-500 leading-tight">
                  Parlays
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#07080a] border-t border-zinc-950 px-4 py-2.5 flex items-center justify-around z-50">
        <button className="flex flex-col items-center gap-1 text-amber-400">
          <Home className="w-5 h-5 fill-amber-400" />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-zinc-500 hover:text-zinc-300">
          <Gamepad2 className="w-5 h-5" />
          <span className="text-[10px]">Games</span>
        </button>
        <button
          onClick={onOpenBaccarat}
          className="flex flex-col items-center gap-1 text-zinc-500 hover:text-zinc-300"
        >
          <Tv className="w-5 h-5" />
          <span className="text-[10px]">Live Casino</span>
        </button>
        <button
          onClick={onOpenParlays}
          className="flex flex-col items-center gap-1 text-zinc-500 hover:text-zinc-300"
        >
          <Dices className="w-5 h-5" />
          <span className="text-[10px]">Sports</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-zinc-500 hover:text-zinc-300">
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </button>
      </div>
    </div>
  );
};
