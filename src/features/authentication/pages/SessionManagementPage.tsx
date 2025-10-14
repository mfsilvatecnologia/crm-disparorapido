import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Monitor, Puzzle, Trash2, LogOut, Shield, Clock, MapPin, AlertTriangle, ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { useAuth } from '@/shared/contexts/AuthContext'
import { getActiveSessions, deleteSession, revokeOtherSessions } from '../services/sessions'
import { getOrCreateDeviceId } from '@/shared/utils/device'
import type { ActiveSession } from '@/shared/services/schemas'
import { useToast } from '@/shared/hooks/use-toast'

export default function SessionManagementPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<ActiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [revokingAll, setRevokingAll] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentDeviceId = getOrCreateDeviceId()

  const loadSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getActiveSessions()
      console.log('Sessions loaded:', data)
      setSessions(data || [])
    } catch (err) {
      console.error('Error loading sessions:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar sessões'
      setError(errorMessage)
      toast({
        title: "Erro ao carregar sessões",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  const handleDeleteSession = async (session: ActiveSession) => {
    try {
      setDeleting(session.id)
      setError(null)

      if (!user?.id) {
        setError('Não foi possível identificar o usuário')
        return
      }

      await deleteSession(
        session.id,
        {
          device_id: currentDeviceId,
          reason: 'user_logout',
          revoked_by: user.id,
        }
      )

      toast({
        title: "Sessão encerrada",
        description: "A sessão foi encerrada com sucesso.",
      })

      await loadSessions()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir sessão'
      setError(errorMessage)
      toast({
        title: "Erro ao encerrar sessão",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const handleRevokeAllOthers = async () => {
    try {
      setRevokingAll(true)
      setError(null)

      if (!user?.id) {
        setError('Não foi possível identificar o usuário')
        return
      }

      await revokeOtherSessions({
        user_id: user.id,
        keep_device_id: currentDeviceId,
        reason: 'logout_other_devices',
        revoked_by: user.id,
      })

      toast({
        title: "Todas as outras sessões foram encerradas",
        description: "Apenas a sessão atual permanece ativa.",
      })

      await loadSessions()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao revogar sessões'
      setError(errorMessage)
      toast({
        title: "Erro ao encerrar sessões",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setRevokingAll(false)
    }
  }

  const isCurrentDevice = (session: ActiveSession) => {
    return session.device_id === currentDeviceId
  }

  const otherSessions = sessions.filter(s => !isCurrentDevice(s))
  const currentSession = sessions.find(s => isCurrentDevice(s))

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gerenciamento de Sessões</h1>
            <p className="text-muted-foreground">
              Gerencie todos os dispositivos conectados à sua conta
            </p>
          </div>
          <Shield className="h-12 w-12 text-primary opacity-20" />
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Sessões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sessões Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{sessions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outros Dispositivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{otherSessions.length}</div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Bar */}
          {otherSessions.length > 0 && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Segurança da Conta</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>
                  Você pode encerrar todas as outras sessões de uma vez para proteger sua conta
                </span>
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

          {/* Current Session */}
          {currentSession && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Sessão Atual</h2>
              <SessionCard
                session={currentSession}
                isCurrent={true}
                onDelete={handleDeleteSession}
                isDeleting={deleting === currentSession.id}
              />
            </div>
          )}

          {/* Other Sessions */}
          {otherSessions.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Outras Sessões</h2>
              <div className="space-y-3">
                {otherSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isCurrent={false}
                    onDelete={handleDeleteSession}
                    isDeleting={deleting === session.id}
                  />
                ))}
              </div>
            </div>
          ) : (
            !currentSession && (
              <Card>
                <CardContent className="py-16 text-center">
                  <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground text-lg">
                    Nenhuma sessão ativa encontrada
                  </p>
                </CardContent>
              </Card>
            )
          )}

          {/* Security Info */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Dica de Segurança</AlertTitle>
            <AlertDescription>
              Se você vir alguma sessão que não reconhece, encerre-a imediatamente e considere alterar sua senha.
              Sempre mantenha suas credenciais seguras e não compartilhe seu acesso.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}

interface SessionCardProps {
  session: ActiveSession
  isCurrent: boolean
  onDelete: (session: ActiveSession) => void
  isDeleting: boolean
}

function SessionCard({ session, isCurrent, onDelete, isDeleting }: SessionCardProps) {
  const Icon = session.client_type === 'extension' ? Puzzle : Monitor
  const deviceLabel = session.client_type === 'extension' ? 'Extensão do Chrome' : 'Navegador Web'

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

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Agora mesmo'
    if (diffMins < 60) return `${diffMins} minuto${diffMins > 1 ? 's' : ''} atrás`
    if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`
    if (diffDays < 7) return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`
    return formatDate(dateString)
  }

  return (
    <Card className={isCurrent ? 'border-primary shadow-md' : ''}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${isCurrent ? 'bg-primary/10' : 'bg-muted'}`}>
              <Icon className={`h-6 w-6 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {deviceLabel}
                {isCurrent && (
                  <Badge variant="default" className="text-xs">
                    Sessão Atual
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs mt-1 font-mono">
                Device ID: {session.device_id.substring(0, 12)}...
              </CardDescription>
            </div>
          </div>

          {!isCurrent && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(session)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Encerrar
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Criada em */}
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Criada em</p>
              <p className="text-sm font-medium">{formatDate(session.created_at)}</p>
            </div>
          </div>

          {/* Última atividade */}
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Última atividade</p>
              <p className="text-sm font-medium">{getRelativeTime(session.last_activity)}</p>
            </div>
          </div>

          {/* IP Address */}
          {session.ip_address && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Endereço IP</p>
                <p className="text-sm font-medium font-mono">{session.ip_address}</p>
              </div>
            </div>
          )}

          {/* Client Type */}
          <div className="flex items-start gap-2">
            {session.client_type === 'extension' ? (
              <Puzzle className="h-4 w-4 text-muted-foreground mt-0.5" />
            ) : (
              <Monitor className="h-4 w-4 text-muted-foreground mt-0.5" />
            )}
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Tipo de Cliente</p>
              <p className="text-sm font-medium">{deviceLabel}</p>
            </div>
          </div>
        </div>

        {/* User Agent */}
        {session.user_agent && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1">User Agent</p>
            <p className="text-xs font-mono text-muted-foreground break-all">
              {session.user_agent}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
