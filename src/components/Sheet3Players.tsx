import React, { useState } from 'react';
import { Player } from '../types/darts';
import { Trash2, Plus, User, Check, Edit2 } from 'lucide-react';

interface Sheet3PlayersProps {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  activeP1Id: string;
  activeP2Id: string;
}

export const Sheet3Players: React.FC<Sheet3PlayersProps> = ({
  players,
  setPlayers,
  activeP1Id,
  activeP2Id,
}) => {
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newP: Player = {
      id: `p_${Date.now()}`,
      name: name.trim(),
      isParticipating: true, // デフォルトで参加
    };

    setPlayers((prev) => [...prev, newP]);
    setName('');
  };

  const handleStartEdit = (p: Player) => {
    setEditingId(p.id);
    setEditingName(p.name);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingName.trim()) return;
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: editingName.trim() } : p))
    );
    setEditingId(null);
    setEditingName('');
  };

  const handleToggleParticipating = (id: string) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const current = p.isParticipating !== false;
          return { ...p, isParticipating: !current };
        }
        return p;
      })
    );
  };

  const handleToggleAll = (participate: boolean) => {
    setPlayers((prev) =>
      prev.map((p) => ({ ...p, isParticipating: participate }))
    );
  };

  const handleDeletePlayer = (id: string) => {
    if (id === activeP1Id || id === activeP2Id) {
      if (
        !confirm(
          'この選手は現在シート1・2の対戦枠に選択されていますが、削除してもよろしいですか？'
        )
      ) {
        return;
      }
    }
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const participatingCount = players.filter(
    (p) => p.isParticipating !== false
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">選手管理</h2>
            <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3" />
              自動保存中
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            一度入力した選手はブラウザに自動保存されます。参加にチェックを入れた選手がトーナメント生成や対戦相手候補に反映されます。
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-lg border border-yellow-400/20">
            大会参加: {participatingCount} / {players.length}名
          </span>
        </div>
      </div>

      {/* Simplified Add Player Form */}
      <form
        onSubmit={handleAddPlayer}
        className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-end gap-3"
      >
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            選手氏名
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-yellow-400"
          />
        </div>

        <button
          type="submit"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs shadow transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>選手を追加</span>
        </button>
      </form>

      {/* Players List Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {/* Table actions bar */}
        {players.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-950/70 border-b border-zinc-800 text-xs text-zinc-400">
            <span>選手一覧 ({players.length}名登録済み)</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleAll(true)}
                className="hover:text-yellow-400 transition-colors"
              >
                全員参加
              </button>
              <span className="text-zinc-600">|</span>
              <button
                type="button"
                onClick={() => handleToggleAll(false)}
                className="hover:text-zinc-200 transition-colors"
              >
                全員解除
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-950 border-b border-zinc-800 text-xs text-zinc-400 font-semibold">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">選手氏名</th>
                <th className="py-3 px-4 w-36 text-center">大会参加</th>
                <th className="py-3 px-4 w-28 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {players.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-500 text-xs">
                    登録されている選手はいません。上のフォームから選手を追加してください（追加した選手は自動保存されます）。
                  </td>
                </tr>
              ) : (
                players.map((p, idx) => {
                  const isParticipating = p.isParticipating !== false;
                  const isEditing = editingId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-zinc-800/40 transition-colors ${
                        isParticipating ? '' : 'opacity-60 bg-zinc-950/30'
                      }`}
                    >
                      <td className="py-2.5 px-4 text-center text-xs text-zinc-500 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-white">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(p.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              autoFocus
                              className="bg-zinc-950 border border-yellow-400 rounded px-2 py-1 text-sm text-white focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(p.id)}
                              className="px-2 py-1 rounded bg-yellow-400 text-black text-xs font-bold"
                            >
                              保存
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs font-bold">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <span>{p.name}</span>
                          </div>
                        )}
                      </td>

                      {/* Checkbox: 大会参加 */}
                      <td
                        onClick={() => handleToggleParticipating(p.id)}
                        className="py-2.5 px-4 text-center cursor-pointer select-none"
                      >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-950 border border-zinc-800 hover:border-zinc-700">
                          <input
                            type="checkbox"
                            checked={isParticipating}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-yellow-400 bg-zinc-900 border-zinc-700 pointer-events-none accent-yellow-400"
                          />
                          <span
                            className={`text-xs font-bold ${
                              isParticipating ? 'text-yellow-400' : 'text-zinc-500'
                            }`}
                          >
                            {isParticipating ? '参加する' : '不参加'}
                          </span>
                        </div>
                      </td>

                      {/* Operations */}
                      <td className="py-2.5 px-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(p)}
                            className="text-zinc-500 hover:text-yellow-400 transition-colors p-1"
                            title="選手名を編集"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePlayer(p.id)}
                            className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                            title="削除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
