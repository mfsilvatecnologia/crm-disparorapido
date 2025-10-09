/**
 * TransactionTypeFilter Component
 * Filter for credit transaction types
 */

import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { CreditTransactionType } from '../../types';

interface TransactionTypeFilterProps {
  value?: CreditTransactionType;
  onChange: (value?: CreditTransactionType) => void;
}

/**
 * Transaction type options
 */
const TYPE_OPTIONS: { value: CreditTransactionType; label: string }[] = [
  { value: 'earned', label: 'Ganhos' },
  { value: 'spent', label: 'Gastos' },
  { value: 'bonus', label: 'Bônus' },
  { value: 'refund', label: 'Reembolso' },
];

/**
 * TransactionTypeFilter Component
 */
export function TransactionTypeFilter({ value, onChange }: TransactionTypeFilterProps) {
  const handleChange = (newValue: string) => {
    if (newValue === 'all') {
      onChange(undefined);
    } else {
      onChange(newValue as CreditTransactionType);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="type-filter">Tipo de Transação</Label>
      <Select value={value || 'all'} onValueChange={handleChange}>
        <SelectTrigger id="type-filter">
          <SelectValue placeholder="Todos os tipos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {TYPE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
