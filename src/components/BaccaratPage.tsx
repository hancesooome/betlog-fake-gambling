/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  X,
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
import { motion, AnimatePresence } from 'framer-motion';
import PokerChip from './PokerChip';
import BetChipStack from './BetChipStack';

// ─── Bet Key Types ────────────────────────────────────────────────────────────
type MainBetKey = 'player' | 'tie' | 'banker';
type SideBetKey = 'playerPair' | 'bankerPair' | 'perfectPair' | 'eitherPair' | 'playerBonus' | 'bankerBonus';
type AllBetKey = MainBetKey | SideBetKey;

const ZERO_BETS: Record<AllBetKey, number> = {
  player: 0, tie: 0, banker: 0,
  playerPair: 0, bankerPair: 0, perfectPair: 0, eitherPair: 0,
  playerBonus: 0, bankerBonus: 0,
};

interface BaccaratPageProps {
  onBackToHome: () => void;
  onOpenParlays: () => void;
}

const ASSETS = {
  logoIcon: 'https://zdveyurydayysazasvdq.supabase.co/storage/v1/object/public/assets/icon.png',
  baccarat: 'https://zdveyurydayysazasvdq.supabase.co/storage/v1/object/public/assets/baccarat.png',
  avatar1: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  avatar2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  avatar3: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
};

