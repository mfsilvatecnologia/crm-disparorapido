import { Coins } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { useCreditBalance } from '../../hooks/credits/useCreditBalance';
import { useNavigate } from 'react-router-dom';

export function CreditsBadge() {
  const { data: balance, isLoading } = useCreditBalance();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg animate-pulse">
        <Coins className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">...</span>
      </div>
    );
  }

  if (!balance) {
    return null;
  }

  const displayBalance = balance.saldoCreditosCentavos ;
  const formattedBalance = displayBalance.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    minimumIntegerDigits: 1,
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate('/app/credits')}
      className="flex items-center gap-2 hover:bg-accent"
    >
      <Coins className="h-4 w-4 text-amber-500" />
      <span className="text-sm font-medium min-w-[4rem] text-right tabular-nums">
        {formattedBalance}
      </span>
      <Badge variant="secondary" className="text-xs">
        créditos
      </Badge>
    </Button>
  );
}
