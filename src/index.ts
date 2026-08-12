/**
 * @faso-erp/plugin-sdk — Kit de développement de plugins pour FasoOrchestra ERP.
 */
import type { QueryClient } from '@tanstack/react-query'
import type { ComponentType } from 'react'
export type {
  UIKit,
  PluginIcon,
  KpiCardProps, KpiTrend,
  AreaChartProps, LineChartProps, BarChartProps, PieChartProps, PieSlice, ChartDataPoint, BaseChartProps,
  DataTableProps, Column, BulkAction,
  BadgeProps, BadgeVariant,
  SpinnerProps,
  EmptyStateProps,
  ModalProps, DrawerProps,
  AlertProps, AlertVariant,
  TabsProps, TabItem,
} from './ui'
import type { UIKit } from './ui'

// ════════════════════════════════════════════════════════════════════════════
// MANIFEST
// ════════════════════════════════════════════════════════════════════════════

/**
 * Permissions de capacité — droits d'accès du plugin aux APIs sensibles de
 * l'hôte. À déclarer dans `manifest.permissions` (en plus des éventuelles
 * permissions métier type `stock:read`, contrôlées côté serveur).
 *
 * Un plugin qui appelle une API sans avoir déclaré la capacité correspondante
 * reçoit une erreur du kernel.
 */
export type CapabilityPermission =
  | 'api:read'        // apiGet, sync.pull
  | 'api:write'       // apiPost/Put/Patch/Delete, upload, sync.push
  | 'files'           // dialogues fichiers natifs, upload, download
  | 'clipboard'       // lecture/écriture du presse-papiers
  | 'notifications'   // notifications natives OS
  | 'shell:open'      // ouverture d'URL externes

export interface Manifest {
  id: string
  name: string
  version: string
  author?: string
  license?: string
  minAppVersion?: string
  /** Capacités hôte (`CapabilityPermission`) + permissions métier éventuelles. */
  permissions: string[]
  dependencies: string[]
}

// ════════════════════════════════════════════════════════════════════════════
// ENREGISTREMENTS UI
// ════════════════════════════════════════════════════════════════════════════

export interface RouteConfig {
  path: string
  component: ComponentType
  meta?: {
    title?: string
    /** Permission requise pour accéder à la route. */
    permission?: string
    icon?: string
  }
}

export interface SidebarItem {
  label: string
  path: string
  icon: string
  section: string
  order?: number
  permission?: string
}

export interface Command {
  id: string
  label: string
  icon?: string
  shortcut?: string
  /** Catégorie affichée dans la palette de commandes (ex. nom du plugin). */
  category?: string
  run: () => void | Promise<void>
}

export interface DashboardWidget {
  id: string
  title: string
  component: ComponentType
  defaultSize?: 'sm' | 'md' | 'lg'
}

export interface SettingsSectionProps {
  onSelectSection?: (id: string) => void
}

export interface SettingsSection {
  id: string
  label: string
  icon: string
  component: ComponentType<SettingsSectionProps>
}

export interface TopbarAction {
  id: string
  component: ComponentType
  order?: number
}

// ════════════════════════════════════════════════════════════════════════════
// EVENT BUS
// ════════════════════════════════════════════════════════════════════════════

export type Unsubscribe = () => void
export type EventHandler<T> = (data: T) => Promise<void> | void
export type PipelineHandler<T> = (data: T) => Promise<T | null | undefined>

export interface EventBus {
  pipe<T>(event: string, handler: PipelineHandler<T>, options?: { pluginId: string; order?: number }): Unsubscribe
  on<T>(event: string, handler: EventHandler<T>, options?: { pluginId: string }): Unsubscribe
  emit<T>(event: string, data: T): void
  dispatch<T>(event: string, data: T): Promise<T | null>
}

export const EVENTS = {
  realtime: (channel: string) => `realtime:${channel}` as const,
  realtimeAny: 'realtime',
  sessionExpired: 'auth:session:expired',
  syncDone: (entity: string) => `sync:done:${entity}` as const,
  syncFailed: (entity: string) => `sync:failed:${entity}` as const,
} as const

// ════════════════════════════════════════════════════════════════════════════
// SHARED STORE
// ════════════════════════════════════════════════════════════════════════════

export interface SharedStore {
  get<T>(key: string): T | undefined
  set<T>(key: string, value: T): void
  subscribe<T>(key: string, listener: (value: T) => void): Unsubscribe
}

export const STORE_KEYS = {
  currentUser: 'auth:current-user',
  wsStatus: 'ws:status',
  syncStatus: 'sync:status',
} as const

// ════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS & TOASTS
// ════════════════════════════════════════════════════════════════════════════

export type ToastType = 'info' | 'success' | 'warning' | 'error'
export type NotificationType = 'TASK' | 'HR' | 'STOCK' | 'FINANCE' | 'SYSTEM'

