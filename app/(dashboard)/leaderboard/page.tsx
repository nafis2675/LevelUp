// app/(dashboard)/leaderboard/page.tsx

'use client';

import { useState } from 'react';

const mockLeaderboard = [
  { id: '1', displayName: 'AlexGamer', totalXP: 25000, level: 18, avatarUrl: null, rank: 1 },
  { id: '2', displayName: 'SarahPro', totalXP: 22000, level: 17, avatarUrl: null, rank: 2 },
  { id: '3', displayName: 'MikeElite', totalXP: 19500, level: 16, avatarUrl: null, rank: 3 },
  { id: '4', displayName: 'EmilyChamp', totalXP: 17000, level: 15, avatarUrl: null, rank: 4 },
  { id: '5', displayName: 'ChrisAce', totalXP: 15500, level: 14, avatarUrl: null, rank: 5 },
  { id: '6', displayName: 'JohnStar', totalXP: 14000, level: 13, avatarUrl: null, rank: 6 },
  { id: '7', displayName: 'LisaMaster', totalXP: 12800, level: 13, avatarUrl: null, rank: 7 },
  { id: '8', displayName: 'DavidHero', totalXP: 11500, level: 12, avatarUrl: null, rank: 8 },
  { id: '9', displayName: 'AnnaPro', totalXP: 10200, level: 12, avatarUrl: null, rank: 9 },
  { id: '10', displayName: 'TomLegend', totalXP: 9500, level: 11, avatarUrl: null, rank: 10 },
];

export default function LeaderboardPage() {
  const [selectedType, setSelectedType] = useState<'total_xp' | 'weekly_xp' | 'level' | 'badges_earned'>('total_xp');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all_time' | 'weekly' | 'monthly'>('all_time');

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-300';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-white text-gray-600';
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          See who's leading the community
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType('total_xp')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedType === 'total_xp'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Total XP
            </button>
            <button
              onClick={() => setSelectedType('weekly_xp')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedType === 'weekly_xp'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Weekly XP
            </button>
            <button
              onClick={() => setSelectedType('level')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedType === 'level'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Level
            </button>
            <button
              onClick={() => setSelectedType('badges_earned')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedType === 'badges_earned'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Badges
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {mockLeaderboard.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 transition hover:shadow-md ${getRankColor(entry.rank)}`}
            >
              <div className="flex items-center justify-center w-12 h-12 text-2xl font-bold">
                {getRankEmoji(entry.rank) || entry.rank}
              </div>

              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                {entry.displayName[0]}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-lg">{entry.displayName}</p>
                <p className="text-sm text-gray-600">
                  {entry.totalXP.toLocaleString()} XP
                </p>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Level {entry.level}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
