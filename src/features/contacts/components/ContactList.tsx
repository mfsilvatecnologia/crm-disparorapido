import React, { useState } from 'react';
import { ContactCard } from './ContactCard';
import { ContactForm } from './ContactForm';
import { useContacts, useCreateContact, useDeleteContact, useSetPrimaryContact, useUpdateContact } from '../api/contacts';
import type { Contact } from '../types/contact';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { useToast } from '@/shared/hooks/use-toast';
import { Skeleton } from '@/shared/components/ui/skeleton';

interface ContactListProps {
  customerId: string;
}

export function ContactList({ customerId }: ContactListProps) {
  const { toast } = useToast();
  const { data: contacts = [], isLoading, isError, error } = useContacts(customerId);
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();
  const deleteMutation = useDeleteContact();
  const setPrimaryMutation = useSetPrimaryContact();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const handleCreate = async (data: { nome: string; email: string; telefone?: string | null; cargo?: string | null; departamento?: string | null }) => {
    try {
      await createMutation.mutateAsync({ customerId, ...data });
      toast({ title: 'Contato criado', description: 'Contato adicionado ao cliente.' });
      setDialogOpen(false);
    } catch (err) {
      toast({
        title: 'Erro ao criar contato',
        description: err instanceof Error ? err.message : 'Nao foi possivel criar o contato.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (data: { nome: string; email: string; telefone?: string | null; cargo?: string | null; departamento?: string | null }) => {
    if (!editingContact) return;
    try {
      await updateMutation.mutateAsync({ customerId, id: editingContact.id, ...data });
      toast({ title: 'Contato atualizado', description: 'Contato atualizado com sucesso.' });
      setEditingContact(null);
      setDialogOpen(false);
    } catch (err) {
      toast({
        title: 'Erro ao atualizar contato',
        description: err instanceof Error ? err.message : 'Nao foi possivel atualizar o contato.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (contact: Contact) => {
    try {
      await deleteMutation.mutateAsync({ customerId, id: contact.id });
      toast({ title: 'Contato removido', description: 'Contato removido com sucesso.' });
    } catch (err) {
      toast({
        title: 'Erro ao remover contato',
        description: err instanceof Error ? err.message : 'Nao foi possivel remover o contato.',
        variant: 'destructive',
      });
    }
  };

  const handleSetPrimary = async (contact: Contact) => {
    try {
      await setPrimaryMutation.mutateAsync({ customerId, id: contact.id });
      toast({ title: 'Contato principal definido', description: 'Contato atualizado com sucesso.' });
    } catch (err) {
      toast({
        title: 'Erro ao definir contato principal',
        description: err instanceof Error ? err.message : 'Nao foi possivel definir o contato principal.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((item) => (
          <div key={`contact-skeleton-${item}`} className="rounded-lg border border-border p-4 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Erro ao carregar contatos: {(error as Error)?.message}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contatos</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingContact(null)}>Novo contato</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingContact ? 'Editar contato' : 'Novo contato'}</DialogTitle>
            </DialogHeader>
            <ContactForm
              onSubmit={editingContact ? handleUpdate : handleCreate}
              submitLabel={editingContact ? 'Salvar alteracoes' : 'Criar contato'}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
              defaultValues={
                editingContact
                  ? {
                      nome: editingContact.nome,
                      email: editingContact.email,
                      telefone: editingContact.telefone ?? '',
                      cargo: editingContact.cargo ?? '',
                      departamento: editingContact.departamento ?? '',
                    }
                  : undefined
              }
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onEdit={(selected) => {
              setEditingContact(selected);
              setDialogOpen(true);
            }}
            onDelete={handleDelete}
            onSetPrimary={handleSetPrimary}
          />
        ))}
      </div>
    </div>
  );
}
