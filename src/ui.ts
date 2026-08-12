/**
 * Contrat des composants UI fournis par l'hôte aux plugins via `app.ui`.
 *
 * Aucun import React ici — les composants sont passés en tant que
 * `ComponentType` et instanciés par le plugin dans son JSX.
 */
import type { ComponentType, ReactNode } from 'react'

/**
 * Type structurel compatible avec `LucideIcon`, SANS dépendre du package
 * `lucide-react` : celui-ci n'est PAS externalisé au runtime (seul React l'est,
 * voir `window.__ERP_RUNTIME__`), donc un plugin ne peut jamais produire une
 * authentique instance `lucide-react.LucideIcon`. Les icônes plugin (inline SVG
 * ou autres) satisfont ce type dès lors qu'elles acceptent ces props usuelles.
 */
export type PluginIcon = ComponentType<{
  size?: number | string
  strokeWidth?: number | string
  color?: string
  className?: string
}>

// ── KpiCard ────────────────────────────────────────────────────────────────────

export type KpiTrend = {
  value: string
  direction: 'up' | 'down'
  /** Si `true`, la direction "down" est verte et "up" est rouge (ex. dépenses). */
  good?: boolean
}

export type KpiCardProps = {
  label: string
  value: string
  icon: PluginIcon
  accent?: string
  trend?: KpiTrend
  hint?: string
}

// ── Charts communs ────────────────────────────────────────────────────────────

export type ChartDataPoint = Record<string, string | number>

export type BaseChartProps = {
  data: ChartDataPoint[]
  xKey: string
  yKey: string | string[]
  height?: number
  colors?: string[]
  unit?: string
  hideLegend?: boolean
}

export type AreaChartProps = BaseChartProps
export type LineChartProps = BaseChartProps
export type BarChartProps  = BaseChartProps & { horizontal?: boolean }

export type PieSlice = { label: string; value: number; color?: string }
export type PieChartProps = {
  data: PieSlice[]
  height?: number
  unit?: string
  showLabels?: boolean
}

// ── DataTable ─────────────────────────────────────────────────────────────────

export type Column<T = Record<string, unknown>> = {
  key: string
  header: string
  /** Rendu cellule. Ignoré si `editable`. */
  cell?: (row: T) => ReactNode
  accessor?: (row: T) => string | number
  sortable?: boolean
  className?: string
  align?: 'left' | 'right' | 'center'
  /** Rend la cellule éditable (input inline) — nécessite `onCellEdit` sur la table. Une
   *  fonction permet de restreindre l'édition à certaines lignes (ex. mode édition par ligne). */
  editable?: boolean | ((row: T) => boolean)
  /** Type du champ d'édition inline. Défaut : 'text'. */
  editType?: 'text' | 'number' | 'select' | 'toggle'
  /** Options du `<select>` — utilisé seulement si `editType: 'select'`. */
  editOptions?: { value: string; label: string }[]
}

export type BulkAction<T = Record<string, unknown>> = {
  label: string
  icon?: ReactNode
  destructive?: boolean
  onClick: (rows: T[]) => void
}

export type DataTableProps<T = Record<string, unknown>> = {
  columns: Column<T>[]
  rows: T[]
  pageSize?: number
  searchable?: boolean
  searchPlaceholder?: string
  onRowClick?: (row: T) => void
  emptyLabel?: string
  /** Identifiant stable : persiste recherche/tri/filtres/densité (localStorage). */
  tableId?: string
  /** Cases à cocher + actions de masse. */
  selectable?: boolean
  bulkActions?: BulkAction<T>[]
  /** Gèle la première colonne au défilement horizontal. */
  stickyFirstColumn?: boolean
  /** Si défini (ex: '60vh'), scroll vertical interne + en-tête sticky. */
  maxHeight?: string
  /** En-tête sticky sans scroll interne borné : la table défile avec la page
   *  (ancêtre scrollable de l'appelant). Valeur = décalage CSS `top` (ex.
   *  '52px') sous d'autres éléments déjà sticky au-dessus. Ignoré si `maxHeight`
   *  est défini. */
  stickyHeaderTop?: string
  /** Affiche un skeleton pendant le chargement. */
  loading?: boolean
  /** Appelé au blur d'une cellule `editable` dont la valeur a changé. */
  onCellEdit?: (row: T, key: string, value: string) => void
}

// ── Badge ─────────────────────────────────────────────────────────────────────

export type BadgeVariant =
  | 'default' | 'primary' | 'secondary' | 'outline' | 'neutral'
  | 'success' | 'warning' | 'info' | 'destructive'

export type BadgeProps = {
  variant?: BadgeVariant
  className?: string
  children: ReactNode
}

// ── Spinner ───────────────────────────────────────────────────────────────────

export type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// ── EmptyState ────────────────────────────────────────────────────────────────

export type EmptyStateProps = {
  icon: PluginIcon
  title: string
  description?: string
  action?: ReactNode
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  /** Largeur de la modale (classe Tailwind max-w-*). Défaut : `max-w-lg`. */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: ReactNode
  footer?: ReactNode
}

// ── Drawer ────────────────────────────────────────────────────────────────────

export type DrawerProps = {
  open: boolean
  onClose: () => void
  title?: string
  side?: 'left' | 'right'
  children: ReactNode
  footer?: ReactNode
}

// ── Alert ─────────────────────────────────────────────────────────────────────

export type AlertVariant = 'info' | 'success' | 'warning' | 'destructive'

export type AlertProps = {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  className?: string
}

// ── KanbanBoard ───────────────────────────────────────────────────────────────

export type KanbanColumn<T = Record<string, unknown>> = {
  id: string
  label: string
  cards: T[]
  /** Couleur du badge de comptage de la colonne (nombre de cartes). */
  badgeVariant?: BadgeVariant
}

export type KanbanBoardProps<T = Record<string, unknown>> = {
  columns: KanbanColumn<T>[]
  /** Rendu du contenu d'une carte — le plugin contrôle entièrement l'affichage. */
  renderCard: (item: T) => ReactNode
  onCardClick?: (item: T) => void
  emptyLabel?: string
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

export type TabItem = {
  value: string
  label: string
  icon?: PluginIcon
  disabled?: boolean
}

export type TabsProps = {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  className?: string
}

// ── UIKit (point d'entrée `app.ui`) ───────────────────────────────────────────

export interface UIKit {
  // ── Charts ──────────────────────────────────────────────────────────────────
  KpiCard:    ComponentType<KpiCardProps>
  AreaChart:  ComponentType<AreaChartProps>
  LineChart:  ComponentType<LineChartProps>
  BarChart:   ComponentType<BarChartProps>
  PieChart:   ComponentType<PieChartProps>

  // ── Données ──────────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DataTable:   ComponentType<DataTableProps<any>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  KanbanBoard: ComponentType<KanbanBoardProps<any>>

  // ── Feedback & état ──────────────────────────────────────────────────────────
  Badge:      ComponentType<BadgeProps>
  Spinner:    ComponentType<SpinnerProps>
  EmptyState: ComponentType<EmptyStateProps>
  Alert:      ComponentType<AlertProps>

  // ── Overlays ─────────────────────────────────────────────────────────────────
  Modal:  ComponentType<ModalProps>
  Drawer: ComponentType<DrawerProps>

  // ── Navigation ────────────────────────────────────────────────────────────────
  Tabs: ComponentType<TabsProps>
}