export type PluginNotification = {
  type?: NotificationType
  title: string
  message: string
  link?: string
}

export interface PluginNotifications {
  push(n: PluginNotification): void
  markAllRead(): void
}

// ════════════════════════════════════════════════════════════════════════════
// CONFIG
// ════════════════════════════════════════════════════════════════════════════

export interface PluginConfigApi<T extends Record<string, unknown> = Record<string, unknown>> {
  get(): T
  set(value: T): void
  update(patch: Partial<T>): void
  subscribe(listener: (config: T) => void): Unsubscribe
}

// ════════════════════════════════════════════════════════════════════════════
// LOGGER
// ════════════════════════════════════════════════════════════════════════════

export interface PluginLogger {
  debug(...args: unknown[]): void
  info(...args: unknown[]): void
  warn(...args: unknown[]): void
  error(...args: unknown[]): void
}

// ════════════════════════════════════════════════════════════════════════════
// THÈME
// ════════════════════════════════════════════════════════════════════════════

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeAPI {
  /** Réglage brut de l'utilisateur (`system` possible). */
  get(): Theme
  /** Thème effectivement appliqué (`light` ou `dark`). */
  resolved(): ResolvedTheme
  /** S'abonne aux changements de thème effectif. */
  onChange(handler: (theme: ResolvedTheme) => void): Unsubscribe
}

// ════════════════════════════════════════════════════════════════════════════
// DIALOG NATIF
// ════════════════════════════════════════════════════════════════════════════

export type OpenDialogOptions = {
  title?: string
  multiple?: boolean
  filters?: { name: string; extensions: string[] }[]
  defaultPath?: string
  directory?: boolean
}

export type SaveDialogOptions = {
  title?: string
  defaultPath?: string
  filters?: { name: string; extensions: string[] }[]
}

export interface DialogAPI {
  /** Demande une confirmation (OK/Annuler). Retourne `true` si confirmé. */
  confirm(message: string, title?: string): Promise<boolean>
  /** Ouvre un dialog de sélection de fichier(s)/dossier. */
  open(options?: OpenDialogOptions): Promise<string | string[] | null>
  /** Ouvre un dialog de sauvegarde. */
  save(options?: SaveDialogOptions): Promise<string | null>
}

// ════════════════════════════════════════════════════════════════════════════
// TENANT
// ════════════════════════════════════════════════════════════════════════════

export type TenantContext = {
  id: string
  name: string
  slug: string | null
}

// ════════════════════════════════════════════════════════════════════════════
// TEMPS RÉEL
// ════════════════════════════════════════════════════════════════════════════

export const CHANNELS = {
  notification: 'notification',
  alerts: 'alerts',
} as const

export interface WsStatus {
  connected: boolean
  reconnecting: boolean
  attempt: number
}

// ════════════════════════════════════════════════════════════════════════════
// RÉSEAU
// ════════════════════════════════════════════════════════════════════════════

export type RequestOptions = { headers?: Record<string, string> }

/**
 * Résultat d'une écriture réseau avec `offlineFallback: true`.
 * - `'ok'`    : la requête a abouti en direct, `data` est la réponse serveur.
 * - `'queued'` : le réseau était indisponible (ou le serveur en erreur 5xx/429) —
 *   l'opération a été enregistrée dans la file offline et sera rejouée
 *   automatiquement dès que possible. `opId` permet de suivre son statut via
 *   `app.sync.onDone`/`onFailed` (l'entité est préfixée par l'id du plugin).
 *   Une erreur de validation (4xx hors 429, 409) n'est jamais mise en file :
 *   elle rejette la promesse comme d'habitude.
 */
export type ApiWriteResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'queued'; opId: string }

export type WriteOptions = RequestOptions & { offlineFallback?: boolean }

export interface CurrentUser {
  id: string
  email: string
  is_active: boolean
  mfa_enabled: boolean
  tenant_id: string | null
}

export interface UploadResult {
  ok: boolean
  data?: unknown
  error?: string
}

export interface DownloadResult {
  ok: boolean
  saved_path?: string
  error?: string
}

// ════════════════════════════════════════════════════════════════════════════
// PRESSE-PAPIERS
// ════════════════════════════════════════════════════════════════════════════

export interface ClipboardAPI {
  write(text: string): Promise<void>
  read(): Promise<string>
}

// ════════════════════════════════════════════════════════════════════════════
// SYNCHRONISATION OFFLINE-FIRST
// ════════════════════════════════════════════════════════════════════════════

export type SyncOpKind = 'create' | 'update' | 'patch' | 'delete'
export type SyncOpStatus = 'pending' | 'syncing' | 'done' | 'failed' | 'permanent_failed'

