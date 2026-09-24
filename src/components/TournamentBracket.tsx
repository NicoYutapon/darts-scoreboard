import React from 'react';
import { Player, TournamentMatch } from '../types/darts';
import { Trophy, Crown } from 'lucide-react';

interface TournamentBracketProps {
  matches: TournamentMatch[];
  players: Player[];
  activeMatchId?: string;
  onSelectMatch?: (matchId: string) => void;
  interactive?: boolean;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  matches,
  players,
  activeMatchId,
  onSelectMatch,
  interactive = false,
}) => {
  const getPlayerName = (id?: string) => {
    if (!id) return '（未定）';
    const found = players.find((p) => p.id === id);
    return found ? found.name : '（未定）';
  };

  // Group matches by round level
  const levels = Array.from(new Set(matches.map((m) => m.roundLevel))).sort(
    (a, b) => a - b
  );

  const finalMatch = matches.find(
    (m) => m.roundLevel === Math.max(...levels, 1)
  );
  const finalWinnerId = finalMatch?.winnerId;
  const championName = finalWinnerId ? getPlayerName(finalWinnerId) : null;

  const renderMatchCard = (match: TournamentMatch, isFinal = false) => {
    const p1Name = getPlayerName(match.p1Id);
    const p2Name = getPlayerName(match.p2Id);
    const p1Won = match.winnerId && match.p1Id && match.winnerId === match.p1Id;
    const p2Won = match.winnerId && match.p2Id && match.winnerId === match.p2Id;
    const isLive = activeMatchId ? match.id === activeMatchId : match.isLive;

    return (
      <div key={match.id} className="p-1">
        <div
          onClick={() => {
            if (interactive && onSelectMatch) {
              onSelectMatch(match.id);
            }
          }}
          className={`w-48 sm:w-56 rounded-lg transition-all select-none overflow-hidden ${
            interactive ? 'cursor-pointer hover:border-zinc-500' : ''
          } ${
            isLive
              ? 'border-2 border-yellow-400 bg-zinc-900 shadow-[0_0_16px_rgba(250,204,21,0.35)]'
              : isFinal
              ? 'border border-zinc-700 bg-zinc-900 shadow-md'
              : 'border border-zinc-800 bg-zinc-900/90'
          }`}
        >
          {/* Match Header */}
          <div
            className={`flex items-center justify-between px-2.5 py-1 text-[11px] font-bold border-b ${
              isLive
                ? 'bg-yellow-400/25 border-yellow-400 text-yellow-300'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400'
            }`}
          >
            <span className="truncate">{match.roundName}</span>
            {isLive ? (
              <span className="px-1.5 py-0.5 rounded bg-yellow-400 text-black text-[9px] font-black uppercase tracking-wider animate-pulse">
                ● 進行中
              </span>
            ) : interactive ? (
              <span className="text-[9px] text-zinc-500 font-normal">選択</span>
            ) : null}
          </div>

          {/* Player 1 Row */}
          <div
            className={`flex items-center justify-between px-3 py-2 border-b border-zinc-800/60 ${
              p1Won
                ? 'bg-yellow-400/20 font-bold text-white'
                : match.winnerId
                ? 'text-zinc-500'
                : 'text-zinc-200'
            }`}
          >
            <span className="truncate text-xs flex-1 pr-2">{p1Name}</span>
            {p1Won && (
              <span className="flex items-center gap-1 text-[11px] text-yellow-400 font-bold bg-yellow-400/10 px-1.5 py-0.5 rounded border border-yellow-400/30">
                <Crown className="w-3 h-3 text-yellow-400" />
                <span>勝</span>
              </span>
            )}
          </div>

          {/* Player 2 Row */}
          <div
            className={`flex items-center justify-between px-3 py-2 ${
              p2Won
                ? 'bg-yellow-400/20 font-bold text-white'
                : match.winnerId
                ? 'text-zinc-500'
                : 'text-zinc-200'
            }`}
          >
            <span className="truncate text-xs flex-1 pr-2">{p2Name}</span>
            {p2Won && (
              <span className="flex items-center gap-1 text-[11px] text-yellow-400 font-bold bg-yellow-400/10 px-1.5 py-0.5 rounded border border-yellow-400/30">
                <Crown className="w-3 h-3 text-yellow-400" />
                <span>勝</span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!matches || matches.length === 0) {
    return (
      <div className="w-full bg-[#111317] border border-[#2a2e37] rounded-xl p-6 text-center text-zinc-500 text-sm">
        トーナメント表がまだ生成されていません。シート2で「トーナメント表を生成」してください。
      </div>
    );
  }

  return (
    <div className="w-full bg-[#111317] border border-[#2a2e37] rounded-xl p-4 sm:p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 font-extrabold text-sm tracking-wider uppercase">
            TOURNAMENT BRACKET
          </span>
          <span className="text-xs text-zinc-400 font-medium">| トーナメント表</span>
        </div>
        {championName && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>優勝: {championName}</span>
          </div>
        )}
      </div>

      {/* Bracket Tree with ample padding to prevent yellow outline clipping */}
      <div className="overflow-x-auto p-3">
        <div className="min-w-fit flex items-center justify-start gap-6 sm:gap-10 py-2">
          {levels.map((lvl) => {
            const levelMatches = matches.filter((m) => m.roundLevel === lvl);
            const isHighest = lvl === Math.max(...levels);
            const roundTitle = isHighest
              ? '決勝戦'
              : lvl === Math.max(...levels) - 1
              ? '準決勝'
              : lvl === Math.max(...levels) - 2
              ? '準々決勝'
              : `${lvl}回戦`;

            return (
              <div key={`lvl-${lvl}`} className="flex flex-col gap-4 flex-shrink-0">
                <div
                  className={`text-xs font-bold tracking-wider text-center uppercase ${
                    isHighest ? 'text-yellow-400' : 'text-zinc-400'
                  }`}
                >
                  {roundTitle}
                </div>
                <div className="flex flex-col gap-4 justify-around h-full py-1">
                  {levelMatches.map((m) => renderMatchCard(m, isHighest))}
                </div>
              </div>
            );
          })}

          {/* Champion Podium if decided */}
          {championName && (
            <div className="flex flex-col items-center justify-center pl-4 flex-shrink-0">
              <div className="text-xs font-bold text-yellow-400 tracking-wider text-center uppercase mb-2">
                CHAMPION
              </div>
              <div className="text-center p-3 rounded-xl bg-yellow-400/15 border-2 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.25)] min-w-[140px]">
                <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1 animate-bounce" />
                <div className="text-xs text-yellow-300 font-bold uppercase tracking-widest">
                  優勝
                </div>
                <div className="text-sm font-extrabold text-white mt-0.5 truncate">
                  {championName}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
