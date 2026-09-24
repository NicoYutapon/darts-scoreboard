import React, { useState } from 'react';
import { MatchConfig, Player, GameType, TournamentMatch } from '../types/darts';
import { generateTournamentFromPlayerCount, createBlankTournament } from '../utils/tournamentGenerator';
import {
  RotateCcw,
  Check,
  Trophy,
  ArrowRight,
  Crown,
  Play,
  Wand2,
  FilePlus,
  Type,
} from 'lucide-react';

export const FONT_OPTIONS = [
  {
    id: 'cambria',
    name: 'クラシック・セリフ (Cambria / Georgia)',
    value: 'Cambria, "Times New Roman", Georgia, serif, system-ui',
    sample: 'Mitchell Lawrie / 山田 太郎',
  },
  {
    id: 'teko',
    name: 'ダーツ中継・ボールド (Teko)',
    value: "'Teko', sans-serif",
    sample: 'Mitchell Lawrie / 山田 太郎',
  },
  {
    id: 'bebas',
    name: 'ストロング・インパクト (Bebas Neue)',
    value: "'Bebas Neue', 'Noto Sans JP', sans-serif",
    sample: 'Mitchell Lawrie / 山田 太郎',
  },
  {
    id: 'rajdhani',
    name: '近未来・サイバー (Rajdhani)',
    value: "'Rajdhani', 'Noto Sans JP', sans-serif",
    sample: 'Mitchell Lawrie / 山田 太郎',
  },
  {
    id: 'montserrat',
    name: 'モダン・サンセリフ (Montserrat)',
    value: "'Montserrat', 'Noto Sans JP', sans-serif",
    sample: 'Mitchell Lawrie / 山田 太郎',
  },
  {
    id: 'noto-serif',
    name: '和モダン・明朝 (Noto Serif JP)',
    value: "'Noto Serif JP', serif",
    sample: 'Mitchell Lawrie / 山田 太郎',
  },
  {
    id: 'noto-sans',
    name: '標準・ゴシック (Noto Sans JP)',
    value: "'Noto Sans JP', sans-serif",
    sample: 'Mitchell Lawrie / 山田 太郎',
  },
];

interface Sheet2ManagementProps {
  config: MatchConfig;
  setConfig: React.Dispatch<React.SetStateAction<MatchConfig>>;
  players: Player[];
  p1: Player;
  p2: Player;
  onNavigateToSheet1: () => void;
}

