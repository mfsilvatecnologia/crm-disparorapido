import React from 'react';

interface ScrapingJobCardProps {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  targetUrl: string;
  progress: number;
  startTime: string;
  endTime?: string;
}

export function ScrapingJobCard({ jobId, status, targetUrl, progress, startTime, endTime }: ScrapingJobCardProps) {
  const statusColor = {
    pending: 'bg-yellow-500',
    running: 'bg-blue-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
  }[status];

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg">Job ID: {jobId}</h3>
        <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
      </div>
      <p className="text-sm text-gray-600">Status: {status}</p>
      <p className="text-sm text-gray-600">URL Alvo: {targetUrl}</p>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="text-sm text-gray-600 mt-1">Progresso: {progress}%</p>
      <p className="text-sm text-gray-600">Início: {startTime}</p>
      {endTime && <p className="text-sm text-gray-600">Fim: {endTime}</p>}
    </div>
  );
}
