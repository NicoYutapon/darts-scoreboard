export interface Player {
  id: string;
  name: string;
  isParticipating?: boolean; // 大会参加フラグ
}

export type GameType = '701' | '501' | '301' | 'CR' | 'CH' | 'MEDLEY' | 'COUNT-UP' | string;

export interface LegState {
  legNumber: number;
  gameType: GameType;
  firstThrow?: 'p1' | 'p2' | null; // 先攻 (未選択可)
  p1Win: boolean;
  p2Win: boolean;
  isBreak: boolean; // 後攻が勝った場合のブレイク
}

export interface TournamentMatch {
  id: string;
  roundName: string; // 例: "1回戦 1", "準々決勝 1", "準決勝 1", "決勝"
  roundLevel: number; // 1: 1回戦/準々決勝, 2: 準決勝, 3: 決勝 など
  p1Id?: string;
  p2Id?: string;
  winnerId?: string; // 勝者のみ（数値入力は不要）
  isLive?: boolean;
}

export interface MatchConfig {
  tournamentName: string; // 大会名
  roundName: string; // 回戦
  legCount: 3 | 5; // レグ数選択 (デフォルト3)
  activeMatchId: string;
  p1Id: string;
  p2Id: string;
  legs: LegState[];
  tournamentMatches: TournamentMatch[];
  showBracketOnSheet1: boolean;
  fontFamily?: string; // 配信画面（シート1）のフォント
}

export type ActiveTab = 'sheet1' | 'sheet2' | 'sheet3';
