// app/(dashboard)/rules/create/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateRulePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    eventType: 'message.created',
    xpAmount: 5,
    cooldown: 0,
    maxPerDay: 0,
    isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would call your API
    console.log('Creating rule:', formData);
    // router.push('/rules');
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex items-center gap-4">
        <Link href="/rules" className="text-gray-600 hover:text-gray-900">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create XP Rule</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rule Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Message sent in chat"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              A descriptive name for this XP rule
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trigger Event
            </label>
            <select
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Select event...</option>
              <option value="message.created">Message Sent</option>
              <option value="purchase.completed">Purchase Made</option>
              <option value="course.completed">Course Completed</option>
              <option value="member.joined">New Member Joined</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              The event that triggers this XP grant
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              XP Amount
            </label>
            <input
              type="number"
              value={formData.xpAmount}
              onChange={(e) => setFormData({ ...formData, xpAmount: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              min="1"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              How much XP to award when this event occurs
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cooldown (seconds)
            </label>
            <input
              type="number"
              value={formData.cooldown}
              onChange={(e) => setFormData({ ...formData, cooldown: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              min="0"
            />
            <p className="mt-1 text-sm text-gray-500">
              Prevent spamming the same action (0 = no cooldown)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Per Day
            </label>
            <input
              type="number"
              value={formData.maxPerDay}
              onChange={(e) => setFormData({ ...formData, maxPerDay: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              min="0"
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum times this can trigger per day (0 = unlimited)
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active (rule will start granting XP immediately)
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Create Rule
            </button>
            <Link
              href="/rules"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
