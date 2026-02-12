import React from 'react';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/shared/components/ui/sidebar';
import { useAuth } from '@/shared/contexts/AuthContext';
import { TenantLogo } from '@/shared/components/branding/TenantLogo';
import { useNavigate } from 'react-router-dom';

export function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLogoClick = () => {
    navigate('/app');
  };

  return (
    <header className="sticky top-0 z-[100] w-full border-b bg-card/50 backdrop-blur-sm">
      <div className="flex h-16 items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <SidebarTrigger />

        {/* Spacer */}
        <div className="flex-1" />

        {/* User Menu */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={user?.nome || user?.email} />
                <AvatarFallback className="bg-gray-100 text-gray-600">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 z-[110]" sideOffset={5}>
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src="" alt={user?.nome || user?.email} />
                  <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5 flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate">{user?.nome || 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/app/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}