export interface SyncItem {
  id: string
  entity: string
  entity_id: string
  operation: SyncOpKind
  payload: string
  idempotency_key: string
  priority: number
  status: SyncOpStatus
  retry_count: number
  next_retry_at: number
  last_error?: string
  created_at: number
  updated_at: number
}

export interface SyncCounts {
  pending: number
  syncing: number
  done: number
  failed: number
  permanent_failed: number
}

export interface SyncStatusPayload {
  online: boolean
  counts: SyncCounts
  last_push_at?: number
  last_pull_at?: number
}

export interface SyncItemEvent {
  id: string
  entity: string
  entity_id: string
  operation: string
  status: SyncOpStatus
  error?: string
  retry_count: number
  retry_at?: number
}

export interface SyncPullEvent {
  entity: string
  count: number
  cursor?: string
}

export interface PluginSyncAPI {
  push(
    entityType: string,
    entityId: string,
    operation: SyncOpKind,
    payload: unknown,
    priority?: number,
  ): Promise<string>
  pull(entityType?: string): Promise<void>
  getCached(entityType: string, entityId: string): Promise<unknown | null>
  /** Liste toutes les entités cachées d'un type. */
  listCached(entityType: string): Promise<unknown[]>
  /** Supprime le cache local d'un type (ou de tout le plugin si omis). */
  clearCached(entityType?: string): Promise<void>
  setCursor(entityType: string, cursor: string): Promise<void>
  counts(): Promise<SyncCounts>
  retryFailed(): Promise<void>
  wake(): void
  onStatus(handler: (status: SyncStatusPayload) => void): Unsubscribe
  onDone(handler: (event: SyncItemEvent) => void): Unsubscribe
  onFailed(handler: (event: SyncItemEvent) => void): Unsubscribe
  onPullDone(handler: (event: SyncPullEvent) => void): Unsubscribe
}

// ════════════════════════════════════════════════════════════════════════════
// APP API (contrat hôte complet)
// ════════════════════════════════════════════════════════════════════════════

export interface AppAPI {
  readonly pluginId: string

  // ── UI ────────────────────────────────────────────────────────────────────
  registerRoutes(routes: RouteConfig[]): void
  registerSidebar(items: SidebarItem[]): void
  registerCommand(cmd: Command): void
  registerDashboardWidget(w: DashboardWidget): void
  registerSettingsSection(section: SettingsSection): void
  registerTopbarAction(action: TopbarAction): void
  navigate(to: string): void
  openUrl(url: string): Promise<void>

  // ── Toasts & notifications ────────────────────────────────────────────────
  notify(msg: string, type?: ToastType): void
  nativeNotify(title: string, body: string): Promise<void>
  notifications: PluginNotifications

  // ── Réseau ────────────────────────────────────────────────────────────────
  // `offlineFallback: true` sur les écritures : tente l'appel en direct, et si le
  // serveur est injoignable (réseau coupé, 5xx, 429 — pas une erreur de validation
  // 4xx), enregistre l'opération dans la file offline au lieu de rejeter. Elle sera
  // rejouée automatiquement dès que le serveur redevient disponible. Voir
  // `ApiWriteResult`.
  apiGet<T>(path: string, options?: RequestOptions): Promise<T>
  apiPost<T>(path: string, body: unknown, options?: RequestOptions): Promise<T>
  apiPost<T>(path: string, body: unknown, options: WriteOptions & { offlineFallback: true }): Promise<ApiWriteResult<T>>
  apiPut<T>(path: string, body: unknown, options?: RequestOptions): Promise<T>
  apiPut<T>(path: string, body: unknown, options: WriteOptions & { offlineFallback: true }): Promise<ApiWriteResult<T>>
  apiPatch<T>(path: string, body: unknown, options?: RequestOptions): Promise<T>
  apiPatch<T>(path: string, body: unknown, options: WriteOptions & { offlineFallback: true }): Promise<ApiWriteResult<T>>
  apiDelete<T>(path: string, options?: RequestOptions): Promise<T>
  apiDelete<T>(path: string, options: WriteOptions & { offlineFallback: true }): Promise<ApiWriteResult<T>>
  /**
   * Le fichier est choisi via un dialog natif piloté côté Rust — aucun chemin
   * disque n'est fourni par le plugin (empêche l'exfiltration d'un fichier
   * arbitraire en passant simplement un chemin de son choix).
   */
  upload(
    path: string,
    field?: string,
    extraFields?: Record<string, string>,
  ): Promise<UploadResult>
  download(path: string, suggestedName?: string): Promise<DownloadResult>
  getQueryClient(): QueryClient

  // ── Presse-papiers ────────────────────────────────────────────────────────
  clipboard: ClipboardAPI

  // ── Dialog natif ──────────────────────────────────────────────────────────
  dialog: DialogAPI

