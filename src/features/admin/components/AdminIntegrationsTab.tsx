import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminIntegrationsApi } from '../api/adminIntegrationsApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Switch } from '@/shared/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { useToast } from '@/shared/hooks/use-toast';
import { Loader2, Zap } from 'lucide-react';

export function AdminIntegrationsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [enabled, setEnabled] = useState(false);

  const settingsQuery = useQuery({
    queryKey: ['admin-n8n-settings'],
    queryFn: () => adminIntegrationsApi.getN8nSettings(),
  });

  const dispatchesQuery = useQuery({
    queryKey: ['admin-webhook-dispatches'],
    queryFn: () => adminIntegrationsApi.listWebhookDispatches({ page: 1, limit: 20 }),
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setWebhookUrl(settingsQuery.data.webhookUrl);
      setEnabled(settingsQuery.data.enabled);
      setWebhookSecret('');
    }
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      adminIntegrationsApi.updateN8nSettings({
        webhookUrl,
        enabled,
        webhookSecret: webhookSecret.trim() ? webhookSecret.trim() : undefined,
      }),
    onSuccess: () => {
      toast({ title: 'Configurações salvas' });
      setWebhookSecret('');
      queryClient.invalidateQueries({ queryKey: ['admin-n8n-settings'] });
    },
    onError: (error: Error) => toast({ title: 'Erro', description: error.message, variant: 'destructive' }),
  });

  const testMutation = useMutation({
    mutationFn: () => {
      if (!webhookUrl.trim()) {
        throw new Error('Informe a URL do webhook antes de testar');
      }
      return adminIntegrationsApi.testN8nWebhook({
        webhookUrl: webhookUrl.trim(),
        webhookSecret: webhookSecret.trim() ? webhookSecret.trim() : undefined,
      });
    },
    onSuccess: (result) => {
      toast({
        title: result.success ? 'Teste enviado' : 'Teste falhou',
        description: result.responseStatus ? `HTTP ${result.responseStatus}` : undefined,
        variant: result.success ? 'default' : 'destructive',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-webhook-dispatches'] });
    },
    onError: (error: Error) => toast({ title: 'Erro', description: error.message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Webhook n8n</CardTitle>
          <CardDescription>
            Configure a URL do fluxo n8n para disparos manuais e automações de WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-xl">
          {settingsQuery.isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <div>
                <Label htmlFor="webhookUrl">URL do webhook</Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://seu-n8n.com/webhook/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="webhookSecret">Secret (opcional)</Label>
                <Input
                  id="webhookSecret"
                  type="password"
                  placeholder={
                    settingsQuery.data?.hasSecret ? 'Deixe em branco para manter o atual' : 'Header X-Webhook-Secret'
                  }
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label>Integração ativa</Label>
                  <p className="text-sm text-muted-foreground">Permite disparos para o n8n</p>
                </div>
                <Switch checked={enabled} onCheckedChange={setEnabled} />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  Salvar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => testMutation.mutate()}
                  disabled={testMutation.isPending}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Testar conexão
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de disparos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {dispatchesQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>HTTP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(dispatchesQuery.data?.items ?? []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{new Date(row.createdAt).toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{row.eventType}</TableCell>
                    <TableCell className="font-mono text-xs">{row.empresaId ?? '—'}</TableCell>
                    <TableCell>{row.responseStatus ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
