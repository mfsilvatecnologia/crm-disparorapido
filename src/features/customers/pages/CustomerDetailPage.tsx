import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCustomer, useCustomerTimeline, useUpdateCustomer } from '../api/customers';
import { CustomerDetail } from '../components/CustomerDetail';
import { CustomerForm } from '../components/CustomerForm';
import { CustomerTimeline } from '../components/CustomerTimeline';
import { StatusChangeDialog } from '../components/StatusChangeDialog';
import { ContactList } from '@/features/contacts/components/ContactList';
import { ActivityList } from '@/features/activities/components/ActivityList';
import { useActivities } from '@/features/activities/api/activities';
import { ContractList } from '@/features/contracts/components/ContractList';
import { useContracts } from '@/features/contracts/api/contracts';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useToast } from '@/shared/hooks/use-toast';
import { Skeleton } from '@/shared/components/ui/skeleton';

export function CustomerDetailPage() {
  const { id = '' } = useParams();
  const { toast } = useToast();
  const { data: customer, isLoading, isError, error } = useCustomer(id);
  const { data: timeline = [] } = useCustomerTimeline(id);
  const { data: activities = [] } = useActivities(id);
  const { data: contracts = [] } = useContracts(id);
  const updateMutation = useUpdateCustomer();
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="rounded-lg border border-border p-6 space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <p className="text-sm text-destructive">
        Erro ao carregar cliente: {(error as Error)?.message}
      </p>
    );
  }

  const handleUpdate = async (data: Parameters<typeof updateMutation.mutateAsync>[0]) => {
    try {
      await updateMutation.mutateAsync({ ...data, id: customer.id });
      toast({
        title: 'Cliente atualizado',
        description: 'Dados do cliente salvos com sucesso.',
      });
      setEditOpen(false);
    } catch (err) {
      toast({
        title: 'Erro ao atualizar cliente',
        description: err instanceof Error ? err.message : 'Nao foi possivel atualizar o cliente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Detalhes do cliente</h1>
          <p className="text-sm text-muted-foreground">Acompanhe o historico do cliente.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusChangeDialog customerId={customer.id} currentStatus={customer.status} />
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Editar</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Editar cliente</DialogTitle>
              </DialogHeader>
              <CustomerForm
                onSubmit={handleUpdate}
                submitLabel="Salvar alteracoes"
                isSubmitting={updateMutation.isPending}
                defaultValues={{
                  nome: customer.nome,
                  email: customer.email ?? '',
                  telefone: customer.telefone ?? '',
                  endereco: customer.endereco ?? '',
                  notas: customer.notas ?? '',
                  segmento: customer.segmento ?? null,
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visao geral</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="contacts">Contatos</TabsTrigger>
          <TabsTrigger value="activities">Atividades</TabsTrigger>
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <CustomerDetail customer={customer} />
        </TabsContent>
        <TabsContent value="timeline">
          <CustomerTimeline events={timeline} activities={activities} contracts={contracts} />
        </TabsContent>
        <TabsContent value="contacts">
          <ContactList customerId={customer.id} />
        </TabsContent>
        <TabsContent value="activities">
          <ActivityList customerId={customer.id} />
        </TabsContent>
        <TabsContent value="contracts">
          <ContractList customerId={customer.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