  // ── Thème ─────────────────────────────────────────────────────────────────
  theme: ThemeAPI

  // ── Inter-plugins ─────────────────────────────────────────────────────────
  events: EventBus
  store: SharedStore

  // ── Temps réel ────────────────────────────────────────────────────────────
  onRealtime(channel: string, handler: (payload: unknown) => void): Unsubscribe

  // ── Synchronisation offline-first ─────────────────────────────────────────
  sync: PluginSyncAPI

  // ── i18n ──────────────────────────────────────────────────────────────────
  t(key: string, options?: Record<string, unknown>): string
  addTranslations(resources: Record<string, Record<string, unknown>>): void
  getLocale(): string

  // ── Config persistante ────────────────────────────────────────────────────
  config: PluginConfigApi

  // ── Journalisation ────────────────────────────────────────────────────────
  log: PluginLogger

  // ── Permissions ───────────────────────────────────────────────────────────
  getPermissions(): string[]
  hasPermission(permission: string): boolean
  can(permission: string): boolean

  // ── Cycle de vie ──────────────────────────────────────────────────────────
  addCleanup(dispose: () => void): void

  // ── Contexte ──────────────────────────────────────────────────────────────
  getUser(): CurrentUser
  /** Retourne le tenant courant, ou `null` si non connecté à un tenant. */
  getTenant(): TenantContext | null
  getManifest(pluginId: string): Manifest | undefined

  // ── Composants UI ─────────────────────────────────────────────────────────
  ui: UIKit
}

// ════════════════════════════════════════════════════════════════════════════
// CONTRAT DE STYLE
// ════════════════════════════════════════════════════════════════════════════

export const ui = {
  card: 'card', cardRaised: 'card-raised',
  metricCard: 'metric-card', metricCardLabel: 'metric-card-label',
  metricCardValue: 'metric-card-value', metricCardDelta: 'metric-card-delta',
  btn: 'btn', btnPrimary: 'btn btn-primary', btnSecondary: 'btn btn-secondary',
  btnGhost: 'btn btn-ghost', btnDanger: 'btn btn-danger',
  btnSm: 'btn-sm', btnLg: 'btn-lg', btnIcon: 'btn btn-icon',
  badge: 'badge', badgeSuccess: 'badge badge-success', badgeWarning: 'badge badge-warning',
  badgeInfo: 'badge badge-info', badgeDanger: 'badge badge-danger',
  badgeNeutral: 'badge badge-neutral', badgePrimary: 'badge badge-primary',
  input: 'input', inputError: 'input-error', label: 'label',
  formHint: 'form-hint', formError: 'form-error',
  table: 'table', alert: 'alert', divider: 'divider',
} as const

export const TOKENS = {
  bg: 'var(--color-bg)', surface: 'var(--color-surface)',
  surfaceSubtle: 'var(--color-surface-subtle)', surfaceHover: 'var(--color-surface-hover)',
  surfaceRaised: 'var(--color-surface-raised)', textPrimary: 'var(--color-text-primary)',
  textSecondary: 'var(--color-text-secondary)', textTertiary: 'var(--color-text-tertiary)',
  primary: 'var(--color-primary)', primaryMuted: 'var(--color-primary-muted)',
  onPrimary: 'var(--color-on-primary)', success: 'var(--color-success)',
  warning: 'var(--color-warning)', danger: 'var(--color-danger)', info: 'var(--color-info)',
  border: 'var(--color-border)', borderStrong: 'var(--color-border-strong)',
  radiusSm: 'var(--radius-sm)', radiusMd: 'var(--radius-md)',
  radiusLg: 'var(--radius-lg)', radiusXl: 'var(--radius-xl)', radiusFull: 'var(--radius-full)',
  shadowSm: 'var(--shadow-sm)', shadowMd: 'var(--shadow-md)', shadowLg: 'var(--shadow-lg)',
  space1: 'var(--space-1)', space2: 'var(--space-2)', space3: 'var(--space-3)',
  space4: 'var(--space-4)', space6: 'var(--space-6)', space8: 'var(--space-8)',
} as const

// ════════════════════════════════════════════════════════════════════════════
// CLASSE DE BASE (ERPPlugin)
// ════════════════════════════════════════════════════════════════════════════

export abstract class ERPPlugin {
  constructor(
    public readonly app: AppAPI,
    public readonly manifest: Manifest,
  ) {}
  abstract onload(): void | Promise<void>
  abstract onunload(): void
}

export type PluginConstructor = new (app: AppAPI, manifest: Manifest) => ERPPlugin

export interface PluginInstance {
  onload(): void | Promise<void>
  onunload(): void
}

export type PluginFactory = (app: AppAPI) => PluginInstance

export function definePlugin(factory: PluginFactory): PluginFactory {
  return factory
}
