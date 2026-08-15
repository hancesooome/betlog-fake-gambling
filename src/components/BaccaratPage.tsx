/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bell,
  Maximize2,
  Volume2,
  Settings,
  ChevronDown,
  Plus,
  RotateCcw,
  Send,
  ArrowLeft,
  Crown,
  Home,
  Gamepad2,
  Tv,
  Dices,
  User,
} from 'lucide-react';

interface BaccaratPageProps {
  onBackToHome: () => void;
}

const ASSETS = {
  logoIcon: 'https://zdveyurydayysazasvdq.supabase.co/storage/v1/object/public/assets/icon.png',
  baccarat: 'https://zdveyurydayysazasvdq.supabase.co/storage/v1/object/public/assets/baccarat.png',
  avatar1: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  avatar2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  avatar3: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
};

export const BaccaratPage: React.FC<BaccaratPageProps> = ({ onBackToHome }) => {
  const [selectedChip, setSelectedChip] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<'Roadmap' | 'History' | 'Chat'>('Roadmap');
  const [selectedBet, setSelectedBet] = useState<'player' | 'tie' | 'banker' | null>('player');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, user: 'LuckyJuan', text: 'Go banker!', time: 'Just now', avatar: ASSETS.avatar1 },
    { id: 2, user: 'TitoBogs', text: 'Player always panalo', time: 'Just now', avatar: ASSETS.avatar2 },
    { id: 3, user: 'QueenM', text: 'Good luck fam!', time: 'Just now', avatar: ASSETS.avatar3 },
  ]);

  const chips = [
    { value: 10, label: '10', color: 'from-blue-500 to-blue-700', border: 'border-blue-300' },
    { value: 25, label: '25', color: 'from-red-500 to-red-700', border: 'border-red-300' },
    { value: 50, label: '50', color: 'from-purple-500 to-purple-800', border: 'border-purple-300' },
    { value: 100, label: '100', color: 'from-emerald-500 to-emerald-700', border: 'border-emerald-300' },
    { value: 300, label: '300', color: 'from-amber-500 to-amber-700', border: 'border-amber-300' },
    { value: 1000, label: '1K', color: 'from-zinc-700 to-zinc-900', border: 'border-zinc-400' },
  ];

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: 'You',
        text: chatInput.trim(),
        time: 'Just now',
        avatar: ASSETS.avatar2,
      },
    ]);
    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-black text-white antialiased flex flex-col font-sans select-none pb-20 md:pb-8">
      {/* Top Navigation Bar */}
      <header className="w-full bg-black px-4 md:px-8 py-4 flex items-center justify-between border-b border-zinc-900 sticky top-0 z-40">
        {/* Left: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-10">
          {/* Brand Logo & Back to Home */}
          <button
            onClick={onBackToHome}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <img
              src={ASSETS.logoIcon}
              alt="BETLOG"
              referrerPolicy="no-referrer"
              className="h-7 md:h-8 object-contain"
            />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-[15px] font-medium text-zinc-400">
            <button onClick={onBackToHome} className="hover:text-white transition-colors cursor-pointer">Games</button>
            <button
              onClick={() => {}}
              className="text-white font-semibold transition-colors text-left cursor-pointer"
            >
              Live Casino
            </button>
            <button onClick={onBackToHome} className="hover:text-white transition-colors cursor-pointer">Sports</button>
            <button onClick={onBackToHome} className="hover:text-white transition-colors cursor-pointer">Bonanza</button>
            <button onClick={onBackToHome} className="hover:text-white transition-colors cursor-pointer">Promos</button>
            <button onClick={onBackToHome} className="text-amber-400 flex items-center gap-1 font-semibold hover:text-amber-300 transition-colors cursor-pointer">
              <Crown className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>VIP</span>
            </button>
          </nav>
        </div>

        {/* Right: Balance, Notifications, Profile */}
        <div className="flex items-center gap-4">
          {/* Table ID Display */}
          <div className="hidden lg:flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white transition-colors bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-900">
            <span className="text-xs font-semibold tracking-wide">Baccarat #10248</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          </div>

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

          {/* User Profile Avatar */}
          <div onClick={onBackToHome} className="relative cursor-pointer">
            <img
              src={ASSETS.avatar2}
              alt="User Profile"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500 ring-offset-2 ring-offset-black"
            />
          </div>
        </div>
      </header>

      {/* Main Grid: Game Video & Betting (Left) + Roadmap & Chat (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[1560px] w-full mx-auto p-4 md:p-6">
        {/* LEFT COLUMN: Live Feed + Betting Spots + Chips (Spans 8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Live Video / Dealer Canvas */}
          <div className="relative w-full h-[280px] sm:h-[360px] md:h-[420px] bg-[#07090e] border border-[#1b202e] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
            {/* Live Dealer Background Image */}
            <img
              src={ASSETS.baccarat}
              alt="Live Baccarat Dealer"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />

            {/* Vignette Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-black/40" />

            {/* Top Left: LIVE Badge */}
            <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10">
              <span className="bg-[#e50914] text-white text-[10px] md:text-[11px] font-black px-2 md:px-2.5 py-0.5 rounded tracking-wider uppercase shadow-md">
                LIVE
              </span>
            </div>

            {/* Top Right: Table Info Overlay */}
            <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-2 md:px-2.5 py-1 flex items-center gap-2 text-[10px] md:text-[11px] text-zinc-300">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold">1,248</span>
              </div>
              <span className="text-zinc-500">|</span>
              <span className="text-zinc-400">Table Info</span>
            </div>

            {/* Bottom Live Game Felt Display: PLAYER and BANKER cards & scores */}
            <div className="absolute bottom-3 md:bottom-4 left-0 right-0 px-4 md:px-6 flex items-end justify-between max-w-2xl mx-auto z-10">
              {/* PLAYER SIDE */}
              <div className="flex flex-col items-center">
                <span className="text-[#38bdf8] font-black text-xs md:text-sm tracking-widest uppercase mb-1.5 md:mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  PLAYER
                </span>
                <div className="flex items-center gap-1.5 md:gap-2.5">
                  {/* Score Badge */}
                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#1e3a8a] border border-[#60a5fa] text-white font-black text-[11px] md:text-xs flex items-center justify-center shadow-lg">
                    7
                  </div>

                  {/* Card 1: 3 of Clubs */}
                  <div className="w-8 h-12 md:w-10 md:h-14 bg-white rounded shadow-xl border border-zinc-300 flex flex-col justify-between p-1 text-black select-none">
                    <div className="text-[10px] md:text-[11px] font-bold leading-none">3</div>
                    <div className="text-xs md:text-sm self-center leading-none">♣</div>
                    <div className="text-[10px] md:text-[11px] font-bold leading-none self-end rotate-180">3</div>
                  </div>

                  {/* Card 2: 4 of Diamonds */}
                  <div className="w-8 h-12 md:w-10 md:h-14 bg-white rounded shadow-xl border border-zinc-300 flex flex-col justify-between p-1 text-[#dc2626] select-none">
                    <div className="text-[10px] md:text-[11px] font-bold leading-none">4</div>
                    <div className="text-xs md:text-sm self-center leading-none">♦</div>
                    <div className="text-[10px] md:text-[11px] font-bold leading-none self-end rotate-180">4</div>
                  </div>
                </div>
              </div>

              {/* BANKER SIDE */}
              <div className="flex flex-col items-center">
                <span className="text-[#ef4444] font-black text-xs md:text-sm tracking-widest uppercase mb-1.5 md:mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  BANKER
                </span>
                <div className="flex items-center gap-1.5 md:gap-2.5">
                  {/* Card 1: 2 of Spades */}
                  <div className="w-8 h-12 md:w-10 md:h-14 bg-white rounded shadow-xl border border-zinc-300 flex flex-col justify-between p-1 text-black select-none">
                    <div className="text-[10px] md:text-[11px] font-bold leading-none">2</div>
                    <div className="text-xs md:text-sm self-center leading-none">♠</div>
                    <div className="text-[10px] md:text-[11px] font-bold leading-none self-end rotate-180">2</div>
                  </div>

                  {/* Card 2: 4 of Hearts */}
                  <div className="w-8 h-12 md:w-10 md:h-14 bg-white rounded shadow-xl border border-zinc-300 flex flex-col justify-between p-1 text-[#dc2626] select-none">
                    <div className="text-[10px] md:text-[11px] font-bold leading-none">4</div>
                    <div className="text-xs md:text-sm self-center leading-none">♥</div>
                    <div className="text-[10px] md:text-[11px] font-bold leading-none self-end rotate-180">4</div>
                  </div>

                  {/* Score Badge */}
                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#7f1d1d] border border-[#f87171] text-white font-black text-[11px] md:text-xs flex items-center justify-center shadow-lg">
                    6
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Betting Spots Grid: PLAYER / TIE / BANKER */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {/* PLAYER Spot */}
            <button
              onClick={() => setSelectedBet('player')}
              className={`h-20 sm:h-24 md:h-28 rounded-xl md:rounded-2xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                selectedBet === 'player'
                  ? 'bg-[#0a1628] border-[#38bdf8] shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                  : 'bg-[#080d18] border-[#1a2336] hover:border-[#38bdf8]/50'
              }`}
            >
              <span className="text-[#38bdf8] font-black text-sm sm:text-base md:text-lg tracking-wider uppercase">
                PLAYER
              </span>
              <span className="text-zinc-400 font-semibold text-xs md:text-sm mt-0.5">
                1:1
              </span>
            </button>

            {/* TIE Spot */}
            <button
              onClick={() => setSelectedBet('tie')}
              className={`h-20 sm:h-24 md:h-28 rounded-xl md:rounded-2xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                selectedBet === 'tie'
                  ? 'bg-[#081b12] border-[#22c55e] shadow-[0_0_15px_rgba(34,197,94,0.25)]'
                  : 'bg-[#07130e] border-[#152a1e] hover:border-[#22c55e]/50'
              }`}
            >
              <span className="text-[#22c55e] font-black text-sm sm:text-base md:text-lg tracking-wider uppercase">
                TIE
              </span>
              <span className="text-zinc-400 font-semibold text-xs md:text-sm mt-0.5">
                8:1
              </span>
            </button>

            {/* BANKER Spot */}
            <button
              onClick={() => setSelectedBet('banker')}
              className={`h-20 sm:h-24 md:h-28 rounded-xl md:rounded-2xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                selectedBet === 'banker'
                  ? 'bg-[#220c0e] border-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                  : 'bg-[#18090b] border-[#331418] hover:border-[#ef4444]/50'
              }`}
            >
              <span className="text-[#ef4444] font-black text-sm sm:text-base md:text-lg tracking-wider uppercase">
                BANKER
              </span>
              <span className="text-zinc-400 font-semibold text-xs md:text-sm mt-0.5">
                1:1
              </span>
            </button>
          </div>

          {/* Chips Tray & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 md:gap-3 mt-1">
            {/* Chips Capsule Box */}
            <div className="bg-[#0b0e15] border border-[#1d2230] rounded-2xl px-2.5 md:px-5 py-2 md:py-2.5 flex items-center justify-between sm:justify-start gap-2 md:gap-3.5 shadow-xl overflow-x-auto">
              {chips.map((chip) => {
                const isSelected = selectedChip === chip.value;
                return (
                  <div key={chip.value} className="relative flex flex-col items-center shrink-0">
                    {/* Top yellow arc highlight if selected */}
                    {isSelected && (
                      <div className="w-6 md:w-8 h-1 bg-[#F5BA15] rounded-full mb-1 shadow-[0_0_6px_#F5BA15]" />
                    )}
                    <button
                      onClick={() => setSelectedChip(chip.value)}
                      className={`w-9 h-9 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${chip.color} border-2 ${
                        chip.border
                      } flex items-center justify-center text-white font-black text-xs md:text-sm shadow-md transition-transform hover:scale-105 active:scale-95 ${
                        isSelected ? 'ring-2 ring-[#F5BA15] ring-offset-2 ring-offset-[#0b0e15]' : ''
                      }`}
                    >
                      <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        {chip.label}
                      </span>
                    </button>
                  </div>
                );
              })}

              {/* Undo / Repeat Action Button */}
              <button
                onClick={() => setSelectedBet(null)}
                title="Clear Bet"
                className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-[#161a24] border border-[#282f42] flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors ml-1 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Right Action Controls: x2 and CONFIRM */}
            <div className="flex items-center gap-2 md:gap-3">
              <button className="flex-1 sm:flex-initial bg-[#121620] hover:bg-[#1a202e] border border-[#242b3d] text-white font-bold text-xs md:text-sm px-4 md:px-5 py-2.5 md:py-3 rounded-xl transition-colors active:scale-95 shadow-md">
                ×2
              </button>
              <button className="flex-2 sm:flex-initial bg-[#F5BA15] hover:bg-[#eab308] text-black font-black text-xs md:text-sm px-6 md:px-9 py-2.5 md:py-3 rounded-xl tracking-wider uppercase transition-transform active:scale-95 shadow-lg">
                CONFIRM
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Roadmap / History / Chat Sidebar (Spans 4 cols) */}
        <div className="lg:col-span-4 bg-[#080a0f] border border-[#1b202e] rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl p-3.5 md:p-5">
          <div>
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-[#1c2230] pb-2.5 mb-3.5">
              <button
                onClick={() => setActiveTab('Roadmap')}
                className={`text-xs md:text-sm font-bold tracking-wide relative pb-2 transition-colors ${
                  activeTab === 'Roadmap' ? 'text-[#F5BA15]' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Roadmap
                {activeTab === 'Roadmap' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F5BA15] rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('History')}
                className={`text-xs md:text-sm font-bold tracking-wide pb-2 transition-colors ${
                  activeTab === 'History' ? 'text-[#F5BA15]' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                History
                {activeTab === 'History' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F5BA15] rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('Chat')}
                className={`text-xs md:text-sm font-bold tracking-wide pb-2 transition-colors ${
                  activeTab === 'Chat' ? 'text-[#F5BA15]' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Chat
                {activeTab === 'Chat' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F5BA15] rounded-full" />
                )}
              </button>
            </div>

            {/* Bead Plate Roadmap Grid */}
            <div className="bg-[#05060a] border border-[#181d2a] rounded-xl p-2.5 md:p-3 mb-3">
              <div className="grid grid-cols-11 gap-1.5 md:gap-2">
                {[
                  { t: 'P', c: 'bg-[#2563eb] text-white' },
                  { t: 'P', c: 'bg-[#2563eb] text-white' },
                  { t: 'B', c: 'bg-[#dc2626] text-white' },
                  { t: 'P', c: 'bg-[#2563eb] text-white' },
                  { t: 'B', c: 'bg-[#dc2626] text-white' },
                  { t: 'P', c: 'bg-[#2563eb] text-white' },
                  { t: 'B', c: 'bg-[#dc2626] text-white' },
                  { t: 'B', c: 'bg-[#dc2626] text-white' },
                  { t: 'P', c: 'bg-[#2563eb] text-white' },
                  { t: 'T', c: 'bg-[#16a34a] text-white' },
                  { t: ' ', c: 'border border-zinc-800' },

                  { t: 'B', c: 'bg-[#dc2626] text-white' },
                  { t: 'P', c: 'bg-[#2563eb] text-white' },
                  { t: 'P', c: 'bg-[#2563eb] text-white' },
                  { t: 'B', c: 'bg-[#dc2626] text-white' },
                  { t: 'P', c: 'bg-[#2563eb] text-white' },
                  { t: 'B', c: 'bg-[#dc2626] text-white' },
                  { t: 'P', c: 'bg-[#2563eb] text-white' },
                  { t: 'P', c: 'bg-[#2563eb] text-white' },
                  { t: ' ', c: 'border border-zinc-800' },
                  { t: 'B', c: 'bg-[#dc2626] text-white' },
                  { t: ' ', c: 'border border-zinc-800' },

                  { t: 'P', c: 'bg-[#2563eb] text-white' },
                  { t: 'P', c: 'bg-[#2563eb] text-white' },
                  { t: 'B', c: 'bg-[#dc2626] text-white' },
                  { t: 'B', c: 'bg-[#dc2626] text-white' },
                  { t: 'B', c: 'bg-[#dc2626] text-white' },
                  { t: 'P', c: 'bg-[#2563eb] text-white' },
                  { t: 'P', c: 'bg-[#2563eb] text-white' },
                  { t: ' ', c: 'border border-zinc-800' },
                  { t: ' ', c: 'border border-zinc-800' },
                  { t: 'T', c: 'bg-[#16a34a] text-white' },
                  { t: ' ', c: 'border border-zinc-800' },

                  { t: 'P', c: 'bg-[#2563eb] text-white' },
                  { t: 'P', c: 'bg-[#2563eb] text-white' },
                  { t: 'P', c: 'bg-[#2563eb] text-white' },
                  { t: ' ', c: 'border border-zinc-800' },
                  { t: ' ', c: 'border border-zinc-800' },
                  { t: 'P', c: 'bg-[#2563eb] text-white' },
                  { t: ' ', c: 'border border-zinc-800' },
                  { t: 'P', c: 'bg-[#2563eb] text-white' },
                  { t: 'T', c: 'bg-[#16a34a] text-white' },
                  { t: ' ', c: 'border border-zinc-800' },
                  { t: ' ', c: 'border border-zinc-800' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[10px] font-black ${item.c}`}
                  >
                    {item.t !== ' ' ? item.t : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics Bar */}
            <div className="flex items-center justify-between text-xs px-1 text-zinc-300 font-semibold mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#2563eb] text-white text-[9px] font-bold flex items-center justify-center">
                  P
                </span>
                <span>45%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#16a34a] text-white text-[9px] font-bold flex items-center justify-center">
                  T
                </span>
                <span>10%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#dc2626] text-white text-[9px] font-bold flex items-center justify-center">
                  B
                </span>
                <span>45%</span>
              </div>
            </div>

            <div className="text-[11px] text-zinc-400 px-1 mb-3">
              Total 120 Rounds
            </div>
          </div>

          {/* Live Chat Area */}
          <div className="flex flex-col gap-2.5 border-t border-[#1c2230] pt-3">
            <div className="flex flex-col gap-2.5 max-h-36 overflow-y-auto pr-1">
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-2.5">
                  <img
                    src={msg.avatar}
                    alt={msg.user}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 md:w-7 md:h-7 rounded-full object-cover ring-1 ring-zinc-700"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300 font-bold text-[11px] md:text-xs">{msg.user}</span>
                      <span className="text-[10px] text-zinc-400">{msg.time}</span>
                    </div>
                    <p className="text-[11px] md:text-xs text-zinc-300 mt-0.5">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendMessage} className="mt-1 relative flex items-center">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-[#05070c] border border-[#1e2434] rounded-xl pl-3 pr-9 py-2 text-xs text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-[#F5BA15]"
              />
              <button
                type="submit"
                className="absolute right-2 text-[#F5BA15] hover:text-amber-400 transition-colors p-1"
              >
                <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#07080a] border-t border-zinc-950 px-4 py-2.5 flex items-center justify-around z-50">
        <button onClick={onBackToHome} className="flex flex-col items-center gap-1 text-zinc-500 hover:text-zinc-300 cursor-pointer">
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>
        <button onClick={onBackToHome} className="flex flex-col items-center gap-1 text-zinc-500 hover:text-zinc-300 cursor-pointer">
          <Gamepad2 className="w-5 h-5" />
          <span className="text-[10px]">Games</span>
        </button>
        <button
          onClick={() => {}}
          className="flex flex-col items-center gap-1 text-amber-400 cursor-pointer"
        >
          <Tv className="w-5 h-5 fill-amber-400" />
          <span className="text-[10px] font-bold">Live Casino</span>
        </button>
        <button onClick={onBackToHome} className="flex flex-col items-center gap-1 text-zinc-500 hover:text-zinc-300 cursor-pointer">
          <Dices className="w-5 h-5" />
          <span className="text-[10px]">Sports</span>
        </button>
        <button onClick={onBackToHome} className="flex flex-col items-center gap-1 text-zinc-500 hover:text-zinc-300 cursor-pointer">
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </button>
      </div>
    </div>
  );
};
