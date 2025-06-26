# 📋 Klipboard - Extension Chrome pour ThotSEO

> **Extension Chrome d'automatisation pour extraire et formater les données SEO de thot-seo.fr directement vers Excel**

![Version](https://img.shields.io/badge/version-1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome Extension](https://img.shields.io/badge/chrome-extension-yellow.svg)

## 🚀 À propos

Klipboard est une extension Chrome développée pour automatiser l'extraction des **recommandations d'écriture SEO** depuis [thot-seo.fr](https://thot-seo.fr) et les formater directement pour Excel. Cette extension répond à un besoin très spécifique : **optimiser le workflow de rédaction SEO** en automatisant la récupération des guides d'optimisation sémantique.

**Développée par :** [Sébastien Grillot](https://www.linkedin.com/in/consultant-seo-ia-automatisation/) - Consultant SEO depuis 2009, spécialisé dans l'automatisation SEO et l'IA.  
**Agence :** [Koeki](https://koeki.fr)  
**Développement :** 100% réalisé avec Claude.ai

## 🎯 Problème résolu

Lors de l'**optimisation de contenu SEO** avec ThotSEO, la récupération manuelle des recommandations d'écriture (intentions de recherche, mots-clés à intégrer, entités NLP, groupes de mots à mettre en gras) est **chronophage et répétitive**. 

Tu saisis tes **requêtes cibles**, ThotSEO te dit **"mets ces mots-là, comme ça"**, et cette extension automatise complètement la récupération de ces recommandations pour ton workflow de rédaction.

## ✨ Fonctionnalités

### 📊 Extraction automatique
- **Intentions de recherche** : Questions + mots-clés associés
- **Mots-clés obligatoires** : Avec leurs scores d'occurrence
- **Mots-clés complémentaires** : Avec leurs scores d'occurrence  
- **Entités NLP Google** : Extraction automatique via API Google
- **Groupes de mots à mettre en gras** : Pour optimisation on-page
- **Prompts SEO** : Récupération des prompts personnalisés

### 🔄 Processus intelligent
1. **Dépliage automatique** des sections ThotSEO
2. **Génération entités NLP** (clic automatique sur le bouton - ⚠️ consomme 1 crédit)
3. **Extraction des prompts** personnalisés
4. **Formatage Excel** avec retours à la ligne dans les cellules

### 📋 Format de sortie
**Format TSV optimisé pour Excel** avec 10 colonnes :
1. Termes pour les intentions de recherche
2. Termes de recherches obligatoires  
3. Termes de recherches complémentaires
4. Entités NLP Google
5. Groupes de mots à mettre en gras
6. Gains d'information *(prompt)*
7. Création d'un plan MECE *(prompt)*
8. Idées de listes et tableaux *(prompt)*
9. Densification mots-clés *(prompt)*
10. Guide pour la rédaction de contenu *(prompt)*

## 🏗️ Architecture technique

### Structure modulaire
```
klipboard/
├── manifest.json           # Configuration extension
├── content.js              # Script principal + orchestration
├── sectionExpander.js       # Gestion dépliage sections
├── nlpManager.js           # Gestion bouton NLP + timing
├── promptsManager.js       # Extraction prompts
├── dataExtractor.js        # Extraction + formatage données
└── styles.css              # Interface utilisateur
```

### Modules spécialisés

#### 🎛️ **content.js** - Orchestrateur principal
- Initialisation des modules
- Interface utilisateur (boutons, notifications)
- Coordination du workflow complet
- Gestion des erreurs et debug

#### 📂 **sectionExpander.js** - Expansion des sections
- Détection sections ThotSEO pliées/dépliées
- Clic automatique sur headers `onclick="open_close_*()"`
- Gestion états d'expansion avec timeouts

#### 🧠 **nlpManager.js** - Gestion entités NLP
- **États du bouton NLP** : Prêt → Génération → Terminé
- **Timing intelligent** : Attente completion (jusqu'à 3 minutes)
- **Extraction entités** : Via structure DOM `#liste_entites_nommes`

#### 📝 **promptsManager.js** - Extraction prompts
- Détection boutons de copie prompts
- Mapping intelligent vers colonnes Excel
- Gestion fallback par ordre d'apparition

#### 🗂️ **dataExtractor.js** - Extraction et formatage
- **Extraction ciblée** : Utilisation structure HTML exacte
- **Format Excel** : TSV avec caractères LF pour retours à la ligne
- **Nettoyage données** : Suppression titres et formatage parasite

## 🚀 Installation

### Prérequis
- Google Chrome
- Accès à [thot-seo.fr](https://thot-seo.fr)

### Installation manuelle
1. Télécharger le code source
2. Ouvrir Chrome → `chrome://extensions/`
3. Activer "Mode développeur"
4. Cliquer "Charger l'extension non empaquetée"
5. Sélectionner le dossier du projet

## 📖 Utilisation

### Utilisation
L'extension ajoute **2 éléments** sur thot-seo.fr :
- 🎯 **Bouton principal** : "📋 Klipboard AUTO" (extraction complète des recommandations)
- 🔧 **Panel debug** : Boutons de test individuels

### Workflow automatique
1. **Saisir tes requêtes** dans ThotSEO
2. **Attendre les recommandations** d'écriture  
3. **Cliquer** "📋 Klipboard AUTO"
4. **Attendre** les notifications de progression
5. **Coller** dans Excel (Ctrl+V) pour avoir toutes les recommandations formatées

### ⚠️ Important
- L'extension **clique automatiquement** sur le bouton NLP
- Ceci **consomme 1 crédit** ThotSEO
- Assure-toi d'avoir des crédits disponibles

## 🎨 Personnalisation

### Ajouter de nouveaux champs
Pour ajouter une extraction (version 1.1+) :

1. **Ajouter dans `dataExtractor.js`** :
```javascript
async extractNouvelleSection() {
  // Logique d'extraction
  this.extractedData.set('nouvelle_section', content);
}
```

2. **Modifier `columnOrder`** dans `assembleAndCopy()` :
```javascript
const columnOrder = [
  'intention_recherche',
  // ... colonnes existantes
  'nouvelle_section'  // Nouvelle colonne
];
```

### Modifier le formatage Excel
Personnaliser dans `assembleAndCopy()` :
```javascript
// Pour retours à la ligne dans cellule
cleanContent = cleanContent.replace(/\n/g, String.fromCharCode(10));

// Pour texte continu
cleanContent = cleanContent.replace(/\n+/g, ' ');
```

## 🤖 Guide pour IA (Développement)

### Context du projet
```
Projet : Extension Chrome d'automatisation SEO
Stack : Vanilla JavaScript (ES6+), Chrome Extension API
Cible : thot-seo.fr (plateforme d'analyse sémantique)
Architecture : Modulaire avec 5 fichiers JS spécialisés
```

### Patterns utilisés
- **Observer Pattern** : MutationObserver pour changements DOM
- **Module Pattern** : Classes ES6 avec injection de dépendances
- **Strategy Pattern** : Multiples méthodes extraction par priorité
- **State Machine** : Gestion états bouton NLP (3 états)

### Contraintes techniques
- **Sélecteurs fragiles** : Structure DOM ThotSEO peut changer
- **Timing critique** : Génération NLP asynchrone (30s-3min)
- **Format Excel** : TSV avec LF (ASCII 10) pour retours à la ligne
- **Pas de localStorage** : Restriction environnement Claude.ai

### Guidelines développement
1. **Toujours** tester les 3 états du bouton NLP
2. **Prioriser** les sélecteurs HTML exacts vs regex texte
3. **Gérer** les timeouts et états d'attente
4. **Préserver** la structure modulaire existante
5. **Ajouter** debug logging pour troubleshooting

## 🔧 Debugging

### Panel debug intégré
- 🎯 Trouver sections ThotSEO
- 📂 Expansion ciblée ThotSEO  
- 🧠 Tester bouton NLP
- 📝 Tester copie prompts
- 🔬 Scan intelligent DOM

### Logs console
```javascript
console.log('🔧 Klipboard: Message de debug');
```

## 🤝 Contribution

### Besoins spécifiques
Cette extension répond à **mon besoin personnel** d'automatisation. Si tu as des besoins différents :
1. **Ouvre une issue** avec ton cas d'usage
2. **Propose** les modifications nécessaires  
3. **On évalue** pour la version 1.1

### Développement collaboratif
- **Fork** le projet
- **Branche** feature/nom-fonctionnalite
- **Test** sur thot-seo.fr
- **Pull Request** avec description détaillée

## 📜 Licence

MIT License - Utilisation libre avec attribution.

## 👨‍💻 Auteur

**Sébastien Grillot**  
🌐 [LinkedIn](https://www.linkedin.com/in/consultant-seo-ia-automatisation/)  
🏢 [Agence Koeki](https://koeki.fr)  
📧 Contact via LinkedIn pour questions techniques

*Consultant SEO depuis 2009, spécialisé dans l'automatisation des workflows SEO et l'intégration d'IA dans les processus d'optimisation.*

---

⭐ **Si cette extension t'aide dans tes workflows SEO, n'hésite pas à mettre une étoile au projet !**