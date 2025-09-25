import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { AnalyticsData } from '@/shared/services/schemas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadsChartProps {
  data: AnalyticsData[];
}

export function LeadsChart({ data }: LeadsChartProps) {
  const chartData = data.map(item => ({
    ...item,
    date: format(new Date(item.date), 'dd/MM', { locale: ptBR }),
  }));

  return (
    <Card className="bg-gradient-card">
      <CardHeader>
        <CardTitle>Evolução de Leads</CardTitle>
        <CardDescription>
          Leads coletados vs acessados nos últimos 7 dias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="leadsCollected" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                name="Leads Coletados"
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="leadsAccessed" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 4 }}
                name="Leads Acessados"
                activeDot={{ r: 6, stroke: 'hsl(var(--accent))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}