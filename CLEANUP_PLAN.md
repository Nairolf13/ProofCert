# Plan de nettoyage ProofCert

## À supprimer (mocks, duplicatas, simulation)

### src/lib/sdkDapp/
- real-components.ts
- realistic-components.ts
- realistic-components.tsx
- sdkDapp.components.ts
- sdkDapp.constants.ts
- sdkDapp.helpers.ts
- sdkDapp.hooks.ts
- sdkDapp.types.ts
- utils.ts
- hooks.ts
- index.ts

### src/lib/sdkCore.ts

### src/hooks/
- MultiversXDappProvider.tsx
- RealMultiversXProvider.tsx

### src/services/
- multiversx.ts (remplacer par un service réel si besoin)

### src/providers/
- MultiversXProvider.tsx (si doublon avec MultiversXAuth/providers)

### src/pages/
- WalletDebugPage.tsx

### src/MultiversXAuth/components/
- WalletResetButton.tsx (si non utilisé)
- SafeLoginButtons.tsx (si non utilisé)

### src/MultiversXAuth/providers/
- WalletProviders.ts (si non utilisé)

## À vérifier/adapter
- Tous les imports de ces fichiers dans le code (pages, hooks, providers, services)
- Remplacer par les vrais composants du SDK MultiversX
- Ne garder qu’un seul provider MultiversX centralisé

## À garder
- src/lib/multiversx/index.ts (vrais exports SDK)
- src/MultiversXAuth/providers/MultiversXProvider.tsx (provider principal)

---

**Étapes suivantes** :
1. Supprimer tous les fichiers listés ci-dessus
2. Corriger les imports dans le code (pages, hooks, providers, services)
3. Tester le site (login, dashboard, proofs, etc.)
4. Réinstaller les dépendances si besoin

---

*Ce plan est généré automatiquement. Valide-le avant exécution massive.*
