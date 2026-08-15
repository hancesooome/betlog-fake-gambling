import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Conditionally create client only if URL is provided
const supabase = supabaseUrl
  ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)
  : null;

const OPENDOTA_API_KEY = process.env.OPENDOTA_API_KEY || '';
const THESPORTSDB_API_KEY = process.env.THESPORTSDB_API_KEY || '1'; // Default test key is '1'

// Helper to check if Supabase config is active
const isSupabaseConfigured = () => {
  return !!supabase;
};

// ─── Odds Generation Algorithm ───────────────────────────────────────────────
/**
 * Calculates custom odds using team performance factors:
 * - Recent win rate (40%)
 * - Head-to-head performance (30%)
 * - Tournament placement/ranking (20%)
 * - Recent form (10%)
 *
 * If data is sparse or mock, default probabilities are derived and normalized.
 */
function generateOddsForTeams(teamAStats: any, teamBStats: any) {
  // Stats format: { winRate: 0.6, h2h: 0.5, ranking: 5, form: 0.7 }
  // Standard defaults if properties missing
  const a = {
    winRate: teamAStats?.winRate ?? 0.5,
    h2h: teamAStats?.h2h ?? 0.5,
    ranking: teamAStats?.ranking ?? 10, // lower ranking rank is better (e.g. 1st vs 20th)
    form: teamAStats?.form ?? 0.5,
  };
  const b = {
    winRate: teamBStats?.winRate ?? 0.5,
    h2h: teamBStats?.h2h ?? 0.5,
    ranking: teamBStats?.ranking ?? 10,
    form: teamBStats?.form ?? 0.5,
  };

  // 1. Win Rate Weight (40%)
  const probWinRateA = a.winRate / (a.winRate + b.winRate || 1);

  // 2. Head-to-head weight (30%)
  const probH2hA = a.h2h / (a.h2h + b.h2h || 1);

  // 3. Ranking weight (20%) - lower value means higher strength
  const totalRank = a.ranking + b.ranking || 1;
  const probRankA = b.ranking / totalRank; // Inverse because rank 1 > rank 10

  // 4. Recent form weight (10%)
  const probFormA = a.form / (a.form + b.form || 1);

  // Combine probabilities
  let probA = (probWinRateA * 0.40) + (probH2hA * 0.30) + (probRankA * 0.20) + (probFormA * 0.10);
  
  // Normalize and apply min/max boundary (e.g. no probability below 10% or above 90%)
  probA = Math.max(0.1, Math.min(0.9, probA));
  const probB = 1 - probA;

  // Convert to decimal odds: odds = 1 / probability
  const oddsA = Math.round((1 / probA) * 100) / 100;
  const oddsB = Math.round((1 / probB) * 100) / 100;

  return { oddsA, oddsB, probA, probB };
}

// ─── Sports Mock Fallback Data ────────────────────────────────────────────────
const MOCK_SPORTS_MATCHES = [
  {
    id: 's_mock_1',
    sport: 'Soccer',
    home_team: 'Manchester City',
    away_team: 'Liverpool',
    start_time: new Date(Date.now() + 2 * 3600000).toISOString(), // 2 hours from now
    status: 'Upcoming',
    generated_odds: { home: 1.85, away: 2.10, draw: 3.40 }
  },
  {
    id: 's_mock_2',
    sport: 'Basketball',
    home_team: 'Golden State Warriors',
    away_team: 'Los Angeles Lakers',
    start_time: new Date(Date.now() + 4 * 3600000).toISOString(),
    status: 'Upcoming',
    generated_odds: { home: 1.72, away: 2.25 }
  },
  {
    id: 's_mock_3',
    sport: 'Soccer',
    home_team: 'Real Madrid',
    away_team: 'Barcelona',
    start_time: new Date(Date.now() + 6 * 3600000).toISOString(),
    status: 'Upcoming',
    generated_odds: { home: 1.95, away: 1.95, draw: 3.25 }
  },
  {
    id: 's_mock_4',
    sport: 'Basketball',
    home_team: 'Boston Celtics',
    away_team: 'Miami Heat',
    start_time: new Date(Date.now() + 24 * 3600000).toISOString(),
    status: 'Upcoming',
    generated_odds: { home: 1.45, away: 2.90 }
  }
];

