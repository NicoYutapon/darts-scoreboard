import React from 'react';
import { MatchConfig, Player } from '../types/darts';

interface ScoreboardBarProps {
  config: MatchConfig;
  p1: Player;
  p2: Player;
  className?: string;
}

export const ScoreboardBar: React.FC<ScoreboardBarProps> = ({
  config,
  p1,
  p2,
  className = '',
}) => {
  // Filter legs according to selected legCount (3 or 5)
  const activeLegs = config.legs.slice(0, config.legCount || 3);

  const selectedFont =
    config.fontFamily || 'Cambria, "Times New Roman", Georgia, serif, system-ui';

  return (
    <div className={`w-full max-w-4xl mx-auto select-none ${className}`}>
      <div className="rounded-lg overflow-hidden border border-[#373d47] shadow-2xl bg-[#111317]">
        {/* Row 1: Player 1 */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-[#21262f] to-[#161a20] border-b border-[#262c37]">
          {/* Player 1 Name */}
          <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
            <span
              className="text-white text-lg sm:text-2xl font-bold truncate drop-shadow-md tracking-wide"
              style={{
                fontFamily: selectedFont,
              }}
            >
              {p1.name || '（選手1 未選択）'}
            </span>
          </div>

          {/* Player 1 Leg Result Boxes */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {activeLegs.map((leg) => {
              const won = leg.p1Win;
              const isBreak = leg.p1Win && leg.isBreak;

              if (won) {
                return (
                  <div
                    key={`p1-leg-${leg.legNumber}`}
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-md flex items-center justify-center font-bold text-black text-sm sm:text-lg shadow-[0_0_10px_rgba(250,204,21,0.6)]"
                    style={{
                      background:
                        'linear-gradient(180deg, #fde047 0%, #eab308 60%, #ca8a04 100%)',
                      border: '1px solid #facc15',
                    }}
                  >
                    {isBreak ? (
                      <span className="font-extrabold font-mono">B</span>
                    ) : (
                      <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-yellow-900/30 inline-block opacity-40" />
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={`p1-leg-${leg.legNumber}`}
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-md flex items-center justify-center bg-[#15181f] border border-[#262b35] shadow-inner"
                >
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-sm bg-[#0e1014] border border-black/40" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 2: Center Meta Info (Tournament Name + Round Name + Game Types) */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-[#0f1216] border-b border-[#262c37]">
          <div className="flex items-center gap-2 sm:gap-3 truncate pr-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold text-zinc-200 uppercase bg-[#20252e] border border-zinc-700 truncate max-w-[160px] sm:max-w-[240px]">
              {config.tournamentName || 'DARTS TOURNAMENT'}
            </span>
            <span
              className="font-extrabold tracking-wider text-xs sm:text-sm uppercase truncate"
              style={{ color: '#facc15' }}
            >
              {config.roundName || 'MATCH'}
            </span>
          </div>

          {/* Game Labels (matching 3 or 5 legs) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {activeLegs.map((leg) => (
              <div
                key={`game-${leg.legNumber}`}
                className="w-9 sm:w-11 text-center font-black text-white text-xs sm:text-sm tracking-tight font-mono"
              >
                {leg.gameType}
              </div>
            ))}
          </div>
        </div>

        {/* Row 3: Player 2 */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-[#181c23] to-[#111317]">
          {/* Player 2 Name */}
          <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
            <span
              className="text-white text-lg sm:text-2xl font-bold truncate drop-shadow-md tracking-wide"
              style={{
                fontFamily: selectedFont,
              }}
            >
              {p2.name || '（選手2 未選択）'}
            </span>
          </div>

          {/* Player 2 Leg Result Boxes */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {activeLegs.map((leg) => {
              const won = leg.p2Win;
              const isBreak = leg.p2Win && leg.isBreak;

              if (won) {
                return (
                  <div
                    key={`p2-leg-${leg.legNumber}`}
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-md flex items-center justify-center font-bold text-black text-sm sm:text-lg shadow-[0_0_10px_rgba(250,204,21,0.6)]"
                    style={{
                      background:
                        'linear-gradient(180deg, #fde047 0%, #eab308 60%, #ca8a04 100%)',
                      border: '1px solid #facc15',
                    }}
                  >
                    {isBreak ? (
                      <span className="font-extrabold font-mono">B</span>
                    ) : (
                      <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-yellow-900/30 inline-block opacity-40" />
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={`p2-leg-${leg.legNumber}`}
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-md flex items-center justify-center bg-[#15181f] border border-[#262b35] shadow-inner"
                >
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-sm bg-[#0e1014] border border-black/40" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
