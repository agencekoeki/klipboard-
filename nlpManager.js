// Module de gestion du bouton NLP - Klipboard by Koeki
class NLPManager {
  constructor(mainExtractor) {
    this.main = mainExtractor;
    this.isProcessing = false;
    console.log('🔧 NLPManager: Module initialisé');
  }

  // Test complet du bouton NLP avec gestion des 3 états
  async testNLPButton() {
    if (this.isProcessing) {
      this.main.updateInspectorResults('⚠️ Traitement NLP déjà en cours');
      return false;
    }

    this.isProcessing = true;
    this.main.logDebug('=== TEST BOUTON NLP AMÉLIORÉ ===', 'warning');
    this.main.clearInspectorResults();
    
    try {
      // 1. Chercher le conteneur NLP
      const nlpContainer = this.findNLPContainer();
      
      if (nlpContainer) {
        const currentContent = nlpContainer.textContent.trim();
        
        // Vérifier si déjà généré (état 3)
        if (this.isNLPAlreadyGenerated(currentContent)) {
          this.main.updateInspectorResults('✅ Entités NLP déjà générées !');
          this.main.updateInspectorResults(`Contenu: ${currentContent.substring(0, 100)}...`);
          return true;
        }
        
        // Vérifier si en cours de génération (état 2)
        if (this.isNLPGenerating(currentContent)) {
          this.main.updateInspectorResults('⏳ Génération déjà en cours...');
          return await this.waitForNLPCompletion(nlpContainer);
        }
        
        // État 1 : Bouton pas encore cliqué
        this.main.updateInspectorResults('🎯 Bouton NLP à cliquer');
      }
      
      // 2. Chercher et cliquer sur le bouton
      const nlpButton = this.findNLPButton();
      
      if (!nlpButton) {
        this.main.updateInspectorResults('❌ Bouton NLP non trouvé');
        return false;
      }
      
      // 3. Processus complet de clic et attente
      return await this.clickAndWaitNLP(nlpButton, nlpContainer);
      
    } finally {
      this.isProcessing = false;
    }
  }

  // Trouver le conteneur des entités NLP
findNLPContainer() {
  // Priorité aux sélecteurs des captures
  const containers = [
    '#load_entities',           // État 1 et 2
    '#liste_entites_nommes',    // État 3 
    '[id*="entities"]',
    '[class*="entities"]'
  ];
  
  for (const selector of containers) {
    const element = document.querySelector(selector);
    if (element) {
      this.main.updateInspectorResults(`✅ Container NLP trouvé: ${selector}`);
      return element;
    }
  }
  
  // Fallback : chercher par structure visible
  const allElements = document.querySelectorAll('div, section');
  for (const element of allElements) {
    const text = element.textContent.toLowerCase();
    if ((text.includes('entités nlp') || text.includes('obtenir les entités')) && 
        element.offsetParent !== null) {
      this.main.updateInspectorResults(`Container trouvé par contenu`);
      return element;
    }
  }
  
  return null;
}

  // Vérifier si les entités sont déjà générées (état 3)
isNLPAlreadyGenerated(content) {
  // Mots-clés spécifiques des captures
  const captureKeywords = [
    'entreprises', 'ensemble', 'coûts', 'normes', 'réalité', 
    'serveurs', 'productivité', 'usages', 'infogérance', 
    'accroissement', 'utilisateurs', 'équipements', 'société',
    'équipes', 'évolutions', 'grâce', 'façon', 'systèmes'
  ];
  
  const lowerContent = content.toLowerCase();
  
  // Compter les mots-clés présents
  const foundKeywords = captureKeywords.filter(keyword => 
    lowerContent.includes(keyword)
  );
  
  // Conditions pour considérer comme généré
  const hasMultipleKeywords = foundKeywords.length >= 3;
  const hasSubstantialContent = content.length > 200;
  const notInProgress = !this.isNLPGenerating(content);
  const notInitialState = !lowerContent.includes('obtenir les entités');
  
  if (hasMultipleKeywords && hasSubstantialContent && notInProgress && notInitialState) {
    this.main.updateInspectorResults(`✅ État 3 détecté avec ${foundKeywords.length} mots-clés: ${foundKeywords.slice(0,3).join(', ')}...`);
    return true;
  }
  
  return false;
}

  // Vérifier si la génération est en cours (état 2)
isNLPGenerating(content) {
  const generatingIndicators = [
    'analyse de la serp lancée',     // Exact des captures
    'résultats dans',               // Exact des captures  
    'minutes',                      // Exact des captures
    'en cours',
    'processing',
    'loading'
  ];
  
  const lowerContent = content.toLowerCase();
  return generatingIndicators.some(indicator => lowerContent.includes(indicator));
}

