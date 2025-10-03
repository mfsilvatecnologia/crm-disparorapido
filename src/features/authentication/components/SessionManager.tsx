/**
 * SessionManager Component
 * Manages and displays active sessions
 * Implements T042 from tasks.md
 */

import { useEffect, useState } from 'react';
import type { Session } from '@/shared/types';
import { listActiveSessions, revokeSession } from '../services/sessionService';
import { SessionCard } from './SessionCard';
import { authStorage } from '@/shared/utils/storage';

export function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentSessionId = authStorage.getSessionId();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await listActiveSessions();
      setSessions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this session?')) {
      return;
    }

    try {
      await revokeSession(sessionId);
      // Refresh the list
      await loadSessions();
    } catch (err: any) {
      setError(err.message || 'Failed to revoke session');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Loading sessions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
        <button
          onClick={loadSessions}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Active Sessions</h2>
        <p className="text-gray-600">
          Manage your active sessions across different devices.
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No active sessions found.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isCurrentSession={session.id === currentSessionId}
              onRevoke={handleRevoke}
            />
          ))}
        </div>
      )}

      <button
        onClick={loadSessions}
        className="mt-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
      >
        Refresh
      </button>
    </div>
  );
}