// ─── Dota 2 Mock Fallback Data ────────────────────────────────────────────────
const MOCK_DOTA_MATCHES = [
  {
    id: 'd_mock_1',
    radiant: 'Team Spirit',
    dire: 'Gaimin Gladiators',
    tournament: 'Riyadh Masters',
    start_time: new Date(Date.now() + 1.5 * 3600000).toISOString(),
    status: 'Upcoming',
    generated_odds: { radiant: 1.68, dire: 2.20 }
  },
  {
    id: 'd_mock_2',
    radiant: 'Tundra Esports',
    dire: 'Team Liquid',
    tournament: 'The International',
    start_time: new Date(Date.now() + 3.5 * 3600000).toISOString(),
    status: 'Upcoming',
    generated_odds: { radiant: 2.05, dire: 1.80 }
  },
  {
    id: 'd_mock_3',
    radiant: 'PSG.LGD',
    dire: 'Xtreme Gaming',
    tournament: 'DreamLeague',
    start_time: new Date(Date.now() + 5 * 3600000).toISOString(),
    status: 'Upcoming',
    generated_odds: { radiant: 1.90, dire: 1.90 }
  },
  {
    id: 'd_mock_4',
    radiant: 'Shopify Rebellion',
    dire: 'OG Esports',
    tournament: 'BetBoom Dacha',
    start_time: new Date(Date.now() + 12 * 3600000).toISOString(),
    status: 'Upcoming',
    generated_odds: { radiant: 2.40, dire: 1.58 }
  }
];

// ─── GET /api/sports/matches ─────────────────────────────────────────────────
app.get('/api/sports/matches', async (req, res) => {
  try {
    if (isSupabaseConfigured()) {
      // 1. Check database cache
      const { data: cached, error } = await supabase
        .from('sports_matches')
        .select('*')
        .order('start_time', { ascending: true });

      if (!error && cached && cached.length > 0) {
        // Simple 1-hour cache check: if any match start_time is outdated and status is upcoming, or cache too old
        const needsRefresh = cached.some(m => new Date(m.start_time).getTime() < Date.now() - 3600000);
        if (!needsRefresh) {
          return res.json({ success: true, source: 'cache', matches: cached });
        }
      }
    }

    // 2. Fetch from External API (TheSportsDB)
    // Defaulting to soccer/basketball leagues: EPL (4328), NBA (4387)
    let apiMatches: any[] = [];
    try {
      const eplResponse = await fetch(`https://www.thesportsdb.com/api/v1/json/${THESPORTSDB_API_KEY}/eventsnextleague.php?id=4328`);
      if (eplResponse.ok) {
        const eplData = await eplResponse.json();
        if (eplData.events) apiMatches.push(...eplData.events);
      }
      
      const nbaResponse = await fetch(`https://www.thesportsdb.com/api/v1/json/${THESPORTSDB_API_KEY}/eventsnextleague.php?id=4387`);
      if (nbaResponse.ok) {
        const nbaData = await nbaResponse.json();
        if (nbaData.events) apiMatches.push(...nbaData.events);
      }
    } catch (apiErr) {
      console.warn('TheSportsDB API request failed, using mock matches.', apiErr.message);
    }

    let matchesToUse = [];

    if (apiMatches.length > 0) {
      matchesToUse = apiMatches.map((event: any, index: number) => {
        // Map API fields to our standard schema
        const sport = event.strSport || 'Sports';
        const home_team = event.strHomeTeam;
        const away_team = event.strAwayTeam;
        const start_time = event.strTimestamp || `${event.dateEvent}T${event.strTime || '12:00:00'}Z`;

        // Mock stats based on event index to generate dynamic odds
        const statsA = { winRate: 0.5 + (index % 5) * 0.05, h2h: 0.5, ranking: 5 + (index % 10), form: 0.6 };
        const statsB = { winRate: 0.45 + (index % 3) * 0.05, h2h: 0.45, ranking: 8 + (index % 8), form: 0.5 };
        const odds = generateOddsForTeams(statsA, statsB);

        return {
          id: `s_api_${event.idEvent}`,
          sport,
          home_team,
          away_team,
          start_time,
          generated_odds: {
            home: odds.oddsA,
            away: odds.oddsB,
            draw: sport.toLowerCase() === 'soccer' ? 3.25 : undefined
          },
          status: 'Upcoming'
        };
      });
    } else {
      // Refresh mock start times so they stay in the future
      matchesToUse = MOCK_SPORTS_MATCHES.map((m, idx) => ({
        ...m,
        start_time: new Date(Date.now() + (idx + 1) * 3 * 3600000).toISOString()
      }));
    }

    // 3. Write cache to Supabase
    if (isSupabaseConfigured()) {
      for (const match of matchesToUse) {
        await supabase
          .from('sports_matches')
          .upsert({
            id: match.id,
            sport: match.sport,
            home_team: match.home_team,
            away_team: match.away_team,
            start_time: match.start_time,
            generated_odds: match.generated_odds,
            status: match.status
          });
      }
    }

    return res.json({ success: true, source: 'api', matches: matchesToUse });
  } catch (err) {
    console.error('Error in GET /api/sports/matches:', err);
    // Safe fallback to mock data on all failures
    return res.json({ success: true, source: 'fallback', matches: MOCK_SPORTS_MATCHES });
  }
});

