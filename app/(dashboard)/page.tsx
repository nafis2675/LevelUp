// app/(dashboard)/page.tsx - Main Dashboard

import { Suspense } from 'react';

// Return mock data immediately - no async/database calls
function getDashboardStats() {
  return {
    totalMembers: 247,
    newThisWeek: 23,
    xpToday: 12450,
    xpGrowth: 15,
    badgesEarned: 89,
    badgesThisWeek: 12,
    avgLevel: 8.4
  };
}

// Return mock data immediately - no async/database calls
function getTopMembers() {
  return [
    { id: '1', displayName: 'User 1', totalXP: 15000, level: 15, avatarUrl: null },
    { id: '2', displayName: 'User 2', totalXP: 12000, level: 13, avatarUrl: null },
    { id: '3', displayName: 'User 3', totalXP: 10000, level: 12, avatarUrl: null },
    { id: '4', displayName: 'User 4', totalXP: 8500, level: 11, avatarUrl: null },
    { id: '5', displayName: 'User 5', totalXP: 7200, level: 10, avatarUrl: null },
  ];
}

function StatCard({ label, value, trend }: { label: string; value: string | number; trend?: { value: number; label: string } }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">{label}</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
            {trend && (
              <p className="mt-2 text-sm text-gray-600">
                <span className="text-green-600 font-medium">+{trend.value}%</span> {trend.label}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TopMembersList({ members }: { members: any[] }) {
  return (
    <div className="space-y-3">
      {members.map((member, index) => (
        <div key={member.id} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
          <span className="text-2xl font-bold text-gray-400 w-8">
            {index + 1}
          </span>
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
            {member.displayName[0]}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{member.displayName}</p>
            <p className="text-sm text-gray-600">{member.totalXP.toLocaleString()} XP</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            index < 3 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            Level {member.level}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const stats = getDashboardStats();
  const topMembers = getTopMembers();

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of your community&apos;s gamification stats
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Members"
          value={stats.totalMembers}
          trend={{ value: stats.newThisWeek, label: 'this week' }}
        />
        <StatCard
          label="XP Awarded Today"
          value={stats.xpToday.toLocaleString()}
          trend={{ value: stats.xpGrowth, label: 'vs yesterday' }}
        />
        <StatCard
          label="Badges Earned"
          value={stats.badgesEarned}
          trend={{ value: stats.badgesThisWeek, label: 'this week' }}
        />
        <StatCard
          label="Average Level"
          value={stats.avgLevel.toFixed(1)}
        />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Members</h2>
        <Suspense fallback={<div>Loading...</div>}>
          <TopMembersList members={topMembers} />
        </Suspense>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">5 min ago</span>
            <span className="text-gray-900">User 1 reached Level 15</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">12 min ago</span>
            <span className="text-gray-900">User 2 earned badge &quot;Chatter&quot;</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">1 hour ago</span>
            <span className="text-gray-900">User 3 claimed reward &quot;Pro Member&quot;</span>
          </div>
        </div>
      </div>
    </div>
  );
}
