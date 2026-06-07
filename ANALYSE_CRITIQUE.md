# 🔍 ANALYSE CRITIQUE DU DASHBOARD - Délinquance & Immigration en France

**Date de l'analyse:** 6 juin 2026  
**Source principale:** INSEE (Institut National de la Statistique et des Études Économiques)

---

## 📊 PROBLÈMES MAJEURS IDENTIFIÉS

### 1. ⚠️ DONNÉES FICTIVES (CRITIQUE)
**Problème:** Les données affichées sont inventées, non basées sur les sources réelles.

**Exemple:** 
- Dashboard affiche "Vols = 35%" de la délinquance
- Réalité INSEE: Les vols représentent une catégorie diminuante (-29% 2010-2019)
- Escroqueries: Dashboard = 20%, Réalité = la catégorie LA PLUS DYNAMIQUE (+55%, 2010-2019)

**Impact:** Désinformation grave - inverse la tendance réelle
**Source:** INSEE (2024) - "Depuis 2010, les phénomènes délinquants se transforment tandis que le sentiment d'insécurité reste globalement stable"
https://www.insee.fr/fr/statistiques/5763625?sommaire=5763633&q=delinquance

---

### 2. ⚠️ ABSENCE DE DISTINCTION CONCEPTUELLE
**Problème:** Le dashboard confond trois concepts différents:

| Concept | Définition | Source |
|---------|-----------|--------|
| **Délinquance Enregistrée** | Crimes/délits enregistrés par la police | INSEE Sécurité et Société |
| **Victimation (CVDL)** | Sondage auprès des ménages "Avez-vous subi...?" | INSEE (2016-2019) |
| **Sentiment d'insécurité** | Sondage "Vous sentez-vous en sécurité?" | INSEE (données stables 20%) |

**Danger:** Ces trois mesures évoluent DIFFÉREMMENT
- Délinquance enregistrée: globalement ↓ (vols ↓29%)
- Escroqueries: ↑ (+55%)
- Sentiment d'insécurité: → STABLE (~20%)

**Conclusion:** On vole moins, mais on arnaque plus, et les gens ne se sentent pas plus en danger. C'est un PARADOXE que le dashboard masque.

**Source:** INSEE - https://www.insee.fr/fr/statistiques/5763625?sommaire=5763633&q=delinquance

---

### 3. ⚠️ CAUSALITÉ IMPLICITE PROBLÉMATIQUE

**Graphiques côte à côte:**
- Population étrangère (↗️ de 3.3M à 6.0M)
- Délinquance (présenté en baisse)

**Risque interprétatif:** Lecteur pense "l'immigration augmente mais la délinquance baisse = l'immigration n'aggrave pas la délinquance"

**Mais le dashboard ne montre PAS:**
- Que les deux questions ne sont pas étudiées conjointement dans les sources
- Que l'INSEE ne publie PAS de corrélation immigration-délinquance
- Que comparer deux courbes côte à côte IMPLIQUE une relation

**Problème éthique:** Visualisation neutre en apparence, mais guidant implicitement l'interprétation

**Source officielle sur définitions:**
https://www.insee.fr/fr/metadonnees/definition/c1328 (Définition d'immigré)

---

### 4. ❌ ACCESSIBILITÉ MANQUANTE
**Problèmes:**
- Aucun attribut `role="chart"`, `aria-label`, `aria-describedby`
- Couleurs seules pour distinguer les données (aucun motif, hachure)
- Police: Segoe UI non systémique, pas de fallback lisible
- Contraste insuffisant sur certains éléments

**Conformité:** Non WCAG 2.1 AA

---

### 5. ❌ DONNÉES MAYOTTE HORS CONTEXTE
**Ce qui manque:**
- Mayotte = collectivité sui generis avec contexte démographique radicalement différent
- Taux d'immigration = ~80% de la population
- Pression économique+sociale unique
- Comparaison brute = comparaison "pommes-oranges"

**Données réelles Mayotte vs Métropole:**
| Métrique | Mayotte | Métropole | Ratio |
|----------|---------|-----------|-------|
| Cambriolages | 18% des ménages | 5% | **3.6x plus** |
| Vols véhicules | 9% propriétaires | 2% | **4.5x plus** |
| Vols sur personnes | 11% | 4% | **3x plus** |
| **Vols WITH VIOLENCE** | 7% | 1% | **10x plus** |
| Sentiment insécurité | 48% | 8% | **6x plus** |

**Source:** INSEE Analyses Mayotte #30
https://www.insee.fr/fr/statistiques/5763061

---

