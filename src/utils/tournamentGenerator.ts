import { Player, TournamentMatch } from '../types/darts';

export function generateTournamentFromPlayerCount(
  players: Player[]
): TournamentMatch[] {
  const count = players.length;

  if (count <= 2) {
    return [
      {
        id: 'm_final',
        roundName: '決勝戦',
        roundLevel: 1,
        p1Id: players[0]?.id || undefined,
        p2Id: players[1]?.id || undefined,
        isLive: true,
      },
    ];
  }

  if (count <= 4) {
    return [
      {
        id: 'm_semi1',
        roundName: '準決勝 1',
        roundLevel: 1,
        p1Id: players[0]?.id || undefined,
        p2Id: players[1]?.id || undefined,
        isLive: true,
      },
      {
        id: 'm_semi2',
        roundName: '準決勝 2',
        roundLevel: 1,
        p1Id: players[2]?.id || undefined,
        p2Id: players[3]?.id || undefined,
      },
      {
        id: 'm_final',
        roundName: '決勝戦',
        roundLevel: 2,
        p1Id: undefined,
        p2Id: undefined,
      },
    ];
  }

  // 5 to 8 players (8-player bracket)
  if (count <= 8) {
    return [
      {
        id: 'm_q1',
        roundName: '準々決勝 1',
        roundLevel: 1,
        p1Id: players[0]?.id || undefined,
        p2Id: players[1]?.id || undefined,
        isLive: true,
      },
      {
        id: 'm_q2',
        roundName: '準々決勝 2',
        roundLevel: 1,
        p1Id: players[2]?.id || undefined,
        p2Id: players[3]?.id || undefined,
      },
      {
        id: 'm_q3',
        roundName: '準々決勝 3',
        roundLevel: 1,
        p1Id: players[4]?.id || undefined,
        p2Id: players[5]?.id || undefined,
      },
      {
        id: 'm_q4',
        roundName: '準々決勝 4',
        roundLevel: 1,
        p1Id: players[6]?.id || undefined,
        p2Id: players[7]?.id || undefined,
      },
      {
        id: 'm_semi1',
        roundName: '準決勝 1',
        roundLevel: 2,
        p1Id: undefined,
        p2Id: undefined,
      },
      {
        id: 'm_semi2',
        roundName: '準決勝 2',
        roundLevel: 2,
        p1Id: undefined,
        p2Id: undefined,
      },
      {
        id: 'm_final',
        roundName: '決勝戦',
        roundLevel: 3,
        p1Id: undefined,
        p2Id: undefined,
      },
    ];
  }

  // 9 to 16 players
  const matches: TournamentMatch[] = [];
  for (let i = 0; i < 8; i++) {
    matches.push({
      id: `m_r1_${i + 1}`,
      roundName: `1回戦 ${i + 1}`,
      roundLevel: 1,
      p1Id: players[i * 2]?.id || undefined,
      p2Id: players[i * 2 + 1]?.id || undefined,
      isLive: i === 0,
    });
  }
  for (let i = 0; i < 4; i++) {
    matches.push({
      id: `m_q${i + 1}`,
      roundName: `準々決勝 ${i + 1}`,
      roundLevel: 2,
    });
  }
  matches.push({
    id: 'm_semi1',
    roundName: '準決勝 1',
    roundLevel: 3,
  });
  matches.push({
    id: 'm_semi2',
    roundName: '準決勝 2',
    roundLevel: 3,
  });
  matches.push({
    id: 'm_final',
    roundName: '決勝戦',
    roundLevel: 4,
  });

  return matches;
}

export function createBlankTournament(size: 2 | 4 | 8 = 4): TournamentMatch[] {
  if (size === 2) {
    return [
      {
        id: 'm_final',
        roundName: '決勝戦',
        roundLevel: 1,
        isLive: true,
      },
    ];
  }

  if (size === 4) {
    return [
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
  }

  return [
    {
      id: 'm_q1',
      roundName: '準々決勝 1',
      roundLevel: 1,
      isLive: true,
    },
    {
      id: 'm_q2',
      roundName: '準々決勝 2',
      roundLevel: 1,
    },
    {
      id: 'm_q3',
      roundName: '準々決勝 3',
      roundLevel: 1,
    },
    {
      id: 'm_q4',
      roundName: '準々決勝 4',
      roundLevel: 1,
    },
    {
      id: 'm_semi1',
      roundName: '準決勝 1',
      roundLevel: 2,
    },
    {
      id: 'm_semi2',
      roundName: '準決勝 2',
      roundLevel: 2,
    },
    {
      id: 'm_final',
      roundName: '決勝戦',
      roundLevel: 3,
    },
  ];
}
