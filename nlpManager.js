// Module de gestion du bouton NLP - Klipboard by Koeki - VERSION TIMING AMÉLIORÉ
class NLPManager {
  constructor(mainExtractor) {
    this.main = mainExtractor;
    this.isProcessing = false;
    console.log('🔧 NLPManager: Module initialisé');
  }

  // Test complet du bouton NLP avec gestion des 3 états et timing amélioré
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
          this.main.showNotification('✅ Entités NLP déjà disponibles !', 'success');
          return true;
        }
        
        // Vérifier si en cours de génération (état 2)
        if (this.isNLPGenerating(currentContent)) {
          this.main.updateInspectorResults('⏳ Génération déjà en cours...');
          this.main.showNotification('⏳ Attente génération NLP...', 'warning');
          return await this.waitForNLPCompletion(nlpContainer);
        }
        
        // État 1 : Bouton pas encore cliqué
        this.main.updateInspectorResults('🎯 Bouton NLP à cliquer');
        this.main.showNotification('🎯 Clic sur bouton NLP...', 'warning');
      }
      
      // 2. Chercher et cliquer sur le bouton
      const nlpButton = this.findNLPButton();
      
      if (!nlpButton) {
        this.main.updateInspectorResults('❌ Bouton NLP non trouvé');
        this.main.showNotification('❌ Bouton NLP non trouvé', 'error');
        return false;
      }
      
      // 3. Processus complet de clic et attente avec timing approprié
      return await this.clickAndWaitNLP(nlpButton, nlpContainer);
      
    } finally {
      this.isProcessing = false;
    }
  }

  // Trouver le conteneur des entités NLP
  findNLPContainer() {
    const selectors = [
      '#load_entities',
      '#entities_btn', 
      '[id*="entities"]',
      '[class*="entities"]',
      '#liste_entites_nommes'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        this.main.updateInspectorResults(`Container NLP trouvé: ${selector}`);
        return element;
      }
    }
    
    this.main.updateInspectorResults('❌ Container NLP non trouvé');
    return null;
  }

  // Vérifier si les entités sont déjà générées (état 3) - VERSION AMÉLIORÉE
  isNLPAlreadyGenerated(content) {
    const indicators = [
      'entreprises', 'ensemble', 'coûts', 'normes',
      'infogérance', 'accroissement', 'utilisateurs',
      'Les entités NLP sont extraites',
      'systèmes', 'équipes', 'évolutions', 'grâce'
    ];
    
    const hasIndicators = indicators.some(indicator => 
      content.toLowerCase().includes(indicator)
    );
    
    const hasSubstantialContent = content.length > 200;
    const notInProgress = !content.includes('Analyse de la SERP lancée') && 
                         !content.includes('Obtenir les entités') &&
                         !content.includes('Résultats dans');
    
    // Vérifier qu'il y a des spans avec des entités
    const hasEntitySpans = content.includes('span') || content.includes('keyword') || 
                          content.match(/\b[a-zA-Z]{4,15}\b/g)?.length > 10;
    
    return hasIndicators && hasSubstantialContent && notInProgress && hasEntitySpans;
  }

  // Vérifier si la génération est en cours (état 2)
  isNLPGenerating(content) {
    return content.includes('Analyse de la SERP lancée') || 
           content.includes('Résultats dans') ||
           content.includes('minutes');
  }

  // Trouver le bouton NLP (état 1) - VERSION AMÉLIORÉE
  findNLPButton() {
    // Stratégie 1: Sélecteur exact des captures
    const exactButton = document.querySelector('#toggleButton');
    if (exactButton && exactButton.textContent.toLowerCase().includes('obtenir les entités')) {
      this.main.updateInspectorResults(`✅ Bouton trouvé par ID exact: "${exactButton.textContent.trim()}"`);
      return exactButton;
    }

    // Stratégie 2: Par structure HTML des captures
    const spanButtons = document.querySelectorAll('span.commande');
    for (const span of spanButtons) {
      if (span.textContent.toLowerCase().includes('obtenir les entités nlp')) {
        this.main.updateInspectorResults(`✅ Bouton trouvé par span.commande: "${span.textContent.trim()}"`);
        return span;
      }
    }

    // Stratégie 3: Chercher par texte spécifique
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

  // Cliquer et attendre la génération NLP - VERSION TIMING AMÉLIORÉ
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
      this.main.showNotification('✅ Bouton NLP cliqué', 'success');
    } catch (error) {
      this.main.updateInspectorResults(`❌ Erreur clic: ${error.message}`);
      this.main.showNotification(`❌ Erreur clic: ${error.message}`, 'error');
      this.highlightButton(button, 'error');
      return false;
    }
    
    // Attendre le changement d'état (passage à l'état 2) - TIMING AMÉLIORÉ
    this.main.showNotification('⏳ Attente réaction ThotSEO...', 'warning');
    await this.main.wait(3000); // Attendre 3 secondes au lieu de 2
    
    // Vérifier le changement
    const updatedContainer = this.findNLPContainer();
    if (updatedContainer) {
      const newContent = updatedContainer.textContent.trim();
      this.main.updateInspectorResults(`📝 Après clic: "${newContent.substring(0, 50)}..."`);
      
      if (this.isNLPGenerating(newContent)) {
        this.main.updateInspectorResults('⏳ État 2 détecté - Génération lancée !');
        this.main.showNotification('⏳ Génération NLP en cours...', 'warning');
        this.highlightButton(button, 'processing');
        
        // Attendre la completion avec notifications appropriées
        const result = await this.waitForNLPCompletion(updatedContainer);
        this.highlightButton(button, result ? 'success' : 'warning');
        return result;
      } else if (this.isNLPAlreadyGenerated(newContent)) {
        this.main.updateInspectorResults('🚀 État 3 détecté - Déjà généré !');
        this.main.showNotification('🚀 Entités NLP générées instantanément !', 'success');
        this.highlightButton(button, 'success');
        return true;
      }
    }
    
    this.main.updateInspectorResults('⚠️ Changement d\'état non détecté après 3s');
    this.main.showNotification('⚠️ Réaction ThotSEO non détectée', 'warning');
    this.highlightButton(button, 'warning');
    return false;
  }

  // Attendre que la génération NLP soit terminée - VERSION AMÉLIORÉE
  async waitForNLPCompletion(container) {
    this.main.updateInspectorResults('⏳ Attente completion NLP...');
    this.main.showNotification('⏳ Génération entités NLP en cours...', 'warning');
    
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 180; // 3 minutes max
      
      const checkInterval = setInterval(() => {
        attempts++;
        const currentContent = container.textContent;
        
        // Vérifier si terminé (état 3)
        if (this.isNLPAlreadyGenerated(currentContent)) {
          this.main.updateInspectorResults(`✅ NLP générées après ${attempts} secondes !`);
          this.main.updateInspectorResults(`Entités trouvées: ${this.countNLPEntities(currentContent)}`);
          this.main.showNotification(`✅ ${this.countNLPEntities(currentContent)} entités NLP générées !`, 'success');
          clearInterval(checkInterval);
          resolve(true);
          return;
        }
        
        // Afficher le progrès avec notifications
        if (attempts % 15 === 0) { // Toutes les 15 secondes
          const minutes = Math.floor(attempts / 60);
          const seconds = attempts % 60;
          this.main.updateInspectorResults(`⏳ ${minutes}m ${seconds}s écoulées...`);
          this.main.showNotification(`⏳ Génération en cours... ${minutes}m ${seconds}s`, 'warning');
        } else if (attempts % 10 === 0) {
          this.main.updateInspectorResults(`⏳ ${attempts}s écoulées...`);
        }
        
        // Timeout
        if (attempts >= maxAttempts) {
          this.main.updateInspectorResults('⚠️ Timeout - Génération trop longue');
          this.main.showNotification('⚠️ Timeout génération NLP - Passage à la suite', 'warning');
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 1000);
    });
  }

  // Compter le nombre d'entités NLP trouvées
  countNLPEntities(content) {
    // Méthode 1: compter les spans avec classe entites_nommees
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const spans = tempDiv.querySelectorAll('.entites_nommees, [class*="entites_nommees"]');
    
    if (spans.length > 0) {
      return spans.length;
    }
    
    // Méthode 2: approximation par mots significatifs
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