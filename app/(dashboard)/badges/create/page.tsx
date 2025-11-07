// app/(dashboard)/badges/create/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateBadgePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '🏆',
    rarity: 'common',
    requirementType: 'xp_total',
    requirementValue: 1000,
    isSecret: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Get companyId from environment or context
      // For now, using a placeholder - in production this should come from auth/context
      const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID || 'demo-company';

      // Build requirement object based on form data
      const requirement: any = {
        type: formData.requirementType,
      };

      // Add the appropriate field based on requirement type
      if (formData.requirementType === 'streak') {
        requirement.days = formData.requirementValue;
      } else {
        requirement.value = formData.requirementValue;
      }

      const response = await fetch('/api/badges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          name: formData.name,
          description: formData.description,
          imageUrl: formData.imageUrl,
          rarity: formData.rarity,
          requirement,
          isSecret: formData.isSecret,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create badge');
      }

      const badge = await response.json();
      console.log('Badge created successfully:', badge);

      // Redirect to badges page
      router.push('/badges');
    } catch (err) {
      console.error('Error creating badge:', err);
      setError(err instanceof Error ? err.message : 'Failed to create badge');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex items-center gap-4">
        <Link href="/badges" className="text-gray-600 hover:text-gray-900">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create Badge</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Badge Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Level 10 Master"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
              placeholder="Reach level 10 to earn this badge"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Badge Icon (Emoji or URL)
            </label>
            <div className="flex gap-4">
              <div className="text-6xl">{formData.imageUrl}</div>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="🏆 or https://..."
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rarity
            </label>
            <select
              value={formData.rarity}
              onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="common">Common</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requirement Type
            </label>
            <select
              value={formData.requirementType}
              onChange={(e) => setFormData({ ...formData, requirementType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="xp_total">Total XP</option>
              <option value="level">Level Reached</option>
              <option value="message_count">Message Count</option>
              <option value="purchase_count">Purchase Count</option>
              <option value="streak">Activity Streak (days)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requirement Value
            </label>
            <input
              type="number"
              value={formData.requirementValue}
              onChange={(e) => setFormData({ ...formData, requirementValue: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              min="1"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isSecret"
              checked={formData.isSecret}
              onChange={(e) => setFormData({ ...formData, isSecret: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isSecret" className="ml-2 block text-sm text-gray-700">
              Secret Badge (hidden until earned)
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Badge'}
            </button>
            <Link
              href="/badges"
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
