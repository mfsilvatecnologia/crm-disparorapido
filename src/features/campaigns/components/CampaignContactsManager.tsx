import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { CampaignContactsList } from './CampaignContactsList'
import { AddContactsToCampaign } from './AddContactsToCampaign'

interface CampaignContactsManagerProps {
  campaignId: string
}

export function CampaignContactsManager({ campaignId }: CampaignContactsManagerProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Lista de Contatos</TabsTrigger>
          <TabsTrigger value="add">Adicionar Contatos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
          <CampaignContactsList campaignId={campaignId} />
        </TabsContent>
        
        <TabsContent value="add" className="mt-6">
          <AddContactsToCampaign campaignId={campaignId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}