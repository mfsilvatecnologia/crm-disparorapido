import React from 'react';

interface WorkerCardProps {
  workerId: string;
  status: 'active' | 'inactive' | 'error';
  lastActivity: string;
  jobsProcessed: number;
}

export function WorkerCard({ workerId, status, lastActivity, jobsProcessed }: WorkerCardProps) {
  const statusColor = {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    error: 'bg-red-500',
  }[status];

  return (
    <div className="p-4 border rounded-lg shadow-sm flex items-center space-x-4">
      <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
      <div>
        <h3 className="font-semibold text-lg">Worker ID: {workerId}</h3>
        <p className="text-sm text-gray-600">Status: {status}</p>
        <p className="text-sm text-gray-600">Última Atividade: {lastActivity}</p>
        <p className="text-sm text-gray-600">Jobs Processados: {jobsProcessed}</p>
      </div>
    </div>
  );
}
