import React, { useState, useEffect, useRef } from 'react';
import { ActiveTab, MatchConfig, Player } from './types/darts';
import { INITIAL_MATCH_CONFIG, INITIAL_PLAYERS } from './data/initialData';
import { Sheet1Broadcast } from './components/Sheet1Broadcast';
import { Sheet2Management } from './components/Sheet2Management';
import { Sheet3Players } from './components/Sheet3Players';
import { ScoreboardBar } from './components/ScoreboardBar';
import { TournamentBracket } from './components/TournamentBracket';
import { Tv, Sliders, Users, RotateCcw } from 'lucide-react';

const DARTS_PLAYERS_STORAGE_KEY = 'darts_players_v1';
const DARTS_CONFIG_STORAGE_KEY = 'darts_match_config_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('sheet1');

  // Check URL parameters for OBS mode and view mode
  const searchParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

  const isObsMode = searchParams.get('mode') === 'obs';
  const obsView = searchParams.get('view') || 'both'; // 'both' | 'scoreboard' | 'bracket'

  // Load players from localStorage on startup as instant cache
  const [players, setPlayers] = useState<Player[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(DARTS_PLAYERS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.error('Failed to load players from storage:', e);
      }
    }
    return INITIAL_PLAYERS;
  });

  // Load match config from localStorage on startup
  const [config, setConfig] = useState<MatchConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(DARTS_CONFIG_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            return { ...INITIAL_MATCH_CONFIG, ...parsed };
          }
        }
      } catch (e) {
        console.error('Failed to load match config from storage:', e);
      }
    }
    return INITIAL_MATCH_CONFIG;
  });

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Setup BroadcastChannel for real-time tab & OBS window synchronization
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('darts_sync_channel');
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data?.type === 'SYNC_STATE') {
          if (event.data.players !== undefined) {
            setPlayers(event.data.players);
          }
          if (event.data.config !== undefined) {
            setConfig(event.data.config);
          }
        }
      };

      return () => {
        channel.close();
      };
    }
  }, []);

  // Listen for storage events (changes made in other tabs)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === DARTS_PLAYERS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setPlayers(parsed);
        } catch (err) {
          console.error(err);
        }
      }
      if (e.key === DARTS_CONFIG_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && typeof parsed === 'object') {
            setConfig((prev) => ({ ...prev, ...parsed }));
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // OBS Mode: Apply transparent body styling & poll localStorage to guarantee instant sync
  useEffect(() => {
    if (isObsMode) {
      document.documentElement.classList.add('obs-mode');
      document.body.classList.add('obs-mode');

      // Frequent poll to ensure OBS CEF instance reflects updates immediately
      const timer = setInterval(() => {
        try {
          const pRaw = localStorage.getItem(DARTS_PLAYERS_STORAGE_KEY);
          if (pRaw) {
            const pParsed = JSON.parse(pRaw);
            setPlayers((prev) =>
              JSON.stringify(prev) !== pRaw ? pParsed : prev
            );
          }
          const cRaw = localStorage.getItem(DARTS_CONFIG_STORAGE_KEY);
          if (cRaw) {
            const cParsed = JSON.parse(cRaw);
            setConfig((prev) =>
              JSON.stringify(prev) !== cRaw ? { ...prev, ...cParsed } : prev
            );
          }
        } catch (e) {
          // Ignore parse errors
        }
      }, 500);

      return () => {
        document.documentElement.classList.remove('obs-mode');
        document.body.classList.remove('obs-mode');
        clearInterval(timer);
      };
    }
  }, [isObsMode]);

  // Persist players to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(DARTS_PLAYERS_STORAGE_KEY, JSON.stringify(players));
      broadcastChannelRef.current?.postMessage({
        type: 'SYNC_STATE',
        players,
      });
    } catch (err) {
      console.error('Failed to save players to storage:', err);
    }
  }, [players]);

  // Persist config to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(DARTS_CONFIG_STORAGE_KEY, JSON.stringify(config));
      broadcastChannelRef.current?.postMessage({
        type: 'SYNC_STATE',
        config,
      });
    } catch (err) {
      console.error('Failed to save match config to storage:', err);
    }
  }, [config]);

  // Active players
  const p1 =
    players.find((p) => p.id === config.p1Id) || {
      id: config.p1Id || 'p1',
      name: '',
    };

  const p2 =
    players.find((p) => p.id === config.p2Id) || {
      id: config.p2Id || 'p2',
      name: '',
    };

  // OBS Mode view: Pure transparent overlay displaying Scoreboard and/or Tournament Bracket
  if (isObsMode) {
    const showScoreboard = obsView === 'both' || obsView === 'scoreboard';
    const showBracket =
      (obsView === 'both' || obsView === 'bracket') &&
      (config.showBracketOnSheet1 !== false || obsView === 'bracket');

    return (
      <div className="w-full min-h-screen bg-transparent flex flex-col items-center justify-start p-3 sm:p-5 gap-6 overflow-hidden">
        {/* Scoreboard Bar */}
        {showScoreboard && (
          <div className="w-full flex justify-center flex-shrink-0">
            <ScoreboardBar config={config} p1={p1} p2={p2} />
          </div>
        )}

        {/* Tournament Bracket */}
        {showBracket && (
          <div className="w-full max-w-5xl flex justify-center">
            <TournamentBracket
              matches={config.tournamentMatches}
              players={players}
              activeMatchId={config.activeMatchId}
            />
          </div>
        )}
      </div>
    );
  }

  // Quick reset all check boxes
  const handleQuickReset = () => {
    setConfig((prev) => ({
      ...prev,
      legs: prev.legs.map((leg) => ({
        ...leg,
        firstThrow: null,
        p1Win: false,
        p2Win: false,
        isBreak: false,
      })),
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-yellow-500/30 selection:text-yellow-200">
      {/* Clean Minimal Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Title / Brand */}
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight leading-none">
                  {config.tournamentName || 'ダーツ配信スコアボード'}
                </h1>
                <p className="text-[10px] text-zinc-400 font-medium mt-1">
                  {config.roundName} ({config.legCount || 3}レグ制)
                </p>
              </div>
            </div>

            {/* Quick reset button */}
            <button
              onClick={handleQuickReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition-colors"
              title="勝敗チェックボックスを一括リセット"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-400" />
              <span>一括リセット</span>
            </button>
          </div>

          {/* Simple Clean Tabs */}
          <div className="flex items-center gap-1 border-t border-zinc-800/80 -mb-px">
            <button
              onClick={() => setActiveTab('sheet1')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'sheet1'
                  ? 'border-yellow-400 text-yellow-400 bg-zinc-800/40'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>シート1 (配信画面)</span>
            </button>

            <button
              onClick={() => setActiveTab('sheet2')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'sheet2'
                  ? 'border-yellow-400 text-yellow-400 bg-zinc-800/40'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>シート2 (試合管理)</span>
            </button>

            <button
              onClick={() => setActiveTab('sheet3')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'sheet3'
                  ? 'border-yellow-400 text-yellow-400 bg-zinc-800/40'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>シート3 (選手管理)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'sheet1' && (
          <Sheet1Broadcast
            config={config}
            setConfig={setConfig}
            p1={p1}
            p2={p2}
            players={players}
          />
        )}

        {activeTab === 'sheet2' && (
          <Sheet2Management
            config={config}
            setConfig={setConfig}
            players={players}
            p1={p1}
            p2={p2}
            onNavigateToSheet1={() => setActiveTab('sheet1')}
          />
        )}

        {activeTab === 'sheet3' && (
          <Sheet3Players
            players={players}
            setPlayers={setPlayers}
            activeP1Id={config.p1Id}
            activeP2Id={config.p2Id}
          />
        )}
      </main>
    </div>
  );
}
