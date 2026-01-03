import React from 'react';
import type { Contact } from '../types/contact';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';

interface ContactCardProps {
  contact: Contact;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
  onSetPrimary?: (contact: Contact) => void;
}

export function ContactCard({ contact, onEdit, onDelete, onSetPrimary }: ContactCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{contact.nome}</p>
            {contact.isPrimary ? <Badge>Principal</Badge> : null}
          </div>
          <p className="text-sm text-muted-foreground">{contact.email}</p>
          <p className="text-sm text-muted-foreground">
            {contact.telefone ?? 'Telefone nao informado'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!contact.isPrimary && onSetPrimary ? (
            <Button variant="outline" size="sm" onClick={() => onSetPrimary(contact)}>
              Definir como principal
            </Button>
          ) : null}
          {onEdit ? (
            <Button variant="outline" size="sm" onClick={() => onEdit(contact)}>
              Editar
            </Button>
          ) : null}
          {onDelete ? (
            <Button variant="outline" size="sm" onClick={() => onDelete(contact)}>
              Remover
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
