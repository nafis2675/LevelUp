// app/(dashboard)/leaderboard/page.tsx

'use client';

import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  totalXP: number;
  level: number;
  weeklyXP?: number;
  badgeCount?: number;
  rank?: number;
}

export default function LeaderboardPage() {
  const [selectedType, setSelectedType] = useState<'total_xp' | 'weekly_xp' | 'level' | 'badges_earned'>('total_xp');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all_time' | 'weekly' | 'monthly'>('all_time');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard data when type or timeframe changes
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get companyId from environment or context
        const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID || 'demo-company';

        const params = new URLSearchParams({
          companyId,
          type: selectedType,
          timeframe: selectedTimeframe,
          limit: '50',
        });

        const response = await fetch(`/api/members/leaderboard?${params}`);

        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }

        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
        setLeaderboard([]); // Clear leaderboard on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedType, selectedTimeframe]);

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
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedType === 'total_xp'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              Total XP
            </button>
            <button
              onClick={() => setSelectedType('weekly_xp')}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedType === 'weekly_xp'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              Weekly XP
            </button>
            <button
              onClick={() => setSelectedType('level')}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedType === 'level'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              Level
            </button>
            <button
              onClick={() => setSelectedType('badges_earned')}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedType === 'badges_earned'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              Badges
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading leaderboard...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            <p className="font-medium mb-2">Failed to load leaderboard</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && leaderboard.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium mb-2">No members yet</p>
            <p className="text-sm">The leaderboard will appear once members start earning XP</p>
          </div>
        )}

        {/* Leaderboard List */}
        {!isLoading && !error && leaderboard.length > 0 && (
          <div className="space-y-2">
            {leaderboard.map((entry) => (
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
                  {selectedType === 'weekly_xp' && entry.weeklyXP !== undefined
                    ? `${entry.weeklyXP.toLocaleString()} XP this week`
                    : selectedType === 'badges_earned' && entry.badgeCount !== undefined
                    ? `${entry.badgeCount} badges`
                    : `${entry.totalXP.toLocaleString()} XP`}
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
        )}
      </div>
    </div>
  );
}