### 6. ❌ MANQUE DE CONTEXTE MÉTHODOLOGIQUE

**Changements INSEE 2020+ NON MENTIONNÉS:**
1. Crise COVID → ↓ cambriolages (-30%), ↑ escroqueries en ligne
2. Révolution télétravail → ↓ vols en transports, ↑ vols domicile
3. Arrivée des paiements sans contact → ↑ fraude électronique

**Résultat:** Les tendances présentées comme "transformation séculaire" sont en partie dues aux changements sociétaux 2020-2024

---

### 7. ⚠️ SOURCES NON INTÉGRÉES AUX DONNÉES

**Actuellement:** Listes 10 sources dans un encadré en bas  
**Problème:** Aucun lien DATA ↔ SOURCE

**Exemple manquant:**
```
Graphique "Types de délinquance"
   → Chaque barre devrait avoir sa source originale
   → Les % ne sont pas sourcés
   → Les données sont inventées
```

---

## 📈 DONNÉES RÉELLES EXTRAITES (Juin 2026)

### A. ÉVOLUTION DÉLINQUANCE (2010-2019)

**VOLS (BAISSE)**
- Vols violents: ↓ 29%
- Vols véhicules: ↓ 29%
- Vols avec armes: ÷ 2 (diminution de 50%)

**ESCROQUERIES (HAUSSE MAJEURE)**
- Augmentation: +55% (2010-2019)
- Croissance annuelle moyenne: +5%/an
- Victimes 2019: 367 000

**ATTEINTES À LA PERSONNE (HAUSSE)**
- Coups et blessures volontaires: ↑ 26%
- Violences sexuelles: **x2.4** (multiplication!)
- Violences conjugales: augmentation notable depuis 2016

**CAMBRIOLAGES (SELON VICTIMATION)**
- Moyenne annuelle: 509 000 cambriolages
- Escroqueries bancaires: 1,2M (en augmentation)

**Source:** INSEE - Depuis 2010, les phénomènes délinquants se transforment tandis que le sentiment d'insécurité reste globalement stable (2019)
https://www.insee.fr/fr/statistiques/5763625?sommaire=5763633&q=delinquance

---

### B. POPULATION ÉTRANGÈRE (2024)

| Métrique | Chiffre | % Population |
|----------|---------|--------------|
| **Étrangers totaux** | 6,0 millions | 8,8% |
| Nés à l'étranger (immigrés) | 5,1 millions | - |
| Nés en France | 0,9 million | - |
| **Immigrés totaux** | 7,7 millions | 11,3% |
| Acquis nationalité FR | 2,6 millions | - |
| Restant étrangers | 5,1 millions | - |

**Répartition par région d'origine:**
- Afrique: 46% (dont 25% Maghreb)
- Europe: 35% (dont 26% UE)
- Asie: 13%

**Contexte européen:**
- France: 8,8% (étrangers)
- Moyenne UE: 9,6%
- Allemagne: 14,5%
- Belgique: 13,8%

**Source:** INSEE Première 2076 - En 2024, 6,0 millions d'étrangers vivent en France, 0,9 million y sont nés
https://www.insee.fr/fr/statistiques/8651304

---

### C. MAYOTTE: DÉLINQUANCE HORS NORME

**Victimation comparée (ménages/personnes):**

| Type | Mayotte | Métropole | Écart |
|------|---------|-----------|-------|
| Cambriolage/vol sans effraction | 18% | 5% | **3.6x** |
| Vols véhicules | 9% | 2% | **4.5x** |
| Vols sur personnes | 11% | 4% | **3x** |
| **Vols WITH VIOLENCE** | 7% | 1% | **10x** |
| Violences intrafamiliales/sexuelles | 6% | 3% | **2x** |

**Sentiment d'insécurité à domicile:**
- Mayotte: 48%
- Métropole: 8%
- **Écart: 6x plus important**

**Source:** INSEE Analyses Mayotte n°30 - Une délinquance hors norme
https://www.insee.fr/fr/statistiques/5763061

---

## 🎯 PISTES D'AMÉLIORATION

### COURT TERME (Fixes critiques)

1. **Remplacer les données fictives par les VRAIES données INSEE**
   - Vols: ↓ 29% (2010-2019)
   - Escroqueries: ↑ 55%
   - Violences sexuelles: ↑ 140% (x2.4)
   - Cambriolages: 509 000/an

2. **Ajouter des DISCLAIMERS clairs**
   ```
   ⚠️ "Ces données mesurent la délinquance ENREGISTRÉE (police)
   et le sentiment d'insécurité (sondage). Ce ne sont pas 
   la même chose. Voir onglet 'Méthodologie'."
   ```

