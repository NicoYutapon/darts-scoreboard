import React, { useState } from 'react';
import { MatchConfig, Player } from '../types/darts';
import { TournamentBracket } from './TournamentBracket';
import { ScoreboardBar } from './ScoreboardBar';
import { Copy, Check, Eye, EyeOff, ExternalLink, Layers, LayoutTemplate, Trophy } from 'lucide-react';

interface Sheet1BroadcastProps {
  config: MatchConfig;
  setConfig?: React.Dispatch<React.SetStateAction<MatchConfig>>;
  p1: Player;
  p2: Player;
  players: Player[];
}

export const Sheet1Broadcast: React.FC<Sheet1BroadcastProps> = ({
  config,
  setConfig,
  p1,
  p2,
  players,
}) => {
  const showBracket = config.showBracketOnSheet1 !== false;
  const [selectedObsView, setSelectedObsView] = useState<'both' | 'scoreboard' | 'bracket'>('both');
  const [copiedObs, setCopiedObs] = useState(false);

  // Generate OBS URL based on selected view mode
  const getObsUrl = (view: 'both' | 'scoreboard' | 'bracket' = selectedObsView) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    if (view === 'both') {
      return `${origin}${pathname}?mode=obs`;
    }
    return `${origin}${pathname}?mode=obs&view=${view}`;
  };

  const handleCopyObsUrl = (view: 'both' | 'scoreboard' | 'bracket' = selectedObsView) => {
    navigator.clipboard.writeText(getObsUrl(view));
    setCopiedObs(true);
    setTimeout(() => setCopiedObs(false), 2000);
  };

  const handleToggleBracket = () => {
    if (setConfig) {
      setConfig((prev) => ({
        ...prev,
        showBracketOnSheet1: !showBracket,
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top minimal control bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-xl text-sm shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-zinc-100 text-sm">配信画面 (シート1)</span>
          <span className="text-zinc-500 text-xs hidden sm:inline">
            | 大会名: {config.tournamentName || '未設定'} ({config.legCount || 3}レグ制)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Toggle Bracket Display on Sheet 1 & OBS */}
          <button
            type="button"
            onClick={handleToggleBracket}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              showBracket
                ? 'bg-zinc-800 text-yellow-400 border-zinc-700 font-semibold'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
            title="トーナメント表の表示/非表示を切り替え（OBSにも即時反映されます）"
          >
            {showBracket ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>トーナメント表 {showBracket ? '表示中' : '非表示'}</span>
          </button>

          {/* Open OBS preview in new tab */}
          <a
            href={getObsUrl(selectedObsView)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:text-white transition-colors"
            title="OBS専用の透過画面を別タブで確認"
          >
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">透過プレビュー確認</span>
          </a>

          {/* Copy OBS URL */}
          <button
            type="button"
            onClick={() => handleCopyObsUrl(selectedObsView)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-lg font-semibold border transition-all ${
              copiedObs
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-yellow-400 hover:bg-yellow-300 text-black border-yellow-400 shadow-sm'
            }`}
            title="OBSのブラウザソースに貼り付ける透過URLをコピー"
          >
            {copiedObs ? (
              <>
                <Check className="w-4 h-4" />
                <span>コピー完了！</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>
                  OBS用URL（
                  {selectedObsView === 'both'
                    ? '両方表示'
                    : selectedObsView === 'scoreboard'
                    ? 'スコアのみ'
                    : 'トーナメントのみ'}
                  ・透過）をコピー
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* OBS URL Type Selector Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-300">
          <Layers className="w-4 h-4 text-yellow-400" />
          <span className="font-bold text-white">OBS透過URLの表示形式:</span>
          <span className="text-zinc-400">
            OBSのブラウザソースに追加する表示内容を選択できます
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          <button
            type="button"
            onClick={() => setSelectedObsView('both')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              selectedObsView === 'both'
                ? 'bg-yellow-400 text-black font-bold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>両方表示（推奨）</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedObsView('scoreboard')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              selectedObsView === 'scoreboard'
                ? 'bg-yellow-400 text-black font-bold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>スコアボードのみ</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedObsView('bracket')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              selectedObsView === 'bracket'
                ? 'bg-yellow-400 text-black font-bold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>トーナメント表のみ</span>
          </button>
        </div>
      </div>

      {/* Broadcast Preview Frame */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-8 space-y-8">
        <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800/50">
          <span className="font-medium flex items-center gap-1.5 text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            スコアボード表示プレビュー
          </span>
          <span className="text-[11px] text-zinc-500 hidden sm:inline">
            ※OBSのブラウザソース上では外枠はなく完全透過で表示されます
          </span>
        </div>

        {/* Scoreboard Bar Component */}
        <ScoreboardBar config={config} p1={p1} p2={p2} />

        {/* Tournament Bracket on Sheet 1 */}
        {showBracket && (
          <div className="pt-4 border-t border-zinc-800/50">
            <div className="mb-3 text-xs font-semibold text-zinc-400">トーナメント表</div>
            <TournamentBracket
              matches={config.tournamentMatches}
              players={players}
              activeMatchId={config.activeMatchId}
            />
          </div>
        )}
      </div>
    </div>
  );
};