export const BaccaratPage: React.FC<BaccaratPageProps> = ({ onBackToHome, onOpenParlays }) => {
  // ── Audio hooks ────────────────────────────────────────────────────────────
  const { playVoice } = useDealerVoice();
  const { playSfx }   = useSoundEffects();
  const { isMuted, toggleMute } = useAudio();

  // Game Play States
  const [balance, setBalance] = useState<number>(1250);
  const [displayedBalance, setDisplayedBalance] = useState<number>(1250);
  const [betAmounts, setBetAmounts] = useState<Record<AllBetKey, number>>({ ...ZERO_BETS });
  const [placedBets, setPlacedBets] = useState<Record<AllBetKey, number>>({ ...ZERO_BETS });
  const [betHistory, setBetHistory] = useState<Array<{ spot: AllBetKey; amount: number }>>([]);
  const [selectedChip, setSelectedChip] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<'Roadmap' | 'History' | 'Chat'>('Roadmap');
  
  // Worker Sync States
  const [serverPhase, setServerPhase] = useState<string>('BETTING_OPEN');
  const [countdown, setCountdown] = useState<number>(15);
  const [tableId, setTableId] = useState<string>('BETLOG-BACCARAT-1');
  const [roundId, setRoundId] = useState<number>(0);
  const [gameState, setGameState] = useState<'betting' | 'dealing' | 'result'>('betting');

  // Ref trackers for phase & round changes
  const prevPhaseRef = useRef<string>('');
  const prevRoundRef = useRef<number>(-1);

  // Card States
  interface Card {
    value: string;
    suit: string;
    score: number;
    color: string;
  }
  
  interface AnimatedCard extends Card {
    isDealt: boolean;
    isFlipped: boolean;
  }

  const [playerCards, setPlayerCards] = useState<AnimatedCard[]>([]);
  const [bankerCards, setBankerCards] = useState<AnimatedCard[]>([]);
  
  // Local result animations
  const [localWinner, setLocalWinner] = useState<string | null>(null);
  const [showResultBanner, setShowResultBanner] = useState<boolean>(false);
  const [winPayoutPulse, setWinPayoutPulse] = useState<boolean>(false);
  const [winArea, setWinArea] = useState<MainBetKey | null>(null);
  const [winSideBets, setWinSideBets] = useState<Set<SideBetKey>>(new Set());
  const [lastTickPlayed, setLastTickPlayed] = useState<number>(0);
  
// Module-level variable to ensure the tick sound plays exactly once per second,
// surviving any React StrictMode double-mounts or component re-renders.
let globalLastTickPlayed = -1;
  
  // Game log/Roadmap states
  const [roadmap, setRoadmap] = useState<Array<{ t: string; c: string }>>([]);
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
    { value: 1,    label: '1'    },
    { value: 2,    label: '2'    },
    { value: 5,    label: '5'    },
    { value: 25,   label: '25'   },
    { value: 100,  label: '100'  },
    { value: 500,  label: '500'  },
    { value: 1000, label: '1000' },
  ];

  // ── Responsive chip size (px) — 40 on mobile, 56 on desktop ───────────────
  const [chipSize, setChipSize] = useState(() => window.innerWidth < 640 ? 40 : 56);
  useEffect(() => {
    const onResize = () => setChipSize(window.innerWidth < 640 ? 40 : 56);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Betting panel grid template — narrower side columns on small screens
  const betGridCols = chipSize < 56
    ? '52px 1fr 72px 1fr 52px'
    : '76px 1fr 96px 1fr 76px';

  // ── Derived State ─────────────────────────────────────────────────────────
  const isBettingOpen = serverPhase === 'BETTING_OPEN' || serverPhase === 'LAST_CALL';

  // Helper score calculator (based on isFlipped property to satisfy visual score delay)
  const calculateScore = (cards: AnimatedCard[]) => {
    const visibleCards = cards.filter(c => c.isFlipped);
    const total = visibleCards.reduce((sum, card) => sum + card.score, 0);
    return total % 10;
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: null });
    }, 4500);
  };

  // Mappings from worker payload
  const mapCard = (workerCard: any): AnimatedCard => ({
    value: workerCard.rank,
    suit: workerCard.suit,
    score: workerCard.value,
    color: workerCard.color === 'red' ? 'text-[#dc2626]' : 'text-black',
    isDealt: false,
    isFlipped: false,
  });

  const mapRoadmap = (bead: any) => {
    const w = bead.winner;
    return {
      t: w === 'PLAYER' ? 'P' : w === 'BANKER' ? 'B' : 'T',
      c: w === 'PLAYER'
        ? 'bg-[#2563eb] text-white shadow-[0_0_8px_rgba(37,99,235,0.5)]'
        : w === 'BANKER'
        ? 'bg-[#dc2626] text-white shadow-[0_0_8px_rgba(220,38,38,0.5)]'
        : 'bg-[#16a34a] text-white shadow-[0_0_8px_rgba(22,163,74,0.5)]',
    };
  };

  // Balance count-up animator hook
  useEffect(() => {
    if (displayedBalance === balance) return;
    const diff = balance - displayedBalance;
    const step = Math.ceil(diff / 15);
    const timer = setTimeout(() => {
      setDisplayedBalance(prev => {
        const nextVal = prev + step;
        if ((step > 0 && nextVal >= balance) || (step < 0 && nextVal <= balance)) {
          return balance;
        }
        return nextVal;
      });
    }, 40);
    return () => clearTimeout(timer);
  }, [balance, displayedBalance]);

  // Stable ref to playSfx — prevents tick effect from re-running on every render
  const playSfxRef = useRef(playSfx);
  useEffect(() => { playSfxRef.current = playSfx; });

  // Last 5 seconds tick — fires exactly once per unique countdown value
  useEffect(() => {
    if (
      (serverPhase === 'BETTING_OPEN' || serverPhase === 'LAST_CALL') &&
      countdown <= 5 &&
      countdown > 0 &&
      countdown !== globalLastTickPlayed
    ) {
      globalLastTickPlayed = countdown;
      playSfxRef.current('LAST_5_SECONDS');
    }
  }, [countdown, serverPhase]);

  // ── Sync to Live Worker API ───────────────────────────────────────────────
  useEffect(() => {
    let active = true;

    const fetchLiveState = async () => {
      try {
        const response = await fetch('https://betlog-baccarat-worker.tekamuna.workers.dev/api/live');
        if (!response.ok) return;
        const data = await response.json();
        if (!active) return;

        // 1. Sync round change -> Clear local bets & result animations
        const isNewRound = prevRoundRef.current !== -1 && prevRoundRef.current !== data.round;
        if (isNewRound) {
          setBetAmounts({ ...ZERO_BETS });
          setPlacedBets({ ...ZERO_BETS });
          setBetHistory([]);
          setWinSideBets(new Set());
          setLocalWinner(null);
          setShowResultBanner(false);
          setWinPayoutPulse(false);
          setWinArea(null);
        }
        prevRoundRef.current = data.round;

        // 2. Sync Basic Info
        setTableId(data.tableId);
        setRoundId(data.round);
        setServerPhase(data.phase);
        setCountdown(data.countdown || data.phaseSecondsRemaining);

        // 3. Sync Roadmap
        if (data.roadmap) {
          setRoadmap(data.roadmap.map(mapRoadmap));
          const total = data.roadmap.length;
          if (total > 0) {
            const pCount = data.roadmap.filter((b: any) => b.winner === 'PLAYER').length;
            const bCount = data.roadmap.filter((b: any) => b.winner === 'BANKER').length;
            const tCount = data.roadmap.filter((b: any) => b.winner === 'TIE').length;
            setStats({
              player: Math.round((pCount / total) * 100),
              banker: Math.round((bCount / total) * 100),
              tie: Math.round((tCount / total) * 100),
              total,
            });
          }
        }

        // 4. Map server phase to local UI gameState
        if (data.phase === 'BETTING_OPEN' || data.phase === 'LAST_CALL') {
          setGameState('betting');
        } else if (data.phase === 'BETTING_CLOSED' || data.phase === 'DEALING' || data.phase === 'REVEALING') {
          setGameState('dealing');
        } else if (data.phase === 'RESULT') {
          setGameState('result');
        }

        // 5. Play Audio Announcements & Handle Win/Loss Payouts on transition
        if (prevPhaseRef.current !== data.phase) {
          const oldPhase = prevPhaseRef.current;
          prevPhaseRef.current = data.phase;

          if (data.phase === 'BETTING_OPEN') {
            playSfx('BET_OPEN');
            playVoice('BETTING_OPEN');
            setPlayerCards([]);
            setBankerCards([]);
          } else if (data.phase === 'LAST_CALL') {
            playVoice('LAST_CALL');
          } else if (data.phase === 'BETTING_CLOSED') {
            playSfx('BET_CLOSED');
            playVoice('BETTING_CLOSED');
          } else if (data.phase === 'DEALING') {
            // Start local staggered deal animation
            const pMapped = data.playerCards.map(mapCard);
            const bMapped = data.bankerCards.map(mapCard);
            setPlayerCards(pMapped);
            setBankerCards(bMapped);

            // Stagger deals and play sfx
            pMapped.forEach((c: any, idx: number) => {
              setTimeout(() => {
                playSfx('CARD_DEAL');
                setPlayerCards(curr => {
                  const copy = [...curr];
                  if (copy[idx]) copy[idx] = { ...copy[idx]!, isDealt: true };
                  return copy;
                });
              }, idx * 600);
            });

            bMapped.forEach((c: any, idx: number) => {
              setTimeout(() => {
                playSfx('CARD_DEAL');
                setBankerCards(curr => {
                  const copy = [...curr];
                  if (copy[idx]) copy[idx] = { ...copy[idx]!, isDealt: true };
                  return copy;
                });
              }, idx * 600 + 300);
            });

          } else if (data.phase === 'REVEALING') {
            // Flip cards one by one
            const pMapped = data.playerCards.map(mapCard);
            const bMapped = data.bankerCards.map(mapCard);
            // Ensure all are marked dealt
            pMapped.forEach((c: any) => c.isDealt = true);
            bMapped.forEach((c: any) => c.isDealt = true);
            setPlayerCards(pMapped);
            setBankerCards(bMapped);

            // Stagger flips
            pMapped.forEach((c: any, idx: number) => {
              setTimeout(() => {
                playSfx('CARD_FLIP');
                setPlayerCards(curr => {
                  const copy = [...curr];
                  if (copy[idx]) copy[idx] = { ...copy[idx]!, isFlipped: true };
                  return copy;
                });
              }, idx * 600);
            });

            bMapped.forEach((c: any, idx: number) => {
              setTimeout(() => {
                playSfx('CARD_FLIP');
                setBankerCards(curr => {
                  const copy = [...curr];
                  if (copy[idx]) copy[idx] = { ...copy[idx]!, isFlipped: true };
                  return copy;
                });
              }, idx * 600 + 300);
            });

          } else if (data.phase === 'RESULT') {
            const resultObj = data.result;
            // Force-load all cards as dealt & flipped for result accuracy
            const pMapped = data.playerCards.map(mapCard);
            const bMapped = data.bankerCards.map(mapCard);
            pMapped.forEach((c: any) => { c.isDealt = true; c.isFlipped = true; });
            bMapped.forEach((c: any) => { c.isDealt = true; c.isFlipped = true; });
            setPlayerCards(pMapped);
            setBankerCards(bMapped);

            if (resultObj) {
              setLocalWinner(resultObj.winner);
              setShowResultBanner(true);
              setWinArea(resultObj.winner.toLowerCase() as any);

              if (resultObj.isNatural) {
                playVoice(resultObj.naturalValue === 9 ? 'RESULT_NATURAL_NINE' : 'RESULT_NATURAL_EIGHT');
              } else {
                playVoice(resultObj.winner === 'PLAYER' ? 'RESULT_PLAYER' : resultObj.winner === 'BANKER' ? 'RESULT_BANKER' : 'RESULT_TIE');
              }

              // Evaluate payouts
              const winner = resultObj.winner;
              let winnings = 0;
              // Detect pairs from raw server card data
              const hasPP = data.playerCards.length >= 2 && data.playerCards[0].rank === data.playerCards[1].rank;
              const hasBP = data.bankerCards.length >= 2 && data.bankerCards[0].rank === data.bankerCards[1].rank;
              const hasPerfectPair = hasPP && data.playerCards[0].suit === data.playerCards[1].suit;
              const hasEitherPair  = hasPP || hasBP;
              // Track which side bets hit
              const hitSideBets = new Set<SideBetKey>();
              if (hasPP)          hitSideBets.add('playerPair');
              if (hasBP)          hitSideBets.add('bankerPair');
              if (hasPerfectPair) hitSideBets.add('perfectPair');
              if (hasEitherPair)  hitSideBets.add('eitherPair');
              setWinSideBets(hitSideBets);

              setPlacedBets(currPlaced => {
                // Main bets
                if (winner === 'PLAYER' && currPlaced.player > 0) winnings += currPlaced.player * 2;
                if (winner === 'BANKER' && currPlaced.banker > 0) winnings += Math.floor(currPlaced.banker * 1.95);
                if (winner === 'TIE'    && currPlaced.tie > 0)    winnings += currPlaced.tie * 9;
                // Side bets
                if (hasPP          && currPlaced.playerPair  > 0) winnings += currPlaced.playerPair  * 12; // 11:1
                if (hasBP          && currPlaced.bankerPair  > 0) winnings += currPlaced.bankerPair  * 12;
                if (hasPerfectPair && currPlaced.perfectPair > 0) winnings += currPlaced.perfectPair * 26; // 25:1
                if (hasEitherPair  && currPlaced.eitherPair  > 0) winnings += currPlaced.eitherPair  * 6;  // 5:1

                const mainBetTotal = currPlaced.player + currPlaced.banker + currPlaced.tie;
                if (winnings > 0) {
                  setBalance(prev => prev + winnings);
                  setWinPayoutPulse(true);
                  showToast(`🎉 Won ₱${winnings.toLocaleString()} CR! (${winner} WINS)`, 'success');
                } else if (mainBetTotal > 0) {
                  showToast(`No match. ${winner} WINS — better luck next round!`, 'error');
                }
                return currPlaced;
              });
            }
          }
        } else {
          // Keep local cards inline with backend if phase hasn't changed (passive updates)
          if (data.phase === 'DEALING' && playerCards.length === 0) {
            const pMapped = data.playerCards.map(mapCard);
            const bMapped = data.bankerCards.map(mapCard);
            pMapped.forEach((c: any) => c.isDealt = true);
            bMapped.forEach((c: any) => c.isDealt = true);
            setPlayerCards(pMapped);
            setBankerCards(bMapped);
          } else if ((data.phase === 'REVEALING' || data.phase === 'RESULT') && (playerCards.length === 0 || !playerCards[0]?.isFlipped)) {
            const pMapped = data.playerCards.map(mapCard);
            const bMapped = data.bankerCards.map(mapCard);
            pMapped.forEach((c: any) => { c.isDealt = true; c.isFlipped = true; });
            bMapped.forEach((c: any) => { c.isDealt = true; c.isFlipped = true; });
            setPlayerCards(pMapped);
            setBankerCards(bMapped);
            if (data.phase === 'RESULT' && data.result) {
              setLocalWinner(data.result.winner);
              setShowResultBanner(true);
              setWinArea(data.result.winner.toLowerCase() as any);
            }
          }
        }
      } catch (err) {
        console.error('Failed to sync live state:', err);
      }
    };

    fetchLiveState();
    const interval = setInterval(fetchLiveState, 1000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [playVoice, playSfx, playerCards.length]);


  const handlePlaceBet = (spot: AllBetKey, explicitAmount?: number) => {
    if (!isBettingOpen) {
      showToast('Betting is closed for this round!', 'error');
      return;
    }
    const betSize = explicitAmount !== undefined ? explicitAmount : selectedChip;
    if (balance < betSize) {
      showToast('Insufficient credits!', 'error');
      return;
    }
    playSfx('CHIP_PLACE');
    setBalance(prev => prev - betSize);
    setBetAmounts(prev => ({ ...prev, [spot]: prev[spot] + betSize }));
    setBetHistory(prev => [...prev, { spot, amount: betSize }]);
  };

  const handleUndoBet = () => {
    if (betHistory.length === 0) return;
    const last = betHistory[betHistory.length - 1]!;
    setBalance(prev => prev + last.amount);
    setBetAmounts(prev => ({ ...prev, [last.spot]: Math.max(0, prev[last.spot] - last.amount) }));
    setBetHistory(prev => prev.slice(0, -1));
  };

  const handleClearBets = () => {
    if (!isBettingOpen) return;
    const totalReturned = (Object.values(betAmounts) as number[]).reduce((s, v) => s + v, 0);
    if (totalReturned > 0) playSfx('CHIP_STACK');
    setBalance(prev => prev + totalReturned);
    setBetAmounts({ ...ZERO_BETS });
    setPlacedBets({ ...ZERO_BETS });
    setBetHistory([]);
  };

  const handleConfirmBets = () => {
    if (!isBettingOpen) {
      showToast('Betting is closed for this round!', 'error');
      return;
    }
    const totalBet = (Object.values(betAmounts) as number[]).reduce((s, v) => s + v, 0);
    if (totalBet === 0) {
      showToast('Place at least one bet!', 'info');
      return;
    }
    setPlacedBets({ ...betAmounts });
    showToast('Bets locked in! Waiting for dealer...', 'success');
  };

  // ── Computed render values ──────────────────────────────────────────────────
  const totalMainBets = betAmounts.player + betAmounts.tie + betAmounts.banker;
  const totalBet = (Object.values(betAmounts) as number[]).reduce((s, v) => s + v, 0);
  const playerPct  = totalMainBets > 0 ? Math.round((betAmounts.player / totalMainBets) * 100) : 40;
  const tiePct     = totalMainBets > 0 ? Math.round((betAmounts.tie    / totalMainBets) * 100) : 20;
  const bankerPct  = totalMainBets > 0 ? 100 - playerPct - tiePct : 40;

  // ── Drag & Drop Event Handlers ─────────────────────────────────────────────
  const [activeDragOver, setActiveDragOver] = useState<AllBetKey | null>(null);

  const handleDragStart = (e: React.DragEvent, val: number) => {
    e.dataTransfer.setData('text/plain', val.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, spot: AllBetKey) => {
    e.preventDefault();
    if (isBettingOpen) {
      setActiveDragOver(spot);
    }
  };

  const handleDragLeave = () => {
    setActiveDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, spot: AllBetKey) => {
    e.preventDefault();
    setActiveDragOver(null);
    if (!isBettingOpen) return;
    const rawVal = e.dataTransfer.getData('text/plain');
    const val = parseInt(rawVal, 10);
    if (!isNaN(val) && val > 0) {
      handlePlaceBet(spot, val);
    }
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
            <button onClick={onOpenParlays} className="hover:text-white transition-colors cursor-pointer">Sports</button>
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
              ₱{displayedBalance.toLocaleString()} CR
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
          <div className="relative w-full h-[300px] sm:h-[380px] md:h-[460px] bg-[#07090e] border border-[#1b202e] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
            {/* Live Dealer Background Image */}
            <img
              src={ASSETS.baccarat}
              alt="Live Baccarat Dealer"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />

            {/* Vignette Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-black/40" />

            {/* Top Left: LIVE Badge & Table Stats */}
            <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-[#e50914] text-white text-[10px] md:text-[11px] font-black px-2 md:px-2.5 py-0.5 rounded tracking-wider uppercase shadow-md animate-pulse">
                  {serverPhase === 'BETTING_OPEN' ? 'PLACE BETS' : serverPhase === 'LAST_CALL' ? 'LAST CALL!' : serverPhase === 'BETTING_CLOSED' ? 'NO MORE BETS' : serverPhase === 'DEALING' ? 'DEALING...' : serverPhase === 'REVEALING' ? 'REVEALING...' : 'RESULTS'}
                </span>
                <span className="text-[10px] text-zinc-400 font-bold bg-black/60 px-2 py-0.5 rounded border border-white/5">
                  Round #{roundId}
                </span>
              </div>
            </div>

            {/* Center Screen: Circular Glassmorphic Countdown Overlay */}
            {(serverPhase === 'BETTING_OPEN' || serverPhase === 'LAST_CALL') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[1px] z-10 animate-in fade-in duration-300">
                <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-300 ${
                  serverPhase === 'LAST_CALL' 
                    ? 'border-red-500 bg-red-950/20 text-red-500 scale-105 animate-pulse' 
                    : 'border-amber-400 bg-black/40 text-amber-400'
                }`}>
                  <span className="text-4xl font-extrabold tracking-tighter leading-none select-none">
                    {countdown}
                  </span>
                  <span className="text-[9px] uppercase font-black tracking-widest mt-1 opacity-85">
                    {serverPhase === 'LAST_CALL' ? 'LAST CALL' : 'SECONDS'}
                  </span>
                </div>
              </div>
            )}

            {/* Top Right: Table Info Overlay */}
            <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-2 md:px-2.5 py-1 flex items-center gap-2 text-[10px] md:text-[11px] text-zinc-300 max-w-[140px] md:max-w-none">
              <div className="flex items-center gap-1 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute" />
                <span className="font-semibold ml-2">1,248</span>
              </div>
              <span className="text-zinc-500">|</span>
              <span className="text-zinc-400 truncate">{tableId}</span>
            </div>

            {/* Center Screen Result Banner Overlay */}
            <AnimatePresence>
              {showResultBanner && localWinner && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-x-0 top-1/3 flex justify-center z-35"
                >
                  <div className="bg-black/80 backdrop-blur-md border border-[#F5BA15]/30 px-8 py-3 rounded-2xl shadow-[0_0_40px_rgba(245,186,21,0.25)] flex flex-col items-center justify-center">
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#F5BA15] mb-1">
                      ROUND COMPLETE
                    </span>
                    <span className="text-xl md:text-2xl font-black tracking-wider text-white">
                      {localWinner === 'PLAYER' ? 'PLAYER WINS' : localWinner === 'BANKER' ? 'BANKER WINS' : 'TIE GAME'}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Live Game Felt Display: PLAYER and BANKER cards & scores */}
            <div className="absolute bottom-3 md:bottom-4 left-0 right-0 px-4 md:px-6 flex items-end justify-between max-w-2xl mx-auto z-10">
              {/* PLAYER SIDE */}
              <div className="flex flex-col items-center">
                <span className="text-[#38bdf8] font-black text-xs md:text-sm tracking-widest uppercase mb-1.5 md:mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  PLAYER
                </span>
                <div className="flex items-center gap-1.5 md:gap-2.5">
                  {/* Score Badge (Only visible when at least one card is flipped) */}
                  {playerCards.some(c => c.isFlipped) && (
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#1e3a8a] border border-[#60a5fa] text-white font-black text-[11px] md:text-xs flex items-center justify-center shadow-lg">
                      {calculateScore(playerCards)}
                    </div>
                  )}

                  <AnimatePresence>
                    {/* Player 3rd card goes LEFT — render order: [2, 0, 1] */}
                    {(playerCards.length === 3 ? [2, 0, 1] : [0, 1]).map((index) => {
                      const card = playerCards[index];
                      if (!card || !card.isDealt) return null;
                      const isThird = index === 2;
                      return (
                        /* For the 3rd card, outer container uses rotated dimensions so layout stays intact */
                        <div
                          key={`p-card-${index}`}
                          style={isThird
                            ? { width: 66, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }
                            : {}}
                        >
                          <motion.div
                            initial={{ x: 200, y: -250, rotate: 45, scale: 0.2, opacity: 0 }}
                            animate={{ x: 0, y: 0, rotate: isThird ? 90 : 0, scale: 1, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                            className="perspective relative"
                            style={{ width: 44, height: 66 }}
                          >
                            <motion.div
                              animate={{ rotateY: card.isFlipped ? 180 : 0 }}
                              transition={{ duration: 0.4, ease: 'easeInOut' }}
                              className="w-full h-full preserve-3d relative"
                            >
                              {/* Card Back */}
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-950 rounded border-2 border-white/90 shadow-xl flex items-center justify-center backface-hidden">
                                <div className="w-full h-full border border-blue-600/30 rounded flex items-center justify-center">
                                  <span className="text-white/20 text-[8px] font-black tracking-widest rotate-45">BETLOG</span>
                                </div>
                              </div>
                              {/* Card Front */}
                              <div className="absolute inset-0 bg-white rounded border border-zinc-300 shadow-xl flex flex-col justify-between p-1.5 select-none rotate-y-180 backface-hidden">
                                <div className="text-xs font-bold leading-none text-black">{card.value}</div>
                                <div className={`text-sm self-center leading-none ${card.color}`}>{card.suit}</div>
                                <div className="text-xs font-bold leading-none self-end rotate-180 text-black">{card.value}</div>
                              </div>
                            </motion.div>
                          </motion.div>
                        </div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* BANKER SIDE */}
              <div className="flex flex-col items-center">
                <span className="text-[#ef4444] font-black text-xs md:text-sm tracking-widest uppercase mb-1.5 md:mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  BANKER
                </span>
                <div className="flex items-center gap-1.5 md:gap-2.5">
                  <AnimatePresence>
                    {bankerCards.map((card, index) => {
                      if (!card.isDealt) return null;
                      const isThird = index === 2;
                      return (
                        /* For the 3rd card, outer container uses rotated dimensions so layout stays intact */
                        <div
                          key={`b-card-${index}`}
                          style={isThird
                            ? { width: 66, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }
                            : {}}
                        >
                          <motion.div
                            initial={{ x: 100, y: -250, rotate: 45, scale: 0.2, opacity: 0 }}
                            animate={{ x: 0, y: 0, rotate: isThird ? 90 : 0, scale: 1, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                            className="perspective relative"
                            style={{ width: 44, height: 66 }}
                          >
                            <motion.div
                              animate={{ rotateY: card.isFlipped ? 180 : 0 }}
                              transition={{ duration: 0.4, ease: 'easeInOut' }}
                              className="w-full h-full preserve-3d relative"
                            >
                              {/* Card Back */}
                              <div className="absolute inset-0 bg-gradient-to-br from-red-800 to-red-950 rounded border-2 border-white/90 shadow-xl flex items-center justify-center backface-hidden">
                                <div className="w-full h-full border border-red-600/30 rounded flex items-center justify-center">
                                  <span className="text-white/20 text-[8px] font-black tracking-widest rotate-45">BETLOG</span>
                                </div>
                              </div>
                              {/* Card Front */}
                              <div className="absolute inset-0 bg-white rounded border border-zinc-300 shadow-xl flex flex-col justify-between p-1.5 select-none rotate-y-180 backface-hidden">
                                <div className="text-xs font-bold leading-none text-black">{card.value}</div>
                                <div className={`text-sm self-center leading-none ${card.color}`}>{card.suit}</div>
                                <div className="text-xs font-bold leading-none self-end rotate-180 text-black">{card.value}</div>
                              </div>
                            </motion.div>
                          </motion.div>
                        </div>
                      );
                    })}
                  </AnimatePresence>

                  {/* Score Badge (Only visible when at least one card is flipped) */}
                  {bankerCards.some(c => c.isFlipped) && (
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#7f1d1d] border border-[#f87171] text-white font-black text-[11px] md:text-xs flex items-center justify-center shadow-lg">
                      {calculateScore(bankerCards)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Evolution-Style 5-Column Betting Panel ────────────────────────── */}
          <div className="rounded-xl overflow-hidden border border-[#1c2030] shadow-2xl mt-0">
            <div className="grid min-h-[148px] md:min-h-[186px]" style={{ gridTemplateColumns: betGridCols }}>

              {/* ── LEFT SIDE BETS ─────────────────────────────────────── */}
              <div className="flex flex-col bg-[#0c0e15] border-r border-[#1c2030] divide-y divide-[#1c2030]">
                {/* Perfect Pair */}
                <button
                  id="bet-perfectPair"
                  onClick={() => handlePlaceBet('perfectPair')}
                  onDragOver={(e) => handleDragOver(e, 'perfectPair')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'perfectPair')}
                  disabled={!isBettingOpen}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 px-1.5 py-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${winSideBets.has('perfectPair') && winPayoutPulse ? 'winning-glow-pulse bg-[#1a1200]' : 'hover:bg-[#141820]'} ${activeDragOver === 'perfectPair' ? 'drag-over-active' : ''}`}
                >
                  <span className="text-[9px] font-black text-zinc-300 uppercase tracking-wide leading-tight text-center">PERFECT<br/>PAIR</span>
                  <span className="text-[10px] font-bold text-amber-400 mt-0.5">25:1</span>
                  {betAmounts.perfectPair > 0 && <BetChipStack amount={betAmounts.perfectPair} size={24} />}
                </button>
                {/* Player Bonus */}
                <button
                  id="bet-playerBonus"
                  onClick={() => handlePlaceBet('playerBonus')}
                  onDragOver={(e) => handleDragOver(e, 'playerBonus')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'playerBonus')}
                  disabled={!isBettingOpen}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 px-1.5 py-1.5 hover:bg-[#141820] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${activeDragOver === 'playerBonus' ? 'drag-over-active' : ''}`}
                >
                  <span className="text-[9px] font-black text-zinc-300 uppercase tracking-wide leading-tight text-center">PLAYER<br/>BONUS</span>
                  {betAmounts.playerBonus > 0 && <BetChipStack amount={betAmounts.playerBonus} size={24} />}
                </button>
                {/* Player Pair */}
                <button
                  id="bet-playerPair"
                  onClick={() => handlePlaceBet('playerPair')}
                  onDragOver={(e) => handleDragOver(e, 'playerPair')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'playerPair')}
                  disabled={!isBettingOpen}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 px-1.5 py-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${winSideBets.has('playerPair') && winPayoutPulse ? 'winning-glow-pulse bg-[#0a0f1e]' : 'hover:bg-[#141820]'} ${activeDragOver === 'playerPair' ? 'drag-over-active' : ''}`}
                >
                  <span className="text-[9px] font-black text-zinc-300 uppercase tracking-wide leading-tight text-center">PLAYER<br/>PAIR</span>
                  <span className="text-[10px] font-bold text-amber-400 mt-0.5">11:1</span>
                  {betAmounts.playerPair > 0 && <BetChipStack amount={betAmounts.playerPair} size={24} />}
                </button>
              </div>

              {/* ── PLAYER MAIN BET ─────────────────────────────────────── */}
              <button
                id="bet-player"
                onClick={() => handlePlaceBet('player')}
                onDragOver={(e) => handleDragOver(e, 'player')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'player')}
                disabled={!isBettingOpen}
                className={`relative flex flex-col items-start justify-between p-3 md:p-4 border-r border-[#1c2030] transition-all duration-200 cursor-pointer disabled:cursor-not-allowed overflow-hidden ${
                  winArea === 'player' && winPayoutPulse
                    ? 'winning-glow-pulse bg-[#0b1828]'
                    : betAmounts.player > 0
                    ? 'bg-[#0a1628] shadow-[inset_0_0_20px_rgba(56,189,248,0.06)]'
                    : isBettingOpen
                    ? 'bg-[#080e1c] hover:bg-[#0a1628]'
                    : 'bg-[#070c18] opacity-60'
                } ${activeDragOver === 'player' ? 'drag-over-active' : ''}`}
              >
                {/* Chinese watermark */}
                <span className="absolute right-2 bottom-1 text-[52px] md:text-[64px] font-black text-blue-900/20 select-none leading-none pointer-events-none">闲</span>
                {/* Top row: label + bet badge */}
                <div className="flex items-start justify-between w-full z-10">
                  <div>
                    <span className="text-[11px] md:text-xs font-black text-[#38bdf8] uppercase tracking-widest block">PLAYER</span>
                    <span className="text-[9px] text-zinc-500 font-semibold">1:1 even money</span>
                  </div>
                  {betAmounts.player > 0 && (
                    <BetChipStack amount={betAmounts.player} size={30} />
                  )}
                </div>
                {/* Bottom: distribution bar */}
                <div className="w-full z-10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-zinc-600">{totalMainBets > 0 ? `${playerPct}%` : '—'}</span>
                  </div>
                  <div className="w-full h-1 bg-[#0d1726] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#38bdf8] to-[#0284c7] rounded-full transition-all duration-700" style={{ width: `${playerPct}%` }} />
                  </div>
                </div>
              </button>

              {/* ── TIE CENTER ──────────────────────────────────────────── */}
              <button
                id="bet-tie"
                onClick={() => handlePlaceBet('tie')}
                onDragOver={(e) => handleDragOver(e, 'tie')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'tie')}
                disabled={!isBettingOpen}
                className={`relative flex flex-col items-center justify-between p-2 md:p-3 border-r border-[#1c2030] transition-all duration-200 cursor-pointer disabled:cursor-not-allowed overflow-hidden ${
                  winArea === 'tie' && winPayoutPulse
                    ? 'winning-glow-pulse bg-[#061410]'
                    : betAmounts.tie > 0
                    ? 'bg-[#071410] shadow-[inset_0_0_20px_rgba(34,197,94,0.06)]'
                    : isBettingOpen
                    ? 'bg-[#050e09] hover:bg-[#071410]'
                    : 'bg-[#040b07] opacity-60'
                } ${activeDragOver === 'tie' ? 'drag-over-active' : ''}`}
              >
                <span className="absolute inset-0 flex items-center justify-center text-[52px] md:text-[62px] font-black text-green-900/15 select-none pointer-events-none">和</span>
                <div className="z-10 text-center">
                  <span className="text-[10px] md:text-[11px] font-black text-[#22c55e] uppercase tracking-widest block">TIE</span>
                  <span className="text-[9px] text-zinc-500 font-semibold">9:1</span>
                </div>
                {betAmounts.tie > 0 && (
                  <div className="z-10">
                    <BetChipStack amount={betAmounts.tie} size={30} />
                  </div>
                )}
                <div className="w-full z-10">
                  <div className="flex justify-center mb-1">
                    <span className="text-[9px] text-zinc-600">{totalMainBets > 0 ? `${tiePct}%` : '—'}</span>
                  </div>
                  <div className="w-full h-1 bg-[#061210] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] rounded-full transition-all duration-700" style={{ width: `${tiePct}%` }} />
                  </div>
                </div>
              </button>

              {/* ── BANKER MAIN BET ─────────────────────────────────────── */}
              <button
                id="bet-banker"
                onClick={() => handlePlaceBet('banker')}
                onDragOver={(e) => handleDragOver(e, 'banker')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'banker')}
                disabled={!isBettingOpen}
                className={`relative flex flex-col items-end justify-between p-3 md:p-4 border-r border-[#1c2030] transition-all duration-200 cursor-pointer disabled:cursor-not-allowed overflow-hidden ${
                  winArea === 'banker' && winPayoutPulse
                    ? 'winning-glow-pulse bg-[#1c0709]'
                    : betAmounts.banker > 0
                    ? 'bg-[#190608] shadow-[inset_0_0_20px_rgba(239,68,68,0.06)]'
                    : isBettingOpen
                    ? 'bg-[#130407] hover:bg-[#190608]'
                    : 'bg-[#0f0306] opacity-60'
                } ${activeDragOver === 'banker' ? 'drag-over-active' : ''}`}
              >
                {/* Chinese watermark */}
                <span className="absolute left-2 bottom-1 text-[52px] md:text-[64px] font-black text-red-900/20 select-none leading-none pointer-events-none">庄</span>
                {/* Top row: bet badge + label */}
                <div className="flex items-start justify-between w-full z-10">
                  {betAmounts.banker > 0 && (
                    <BetChipStack amount={betAmounts.banker} size={30} />
                  )}
                  <div className="text-right ml-auto">
                    <span className="text-[11px] md:text-xs font-black text-[#ef4444] uppercase tracking-widest block">BANKER</span>
                    <span className="text-[9px] text-zinc-500 font-semibold">0.95:1</span>
                  </div>
                </div>
                {/* Bottom: distribution bar */}
                <div className="w-full z-10">
                  <div className="flex items-center justify-end mb-1">
                    <span className="text-[9px] text-zinc-600">{totalMainBets > 0 ? `${bankerPct}%` : '—'}</span>
                  </div>
                  <div className="w-full h-1 bg-[#1a0608] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#ef4444] to-[#b91c1c] rounded-full transition-all duration-700" style={{ width: `${bankerPct}%` }} />
                  </div>
                </div>
              </button>

              {/* ── RIGHT SIDE BETS ─────────────────────────────────────── */}
              <div className="flex flex-col bg-[#0c0e15] divide-y divide-[#1c2030]">
                {/* Either Pair */}
                <button
                  id="bet-eitherPair"
                  onClick={() => handlePlaceBet('eitherPair')}
                  onDragOver={(e) => handleDragOver(e, 'eitherPair')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'eitherPair')}
                  disabled={!isBettingOpen}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 px-1.5 py-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${winSideBets.has('eitherPair') && winPayoutPulse ? 'winning-glow-pulse bg-[#1a1200]' : 'hover:bg-[#141820]'} ${activeDragOver === 'eitherPair' ? 'drag-over-active' : ''}`}
                >
                  <span className="text-[9px] font-black text-zinc-300 uppercase tracking-wide leading-tight text-center">EITHER<br/>PAIR</span>
                  <span className="text-[10px] font-bold text-amber-400 mt-0.5">5:1</span>
                  {betAmounts.eitherPair > 0 && <BetChipStack amount={betAmounts.eitherPair} size={24} />}
                </button>
                {/* Banker Bonus */}
                <button
                  id="bet-bankerBonus"
                  onClick={() => handlePlaceBet('bankerBonus')}
                  onDragOver={(e) => handleDragOver(e, 'bankerBonus')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'bankerBonus')}
                  disabled={!isBettingOpen}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 px-1.5 py-1.5 hover:bg-[#141820] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${activeDragOver === 'bankerBonus' ? 'drag-over-active' : ''}`}
                >
                  <span className="text-[9px] font-black text-zinc-300 uppercase tracking-wide leading-tight text-center">BANKER<br/>BONUS</span>
                  {betAmounts.bankerBonus > 0 && <BetChipStack amount={betAmounts.bankerBonus} size={24} />}
                </button>
                {/* Banker Pair */}
                <button
                  id="bet-bankerPair"
                  onClick={() => handlePlaceBet('bankerPair')}
                  onDragOver={(e) => handleDragOver(e, 'bankerPair')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'bankerPair')}
                  disabled={!isBettingOpen}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 px-1.5 py-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${winSideBets.has('bankerPair') && winPayoutPulse ? 'winning-glow-pulse bg-[#1a0608]' : 'hover:bg-[#141820]'} ${activeDragOver === 'bankerPair' ? 'drag-over-active' : ''}`}
                >
                  <span className="text-[9px] font-black text-zinc-300 uppercase tracking-wide leading-tight text-center">BANKER<br/>PAIR</span>
                  <span className="text-[10px] font-bold text-amber-400 mt-0.5">11:1</span>
                  {betAmounts.bankerPair > 0 && <BetChipStack amount={betAmounts.bankerPair} size={24} />}
                </button>
              </div>

            </div>
          </div>

          {/* ── Pill Chip Tray ─────────────────────────────────────────────────── */}
          <div className="flex items-center gap-1 md:gap-2 bg-[#08090e] border border-[#1c2030] rounded-2xl px-2 md:px-3 py-2 shadow-2xl mt-2 overflow-x-auto">
            {/* Balance + Total Bet */}
            <div className="hidden sm:flex flex-col items-start shrink-0">
              <span className="text-[8px] text-zinc-600 uppercase tracking-wider font-semibold">Balance</span>
              <span className="text-amber-400 font-extrabold text-[11px] md:text-sm tracking-wide leading-tight">
                ₱{displayedBalance.toLocaleString()}
              </span>
            </div>
            <div className="hidden sm:flex flex-col items-start shrink-0 border-l border-zinc-800/60 pl-2">
              <span className="text-[8px] text-zinc-600 uppercase tracking-wider font-semibold">Total Bet</span>
              <span className={`font-extrabold text-[11px] md:text-sm leading-tight transition-colors ${totalBet > 0 ? 'text-white' : 'text-zinc-600'}`}>
                ₱{totalBet.toLocaleString()}
              </span>
            </div>

            {/* Undo button */}
            <button
              id="btn-undo"
              onClick={handleUndoBet}
              disabled={betHistory.length === 0}
              title="Undo last bet"
              className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#141720] border border-[#252c3f] flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 disabled:opacity-25 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 md:w-3.5 md:h-3.5" />
            </button>

            {/* Chips row — PokerChip SVG components, size responds to screen width */}
            <div className="flex items-end gap-0.5 md:gap-1.5 flex-1 justify-center">
              {chips.map((chip) => (
                <PokerChip
                  key={chip.value}
                  value={chip.value}
                  label={chip.label}
                  isSelected={selectedChip === chip.value}
                  size={chipSize}
                  disabled={!isBettingOpen && false /* always selectable */}
                  onClick={() => setSelectedChip(chip.value)}
                  draggable={isBettingOpen}
                  onDragStart={(e) => handleDragStart(e, chip.value)}
                />
              ))}
            </div>

            {/* Double ×2 */}
            <button
              id="btn-double"
              onClick={() => {
                if (!isBettingOpen) return;
                const mainTotal = betAmounts.player + betAmounts.tie + betAmounts.banker;
                if (balance < mainTotal) { showToast('Insufficient balance to double!', 'error'); return; }
                playSfx('CHIP_STACK');
                setBalance(prev => prev - mainTotal);
                setBetAmounts(prev => ({
                  ...prev,
                  player: prev.player * 2,
                  tie:    prev.tie    * 2,
                  banker: prev.banker * 2,
                }));
              }}
              className="hidden sm:flex w-8 h-8 md:w-9 md:h-9 items-center justify-center rounded-full bg-[#141720] border border-[#252c3f] text-zinc-300 hover:text-white hover:border-zinc-500 text-[10px] font-black transition-all shrink-0 cursor-pointer"
              title="Double main bets"
            >
              ×2
            </button>

            {/* Clear button */}
            <button
              id="btn-clear"
              onClick={handleClearBets}
              title="Clear all bets"
              className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#141720] border border-[#252c3f] flex items-center justify-center text-zinc-400 hover:text-red-400 hover:border-red-900/60 transition-all shrink-0 cursor-pointer"
            >
              <X className="w-3 h-3 md:w-3.5 md:h-3.5" />
            </button>

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
                className={`text-xs md:text-sm font-bold tracking-wide relative pb-2 transition-colors cursor-pointer ${
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
                className={`text-xs md:text-sm font-bold tracking-wide relative pb-2 transition-colors cursor-pointer ${
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
                {roadmap.slice().reverse().map((item, index) => {
                  const originalIdx = roadmap.length - 1 - index;
                  return (
                    <div key={originalIdx} className="flex justify-between py-0.5 animate-in slide-in-from-top-1 duration-200">
                      <span>#R0{originalIdx + 1021}</span>
                      <span className={item.t === 'P' ? 'text-[#2563eb] font-bold' : item.t === 'B' ? 'text-[#dc2626] font-bold' : 'text-[#16a34a] font-bold'}>
                        {item.t === 'P' ? 'Player' : item.t === 'B' ? 'Banker' : 'Tie'}
                      </span>
                      <span>{item.t === 'T' ? '8:1' : '1:1'}</span>
                    </div>
                  );
                })}
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
        <button onClick={onOpenParlays} className="flex flex-col items-center gap-1 text-zinc-500 hover:text-zinc-300 cursor-pointer">
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
