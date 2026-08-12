# @infintywab/plugin-sdk

SDK officiel pour écrire des plugins **FasoOrchestra ERP**. Fournit le contrat de
types complet (`AppAPI`, `Manifest`, …), la classe de base `ERPPlugin`, le helper
`definePlugin`, les constantes (`EVENTS`, `STORE_KEYS`, `CHANNELS`) et le **contrat
de style** (`ui`, `TOKENS`).

> À l'exécution, le plugin ne charge **pas** ce code : l'hôte injecte l'`AppAPI`
> réelle dans la factory/constructeur. Le SDK n'apporte que des types (effacés au
> build), une classe de base triviale et des constantes. **React reste externe**
> (fourni par l'hôte via `window`) — voir le contrat de packaging.

## Installation

```bash
npm i -D @infintywab/plugin-sdk
```

## Build (émet les `.d.ts`)

```bash
npm run build   # → dist/index.js + dist/index.d.ts (+ source maps)
```

Le `package.json` expose `dist/index.d.ts` comme `types` → **autocomplétion
complète** dans VS Code pour tout projet qui installe le paquet.

## Utilisation

```ts
import { definePlugin, type AppAPI, ui } from '@infintywab/plugin-sdk'

export const manifest = {
  id: 'my-plugin',
  name: 'Mon plugin',
  version: '1.0.0',
  license: 'MIT',
  permissions: ['tasks:read'],
  dependencies: [],
}

export default definePlugin((app: AppAPI) => ({
  onload() {
    app.registerSidebar([{ label: 'Mon plugin', path: '/mine', icon: 'package', section: 'Modules' }])
    app.registerCommand({ id: 'mine.hello', label: 'Hello', run: () => app.notify(app.t('common.save')) })
    app.navigate('/mine')
    app.log.info('chargé', app.getPermissions())
    const id = setInterval(() => {}, 1000)
    app.addCleanup(() => clearInterval(id))
  },
  onunload() {},
}))
```

## Surface de l'`AppAPI`

| Domaine | Membres |
|---|---|
| Identité | `pluginId` |
| UI | `registerRoutes`, `registerSidebar`, `registerCommand`, `registerDashboardWidget`, `registerSettingsSection`, `navigate` |
| Notifs | `notify`, `notifications.push/markAllRead` |
| Réseau | `apiGet/Post/Put/Patch/Delete`, `getQueryClient` |
| Inter-plugins | `events` (pipe/on/emit/dispatch), `store` |
| Temps réel | `onRealtime(channel, cb)` |
| i18n | `t(key, opts?)`, `getLocale()` |
| Journalisation | `log.debug/info/warn/error` |
| Permissions | `getPermissions()`, `hasPermission()` |
| Cycle de vie | `addCleanup(fn)` |
| Contexte | `getUser()`, `getManifest(id)` |

## Style

Tout plugin **repose sur le design system de l'hôte** : classes via `ui`
(`ui.card`, `ui.btnPrimary`, `ui.badgeSuccess`, `ui.input`, `ui.metricCard`…) et
tokens via `TOKENS` (`var(--color-*)`). Aucune feuille de style embarquée.

---

## Publication

Le SDK est le **contrat** entre le shell et tous les plugins. Toute modification
de la surface publique (`AppAPI`, `Manifest`, constantes) est un événement de
version : semver strict, sans exception.

| Changement | Version |
|---|---|
| Ajout d'une méthode ou d'un champ optionnel | mineure |
| Correction sans impact sur la surface | corrective |
| Signature modifiée, champ retiré ou rendu obligatoire | **majeure** |

### Publier une version

```bash
npm version minor        # met à jour package.json ET crée le tag vX.Y.Z
git push --follow-tags   # déclenche le workflow Release
```

Le workflow refuse de publier si le tag ne correspond pas à la version du
`package.json`, ou si cette version existe déjà sur le registre. Il vaut mieux
échouer à la publication qu'obtenir un paquet dont le numéro ne correspond à
aucun commit.

### Prérequis, une seule fois

1. **Le scope `@infintywab` doit exister sur npm** et appartenir au compte
   publiant. Le créer via `npm org create infintywab`, ou publier sous un autre
   nom en modifiant le champ `name` du `package.json` **avant la première
   publication** — un nom publié ne se reprend pas.
2. **Secret `NPM_TOKEN`** dans les paramètres du dépôt
   (*Settings → Secrets and variables → Actions*), avec un jeton npm de type
   *Automation* — il traverse la double authentification, contrairement à un
   jeton de publication classique.

`--access public` est passé explicitement : un paquet scopé est publié en
`restricted` par défaut, ce qui exige un plan payant et le rendrait inaccessible
aux consommateurs.

### Provenance (optionnel)

Pour attester publiquement le lien entre le paquet et le commit qui l'a produit,
ajouter `--provenance` à l'étape de publication et la permission
`id-token: write` au job. **Cela requiert un dépôt public** — sur un dépôt privé,
la publication échouerait.

## Consommateurs

| Dépôt | Usage |
|---|---|
| `InfinityWAB/erp-Orchestra` | le shell : kernel, factory et types partagés |
| `InfinityWAB/branch` | module organigramme (`frontend/`) |
| `InfinityWAB/xstocks` | module stock (`frontend/`) |

Après une version majeure, prévenir ces dépôts : ils déclarent une plage semver
et ne suivront pas automatiquement.

### Si la publication renvoie 404

```
npm error 404 Not Found - PUT https://registry.npmjs.org/@infintywab%2fplugin-sdk
```

npm répond 404 au lieu de 403 pour ne pas révéler l'existence d'un scope privé.
Le message ne distingue donc pas les causes. Dans l'ordre de fréquence :

1. **L'organisation npm n'existe pas.** Une organisation GitHub n'en crée pas
   une sur npm — les deux registres sont indépendants.
   ```bash
   npm login && npm org create infintywab
   ```
2. **Le jeton est un *granular access token* trop restreint.** Pour créer un
   paquet qui n'existe pas encore, il doit couvrir le **scope entier** en
   lecture-écriture, et non une liste de paquets. Un jeton *Automation* classique
   n'a pas cette limite.
3. **Le compte du jeton n'est pas membre de l'organisation**, ou y est simple
   lecteur.

Le workflow `release.yml` vérifie ces trois points avant de publier et affiche
la cause exacte.
