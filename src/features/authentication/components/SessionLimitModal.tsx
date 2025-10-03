/**
 * SessionLimitModal Component
 * Displays session limit error and upgrade options
 * Implements T044 from tasks.md
 */

import type { SessionLimitDetails } from '../contracts/errors';

interface SessionLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: SessionLimitDetails;
}

export function SessionLimitModal({ isOpen, onClose, details }: SessionLimitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Device Limit Reached
          </h2>
          <p className="text-gray-600">
            You've reached the maximum number of active devices for your {details.plan} plan.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Active Devices:</span>
            <span className="font-bold text-yellow-800">
              {details.current_active_sessions} / {details.max_concurrent_sessions}
            </span>
          </div>
        </div>

        <div className="space-y-3 text-sm text-gray-600">
          <p>To log in on this device, you can:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Log out from another device</li>
            <li>Upgrade your plan for more devices</li>
            <li>Contact support for assistance</li>
          </ul>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              // TODO: Implement upgrade flow
              window.location.href = '/upgrade';
            }}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
}