  // Trouver le bouton NLP (état 1)
findNLPButton() {
  // Stratégie prioritaire : sélecteur exact des captures
  const exactButton = document.querySelector('#toggleButton');
  if (exactButton && exactButton.textContent.toLowerCase().includes('obtenir les entités')) {
    this.main.updateInspectorResults(`✅ Bouton trouvé par ID exact: "${exactButton.textContent.trim()}"`);
    return exactButton;
  }

  // Stratégie 2 : par structure HTML des captures
  const spanButtons = document.querySelectorAll('span.commande');
  for (const span of spanButtons) {
    if (span.textContent.toLowerCase().includes('obtenir les entités nlp')) {
      this.main.updateInspectorResults(`✅ Bouton trouvé par span.commande: "${span.textContent.trim()}"`);
      return span;
    }
  }

  // Vos stratégies existantes (gardées en fallback)
  const textButtons = Array.from(document.querySelectorAll('button, [role="button"], .commande, span')).filter(btn => {
    const text = btn.textContent.toLowerCase();
    return text.includes('obtenir les entités') && text.includes('nlp');
  });
  
  if (textButtons.length > 0) {
    this.main.updateInspectorResults(`Bouton trouvé par texte: "${textButtons[0].textContent.trim()}"`);
    return textButtons[0];
  }

  return null;
}

  // Cliquer et attendre la génération NLP
  async clickAndWaitNLP(button, container) {
  this.main.updateInspectorResults(`🎯 Clic sur: "${button.textContent.trim()}"`);
  this.main.updateInspectorResults(`📍 Container: ${container ? container.id || container.className : 'non trouvé'}`);
  
  // Surligner le bouton
  this.highlightButton(button, 'processing');
  
  // Enregistrer l'état avant clic
  const beforeContent = container ? container.textContent.trim() : '';
  this.main.updateInspectorResults(`📝 Avant clic: "${beforeContent.substring(0, 50)}..."`);
  
  // Cliquer
  try {
    button.click();
    this.main.updateInspectorResults('✅ Clic effectué');
  } catch (error) {
    this.main.updateInspectorResults(`❌ Erreur clic: ${error.message}`);
    this.highlightButton(button, 'error');
    return false;
  }
  
  // Attendre le changement d'état
  await this.main.wait(2000);
  
  // Vérifier le changement
  const updatedContainer = this.findNLPContainer();
  if (updatedContainer) {
    const newContent = updatedContainer.textContent.trim();
    this.main.updateInspectorResults(`📝 Après clic: "${newContent.substring(0, 50)}..."`);
    
    if (this.isNLPGenerating(newContent)) {
      this.main.updateInspectorResults('⏳ État 2 détecté - Génération lancée !');
      this.highlightButton(button, 'processing');
      
      const result = await this.waitForNLPCompletion(updatedContainer);
      this.highlightButton(button, result ? 'success' : 'warning');
      return result;
    } else if (this.isNLPAlreadyGenerated(newContent)) {
      this.main.updateInspectorResults('🚀 État 3 détecté - Déjà généré !');
      this.highlightButton(button, 'success');
      return true;
    }
  }
  
  this.main.updateInspectorResults('⚠️ Changement d\'état non détecté');
  this.highlightButton(button, 'warning');
  return false;
}

  // Compter le nombre d'entités NLP trouvées
  countNLPEntities(content) {
    // Compter les mots significatifs (approximation)
    const words = content.split(/\s+/).filter(word => 
      word.length > 3 && 
      !word.includes('NLP') && 
      !word.includes('entités') &&
      !word.includes('extraites')
    );
    return Math.min(words.length, 50);
  }

  // Surligner le bouton avec code couleur
  highlightButton(button, status) {
    const styles = {
      processing: { border: '3px solid orange', boxShadow: '0 0 15px orange' },
      success: { border: '3px solid green', boxShadow: '0 0 15px green' },
      warning: { border: '3px solid yellow', boxShadow: '0 0 15px yellow' },
      error: { border: '3px solid red', boxShadow: '0 0 15px red' }
    };
    
    const style = styles[status] || styles.processing;
    button.style.border = style.border;
    button.style.boxShadow = style.boxShadow;
  }

  // Extraire le contenu NLP généré
  extractNLPContent() {
    const container = this.findNLPContainer();
    if (!container) {
      return null;
    }
    
    const content = container.textContent.trim();
    
    if (this.isNLPAlreadyGenerated(content)) {
      this.main.logDebug('Extraction contenu NLP', 'success');
      return content;
    }
    
    return null;
  }

  // Vérifier l'état actuel du NLP
  getCurrentNLPStatus() {
    const container = this.findNLPContainer();
    if (!container) {
      return 'not_found';
    }
    
    const content = container.textContent.trim();
    
    if (this.isNLPAlreadyGenerated(content)) {
      return 'generated';
    } else if (this.isNLPGenerating(content)) {
      return 'generating';
    } else {
      return 'ready_to_click';
    }
  }

  // Forcer la génération NLP (même si déjà généré)
  async forceNLPGeneration() {
    this.main.logDebug('=== FORCE GÉNÉRATION NLP ===', 'warning');
    
    const button = this.findNLPButton();
    if (!button) {
      return false;
    }
    
    const container = this.findNLPContainer();
    return await this.clickAndWaitNLP(button, container);
  }
}

console.log('🔧 NLPManager: Module chargé');