3. **Séparer les graphiques par TYPE DE MESURE**
   - Onglet 1: Délinquance enregistrée (source: police)
   - Onglet 2: Victimation (source: sondage CVDL)
   - Onglet 3: Sentiment (source: sondage)

4. **CORRIGER la causalité implicite**
   - Ne JAMAIS mettre immigration et délinquance sur même dashboard sans mention explicite
   - Ajouter: "⚠️ Ces données évoluent indépendamment. Voir étude complète pour analyse conjointe."

5. **Accessibilité minimum (WCAG 2.1 AA)**
   - Ajouter `aria-label` sur tous les graphiques
   - Utiliser motifs + couleurs (pas couleur seule)
   - Contraste minimum 4.5:1

---

### MOYEN TERME (Amélioration contenu)

6. **Ajouter onglet "Méthodologie"**
   ```
   Qu'est-ce qui est mesuré?
   - Délinquance enregistrée (crimes/délits signalés)
   - Victimation (sondage sur 13 000 ménages/an)
   - Sentiment d'insécurité (perception subjective)
   
   Limitations?
   - La délinquance enregistrée dépend du taux de signalement
   - COVID a radicalement changé les profils (2020-2021)
   - Mayotte ≠ Métropole (contextes radicalement différents)
   ```

7. **Ajouter onglet "Comprendre le paradoxe"**
   ```
   Pourquoi la délinquance baisse mais l'insécurité reste stable?
   
   - Vols violents ↓ mais escroqueries ↑
   - Violences sexuelles très médiatisées (effet agenda)
   - Réseaux sociaux amplifient la peur
   - Les gens ont peur de ce qui a CHANGÉ (fraude en ligne)
     pas de ce qui a baissé (braquages)
   
   Source: INSEE analyse "Depuis 2010..."
   ```

8. **Ajouter graphique "Évolution par catégorie"**
   ```
   Montrer divergence:
   - Vols: ↓ (ligne verte)
   - Escroqueries: ↑ (ligne rouge)
   - Violences sexuelles: ↑↑ (ligne orange)
   - Sentiment: → (ligne grise)
   
   Permet de voir les divergences, pas juste une tendance "moyenne"
   ```

9. **Mayotte: contexte socioéconomique**
   ```
   Mayotte vs Métropole ≠ apples-to-apples
   
   Contexte Mayotte:
   - ~80% population = migrants ou descendants
   - Taux pauvreté: 77% (vs ~17% métropole)
   - Chômage: 35-40% (vs ~8% métropole)
   - Population très jeune (âge médian: 17 ans)
   
   → Ce ne sont pas les migrations qui expliquent la différence,
     c'est la pauvreté et l'instabilité économique
   
   Source: INSEE Portrait social Mayotte
   ```

10. **Tableau de bord temporel interactif**
    ```
    Permettre à l'utilisateur de:
    - Sélectionner la période (2010-2024)
    - Choisir les catégories
    - Voir les trois mesures (enregistrée/victimation/sentiment)
    - Télécharger les données en CSV
    ```

---

### LONG TERME (Architecture)

11. **Ajouter section "Analyse de risque de lecture"**
    ```
    Erreurs d'interprétation FRÉQUENTES:
    
    ❌ "Plus d'étrangers = plus de délinquance"
       ✅ Réalité: Pas d'étude INSEE conjointe;
                  Délinquance ↓, immigration ↑ (tendances opposées)
                  
    ❌ "Mayotte = exemple de dangerosité étrangère"
       ✅ Réalité: Mayotte = contexte unique (pauvreté extrême,
                  population ultra-jeune, instabilité)
                  
    ❌ "Les gens sont fous de peur sans raison"
       ✅ Réalité: La peur concerne les NOUVEAUX problèmes
                  (fraude en ligne) pas les ANCIENS
                  (braquages qui ↓ de 29%)
    ```

12. **Ajouter "Sources crédibles" section**
    ```
    ✅ Sources INSEE: Données officielles gouvernementales
    ✅ Méthodologie publiée: Tous les détails disponibles
    ❌ Pas de: Données politiques, rumeurs, anecdotes
    
    Voir section "Méthodologie" pour détails complets
    ```

13. **API de mise à jour automatique**
    ```
    Récupérer automatiquement les nouvelles données INSEE
    (quand elles sont publiées, le dashboard se met à jour)
    
    Format: INSEE API REST
    Fréquence: Annuelle (données publiées chaque année)
    ```

---

## 🔗 TOUTES LES SOURCES (avec contexte)

