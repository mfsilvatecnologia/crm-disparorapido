import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useToast } from '@/shared/hooks/use-toast';
import { affiliatesApi } from '../api/affiliatesApi';
import { affiliateKeys } from '../hooks/queryKeys';
import type { AffiliateCadastroResubmitBody } from '../types';

const AREA_ATUACAO_OPTIONS = [
  { value: 'agencia_marketing', label: 'Agência de Marketing' },
  { value: 'autonomo', label: 'Autônomo' },
  { value: 'influenciador', label: 'Influenciador' },
  { value: 'info_produtor', label: 'Info Produtor' },
  { value: 'promotor_vendas', label: 'Promotor de Vendas' },
  { value: 'representante_comercial', label: 'Representante Comercial' },
  { value: 'tik_toker', label: 'Tik Toker' },
  { value: 'youtuber', label: 'Youtuber' },
  { value: 'outros', label: 'Outros' },
] as const;

const CHAVE_PIX_TIPO_OPTIONS = ['CPF', 'CNPJ', 'EMAIL', 'TELEFONE', 'ALEATORIA'] as const;

const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR',
  'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

type FormState = {
  nome: string;
  telefone: string;
  razao_social: string;
  area_atuacao: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  chave_pix: string;
  chave_pix_tipo: string;
};

const emptyForm = (): FormState => ({
  nome: '',
  telefone: '',
  razao_social: '',
  area_atuacao: '',
  cep: '',
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  chave_pix: '',
  chave_pix_tipo: '',
});

export function AffiliateCadastroResubmitSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);

  const { data: cadastro, isLoading } = useQuery({
    queryKey: affiliateKeys.cadastro(),
    queryFn: affiliatesApi.getAffiliateCadastro,
  });

  useEffect(() => {
    if (!cadastro) return;
    setForm({
      nome: cadastro.nome ?? '',
      telefone: cadastro.telefone ?? '',
      razao_social: cadastro.razao_social ?? '',
      area_atuacao: cadastro.area_atuacao ?? '',
      cep: cadastro.cep ?? '',
      rua: cadastro.rua ?? '',
      numero: cadastro.numero ?? '',
      complemento: cadastro.complemento ?? '',
      bairro: cadastro.bairro ?? '',
      cidade: cadastro.cidade ?? '',
      estado: cadastro.estado ?? '',
      chave_pix: cadastro.chave_pix ?? '',
      chave_pix_tipo: cadastro.chave_pix_tipo ?? '',
    });
  }, [cadastro]);

  const resubmitMutation = useMutation({
    mutationFn: (body: AffiliateCadastroResubmitBody) => affiliatesApi.resubmitAffiliateCadastro(body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: affiliateKeys.code() }),
        queryClient.invalidateQueries({ queryKey: affiliateKeys.cadastro() }),
      ]);
      toast({
        title: 'Cadastro reenviado',
        description: 'Sua solicitação voltou para análise. Você será notificado após a revisão.',
      });
    },
    onError: (e: unknown) => {
      toast({
        title: 'Não foi possível reenviar',
        description: e instanceof Error ? e.message : 'Tente novamente em instantes.',
        variant: 'destructive',
      });
    },
  });

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body: AffiliateCadastroResubmitBody = {
      nome: form.nome.trim() || undefined,
      telefone: form.telefone.trim() || undefined,
      razao_social: form.razao_social.trim() || undefined,
      area_atuacao: form.area_atuacao || undefined,
      cep: form.cep.trim() || undefined,
      rua: form.rua.trim() || undefined,
      numero: form.numero.trim() || undefined,
      complemento: form.complemento.trim() ? form.complemento.trim() : null,
      bairro: form.bairro.trim() || undefined,
      cidade: form.cidade.trim() || undefined,
      estado: form.estado || undefined,
      chave_pix: form.chave_pix.trim() || undefined,
      chave_pix_tipo: form.chave_pix_tipo || undefined,
    };
    resubmitMutation.mutate(body);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Corrigir cadastro e reenviar</CardTitle>
        <CardDescription>
          Atualize os dados indicados na rejeição e reenvie sua solicitação para nova análise.
          {cadastro?.cnpj ? (
            <span className="mt-1 block text-muted-foreground">
              CNPJ: {cadastro.cnpj} · E-mail: {cadastro.email}
            </span>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="resubmit-nome">Nome completo</Label>
              <Input
                id="resubmit-nome"
                value={form.nome}
                onChange={(e) => update('nome', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="resubmit-telefone">Telefone</Label>
              <Input
                id="resubmit-telefone"
                value={form.telefone}
                onChange={(e) => update('telefone', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="resubmit-razao">Razão social</Label>
              <Input
                id="resubmit-razao"
                value={form.razao_social}
                onChange={(e) => update('razao_social', e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Área de atuação</Label>
              <Select value={form.area_atuacao} onValueChange={(v) => update('area_atuacao', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {AREA_ATUACAO_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-sm font-medium">Endereço</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="resubmit-cep">CEP</Label>
                <Input id="resubmit-cep" value={form.cep} onChange={(e) => update('cep', e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="resubmit-rua">Rua</Label>
                <Input id="resubmit-rua" value={form.rua} onChange={(e) => update('rua', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="resubmit-numero">Número</Label>
                <Input
                  id="resubmit-numero"
                  value={form.numero}
                  onChange={(e) => update('numero', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="resubmit-complemento">Complemento</Label>
                <Input
                  id="resubmit-complemento"
                  value={form.complemento}
                  onChange={(e) => update('complemento', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="resubmit-bairro">Bairro</Label>
                <Input
                  id="resubmit-bairro"
                  value={form.bairro}
                  onChange={(e) => update('bairro', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="resubmit-cidade">Cidade</Label>
                <Input
                  id="resubmit-cidade"
                  value={form.cidade}
                  onChange={(e) => update('cidade', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>UF</Label>
                <Select value={form.estado} onValueChange={(v) => update('estado', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {UF_OPTIONS.map((uf) => (
                      <SelectItem key={uf} value={uf}>
                        {uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-sm font-medium">Chave PIX</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={form.chave_pix_tipo} onValueChange={(v) => update('chave_pix_tipo', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo da chave" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHAVE_PIX_TIPO_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="resubmit-pix">Chave PIX</Label>
                <Input
                  id="resubmit-pix"
                  value={form.chave_pix}
                  onChange={(e) => update('chave_pix', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={resubmitMutation.isPending}>
              {resubmitMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Reenviar para análise
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
