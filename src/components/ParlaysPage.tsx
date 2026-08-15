import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Share2,
  Home,
  Gamepad2,
  Tv,
  Dices,
  User,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  AlertTriangle,
  History,
  TrendingUp,
  Award
} from 'lucide-react';

interface ParlaysPageProps {
  onBackToHome: () => void;
  onOpenBaccarat: () => void;
}

interface MatchLeg {
  matchId: string;
  sportOrEsport: 'sports' | 'dota';
  matchName: string;
  team: string;
  odds: number;
  market: string;
}

export const ParlaysPage: React.FC<ParlaysPageProps> = ({ onBackToHome, onOpenBaccarat }) => {
  const [activeSubTab, setActiveSubTab] = useState<'Home' | 'Sports' | 'Dota 2' | 'My Parlays' | 'Results'>('Home');
  const [sportsFilter, setSportsFilter] = useState<'All' | 'Soccer' | 'Basketball'>('All');

  // Loading states
  const [loadingSports, setLoadingSports] = useState(false);
  const [loadingDota, setLoadingDota] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Match Lists from Express Backend API
  const [sportsMatches, setSportsMatches] = useState<any[]>([]);
  const [dotaMatches, setDotaMatches] = useState<any[]>([]);
  const [parlayHistory, setParlayHistory] = useState<any[]>([]);

  // Selected Parlay Legs
  const [selectedLegs, setSelectedLegs] = useState<MatchLeg[]>([]);
  const [wager, setWager] = useState<number>(500);

  // Backend response calculations
  const [backendOdds, setBackendOdds] = useState<number>(1);
  const [backendPayout, setBackendPayout] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);

  // Success Slip Modal
  const [showSlipSuccess, setShowSlipSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch Sports Matches from Local Express API
  const fetchSportsMatches = async () => {
    setLoadingSports(true);
    try {
      const res = await fetch('http://localhost:3001/api/sports/matches');
      if (res.ok) {
        const data = await res.json();
        setSportsMatches(data.matches || []);
      }
    } catch (err) {
      console.error('Failed to fetch sports matches:', err);
    } finally {
      setLoadingSports(false);
    }
  };

  // Fetch Dota 2 Matches from Local Express API
  const fetchDotaMatches = async () => {
    setLoadingDota(true);
    try {
      const res = await fetch('http://localhost:3001/api/dota/matches');
      if (res.ok) {
        const data = await res.json();
        setDotaMatches(data.matches || []);
      }
    } catch (err) {
      console.error('Failed to fetch dota matches:', err);
    } finally {
      setLoadingDota(false);
    }
  };

  // Fetch Parlay History from Local Express API
  const fetchParlayHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('http://localhost:3001/api/parlay/history?userId=temp_anonymous_user');
      if (res.ok) {
        const data = await res.json();
        setParlayHistory(data.parlays || []);
      }
    } catch (err) {
      console.error('Failed to fetch parlay history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Run initial fetches
  useEffect(() => {
    fetchSportsMatches();
    fetchDotaMatches();
    fetchParlayHistory();
  }, []);

  // Recalculate combined parlay odds on backend whenever legs or wager change
  useEffect(() => {
    if (selectedLegs.length === 0) {
      setBackendOdds(1);
      setBackendPayout(0);
      return;
    }

    const calculateParlay = async () => {
      setIsCalculating(true);
      try {
        const res = await fetch('http://localhost:3001/api/parlay/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stake: wager,
            legs: selectedLegs.map(leg => ({
              matchId: leg.matchId,
              team: leg.team,
              odds: leg.odds
            }))
          })
        });

        if (res.ok) {
          const data = await res.json();
          setBackendOdds(data.combinedOdds);
          setBackendPayout(data.potentialPayout);
        }
      } catch (err) {
        console.error('Error calculating parlay odds:', err);
        // Fallback to client-side multiplication on request error
        const localOdds = selectedLegs.reduce((acc, leg) => acc * leg.odds, 1);
        setBackendOdds(Math.round(localOdds * 100) / 100);
        setBackendPayout(Math.round(wager * localOdds * 100) / 100);
      } finally {
        setIsCalculating(false);
      }
    };

    const timeout = setTimeout(calculateParlay, 250);
    return () => clearTimeout(timeout);
  }, [selectedLegs, wager]);

  // Toggle selection handler
  const handleToggleLeg = (
    matchId: string,
    sportOrEsport: 'sports' | 'dota',
    matchName: string,
    team: string,
    odds: number,
    market: string
  ) => {
    setSelectedLegs((prev) => {
      // Find if we already have a selection for this matchId
      const existsIndex = prev.findIndex(leg => leg.matchId === matchId);
      
      if (existsIndex >= 0) {
        const existing = prev[existsIndex];
        if (existing.team === team) {
          // Deselect if same team clicked again
          return prev.filter((_, idx) => idx !== existsIndex);
        } else {
          // Switch team selection on same match
          const copy = [...prev];
          copy[existsIndex] = { matchId, sportOrEsport, matchName, team, odds, market };
          return copy;
        }
      } else {
        // Add new selection leg
        return [...prev, { matchId, sportOrEsport, matchName, team, odds, market }];
      }
    });
  };

  const handleClearAll = () => {
    setSelectedLegs([]);
  };

  const handleLockInParlay = async () => {
    if (selectedLegs.length === 0) return;

    try {
      const res = await fetch('http://localhost:3001/api/parlay/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'temp_anonymous_user',
          stake: wager,
          combinedOdds: backendOdds,
          potentialPayout: backendPayout,
          legs: selectedLegs.map(leg => ({
            matchId: leg.matchId,
            team: leg.team,
            odds: leg.odds
          }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMessage(data.message || 'Parlay bet placed successfully!');
        setShowSlipSuccess(true);
        setSelectedLegs([]);
        fetchParlayHistory();
      }
    } catch (err) {
      console.error('Failed to save parlay bet:', err);
      setSuccessMessage('Local simulated parlay slip generated successfully!');
      setShowSlipSuccess(true);
      setSelectedLegs([]);
    }
  };

  // Filtered sports matches based on soccer/basketball toggles
  const filteredSports = useMemo(() => {
    if (sportsFilter === 'All') return sportsMatches;
    return sportsMatches.filter(m => m.sport?.toLowerCase() === sportsFilter.toLowerCase());
  }, [sportsMatches, sportsFilter]);

  return (
    <div className="min-h-screen bg-[#090b0e] text-white flex flex-col font-sans relative pb-28 select-none">
      
      {/* ── Header ── */}
      <header className="px-4 py-4 flex items-center justify-between border-b border-zinc-900 bg-[#090b0e] sticky top-0 z-40">
        <button
          onClick={onBackToHome}
          className="flex items-center justify-center p-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-white font-extrabold text-lg tracking-wide uppercase">BETLOG</span>
          <span className="w-2 h-2 rounded-full bg-amber-400" />
        </div>

        <h1 className="text-sm font-black tracking-wide text-zinc-400 bg-zinc-900/50 px-3 py-1 rounded-full uppercase">
          Parlay Simulator
        </h1>

        <button className="flex items-center justify-center p-2 rounded-lg bg-zinc-900/60 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer">
          <Share2 className="w-5 h-5" />
        </button>
      </header>

      {/* ── Sub Navigation Tabs ── */}
      <div className="w-full border-b border-zinc-900 bg-[#090b0e] px-4 py-2 sticky top-[61px] z-30 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center justify-center gap-6 max-w-md mx-auto">
          {(['Home', 'Sports', 'Dota 2', 'My Parlays', 'Results'] as const).map((tab) => {
            const isActive = activeSubTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`py-1 text-xs font-black tracking-widest uppercase transition-all cursor-pointer relative ${
                  isActive ? 'text-amber-400 border-b-2 border-amber-400 pb-1' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main View Switcher ── */}
      <main className={`flex-1 max-w-md w-full mx-auto px-4 py-6 flex flex-col gap-4 ${
        selectedLegs.length > 0 ? 'pb-56' : 'pb-24'
      }`}>
        
        {/* ─── TAB: HOME ────────────────────────────────────────────────────── */}
        {activeSubTab === 'Home' && (
          <div className="flex flex-col gap-5">
            {/* Quick Hero */}
            <div className="relative rounded-2xl overflow-hidden border border-zinc-900 bg-gradient-to-br from-[#121824] to-[#0b0e14] p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                  No-Risk Wager
                </span>
                <span className="text-zinc-600 text-xs font-semibold">Virtual Play</span>
              </div>
              <h2 className="text-xl font-black mt-3 text-zinc-100 uppercase tracking-tight">
                Simulated <span className="text-amber-400">Parlay Arena</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Build combined bet slips using dynamic odds calculated from live team data. No deposit required.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-zinc-800/40">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 uppercase font-black">Online Players</span>
                  <span className="text-sm font-black text-white flex items-center gap-1.5 mt-0.5">
                    1,248 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 uppercase font-black">Top Payout Today</span>
                  <span className="text-sm font-black text-amber-400 mt-0.5">₱24,560 CR</span>
                </div>
              </div>
            </div>

            {/* Quick Navigation Quick Links */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">Select Category</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveSubTab('Sports')}
                  className="bg-[#14161e] border border-zinc-900 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-amber-400/20 transition-all cursor-pointer shadow"
                >
                  <Dices className="w-6 h-6 text-amber-400" />
                  <span className="text-xs font-black uppercase text-zinc-200">Sports Book</span>
                </button>
                <button
                  onClick={() => setActiveSubTab('Dota 2')}
                  className="bg-[#14161e] border border-zinc-900 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-amber-400/20 transition-all cursor-pointer shadow"
                >
                  <Gamepad2 className="w-6 h-6 text-amber-400" />
                  <span className="text-xs font-black uppercase text-zinc-200">Dota 2 Esports</span>
                </button>
              </div>
            </div>

            {/* Play Safely disclaimer */}
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-4 flex gap-3 items-start">
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-black text-zinc-300 uppercase">Virtual Sandbox Mode</span>
                <span className="text-[10px] text-zinc-500 leading-relaxed">
                  This system operates purely for entertainment. Simulated payout credits do not hold monetary value.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: SPORTS ──────────────────────────────────────────────────── */}
        {activeSubTab === 'Sports' && (
          <div className="flex flex-col gap-4">
            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              {(['All', 'Soccer', 'Basketball'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setSportsFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                    sportsFilter === f
                      ? 'bg-amber-400 border-amber-400 text-black'
                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {loadingSports ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <span className="text-xs animate-pulse">Loading fixtures from TheSportsDB...</span>
              </div>
            ) : filteredSports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
                <span className="text-xs">No upcoming matches available</span>
              </div>
            ) : (
              filteredSports.map((match) => {
                const selected = selectedLegs.find(leg => leg.matchId === match.id);
                return (
                  <div
                    key={match.id}
                    className="bg-[#14161e] border border-zinc-900/80 rounded-2xl p-4 flex flex-col gap-3 shadow-lg"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                        {match.sport}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Team names */}
                    <div className="text-sm font-extrabold tracking-wide text-zinc-200 flex items-center justify-between">
                      <span className={selected?.team === match.home_team ? 'text-amber-400' : 'text-zinc-200'}>
                        {match.home_team}
                      </span>
                      <span className="text-zinc-500 text-xs px-2">vs</span>
                      <span className={selected?.team === match.away_team ? 'text-amber-400' : 'text-zinc-200'}>
                        {match.away_team}
                      </span>
                    </div>

                    {/* Odds Options */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                      {/* Home */}
                      <button
                        onClick={() => handleToggleLeg(
                          match.id,
                          'sports',
                          `${match.home_team} vs ${match.away_team}`,
                          match.home_team,
                          match.generated_odds?.home || 1.80,
                          'Moneyline'
                        )}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                          selected?.team === match.home_team
                            ? 'bg-amber-400 border-amber-400 text-black font-black'
                            : 'bg-[#181a24] border-zinc-900 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <span className="text-[9px] uppercase tracking-wide opacity-75">Home</span>
                        <span className="text-xs font-black">{(match.generated_odds?.home || 1.80).toFixed(2)}</span>
                      </button>

                      {/* Draw (soccer only) */}
                      {match.generated_odds?.draw ? (
                        <button
                          onClick={() => handleToggleLeg(
                            match.id,
                            'sports',
                            `${match.home_team} vs ${match.away_team}`,
                            'Draw',
                            match.generated_odds.draw,
                            'Moneyline'
                          )}
                          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                            selected?.team === 'Draw'
                              ? 'bg-amber-400 border-amber-400 text-black font-black'
                              : 'bg-[#181a24] border-zinc-900 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <span className="text-[9px] uppercase tracking-wide opacity-75">Draw</span>
                          <span className="text-xs font-black">{match.generated_odds.draw.toFixed(2)}</span>
                        </button>
                      ) : null}

                      {/* Away */}
                      <button
                        onClick={() => handleToggleLeg(
                          match.id,
                          'sports',
                          `${match.home_team} vs ${match.away_team}`,
                          match.away_team,
                          match.generated_odds?.away || 2.00,
                          'Moneyline'
                        )}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                          selected?.team === match.away_team
                            ? 'bg-amber-400 border-amber-400 text-black font-black'
                            : 'bg-[#181a24] border-zinc-900 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <span className="text-[9px] uppercase tracking-wide opacity-75">Away</span>
                        <span className="text-xs font-black">{(match.generated_odds?.away || 2.00).toFixed(2)}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ─── TAB: DOTA 2 ──────────────────────────────────────────────────── */}
        {activeSubTab === 'Dota 2' && (
          <div className="flex flex-col gap-4">
            {loadingDota ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <span className="text-xs animate-pulse">Loading pro matches from OpenDota...</span>
              </div>
            ) : dotaMatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
                <span className="text-xs">No pro Dota 2 matches available</span>
              </div>
            ) : (
              dotaMatches.map((match) => {
                const selected = selectedLegs.find(leg => leg.matchId === match.id);
                return (
                  <div
                    key={match.id}
                    className="bg-[#14161e] border border-zinc-900/80 rounded-2xl p-4 flex flex-col gap-3 shadow-lg"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10">
                        {match.tournament || 'Dota 2'}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Team names */}
                    <div className="text-sm font-extrabold tracking-wide text-zinc-200 flex items-center justify-between">
                      <span className={selected?.team === match.radiant ? 'text-amber-400' : 'text-zinc-200'}>
                        {match.radiant}
                      </span>
                      <span className="text-zinc-500 text-xs px-2">vs</span>
                      <span className={selected?.team === match.dire ? 'text-amber-400' : 'text-zinc-200'}>
                        {match.dire}
                      </span>
                    </div>

                    {/* Odds Options */}
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      {/* Radiant */}
                      <button
                        onClick={() => handleToggleLeg(
                          match.id,
                          'dota',
                          `${match.radiant} vs ${match.dire}`,
                          match.radiant,
                          match.generated_odds?.radiant || 1.85,
                          'Winner'
                        )}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                          selected?.team === match.radiant
                            ? 'bg-amber-400 border-amber-400 text-black font-black'
                            : 'bg-[#181a24] border-zinc-900 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <span className="text-[9px] uppercase tracking-wide opacity-75">Radiant</span>
                        <span className="text-xs font-black">{(match.generated_odds?.radiant || 1.85).toFixed(2)}</span>
                      </button>

                      {/* Dire */}
                      <button
                        onClick={() => handleToggleLeg(
                          match.id,
                          'dota',
                          `${match.radiant} vs ${match.dire}`,
                          match.dire,
                          match.generated_odds?.dire || 1.85,
                          'Winner'
                        )}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                          selected?.team === match.dire
                            ? 'bg-amber-400 border-amber-400 text-black font-black'
                            : 'bg-[#181a24] border-zinc-900 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <span className="text-[9px] uppercase tracking-wide opacity-75">Dire</span>
                        <span className="text-xs font-black">{(match.generated_odds?.dire || 1.85).toFixed(2)}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ─── TAB: MY PARLAYS ──────────────────────────────────────────────── */}
        {activeSubTab === 'My Parlays' && (
          <div className="flex flex-col gap-4">
            {loadingHistory ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <span className="text-xs animate-pulse">Loading parlay history...</span>
              </div>
            ) : parlayHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                <History className="w-8 h-8 text-zinc-700 mb-2" />
                <span className="text-xs font-black uppercase text-zinc-400">No Bets Placed Yet</span>
                <span className="text-[10px] text-zinc-600 mt-1 max-w-[200px]">
                  Picks selected in Sports and Dota 2 tabs will show up here after placement.
                </span>
              </div>
            ) : (
              parlayHistory.map((parlay) => (
                <div
                  key={parlay.id}
                  className="bg-[#14161e] border border-zinc-900 rounded-2xl p-4 flex flex-col gap-3 shadow"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-zinc-500 font-bold">
                      {new Date(parlay.created_at).toLocaleDateString()} {new Date(parlay.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      parlay.status === 'Won' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      parlay.status === 'Lost' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {parlay.status}
                    </span>
                  </div>

                  {/* Legs summary list */}
                  <div className="flex flex-col gap-2 pt-1 border-t border-zinc-800/40">
                    {parlay.parlay_legs?.map((leg: any) => (
                      <div key={leg.id} className="flex justify-between items-center text-xs">
                        <div className="flex flex-col">
                          <span className="font-semibold text-zinc-500 text-[10px]">Leg</span>
                          <span className="font-black text-zinc-300">{leg.selection}</span>
                        </div>
                        <span className="font-black text-amber-400">@{Number(leg.odds).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bets payout footer */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-800/40 text-center">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-zinc-500 font-bold">WAGER</span>
                      <span className="text-xs font-black text-zinc-300">₱{parlay.stake}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-zinc-500 font-bold">ODDS</span>
                      <span className="text-xs font-black text-zinc-300">{(parlay.combined_odds || parlay.combinedOdds || 1).toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-zinc-500 font-bold">POTENTIAL WIN</span>
                      <span className="text-xs font-black text-amber-400">₱{(parlay.potential_payout || parlay.potentialPayout || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ─── TAB: RESULTS ─────────────────────────────────────────────────── */}
        {activeSubTab === 'Results' && (
          <div className="flex flex-col gap-4 text-center py-10 text-zinc-500">
            <Award className="w-10 h-10 text-amber-400/30 mx-auto mb-2" />
            <span className="text-xs font-black uppercase text-zinc-400">Simulated Results Feed</span>
            <span className="text-[10px] text-zinc-600 mt-1 max-w-xs mx-auto">
              Simulated results are updated after matches are marked completed in the background server. Check back shortly.
            </span>
          </div>
        )}

      </main>

      {/* ── Footer Parlay Builder Sticky Bar ── */}
      {selectedLegs.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-40 bg-[#090b0e]/95 border-t border-zinc-900 px-4 py-3.5 backdrop-blur-md shadow-2xl">
          <div className="max-w-md mx-auto flex flex-col gap-3">
            {/* Selected stats */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                {selectedLegs.length} Multi-Leg Parlay
              </span>
              <button
                onClick={handleClearAll}
                className="text-zinc-400 hover:text-red-400 font-bold transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Odds & Calculations */}
            <div className="grid grid-cols-12 items-center gap-3 bg-[#14161e] border border-zinc-900 p-3 rounded-xl">
              {/* Odds */}
              <div className="col-span-3 flex flex-col justify-center">
                <span className="text-[10px] text-zinc-500 uppercase font-black">Odds</span>
                <span className="text-sm font-black text-white">
                  {isCalculating ? '...' : backendOdds.toFixed(2)}
                </span>
              </div>

              {/* Custom Wager Input */}
              <div className="col-span-4 flex flex-col justify-center">
                <span className="text-[10px] text-zinc-500 uppercase font-black">Stake</span>
                <div className="flex items-center gap-0.5 mt-0.5">
                  <span className="text-xs font-bold text-zinc-500">₱</span>
                  <input
                    type="number"
                    value={wager}
                    onChange={(e) => setWager(Math.max(1, parseInt(e.target.value, 10) || 0))}
                    className="w-full bg-transparent border-b border-zinc-800 text-sm font-black text-white focus:outline-none focus:border-amber-400 p-0"
                  />
                </div>
              </div>

              {/* Potential Win */}
              <div className="col-span-5 flex flex-col justify-center text-right">
                <span className="text-[10px] text-zinc-500 uppercase font-black">Payout</span>
                <span className="text-xs sm:text-sm font-black text-amber-400">
                  ₱{backendPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Build Parlay Action */}
            <button
              onClick={handleLockInParlay}
              className="w-full bg-amber-400 hover:bg-amber-500 active:scale-[0.99] text-black font-extrabold text-xs sm:text-sm py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-[0_4px_16px_rgba(245,186,21,0.2)] cursor-pointer"
            >
              BUILD PARLAY
            </button>
          </div>
        </div>
      )}

      {/* ── Bottom Mobile Tab Bar ── */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#090b0e] border-t border-zinc-900/80 px-4 py-2 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="flex flex-col items-center gap-1 py-1 px-3 text-zinc-500 hover:text-white transition-all cursor-pointer"
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-bold">Home</span>
          </button>
          <button
            onClick={onBackToHome}
            className="flex flex-col items-center gap-1 py-1 px-3 text-zinc-500 hover:text-white transition-all cursor-pointer"
          >
            <Gamepad2 className="w-5 h-5" />
            <span className="text-[9px] font-bold">Games</span>
          </button>
          <button
            onClick={onOpenBaccarat}
            className="flex flex-col items-center gap-1 py-1 px-3 text-zinc-500 hover:text-white transition-all cursor-pointer"
          >
            <Tv className="w-5 h-5" />
            <span className="text-[9px] font-bold">Live Casino</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 py-1 px-3 text-amber-400 font-extrabold transition-all cursor-pointer"
          >
            <Dices className="w-5 h-5" />
            <span className="text-[9px]">Sports</span>
          </button>
          <button
            onClick={onBackToHome}
            className="flex flex-col items-center gap-1 py-1 px-3 text-zinc-500 hover:text-white transition-all cursor-pointer"
          >
            <User className="w-5 h-5" />
            <span className="text-[9px] font-bold">Profile</span>
          </button>
        </div>
      </footer>

      {/* ── Success Slip Modal ── */}
      {showSlipSuccess && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14161e] border border-zinc-800 rounded-2xl p-6 max-w-sm w-full flex flex-col items-center justify-center gap-4 text-center shadow-2xl animate-in scale-in duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-black tracking-wide text-zinc-100">Parlay Bet Locked In!</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {successMessage}
              </p>
            </div>
            <button
              onClick={() => {
                setShowSlipSuccess(false);
                setActiveSubTab('My Parlays');
              }}
              className="w-full mt-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
            >
              View Bets
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
