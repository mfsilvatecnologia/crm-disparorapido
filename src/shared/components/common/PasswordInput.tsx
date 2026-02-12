import React, { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/utils';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrengthIndicator?: boolean;
  error?: string;
}

interface PasswordStrength {
  score: number;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

const checkPasswordStrength = (password: string): PasswordStrength => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  return { score, checks };
};

const getStrengthColor = (score: number): string => {
  if (score < 2) return 'bg-red-500';
  if (score < 4) return 'bg-yellow-500';
  return 'bg-green-500';
};

const getStrengthText = (score: number): string => {
  if (score < 2) return 'Fraca';
  if (score < 4) return 'Média';
  return 'Forte';
};

export function PasswordInput({ 
  showStrengthIndicator = false, 
  error,
  className,
  ...props 
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  
  const strength = showStrengthIndicator ? checkPasswordStrength(password) : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    props.onChange?.(e);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          {...props}
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={handleChange}
          className={cn(
            error ? 'border-destructive' : '',
            'pr-10',
            className
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {showStrengthIndicator && password && strength && (
        <div className="space-y-2">
          {/* Strength Bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full transition-all duration-300',
                  getStrengthColor(strength.score)
                )}
                style={{ width: `${(strength.score / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {getStrengthText(strength.score)}
            </span>
          </div>

          {/* Requirements */}
          <div className="grid grid-cols-1 gap-1 text-xs">
            <div className={cn(
              'flex items-center gap-2',
              strength.checks.length ? 'text-green-600' : 'text-muted-foreground'
            )}>
              {strength.checks.length ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              Pelo menos 8 caracteres
            </div>
            
            <div className={cn(
              'flex items-center gap-2',
              strength.checks.uppercase ? 'text-green-600' : 'text-muted-foreground'
            )}>
              {strength.checks.uppercase ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              Uma letra maiúscula
            </div>
            
            <div className={cn(
              'flex items-center gap-2',
              strength.checks.lowercase ? 'text-green-600' : 'text-muted-foreground'
            )}>
              {strength.checks.lowercase ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              Uma letra minúscula
            </div>
            
            <div className={cn(
              'flex items-center gap-2',
              strength.checks.number ? 'text-green-600' : 'text-muted-foreground'
            )}>
              {strength.checks.number ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              Um número
            </div>
            
            <div className={cn(
              'flex items-center gap-2',
              strength.checks.special ? 'text-green-600' : 'text-muted-foreground'
            )}>
              {strength.checks.special ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              Um caractere especial
            </div>
          </div>
        </div>
      )}
    </div>
  );
}