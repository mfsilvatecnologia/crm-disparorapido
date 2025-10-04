import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Loader2, Monitor, Smartphone, Trash2, LogOut, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/shared/contexts/AuthContext'
import { getActiveSessions, deleteSession, revokeOtherSessions } from '../services/sessions'
import { getOrCreateDeviceId } from '@/shared/utils/device'
import { extractUserIdFromManagementToken } from '@/shared/utils/token'
import type { ActiveSession } from '@/shared/services/schemas'

interface ActiveSessionsManagerProps {
  open: boolean
  onClose: () => void
  forceSelection?: boolean // Quando true, força o usuário a escolher uma sessão para encerrar
  onSessionRevoked?: () => void // Callback após revogar sessão
}

export function ActiveSessionsManager({
  open,
  onClose,
  forceSelection = false,
  onSessionRevoked
}: ActiveSessionsManagerProps) {
  const { user, sessionLimitError } = useAuth()
  const [sessions, setSessions] = useState<ActiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [revokingAll, setRevokingAll] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentDeviceId = getOrCreateDeviceId()

  // Pega o management_token do sessionLimitError se disponível
  const managementToken = sessionLimitError?.management_token

  const loadSessions = async () => {
    try {
      setLoading(true)
      setError(null)

      // Se temos dados do erro de limite de sessão, usa eles em vez de fazer nova requisição
      if (sessionLimitError?.active_sessions) {
        setSessions(sessionLimitError.active_sessions)
        setLoading(false)
        return
      }

      // Só tenta buscar se o usuário está autenticado OU temos management token
      if (!user && !managementToken) {
        setError('Você precisa estar autenticado para ver as sessões')
        setLoading(false)
        return
      }

      const data = await getActiveSessions(managementToken)
      setSessions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar sessões')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadSessions()
    }
  }, [open, sessionLimitError])

  const handleDeleteSession = async (session: ActiveSession) => {
    try {
      setDeleting(session.id)
      setError(null)

      // Extrai user_id do management token se disponível, senão usa do user autenticado
      const userId = managementToken
        ? extractUserIdFromManagementToken(managementToken)
        : user?.id

      if (!userId) {
        setError('Não foi possível identificar o usuário')
        return
      }

      await deleteSession(
        session.id,
        {
          device_id: currentDeviceId,
          reason: 'user_logout',
          revoked_by: userId,
        },
        managementToken // Passa o management token se disponível
      )

      // Recarrega a lista se user estiver autenticado, senão só remove da lista local
      if (user || managementToken) {
        await loadSessions()
      } else {
        setSessions(prev => prev.filter(s => s.id !== session.id))
      }

      if (onSessionRevoked) {
        onSessionRevoked()
      }

      // Se estamos em modo forçado e só resta uma sessão (ou menos), podemos fechar
      if (forceSelection && sessions.length <= 1) {
        onClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir sessão')
    } finally {
      setDeleting(null)
    }
  }

  const handleRevokeAllOthers = async () => {
    try {
      setRevokingAll(true)
      setError(null)

      // Extrai user_id do management token se disponível, senão usa do user autenticado
      const userId = managementToken
        ? extractUserIdFromManagementToken(managementToken)
        : user?.id

      if (!userId) {
        setError('Não foi possível identificar o usuário')
        return
      }

      await revokeOtherSessions(
        {
          user_id: userId,
          keep_device_id: currentDeviceId,
          reason: 'logout_other_devices',
          revoked_by: userId,
        },
        managementToken // Passa o management token se disponível
      )

      // Recarrega a lista se user estiver autenticado, senão filtra localmente
      if (user || managementToken) {
        await loadSessions()
      } else {
        setSessions(prev => prev.filter(s => s.device_id === currentDeviceId))
      }

      if (onSessionRevoked) {
        onSessionRevoked()
      }

      // Se estamos em modo forçado, podemos fechar após revogar todas
      if (forceSelection) {
        onClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao revogar sessões')
    } finally {
      setRevokingAll(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getDeviceIcon = (clientType: string) => {
    return clientType === 'web' ? Monitor : Smartphone
  }

  const isCurrentDevice = (session: ActiveSession) => {
    return session.device_id === currentDeviceId
  }

  const otherSessions = sessions.filter(s => !isCurrentDevice(s))

  return (
    <Dialog open={open} onOpenChange={forceSelection ? undefined : onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {forceSelection && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
            Gerenciar Sessões Ativas
          </DialogTitle>
          <DialogDescription>
            {forceSelection
              ? 'Limite de sessões atingido. Você precisa encerrar uma sessão ativa para continuar.'
              : 'Gerencie os dispositivos conectados à sua conta'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {forceSelection && otherSessions.length > 0 && (
              <Alert>
                <AlertDescription className="flex items-center justify-between">
                  <span>Você pode encerrar todas as outras sessões de uma vez</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleRevokeAllOthers}
                    disabled={revokingAll}
                  >
                    {revokingAll ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Encerrando...
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        Encerrar Todas as Outras
                      </>
                    )}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {sessions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma sessão ativa encontrada
              </p>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => {
                  const Icon = getDeviceIcon(session.client_type)
                  const isCurrent = isCurrentDevice(session)

                  return (
                    <Card key={session.id} className={isCurrent ? 'border-primary' : ''}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <CardTitle className="text-base flex items-center gap-2">
                                {session.client_type === 'web' ? 'Navegador Web' : 'Extensão'}
                                {isCurrent && (
                                  <Badge variant="default" className="text-xs">
                                    Sessão Atual
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                Device ID: {session.device_id.substring(0, 8)}...
                              </CardDescription>
                            </div>
                          </div>

                          {/* No modo forceSelection, permite deletar qualquer sessão exceto se for a última */}
                          {(forceSelection || !isCurrent) && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteSession(session)}
                              disabled={deleting === session.id}
                            >
                              {deleting === session.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Criada em:</span>
                            <p className="font-medium">{formatDate(session.created_at)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Última atividade:</span>
                            <p className="font-medium">{formatDate(session.last_activity)}</p>
                          </div>
                          {session.ip_address && (
                            <div>
                              <span className="text-muted-foreground">IP:</span>
                              <p className="font-medium font-mono">{session.ip_address}</p>
                            </div>
                          )}
                          {session.user_agent && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">User Agent:</span>
                              <p className="font-medium text-xs truncate" title={session.user_agent}>
                                {session.user_agent}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {!forceSelection && otherSessions.length > 0 && (
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Fechar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRevokeAllOthers}
                  disabled={revokingAll}
                >
                  {revokingAll ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Encerrando...
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Encerrar Todas as Outras Sessões
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
