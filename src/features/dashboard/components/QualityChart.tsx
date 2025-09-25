import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { AnalyticsData } from '@/shared/services/schemas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface QualityChartProps {
  data: AnalyticsData[];
}

export function QualityChart({ data }: QualityChartProps) {
  const chartData = data.map(item => ({
    ...item,
    date: format(new Date(item.date), 'dd/MM', { locale: ptBR }),
  }));

  return (
    <Card className="bg-gradient-card">
      <CardHeader>
        <CardTitle>Qualidade dos Leads</CardTitle>
        <CardDescription>
          Score médio de qualidade dos leads coletados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                domain={[70, 100]}
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
                formatter={(value: number) => [`${value}%`, 'Qualidade']}
              />
              <Area 
                type="monotone" 
                dataKey="qualityAverage" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                fill="url(#qualityGradient)"
                dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--success))', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}