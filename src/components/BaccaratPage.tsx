/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bell,
  Maximize2,
  Volume2,
  VolumeX,
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
import { useDealerVoice } from '../hooks/useDealerVoice';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useAudio } from '../hooks/useAudio';

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
  // ── Audio hooks ────────────────────────────────────────────────────────────
  const { playVoice } = useDealerVoice();
  const { playSfx }   = useSoundEffects();
  const { isMuted, toggleMute } = useAudio();

  // Game Play States
  const [balance, setBalance] = useState<number>(1250);
  const [betAmounts, setBetAmounts] = useState<{ player: number; tie: number; banker: number }>({
    player: 0,
    tie: 0,
    banker: 0,
  });
  const [placedBets, setPlacedBets] = useState<{ player: number; tie: number; banker: number }>({
    player: 0,
    tie: 0,
    banker: 0,
  });
  const [selectedChip, setSelectedChip] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<'Roadmap' | 'History' | 'Chat'>('Roadmap');
  const [selectedBet, setSelectedBet] = useState<'player' | 'tie' | 'banker' | null>('player');
  const [gameState, setGameState] = useState<'betting' | 'dealing' | 'result'>('betting');
  
  // Card States
  interface Card {
    value: string;
    suit: string;
    score: number;
    color: string;
  }
  const [playerCards, setPlayerCards] = useState<Card[]>([
    { value: '3', suit: '♣', score: 3, color: 'text-black' },
    { value: '4', suit: '♦', score: 4, color: 'text-[#dc2626]' },
  ]);
  const [bankerCards, setBankerCards] = useState<Card[]>([
    { value: '2', suit: '♠', score: 2, color: 'text-black' },
    { value: '4', suit: '♥', score: 4, color: 'text-[#dc2626]' },
  ]);
  
  // Game log/Roadmap states
  const [roadmap, setRoadmap] = useState<Array<{ t: string; c: string }>>([
    { t: 'P', c: 'bg-[#2563eb] text-white shadow-[0_0_8px_rgba(37,99,235,0.5)]' },
    { t: 'P', c: 'bg-[#2563eb] text-white shadow-[0_0_8px_rgba(37,99,235,0.5)]' },
    { t: 'B', c: 'bg-[#dc2626] text-white shadow-[0_0_8px_rgba(220,38,38,0.5)]' },
    { t: 'P', c: 'bg-[#2563eb] text-white shadow-[0_0_8px_rgba(37,99,235,0.5)]' },
    { t: 'B', c: 'bg-[#dc2626] text-white shadow-[0_0_8px_rgba(220,38,38,0.5)]' },
    { t: 'P', c: 'bg-[#2563eb] text-white shadow-[0_0_8px_rgba(37,99,235,0.5)]' },
    { t: 'B', c: 'bg-[#dc2626] text-white shadow-[0_0_8px_rgba(220,38,38,0.5)]' },
    { t: 'B', c: 'bg-[#dc2626] text-white shadow-[0_0_8px_rgba(220,38,38,0.5)]' },
    { t: 'P', c: 'bg-[#2563eb] text-white shadow-[0_0_8px_rgba(37,99,235,0.5)]' },
    { t: 'T', c: 'bg-[#16a34a] text-white shadow-[0_0_8px_rgba(22,163,74,0.5)]' },
  ]);
  
  const [stats, setStats] = useState({ player: 45, tie: 10, banker: 45, total: 120 });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' | null }>({ message: '', type: null });

  // Chat state
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

  // Helper score calculator
  const calculateScore = (cards: Card[]) => {
    const total = cards.reduce((sum, card) => sum + card.score, 0);
    return total % 10;
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: null });
    }, 4500);
  };

  const handlePlaceBet = (spot: 'player' | 'tie' | 'banker') => {
    if (gameState !== 'betting') {
      showToast('Wait for the next betting round to start!', 'error');
      return;
    }
    if (balance < selectedChip) {
      showToast('Insufficient credits!', 'error');
      return;
    }
    playSfx('CHIP_PLACE');
    setBalance(prev => prev - selectedChip);
    setBetAmounts(prev => ({
      ...prev,
      [spot]: prev[spot] + selectedChip,
    }));
  };

  const handleClearBets = () => {
    if (gameState !== 'betting') return;
    const totalReturned = betAmounts.player + betAmounts.tie + betAmounts.banker;
    if (totalReturned > 0) playSfx('CHIP_STACK');
    setBalance(prev => prev + totalReturned);
    setBetAmounts({ player: 0, tie: 0, banker: 0 });
    setPlacedBets({ player: 0, tie: 0, banker: 0 });
  };

  const handleConfirmBets = () => {
    if (gameState !== 'betting') return;
    const totalBet = betAmounts.player + betAmounts.tie + betAmounts.banker;
    if (totalBet === 0) {
      showToast('Please place at least one bet!', 'info');
      return;
    }
    setPlacedBets({ ...betAmounts });
    showToast('Bets confirmed! Dealing cards...', 'success');
    // ── Audio: bets closed ──
    playSfx('BET_CLOSED');
    playVoice('BETTING_CLOSED');
    setGameState('dealing');

    // Deal cards after voice finishes (~1.5 s)
    setTimeout(() => {
      simulateDeal();
    }, 1500);
  };

  const simulateDeal = () => {
    const suits = [
      { s: '♣', c: 'text-black' },
      { s: '♦', c: 'text-[#dc2626]' },
      { s: '♠', c: 'text-black' },
      { s: '♥', c: 'text-[#dc2626]' },
    ];
    const cardValues = [
      { v: 'A', s: 1 },
      { v: '2', s: 2 },
      { v: '3', s: 3 },
      { v: '4', s: 4 },
      { v: '5', s: 5 },
      { v: '6', s: 6 },
      { v: '7', s: 7 },
      { v: '8', s: 8 },
      { v: '9', s: 9 },
      { v: '10', s: 0 },
      { v: 'J', s: 0 },
      { v: 'Q', s: 0 },
      { v: 'K', s: 0 },
    ];

    const drawCard = () => {
      const valObj = cardValues[Math.floor(Math.random() * cardValues.length)];
      const suitObj = suits[Math.floor(Math.random() * suits.length)];
      return {
        value: valObj.v,
        suit: suitObj.s,
        score: valObj.s,
        color: suitObj.c,
      };
    };

    // Deal initial cards
    const p1 = drawCard();
    const p2 = drawCard();
    const b1 = drawCard();
    const b2 = drawCard();

    let currentP = [p1, p2];
    let currentB = [b1, b2];

    // ── Audio: card deal SFX for initial 4 cards ──
    playSfx('CARD_DEAL');
    setTimeout(() => playSfx('CARD_DEAL'), 200);
    setTimeout(() => playSfx('CARD_DEAL'), 400);
    setTimeout(() => playSfx('CARD_DEAL'), 600);

    setPlayerCards(currentP);
    setBankerCards(currentB);

    let pScore = (p1.score + p2.score) % 10;
    let bScore = (b1.score + b2.score) % 10;

    // Standard Baccarat Third Card Rule logic
    let extraDealTime = 0;

    // Detect naturals (8 or 9) early for voice
    const isNatural = pScore >= 8 || bScore >= 8;

    // If neither has 8 or 9 (Natural win)
    if (pScore < 8 && bScore < 8) {
      // Player draws if score is 0-5
      let pDraw = false;
      let pThirdCard: Card | null = null;
      if (pScore <= 5) {
        pDraw = true;
        pThirdCard = drawCard();
        currentP.push(pThirdCard);
        pScore = (pScore + pThirdCard.score) % 10;
        extraDealTime = 1000;
        setTimeout(() => {
          playSfx('CARD_FLIP');
          setPlayerCards([...currentP]);
        }, 800);
      }

      // Banker draws rules
      let bDraw = false;
      if (pDraw && pThirdCard) {
        const val = pThirdCard.score;
        if (bScore <= 2) bDraw = true;
        else if (bScore === 3 && val !== 8) bDraw = true;
        else if (bScore === 4 && [2, 3, 4, 5, 6, 7].includes(val)) bDraw = true;
        else if (bScore === 5 && [4, 5, 6, 7].includes(val)) bDraw = true;
        else if (bScore === 6 && [6, 7].includes(val)) bDraw = true;
      } else if (!pDraw) {
        if (bScore <= 5) bDraw = true;
      }

      if (bDraw) {
        const bThird = drawCard();
        currentB.push(bThird);
        bScore = (bScore + bThird.score) % 10;
        extraDealTime = 1800;
        setTimeout(() => {
          playSfx('CARD_FLIP');
          setBankerCards([...currentB]);
        }, 1500);
      }
    }

    // Resolve outcome
    setTimeout(() => {
      let result: 'player' | 'tie' | 'banker';
      let resultLabel = '';
      if (pScore > bScore) {
        result = 'player';
        resultLabel = 'PLAYER WINS';
      } else if (bScore > pScore) {
        result = 'banker';
        resultLabel = 'BANKER WINS';
      } else {
        result = 'tie';
        resultLabel = 'TIE GAME';
      }

      // Calculate Winnings
      let totalPayout = 0;
      if (result === 'player' && placedBets.player > 0) {
        totalPayout += placedBets.player * 2;
      }
      if (result === 'banker' && placedBets.banker > 0) {
        totalPayout += placedBets.banker * 2;
      }
      if (result === 'tie' && placedBets.tie > 0) {
        totalPayout += placedBets.tie * 9;
      }

      // ── Audio: result voice line ──
      if (isNatural) {
        // Natural eight or nine — use the correct voice
        const naturalScore = Math.max(pScore, bScore);
        playVoice(naturalScore >= 9 ? 'RESULT_NATURAL_NINE' : 'RESULT_NATURAL_EIGHT');
      } else if (result === 'player') {
        playVoice('RESULT_PLAYER');
      } else if (result === 'banker') {
        playVoice('RESULT_BANKER');
      } else {
        playVoice('RESULT_TIE');
      }

      if (totalPayout > 0) {
        setBalance(prev => prev + totalPayout);
        showToast(`Congratulations! You won ₱${totalPayout} CR! (${resultLabel})`, 'success');
      } else if (placedBets.player + placedBets.tie + placedBets.banker > 0) {
        showToast(`No matches! Try again! (${resultLabel})`, 'error');
      } else {
        showToast(`Round finished: ${resultLabel}`, 'info');
      }

      // Add to Roadmap
      const roadmapItem = {
        t: result === 'player' ? 'P' : result === 'banker' ? 'B' : 'T',
        c: result === 'player'
          ? 'bg-[#2563eb] text-white shadow-[0_0_8px_rgba(37,99,235,0.5)]'
          : result === 'banker'
          ? 'bg-[#dc2626] text-white shadow-[0_0_8px_rgba(220,38,38,0.5)]'
          : 'bg-[#16a34a] text-white shadow-[0_0_8px_rgba(22,163,74,0.5)]',
      };
      setRoadmap(prev => [...prev.slice(1), roadmapItem]);

      // Update statistics
      setStats(prev => {
        const total = prev.total + 1;
        const isPlayer = result === 'player';
        const isBanker = result === 'banker';
        const isTie = result === 'tie';
        return {
          player: Math.round(((prev.player * prev.total + (isPlayer ? 100 : 0)) / total)),
          banker: Math.round(((prev.banker * prev.total + (isBanker ? 100 : 0)) / total)),
          tie: Math.round(((prev.tie * prev.total + (isTie ? 100 : 0)) / total)),
          total,
        };
      });

      setGameState('result');

      // Reset back to betting phase after 4 seconds
      setTimeout(() => {
        setGameState('betting');
        setBetAmounts({ player: 0, tie: 0, banker: 0 });
        setPlacedBets({ player: 0, tie: 0, banker: 0 });
        // ── Audio: next round opens ──
        playSfx('BET_OPEN');
        playVoice('BETTING_OPEN');
      }, 4000);

    }, 1500 + extraDealTime);
  };

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
      {/* Toast Notification */}
      {toast.message && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl z-50 text-xs md:text-sm font-black border transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-[#15803d]/90 border-emerald-500 text-white' 
            : toast.type === 'error'
            ? 'bg-[#b91c1c]/90 border-red-500 text-white'
            : 'bg-[#1e293b]/90 border-zinc-700 text-white'
        }`}>
          {toast.message}
        </div>
      )}

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
              ₱{balance.toLocaleString()} CR
            </span>
            <button onClick={() => setBalance(prev => prev + 500)} className="bg-amber-400 hover:bg-amber-500 text-black w-6 h-6 rounded flex items-center justify-center font-bold transition-all cursor-pointer">
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Bell Icon with orange dot */}
          <button className="text-zinc-400 hover:text-white transition-colors p-1 relative cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#ef4444] rounded-full" />
          </button>

          {/* Mute / Unmute Toggle */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isMuted
                ? 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
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
            <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 flex items-center gap-2">
              <span className="bg-[#e50914] text-white text-[10px] md:text-[11px] font-black px-2 md:px-2.5 py-0.5 rounded tracking-wider uppercase shadow-md animate-pulse">
                {gameState === 'betting' ? 'PLACE BETS' : gameState === 'dealing' ? 'DEALING...' : 'RESULTS'}
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
                    {calculateScore(playerCards)}
                  </div>

                  {playerCards.map((card, index) => (
                    <div key={index} className="w-8 h-12 md:w-10 md:h-14 bg-white rounded shadow-xl border border-zinc-300 flex flex-col justify-between p-1 select-none animate-in fade-in zoom-in duration-300">
                      <div className="text-[10px] md:text-[11px] font-bold leading-none text-black">{card.value}</div>
                      <div className={`text-xs md:text-sm self-center leading-none ${card.color}`}>{card.suit}</div>
                      <div className="text-[10px] md:text-[11px] font-bold leading-none self-end rotate-180 text-black">{card.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BANKER SIDE */}
              <div className="flex flex-col items-center">
                <span className="text-[#ef4444] font-black text-xs md:text-sm tracking-widest uppercase mb-1.5 md:mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  BANKER
                </span>
                <div className="flex items-center gap-1.5 md:gap-2.5">
                  {bankerCards.map((card, index) => (
                    <div key={index} className="w-8 h-12 md:w-10 md:h-14 bg-white rounded shadow-xl border border-zinc-300 flex flex-col justify-between p-1 select-none animate-in fade-in zoom-in duration-300">
                      <div className="text-[10px] md:text-[11px] font-bold leading-none text-black">{card.value}</div>
                      <div className={`text-xs md:text-sm self-center leading-none ${card.color}`}>{card.suit}</div>
                      <div className="text-[10px] md:text-[11px] font-bold leading-none self-end rotate-180 text-black">{card.value}</div>
                    </div>
                  ))}

                  {/* Score Badge */}
                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#7f1d1d] border border-[#f87171] text-white font-black text-[11px] md:text-xs flex items-center justify-center shadow-lg">
                    {calculateScore(bankerCards)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Betting Spots Grid: PLAYER / TIE / BANKER */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {/* PLAYER Spot */}
            <button
              onClick={() => handlePlaceBet('player')}
              className={`h-20 sm:h-24 md:h-28 rounded-xl md:rounded-2xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                betAmounts.player > 0
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
              {betAmounts.player > 0 && (
                <div className="mt-1 bg-[#2563eb] text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                  ₱{betAmounts.player}
                </div>
              )}
            </button>

            {/* TIE Spot */}
            <button
              onClick={() => handlePlaceBet('tie')}
              className={`h-20 sm:h-24 md:h-28 rounded-xl md:rounded-2xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                betAmounts.tie > 0
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
              {betAmounts.tie > 0 && (
                <div className="mt-1 bg-[#16a34a] text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                  ₱{betAmounts.tie}
                </div>
              )}
            </button>

            {/* BANKER Spot */}
            <button
              onClick={() => handlePlaceBet('banker')}
              className={`h-20 sm:h-24 md:h-28 rounded-xl md:rounded-2xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                betAmounts.banker > 0
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
              {betAmounts.banker > 0 && (
                <div className="mt-1 bg-[#dc2626] text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                  ₱{betAmounts.banker}
                </div>
              )}
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
                      } flex items-center justify-center text-white font-black text-xs md:text-sm shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
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

              {/* Clear Bet Action Button */}
              <button
                onClick={handleClearBets}
                title="Clear Bets"
                className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-[#161a24] border border-[#282f42] flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors ml-1 shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Right Action Controls: x2 and CONFIRM */}
            <div className="flex items-center gap-2 md:gap-3">
              <button onClick={() => {
                if (gameState !== 'betting') return;
                const doubledBets = {
                  player: betAmounts.player * 2,
                  tie: betAmounts.tie * 2,
                  banker: betAmounts.banker * 2,
                };
                const totalAdditional = betAmounts.player + betAmounts.tie + betAmounts.banker;
                if (balance < totalAdditional) {
                  showToast('Insufficient balance to double bets!', 'error');
                  return;
                }
                playSfx('CHIP_STACK');
                setBalance(prev => prev - totalAdditional);
                setBetAmounts(doubledBets);
              }} className="flex-1 sm:flex-initial bg-[#121620] hover:bg-[#1a202e] border border-[#242b3d] text-white font-bold text-xs md:text-sm px-4 md:px-5 py-2.5 md:py-3 rounded-xl transition-colors active:scale-95 shadow-md cursor-pointer">
                ×2
              </button>
              <button onClick={handleConfirmBets} className="flex-2 sm:flex-initial bg-[#F5BA15] hover:bg-[#eab308] text-black font-black text-xs md:text-sm px-6 md:px-9 py-2.5 md:py-3 rounded-xl tracking-wider uppercase transition-transform active:scale-95 shadow-lg cursor-pointer">
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
                className={`text-xs md:text-sm font-bold tracking-wide relative pb-2 transition-colors cursor-pointer ${
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
                className={`text-xs md:text-sm font-bold tracking-wide pb-2 transition-colors cursor-pointer ${
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
                className={`text-xs md:text-sm font-bold tracking-wide pb-2 transition-colors cursor-pointer ${
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
            {activeTab === 'Roadmap' && (
              <div className="bg-[#05060a] border border-[#181d2a] rounded-xl p-2.5 md:p-3 mb-3 animate-in fade-in duration-300">
                <div className="grid grid-cols-11 gap-1.5 md:gap-2">
                  {roadmap.map((item, idx) => (
                    <div
                      key={idx}
                      className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[10px] font-black ${item.c}`}
                    >
                      {item.t}
                    </div>
                  ))}
                  {/* Empty spacers to fill roadmap layout */}
                  {Array.from({ length: Math.max(0, 44 - roadmap.length) }).map((_, idx) => (
                    <div key={`spacer-${idx}`} className="w-6 h-6 md:w-7 md:h-7 rounded-full border border-zinc-900" />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'History' && (
              <div className="bg-[#05060a] border border-[#181d2a] rounded-xl p-3 mb-3 max-h-56 overflow-y-auto text-xs text-zinc-400 space-y-2 animate-in fade-in duration-300">
                <div className="flex justify-between border-b border-zinc-900 pb-1 font-bold text-zinc-300">
                  <span>Round ID</span>
                  <span>Winner</span>
                  <span>Multiplier</span>
                </div>
                {roadmap.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-0.5">
                    <span>#R0{idx + 1021}</span>
                    <span className={item.t === 'P' ? 'text-[#2563eb]' : item.t === 'B' ? 'text-[#dc2626]' : 'text-[#16a34a]'}>
                      {item.t === 'P' ? 'Player' : item.t === 'B' ? 'Banker' : 'Tie'}
                    </span>
                    <span>{item.t === 'T' ? '8:1' : '1:1'}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Statistics Bar */}
            <div className="flex items-center justify-between text-xs px-1 text-zinc-300 font-semibold mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#2563eb] text-white text-[9px] font-bold flex items-center justify-center">
                  P
                </span>
                <span>{stats.player}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#16a34a] text-white text-[9px] font-bold flex items-center justify-center">
                  T
                </span>
                <span>{stats.tie}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#dc2626] text-white text-[9px] font-bold flex items-center justify-center">
                  B
                </span>
                <span>{stats.banker}%</span>
              </div>
            </div>

            <div className="text-[11px] text-zinc-400 px-1 mb-3">
              Total {stats.total} Rounds
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