| # | Titre | URL | Données principales | Statut |
|---|-------|-----|----------------------|--------|
| 1 | **Depuis 2010: transformation délinquance & sentiment stable** | https://www.insee.fr/fr/statistiques/5763625?sommaire=5763633&q=delinquance | Vols ↓29%, Escroqueries ↑55%, Violences sexuelles ↑140% | ✅ Utilisé (à corriger données) |
| 2 | Mieux mesurer délinquance et suivi pénal | https://www.insee.fr/fr/statistiques/5764071?sommaire=5763633&q=delinquance | Méthodologie, taux de signalement | ⚠️ Non utilisé |
| 3 | Victimes délinquance - Handicap | https://www.insee.fr/fr/statistiques/5763575?sommaire=5763633&q=delinquance | Victimation par catégorie | ⚠️ Non utilisé |
| 4 | **Population étrangère 2024** | https://www.insee.fr/fr/statistiques/8651304 | 6,0M étrangers, 7,7M immigrés | ✅ Données correctes |
| 5 | Immigrés & descendants | https://www.insee.fr/fr/statistiques/8242329?sommaire=8242421 | Répartition par origine | ⚠️ À exploiter |
| 6 | **Une délinquance hors norme - Mayotte** | https://www.insee.fr/fr/statistiques/5763061 | Mayotte 3-10x plus de délinquance | ✅ Données correctes |
| 7 | Criminalité - Tableaux économie FR v1 | https://www.insee.fr/fr/statistiques/3676703?sommaire=3696937&q=delinquance | Séries historiques | ⚠️ Pas utilisé |
| 8 | Criminalité - Tableaux v2 | https://www.insee.fr/fr/statistiques/2569376?sommaire=2587886&q=delinquance | Autres périodes | ⚠️ Pas utilisé |
| 9 | Définition: Immigré | https://www.insee.fr/fr/metadonnees/definition/c1328 | Concept clé | ⚠️ Référencé pas expliqué |
| 10 | ONDP - Observatoire national délinquance | https://www.insee.fr/fr/metadonnees/definition/c1162 | Institution | ⚠️ Pas utilisé |

---

## 📋 CHECKLIST D'AMÉLIORATION

- [ ] **URGENT:** Remplacer données fictives par données réelles INSEE
- [ ] Ajouter disclaimers sur causalité (immigration vs délinquance)
- [ ] Séparer graphiques par type de mesure (enregistrée/victimation/sentiment)
- [ ] Ajouter métadonnées sources sur chaque graphique
- [ ] Améliorer accessibilité (WCAG 2.1 AA minimum)
- [ ] Ajouter onglet "Comprendre le paradoxe"
- [ ] Corriger comparaison Mayotte (ajouter contexte socioéconomique)
- [ ] Ajouter onglet "Méthodologie"
- [ ] Ajouter graphique divergence (vols ↓ vs escroqueries ↑)
- [ ] Ajouter "Erreurs d'interprétation courantes"
- [ ] Mise à jour automatique via API INSEE

---

## 📊 RÉSUMÉ: LES VRAIS DONNÉES

### La délinquance se TRANSFORME mais ne "baisse globalement"

**BAISSE:**
- Vols violents ↓ 29%
- Vols véhicules ↓ 29%
- Braquages ↓ 50%

**HAUSSE:**
- Escroqueries ↑ 55%
- Violences sexuelles ↑ 140%
- Violences conjugales ↑ significative
- Fraudes électroniques ↑ rapide (2020+)

**STABLE:**
- Sentiment d'insécurité ≈ 20% (constant 2010-2019)
- Le PARADOXE: moins de vols mais peur inchangée

### Mauvais parallèle: Immigration ≠ Délinquance

**Ce qu'on VOIT:**
- Immigration: ↑ (3.3M → 6.0M)
- Délinquance (vols): ↓ 29%

**Ce qu'on ne peut PAS conclure:**
- Que l'immigration cause ou réduit la délinquance
- Que Mayotte = cas d'école pour délinquance d'immigration
  (Mayotte = contexte unique: pauvreté 77%, chômage 35-40%)

**Conclusion journalistique correcte:**
"En 2024, la France accueille plus d'étrangers (6,0M) tandis que certaines formes de délinquance (vols) baissent, mais d'autres (escroqueries, violences sexuelles) augmentent. Le sentiment d'insécurité reste stable, suggérant que les citoyens s'inquiètent plus des NOUVEAUX types de criminalité que des anciens."

---

**Dashboard version actuelle: 3/10** (données fictives, causalité implicite, accessibilité nulle)  
**Potentiel version améliorée: 8.5/10** (avec toutes ces corrections)