// ─── GET /api/dota/matches ───────────────────────────────────────────────────
app.get('/api/dota/matches', async (req, res) => {
  try {
    if (isSupabaseConfigured()) {
      // 1. Check database cache
      const { data: cached, error } = await supabase
        .from('dota_matches')
        .select('*')
        .order('start_time', { ascending: true });

      if (!error && cached && cached.length > 0) {
        const needsRefresh = cached.some(m => new Date(m.start_time).getTime() < Date.now() - 3600000);
        if (!needsRefresh) {
          return res.json({ success: true, source: 'cache', matches: cached });
        }
      }
    }

    // 2. Fetch from OpenDota API
    let apiMatches: any[] = [];
    try {
      const url = OPENDOTA_API_KEY
        ? `https://api.opendota.com/api/proMatches?api_key=${OPENDOTA_API_KEY}`
        : `https://api.opendota.com/api/proMatches`;
      const response = await fetch(url);
      if (response.ok) {
        apiMatches = await response.json();
      }
    } catch (apiErr) {
      console.warn('OpenDota API request failed, using mock matches.', apiErr.message);
    }

    let matchesToUse = [];

    if (apiMatches.length > 0) {
      // Filter recent or upcoming-like pro matches
      matchesToUse = apiMatches.slice(0, 10).map((match: any, index: number) => {
        const radiant = match.radiant_name || 'Radiant';
        const dire = match.dire_name || 'Dire';
        const tournament = match.league_name || 'Pro Cup';
        // OpenDota returns completed games; we pretend they are upcoming or simulated live matches
        const start_time = new Date(Date.now() + (index + 1) * 2 * 3600000).toISOString();

        // Calculate odds
        const statsA = { winRate: 0.52 + (index % 4) * 0.04, h2h: 0.5, ranking: 4 + (index % 6), form: 0.6 };
        const statsB = { winRate: 0.48 + (index % 3) * 0.05, h2h: 0.48, ranking: 6 + (index % 8), form: 0.5 };
        const odds = generateOddsForTeams(statsA, statsB);

        return {
          id: `d_api_${match.match_id || index}`,
          radiant,
          dire,
          tournament,
          start_time,
          generated_odds: {
            radiant: odds.oddsA,
            dire: odds.oddsB
          },
          status: 'Upcoming'
        };
      });
    } else {
      // Update mock start times to be fresh
      matchesToUse = MOCK_DOTA_MATCHES.map((m, idx) => ({
        ...m,
        start_time: new Date(Date.now() + (idx + 1) * 2.5 * 3600000).toISOString()
      }));
    }

    // 3. Write cache to Supabase
    if (isSupabaseConfigured()) {
      for (const match of matchesToUse) {
        await supabase
          .from('dota_matches')
          .upsert({
            id: match.id,
            radiant: match.radiant,
            dire: match.dire,
            tournament: match.tournament,
            start_time: match.start_time,
            generated_odds: match.generated_odds,
            status: match.status
          });
      }
    }

    return res.json({ success: true, source: 'api', matches: matchesToUse });
  } catch (err) {
    console.error('Error in GET /api/dota/matches:', err);
    return res.json({ success: true, source: 'fallback', matches: MOCK_DOTA_MATCHES });
  }
});

