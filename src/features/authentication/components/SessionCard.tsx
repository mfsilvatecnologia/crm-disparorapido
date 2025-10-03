/**
 * SessionCard Component
 * Displays session information
 * Implements T043 from tasks.md
 */

import type { Session } from '@/shared/types';

interface SessionCardProps {
  session: Session;
  isCurrentSession: boolean;
  onRevoke: (sessionId: string) => void;
}

export function SessionCard({ session, isCurrentSession, onRevoke }: SessionCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
      case 'suspicious':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getStatusColor(session.status)}`}>
            {session.status}
          </span>
          {isCurrentSession && (
            <span className="ml-2 inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
              Current Session
            </span>
          )}
        </div>
        {!isCurrentSession && session.status === 'active' && (
          <button
            onClick={() => onRevoke(session.id)}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Revoke
          </button>
        )}
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div>
          <span className="font-medium">Device ID:</span> {session.device_id.substring(0, 8)}...
        </div>
        <div>
          <span className="font-medium">Client Type:</span> {session.client_type}
        </div>
        {session.ip_address && (
          <div>
            <span className="font-medium">IP Address:</span> {session.ip_address}
          </div>
        )}
        {session.user_agent && (
          <div className="text-xs truncate">
            <span className="font-medium">User Agent:</span> {session.user_agent}
          </div>
        )}
        <div>
          <span className="font-medium">Created:</span> {formatDate(session.created_at)}
        </div>
        <div>
          <span className="font-medium">Last Activity:</span> {formatDate(session.last_activity_at)}
        </div>
        <div>
          <span className="font-medium">Expires:</span> {formatDate(session.expires_at)}
        </div>
      </div>
    </div>
  );
}
