import React from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { User as UserType } from '@/lib/api/schemas';

interface UserAvatarProps {
  user: UserType;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  showRole?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

const roleColors = {
  admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  org_admin: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  agent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  user: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const roleLabels = {
  admin: 'Admin',
  org_admin: 'Org Admin',
  agent: 'Agente',
  viewer: 'Viewer',
  user: 'Usuário',
};

export function UserAvatar({ 
  user, 
  size = 'md', 
  showStatus = false, 
  showRole = false,
  className = '' 
}: UserAvatarProps) {
  const initials = (user.nome || user.name || user.email || '')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={user.avatar} alt={user.nome || user.name || user.email} />
          <AvatarFallback className="bg-gradient-primary text-white">
            {initials || <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        
        {showStatus && (
          <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
            user.ativo ? 'bg-green-500' : 'bg-gray-400'
          }`} />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">
            {user.nome || user.name || 'Nome não informado'}
          </p>
          {showRole && user.role && (
            <Badge 
              variant="outline" 
              className={`text-xs ${roleColors[user.role]}`}
            >
              {roleLabels[user.role]}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {user.email}
        </p>
        {user.cargo && (
          <p className="text-xs text-muted-foreground truncate">
            {user.cargo}
          </p>
        )}
      </div>
    </div>
  );
}