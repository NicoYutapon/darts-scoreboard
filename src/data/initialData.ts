import { MatchConfig, Player, TournamentMatch } from '../types/darts';

// 初回からブランクの状態
export const INITIAL_PLAYERS: Player[] = [];

// 初回からブランクのトーナメント表（未入力状態）
export const INITIAL_TOURNAMENT_MATCHES: TournamentMatch[] = [
  {
    id: 'm_semi1',
    roundName: '準決勝 1',
    roundLevel: 1,
    isLive: true,
  },
  {
    id: 'm_semi2',
    roundName: '準決勝 2',
    roundLevel: 1,
  },
  {
    id: 'm_final',
    roundName: '決勝戦',
    roundLevel: 2,
  },
];

export const INITIAL_MATCH_CONFIG: MatchConfig = {
  tournamentName: 'ダーツトーナメント',
  roundName: '準決勝 1',
  legCount: 3, // 基本3レグから選択
  activeMatchId: 'm_semi1',
  p1Id: '',
  p2Id: '',
  showBracketOnSheet1: true,
  fontFamily: 'Cambria, "Times New Roman", Georgia, serif, system-ui',
  legs: [
    {
      legNumber: 1,
      gameType: '701',
      firstThrow: null, // 初期状態は未選択
      p1Win: false,
      p2Win: false,
      isBreak: false,
    },
    {
      legNumber: 2,
      gameType: 'CR',
      firstThrow: null,
      p1Win: false,
      p2Win: false,
      isBreak: false,
    },
    {
      legNumber: 3,
      gameType: 'CH', // 3レグ目は初期でCH
      firstThrow: null,
      p1Win: false,
      p2Win: false,
      isBreak: false,
    },
    {
      legNumber: 4,
      gameType: '701',
      firstThrow: null,
      p1Win: false,
      p2Win: false,
      isBreak: false,
    },
    {
      legNumber: 5,
      gameType: 'CH',
      firstThrow: null,
      p1Win: false,
      p2Win: false,
      isBreak: false,
    },
  ],
  tournamentMatches: INITIAL_TOURNAMENT_MATCHES,
};