// ─── POST /api/parlay/calculate ──────────────────────────────────────────────
app.post('/api/parlay/calculate', (req, res) => {
  const { stake, legs } = req.body; // legs: Array<{ matchId, team, odds }>
  
  if (!legs || !Array.isArray(legs) || legs.length === 0) {
    return res.status(400).json({ success: false, error: 'Selections (legs) must be provided' });
  }

  const numericStake = Number(stake) || 0;
  
  // combinedOdds = odds1 * odds2 * odds3...
  const combinedOdds = legs.reduce((acc, leg) => {
    const o = Number(leg.odds) || 1.0;
    return acc * o;
  }, 1.0);

  const roundedOdds = Math.round(combinedOdds * 100) / 100;
  const potentialPayout = Math.round(numericStake * roundedOdds * 100) / 100;

  return res.json({
    success: true,
    combinedOdds: roundedOdds,
    potentialPayout
  });
});

// ─── POST /api/parlay/save ───────────────────────────────────────────────────
app.post('/api/parlay/save', async (req, res) => {
  const { userId, stake, combinedOdds, potentialPayout, legs } = req.body;

  if (!legs || !Array.isArray(legs) || legs.length === 0) {
    return res.status(400).json({ success: false, error: 'Selections (legs) must be provided' });
  }

  const uId = userId || 'temp_anonymous_user';

  try {
    if (isSupabaseConfigured()) {
      // 1. Insert parlay header
      const { data: parlay, error: pError } = await supabase
        .from('parlays')
        .insert({
          user_id: uId,
          stake,
          combined_odds: combinedOdds,
          potential_payout: potentialPayout,
          status: 'Pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (pError || !parlay) {
        throw new Error(`Failed to save parlay header: ${pError?.message}`);
      }

      // 2. Insert legs
      const legRecords = legs.map((leg) => ({
        parlay_id: parlay.id,
        match_id: leg.matchId,
        selection: leg.team,
        odds: leg.odds
      }));

      const { error: legsErr } = await supabase
        .from('parlay_legs')
        .insert(legRecords);

      if (legsErr) {
        throw new Error(`Failed to save parlay legs: ${legsErr.message}`);
      }

      return res.json({
        success: true,
        parlayId: parlay.id,
        message: 'Parlay bet placed successfully!'
      });
    } else {
      // Cache-less mock success response if Supabase credentials aren't present
      return res.json({
        success: true,
        parlayId: `mock_p_${Date.now()}`,
        message: 'Parlay created successfully (Local Sandbox Mode)!'
      });
    }
  } catch (err) {
    console.error('Error in POST /api/parlay/save:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/parlay/history ─────────────────────────────────────────────────
app.get('/api/parlay/history', async (req, res) => {
  const { userId } = req.query;
  const uId = userId || 'temp_anonymous_user';

  try {
    if (isSupabaseConfigured()) {
      // Fetch parlays with their legs
      const { data: parlays, error } = await supabase
        .from('parlays')
        .select(`
          *,
          parlay_legs (
            *
          )
        `)
        .eq('user_id', uId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return res.json({ success: true, parlays });
    } else {
      // LocalStorage / local memory mock history if Supabase is unconfigured
      return res.json({ success: true, parlays: [] });
    }
  } catch (err) {
    console.error('Error in GET /api/parlay/history:', err);
    return res.status(500).json({ success: true, parlays: [] });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`Betlog Sports & Esports Server running on port ${PORT}`);
});
