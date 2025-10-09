/**
 * Period Selector Component
 * Date range picker for financial summary
 */

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PeriodSelectorProps {
  startDate: Date;
  endDate: Date;
  onPeriodChange: (startDate: Date, endDate: Date) => void;
}

/**
 * Preset periods
 */
const PRESET_PERIODS = [
  { label: 'Últimos 7 dias', days: 7 },
  { label: 'Últimos 30 dias', days: 30 },
  { label: 'Últimos 90 dias', days: 90 },
];

/**
 * PeriodSelector Component
 */
export function PeriodSelector({ 
  startDate, 
  endDate, 
  onPeriodChange 
}: PeriodSelectorProps) {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  const handlePresetClick = (days: number) => {
    const newEndDate = new Date();
    const newStartDate = subDays(newEndDate, days);
    onPeriodChange(newStartDate, newEndDate);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PRESET_PERIODS.map((preset) => (
          <Button
            key={preset.days}
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick(preset.days)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Start Date Picker */}
        <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              De: {format(startDate, 'dd/MM/yyyy', { locale: ptBR })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => {
                if (date) {
                  onPeriodChange(date, endDate);
                  setIsStartOpen(false);
                }
              }}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>

        {/* End Date Picker */}
        <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Até: {format(endDate, 'dd/MM/yyyy', { locale: ptBR })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => {
                if (date) {
                  onPeriodChange(startDate, date);
                  setIsEndOpen(false);
                }
              }}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