export const Sheet2Management: React.FC<Sheet2ManagementProps> = ({
  config,
  setConfig,
  players,
  p1,
  p2,
  onNavigateToSheet1,
}) => {
  const [autoBreak, setAutoBreak] = useState(true);
  const [resetSuccess, setResetSuccess] = useState(false);

  const gameOptions: GameType[] = ['701', '501', '301', 'CR', 'CH', 'MEDLEY', 'COUNT-UP'];

  // Current active tournament match
  const activeMatch =
    config.tournamentMatches.find((m) => m.id === config.activeMatchId) ||
    config.tournamentMatches[0] || {
      id: 'default',
      roundName: config.roundName,
      roundLevel: 1,
      p1Id: config.p1Id,
      p2Id: config.p2Id,
    };

  const getPlayerName = (id?: string) => {
    if (!id) return '（未定）';
    const found = players.find((p) => p.id === id);
    return found ? found.name : '（未定）';
  };

  // Switch active match in tournament
  const handleSelectActiveMatch = (match: TournamentMatch) => {
    setConfig((prev) => {
      const updatedMatches = prev.tournamentMatches.map((m) => ({
        ...m,
        isLive: m.id === match.id,
      }));

      return {
        ...prev,
        activeMatchId: match.id,
        roundName: match.roundName,
        p1Id: match.p1Id || '',
        p2Id: match.p2Id || '',
        tournamentMatches: updatedMatches,
      };
    });
  };

  // Change Leg Count (3 or 5, defaults to 3)
  const handleLegCountChange = (count: 3 | 5) => {
    setConfig((prev) => {
      let legs = [...prev.legs];
      if (count === 5 && legs.length < 5) {
        legs = [
          ...legs,
          { legNumber: 4, gameType: '701', firstThrow: null, p1Win: false, p2Win: false, isBreak: false },
          { legNumber: 5, gameType: 'CH', firstThrow: null, p1Win: false, p2Win: false, isBreak: false },
        ];
      }
      return {
        ...prev,
        legCount: count,
        legs,
      };
    });
  };

  // Generate tournament based on registered players count
  const participatingPlayers = players.filter((p) => p.isParticipating !== false);

  const handleGenerateFromPlayers = () => {
    if (participatingPlayers.length < 2) {
      alert('大会に参加する選手（シート3で参加チェックが入っている選手）が2名以上必要です。シート3で選手を登録・参加設定してください。');
      return;
    }
    const newMatches = generateTournamentFromPlayerCount(participatingPlayers);
    const firstMatch = newMatches[0];

    setConfig((prev) => ({
      ...prev,
      tournamentMatches: newMatches,
      activeMatchId: firstMatch.id,
      roundName: firstMatch.roundName,
      p1Id: firstMatch.p1Id || '',
      p2Id: firstMatch.p2Id || '',
      legs: prev.legs.map((l) => ({ ...l, p1Win: false, p2Win: false, isBreak: false })),
    }));
  };

  // Create a completely blank tournament (unassigned)
  const handleCreateBlankTournament = (size: 2 | 4 | 8 = 4) => {
    const blankMatches = createBlankTournament(size);
    const firstMatch = blankMatches[0];

    setConfig((prev) => ({
      ...prev,
      tournamentMatches: blankMatches,
      activeMatchId: firstMatch.id,
      roundName: firstMatch.roundName,
      p1Id: '',
      p2Id: '',
      legs: prev.legs.map((l) => ({ ...l, p1Win: false, p2Win: false, isBreak: false })),
    }));
  };

  // Advance winner in tournament (Win/Loss only, no numbers)
  const handleSetWinner = (matchId: string, winnerId: string) => {
    setConfig((prev) => {
      const match = prev.tournamentMatches.find((m) => m.id === matchId);
      if (!match) return prev;

      const isAlreadyWinner = match.winnerId === winnerId;
      const nextWinnerId = isAlreadyWinner ? undefined : winnerId;

      const updatedMatches = prev.tournamentMatches.map((m) =>
        m.id === matchId ? { ...m, winnerId: nextWinnerId } : m
      );

      // Find current match index among matches of same round level
      const currentLevelMatches = prev.tournamentMatches.filter(
        (m) => m.roundLevel === match.roundLevel
      );
      const matchIndexInLevel = currentLevelMatches.findIndex((m) => m.id === matchId);

      // Next level matches
      const nextLevelMatches = prev.tournamentMatches.filter(
        (m) => m.roundLevel === match.roundLevel + 1
      );

      if (nextLevelMatches.length > 0) {
        const nextMatchIndex = Math.floor(matchIndexInLevel / 2);
        const nextMatch = nextLevelMatches[nextMatchIndex];
        const isP1SlotInNext = matchIndexInLevel % 2 === 0;

        if (nextMatch) {
          const targetIndex = updatedMatches.findIndex((m) => m.id === nextMatch.id);
          if (targetIndex !== -1) {
            updatedMatches[targetIndex] = {
              ...updatedMatches[targetIndex],
              [isP1SlotInNext ? 'p1Id' : 'p2Id']: nextWinnerId,
            };
          }
        }
      }

      return {
        ...prev,
        tournamentMatches: updatedMatches,
      };
    });
  };

  // Change player assigned to match
  const handleAssignPlayer = (matchId: string, slot: 'p1' | 'p2', playerId: string) => {
    setConfig((prev) => {
      const updatedMatches = prev.tournamentMatches.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            [slot === 'p1' ? 'p1Id' : 'p2Id']: playerId || undefined,
          };
        }
        return m;
      });

      let p1Id = prev.p1Id;
      let p2Id = prev.p2Id;
      if (prev.activeMatchId === matchId) {
        if (slot === 'p1') p1Id = playerId;
        if (slot === 'p2') p2Id = playerId;
      }

      return {
        ...prev,
        p1Id,
        p2Id,
        tournamentMatches: updatedMatches,
      };
    });
  };

  // Reset checkboxes for current match
  const handleResetCheckboxes = () => {
    setConfig((prev) => ({
      ...prev,
      legs: prev.legs.map((leg) => ({
        ...leg,
        firstThrow: null, // 先攻・後攻も未選択状態にリセット
        p1Win: false,
        p2Win: false,
        isBreak: false,
      })),
    }));
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2000);
  };

  // Toggle P1 Win for a leg
  const handleToggleP1 = (legIndex: number) => {
    setConfig((prev) => {
      const nextLegs = [...prev.legs];
      const leg = { ...nextLegs[legIndex] };
      const nextWin = !leg.p1Win;

      leg.p1Win = nextWin;
      if (nextWin) {
        leg.p2Win = false;
        if (autoBreak && leg.firstThrow) {
          leg.isBreak = leg.firstThrow === 'p2';
        } else {
          leg.isBreak = false;
        }
      } else {
        leg.isBreak = false;
      }

      nextLegs[legIndex] = leg;
      return { ...prev, legs: nextLegs };
    });
  };

  // Toggle P2 Win for a leg
  const handleToggleP2 = (legIndex: number) => {
    setConfig((prev) => {
      const nextLegs = [...prev.legs];
      const leg = { ...nextLegs[legIndex] };
      const nextWin = !leg.p2Win;

      leg.p2Win = nextWin;
      if (nextWin) {
        leg.p1Win = false;
        if (autoBreak && leg.firstThrow) {
          leg.isBreak = leg.firstThrow === 'p1';
        } else {
          leg.isBreak = false;
        }
      } else {
        leg.isBreak = false;
      }

      nextLegs[legIndex] = leg;
      return { ...prev, legs: nextLegs };
    });
  };

  // Toggle Break Checkbox
  const handleToggleBreak = (legIndex: number) => {
    setConfig((prev) => {
      const nextLegs = [...prev.legs];
      nextLegs[legIndex] = {
        ...nextLegs[legIndex],
        isBreak: !nextLegs[legIndex].isBreak,
      };
      return { ...prev, legs: nextLegs };
    });
  };

  // Change first throw (arbitrary selection, toggleable)
  const handleFirstThrowChange = (legIndex: number, thrower: 'p1' | 'p2') => {
    setConfig((prev) => {
      const nextLegs = [...prev.legs];
      const current = nextLegs[legIndex].firstThrow;
      const nextThrower = current === thrower ? null : thrower;
      const leg = { ...nextLegs[legIndex], firstThrow: nextThrower };
      if (autoBreak) {
        if (nextThrower) {
          if (leg.p1Win) leg.isBreak = nextThrower === 'p2';
          if (leg.p2Win) leg.isBreak = nextThrower === 'p1';
        } else {
          leg.isBreak = false;
        }
      }
      nextLegs[legIndex] = leg;
      return { ...prev, legs: nextLegs };
    });
  };

  // Change Game Type
  const handleGameChange = (legIndex: number, gameType: string) => {
    setConfig((prev) => {
      const nextLegs = [...prev.legs];
      nextLegs[legIndex] = { ...nextLegs[legIndex], gameType };
      return { ...prev, legs: nextLegs };
    });
  };

  const activeLegs = config.legs.slice(0, config.legCount);

  // Group matches by round level
  const levels = Array.from(
    new Set(config.tournamentMatches.map((m) => m.roundLevel))
  ).sort((a, b) => a - b);

  // Render an interactive match box inside the tree (Win/Loss only - NO numeric scores)
  const renderInteractiveMatchCard = (match: TournamentMatch, isInitialRound = false) => {
    const isLive = match.id === config.activeMatchId;
    const p1Won = match.winnerId && match.p1Id && match.winnerId === match.p1Id;
    const p2Won = match.winnerId && match.p2Id && match.winnerId === match.p2Id;

    return (
      <div key={match.id} className="p-1">
        <div
          className={`w-64 sm:w-72 rounded-xl border transition-all overflow-hidden ${
            isLive
              ? 'border-2 border-yellow-400 bg-zinc-900 shadow-[0_0_16px_rgba(250,204,21,0.35)]'
              : 'border border-zinc-800 bg-zinc-900/90 hover:border-zinc-700'
          }`}
        >
          {/* Card Header */}
          <div
            className={`flex items-center justify-between px-3 py-1.5 text-xs font-bold border-b ${
              isLive
                ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400'
            }`}
          >
            <span className="font-semibold">{match.roundName}</span>
            {isLive ? (
              <span className="px-2 py-0.5 rounded bg-yellow-400 text-black text-[10px] font-black uppercase tracking-wider animate-pulse">
                ● 進行中
              </span>
            ) : (
              <button
                onClick={() => handleSelectActiveMatch(match)}
                className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-yellow-400 hover:text-black text-zinc-300 font-medium transition-colors"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>この試合を選択</span>
              </button>
            )}
          </div>

          {/* Player 1 Row */}
          <div
            className={`flex items-center justify-between p-2.5 border-b border-zinc-800/70 transition-colors ${
              p1Won ? 'bg-yellow-400/15' : ''
            }`}
          >
            <div className="flex-1 min-w-0 pr-2">
              {isInitialRound ? (
                <select
                  value={match.p1Id || ''}
                  onChange={(e) =>
                    handleAssignPlayer(match.id, 'p1', e.target.value)
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white font-medium focus:outline-none focus:border-zinc-600"
                >
                  <option value="">(選手を選択)</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-medium text-white truncate">
                  {p1Won && <Crown className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />}
                  <span className={match.p1Id ? 'text-white' : 'text-zinc-500 italic'}>
                    {getPlayerName(match.p1Id)}
                  </span>
                </div>
              )}
            </div>

            {/* Advance Winner Button (Win/Loss only - NO numbers) */}
            {match.p1Id && (
              <button
                type="button"
                onClick={() => handleSetWinner(match.id, match.p1Id!)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  p1Won
                    ? 'bg-yellow-400 text-black shadow-sm'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
                title={p1Won ? '勝利を取り消し' : 'この選手を勝利にして次へ進める'}
              >
                <Crown className="w-3 h-3" />
                <span>{p1Won ? '勝者' : '勝'}</span>
              </button>
            )}
          </div>

          {/* Player 2 Row */}
          <div
            className={`flex items-center justify-between p-2.5 transition-colors ${
              p2Won ? 'bg-yellow-400/15' : ''
            }`}
          >
            <div className="flex-1 min-w-0 pr-2">
              {isInitialRound ? (
                <select
                  value={match.p2Id || ''}
                  onChange={(e) =>
                    handleAssignPlayer(match.id, 'p2', e.target.value)
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white font-medium focus:outline-none focus:border-zinc-600"
                >
                  <option value="">(選手を選択)</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-medium text-white truncate">
                  {p2Won && <Crown className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />}
                  <span className={match.p2Id ? 'text-white' : 'text-zinc-500 italic'}>
                    {getPlayerName(match.p2Id)}
                  </span>
                </div>
              )}
            </div>

            {/* Advance Winner Button (Win/Loss only - NO numbers) */}
            {match.p2Id && (
              <button
                type="button"
                onClick={() => handleSetWinner(match.id, match.p2Id!)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  p2Won
                    ? 'bg-yellow-400 text-black shadow-sm'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
                title={p2Won ? '勝利を取り消し' : 'この選手を勝利にして次へ進める'}
              >
                <Crown className="w-3 h-3" />
                <span>{p2Won ? '勝者' : '勝'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Global Tournament Settings & Quick Actions */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[240px]">
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              大会名
            </label>
            <input
              type="text"
              value={config.tournamentName}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, tournamentName: e.target.value }))
              }
              placeholder="例: 第1回 ダーツトーナメント"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-zinc-500"
            />
          </div>

          {/* Leg count toggle (Default is 3 legs) */}
          <div>
            <label className="block text-xs font-medium text-yellow-400 mb-1">
              試合レグ数
            </label>
            <div className="flex rounded-lg p-0.5 bg-zinc-950 border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => handleLegCountChange(3)}
                className={`px-3 py-1 rounded font-bold transition-colors ${
                  config.legCount === 3
                    ? 'bg-yellow-400 text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                3レグ制
              </button>
              <button
                type="button"
                onClick={() => handleLegCountChange(5)}
                className={`px-3 py-1 rounded font-bold transition-colors ${
                  config.legCount === 5
                    ? 'bg-yellow-400 text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                5レグ制
              </button>
            </div>
          </div>

          {/* Sheet 1 Font selector */}
          <div className="flex-1 min-w-[240px]">
            <label className="block text-xs font-medium text-yellow-400 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Type className="w-3.5 h-3.5" />
                <span>シート1 フォント選択</span>
              </span>
              <span
                className="text-[11px] text-zinc-300 font-bold truncate max-w-[140px]"
                style={{
                  fontFamily: config.fontFamily || FONT_OPTIONS[0].value,
                }}
              >
                Sample 選手名
              </span>
            </label>
            <select
              value={config.fontFamily || FONT_OPTIONS[0].value}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, fontFamily: e.target.value }))
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-400"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.id} value={f.value}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tournament Generation Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGenerateFromPlayers}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold transition-colors shadow-sm"
              title="シート3で大会参加にチェックを入れた選手数に合わせてトーナメント表を自動生成します"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>参加選手で自動生成（{participatingPlayers.length}名）</span>
            </button>

            <button
              onClick={() => handleCreateBlankTournament(4)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors border border-zinc-700"
              title="空の4枠トーナメント表を作成"
            >
              <FilePlus className="w-3.5 h-3.5 text-zinc-400" />
              <span>空の4名トーナメント</span>
            </button>

            <button
              onClick={() => handleCreateBlankTournament(8)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors border border-zinc-700"
              title="空の8枠トーナメント表を作成"
            >
              <FilePlus className="w-3.5 h-3.5 text-zinc-400" />
              <span>空の8名トーナメント</span>
            </button>
          </div>

          <div className="text-zinc-500 text-[11px]">
            💡 「勝」ボタンを押すと勝者が確定し、次の回戦へ自動進出します。
          </div>
        </div>
      </div>

      {/* 2. Visual Tournament Tree (Heading: トーナメント表) */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 sm:p-5 rounded-xl space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="font-bold text-sm text-white">トーナメント表</span>
          </div>
          <span className="text-xs text-zinc-400">
            選択中: <strong className="text-yellow-400">{activeMatch.roundName}</strong>
          </span>
        </div>

        {/* Tree flow container */}
        <div className="overflow-x-auto p-2">
          <div className="min-w-fit flex items-center justify-start gap-6 py-2">
            {levels.map((lvl) => {
              const levelMatches = config.tournamentMatches.filter(
                (m) => m.roundLevel === lvl
              );
              const isFirstLevel = lvl === Math.min(...levels);
              const isHighest = lvl === Math.max(...levels);
              const roundTitle = isHighest
                ? '決勝戦'
                : lvl === Math.max(...levels) - 1
                ? '準決勝'
                : lvl === Math.max(...levels) - 2
                ? '準々決勝'
                : `${lvl}回戦`;

              return (
                <div key={`lvl-m-${lvl}`} className="flex flex-col gap-3 flex-shrink-0">
                  <div
                    className={`text-xs font-bold text-center uppercase tracking-wider ${
                      isHighest ? 'text-yellow-400' : 'text-zinc-400'
                    }`}
                  >
                    {roundTitle}
                  </div>
                  <div className="flex flex-col gap-3 justify-around h-full py-1">
                    {levelMatches.map((m) =>
                      renderInteractiveMatchCard(m, isFirstLevel)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Realtime Leg Score Controller for Active Match */}
      <div className="bg-zinc-900 border-2 border-yellow-400/60 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(250,204,21,0.15)]">
        {/* Active Match Banner */}
        <div className="bg-gradient-to-r from-yellow-500/20 via-zinc-900 to-zinc-900 p-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-yellow-400 text-black text-[11px] font-black uppercase tracking-wider">
                進行中
              </span>
              <h3 className="text-base font-bold text-white">
                【{activeMatch.roundName}】 {p1.name || '選手1'} vs {p2.name || '選手2'}
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              チェックを入れると、配信画面（シート1）に勝敗・ブレイクが即時反映されます。
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetCheckboxes}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                resetSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-sm'
              }`}
            >
              {resetSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>リセット完了</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>勝敗チェックボックスをリセット</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Legs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-950 border-b border-zinc-800 text-xs text-zinc-400 font-semibold">
                <th className="py-3 px-4 w-16 text-center">レグ</th>
                <th className="py-3 px-4 w-28">ゲーム</th>
                <th className="py-3 px-4 w-36 text-center">先攻</th>
                <th className="py-3 px-4 text-center border-l border-zinc-800 bg-amber-500/5">
                  <span className="text-amber-400 font-bold">{p1.name || '選手1'} 勝利</span>
                </th>
                <th className="py-3 px-4 text-center border-l border-zinc-800 bg-sky-500/5">
                  <span className="text-sky-400 font-bold">{p2.name || '選手2'} 勝利</span>
                </th>
                <th className="py-3 px-4 text-center border-l border-zinc-800 w-36">
                  <span className="text-yellow-400 font-bold">ブレイク (B)</span>
                </th>
                <th className="py-3 px-4 text-center border-l border-zinc-800 w-28">
                  点灯プレビュー
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800">
              {activeLegs.map((leg, idx) => {
                const wonP1 = leg.p1Win;
                const wonP2 = leg.p2Win;
                const isBreak = leg.isBreak;

                return (
                  <tr
                    key={`leg-${leg.legNumber}`}
                    className={`hover:bg-zinc-800/40 transition-colors ${
                      wonP1 || wonP2 ? 'bg-zinc-800/20' : ''
                    }`}
                  >
                    {/* Leg number */}
                    <td className="py-3 px-4 text-center font-bold text-zinc-200">
                      Leg {leg.legNumber}
                    </td>

                    {/* Game Selector */}
                    <td className="py-3 px-4">
                      <select
                        value={leg.gameType}
                        onChange={(e) => handleGameChange(idx, e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white font-bold focus:outline-none"
                      >
                        {gameOptions.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* First throw selection */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex rounded-md p-0.5 bg-zinc-950 border border-zinc-800 text-xs shadow-inner">
                        <button
                          type="button"
                          onClick={() => handleFirstThrowChange(idx, 'p1')}
                          className={`px-2.5 py-1 rounded font-medium transition-all ${
                            leg.firstThrow === 'p1'
                              ? 'bg-amber-500 text-black font-bold shadow-sm'
                              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                          }`}
                          title="P1を先攻に設定（再度クリックで未選択に解除）"
                        >
                          P1先攻
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFirstThrowChange(idx, 'p2')}
                          className={`px-2.5 py-1 rounded font-medium transition-all ${
                            leg.firstThrow === 'p2'
                              ? 'bg-sky-500 text-black font-bold shadow-sm'
                              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                          }`}
                          title="P2を先攻に設定（再度クリックで未選択に解除）"
                        >
                          P2先攻
                        </button>
                      </div>
                    </td>

                    {/* P1 Win Checkbox */}
                    <td
                      onClick={() => handleToggleP1(idx)}
                      className="py-3 px-4 text-center border-l border-zinc-800 cursor-pointer select-none"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="checkbox"
                          checked={wonP1}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-amber-500 bg-zinc-950 border-zinc-700 pointer-events-none"
                        />
                        <span
                          className={`text-xs font-semibold ${
                            wonP1 ? 'text-amber-400' : 'text-zinc-500'
                          }`}
                        >
                          {wonP1 ? '勝利' : '未勝'}
                        </span>
                      </div>
                    </td>

                    {/* P2 Win Checkbox */}
                    <td
                      onClick={() => handleToggleP2(idx)}
                      className="py-3 px-4 text-center border-l border-zinc-800 cursor-pointer select-none"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="checkbox"
                          checked={wonP2}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-sky-500 bg-zinc-950 border-zinc-700 pointer-events-none"
                        />
                        <span
                          className={`text-xs font-semibold ${
                            wonP2 ? 'text-sky-400' : 'text-zinc-500'
                          }`}
                        >
                          {wonP2 ? '勝利' : '未勝'}
                        </span>
                      </div>
                    </td>

                    {/* Break Checkbox */}
                    <td
                      onClick={() => handleToggleBreak(idx)}
                      className="py-3 px-4 text-center border-l border-zinc-800 cursor-pointer select-none"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="checkbox"
                          checked={isBreak}
                          onChange={() => {}}
                          disabled={!wonP1 && !wonP2}
                          className="w-4 h-4 rounded text-yellow-500 bg-zinc-950 border-zinc-700 pointer-events-none disabled:opacity-30"
                        />
                        <span
                          className={`text-xs font-bold ${
                            isBreak ? 'text-yellow-400' : 'text-zinc-600'
                          }`}
                        >
                          {isBreak ? 'B (ブレイク)' : '—'}
                        </span>
                      </div>
                    </td>

                    {/* Live Preview of LED square */}
                    <td className="py-3 px-4 text-center border-l border-zinc-800">
                      <div className="flex items-center justify-center gap-1.5">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                            wonP1
                              ? 'bg-yellow-400 text-black shadow-sm'
                              : 'bg-zinc-800 text-zinc-600'
                          }`}
                        >
                          {wonP1 ? (isBreak ? 'B' : '■') : ''}
                        </div>
                        <span className="text-zinc-700">/</span>
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                            wonP2
                              ? 'bg-yellow-400 text-black shadow-sm'
                              : 'bg-zinc-800 text-zinc-600'
                          }`}
                        >
                          {wonP2 ? (isBreak ? 'B' : '■') : ''}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom helper bar */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-400">
            <input
              type="checkbox"
              checked={autoBreak}
              onChange={(e) => setAutoBreak(e.target.checked)}
              className="w-4 h-4 rounded text-yellow-500 bg-zinc-950 border-zinc-700"
            />
            <span>後攻側が勝った時に「ブレイク（B）」を自動判定する</span>
          </label>

          <button
            onClick={onNavigateToSheet1}
            className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 font-bold"
          >
            <span>シート1 (配信画面) を確認</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
