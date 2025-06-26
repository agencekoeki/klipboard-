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

  // Vérifier si les entités sont déjà générées (état 3)
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
                         !content.includes('Obtenir les entités');
    
    return hasIndicators && hasSubstantialContent && notInProgress;
  }

  // Vérifier si la génération est en cours (état 2)
  isNLPGenerating(content) {
    return content.includes('Analyse de la SERP lancée') || 
           content.includes('Résultats dans') ||
           content.includes('minutes');
  }

  // Trouver le bouton NLP (état 1)
  findNLPButton() {
    // Stratégie 1: Chercher par texte spécifique
    const textButtons = Array.from(document.querySelectorAll('button, [role="button"], .commande, span')).filter(btn => {
      const text = btn.textContent.toLowerCase();
      return text.includes('obtenir les entités') && text.includes('nlp');
    });
    
    if (textButtons.length > 0) {
      this.main.updateInspectorResults(`Bouton trouvé par texte: "${textButtons[0].textContent.trim()}"`);
      return textButtons[0];
    }
    
    // Stratégie 2: Chercher par ID spécifique
    const idSelectors = ['#toggleButton', '[id*="toggle"]', '[id*="entities"]'];
    for (const selector of idSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.toLowerCase().includes('entités')) {
        this.main.updateInspectorResults(`Bouton trouvé par ID: ${selector}`);
        return element;
      }
    }
    
    // Stratégie 3: Chercher dans le container NLP
    const nlpContainer = this.findNLPContainer();
    if (nlpContainer) {
      const innerButtons = nlpContainer.querySelectorAll('button, span[class*="commande"], [onclick]');
      for (const btn of innerButtons) {
        if (btn.textContent.toLowerCase().includes('obtenir')) {
          this.main.updateInspectorResults(`Bouton trouvé dans container: "${btn.textContent.trim()}"`);
          return btn;
        }
      }
    }
    
    // Stratégie 4: Chercher par classe commande
    const commandeButtons = document.querySelectorAll('.commande');
    for (const btn of commandeButtons) {
      if (btn.textContent.toLowerCase().includes('nlp') || btn.textContent.toLowerCase().includes('entités')) {
        this.main.updateInspectorResults(`Bouton trouvé par classe commande: "${btn.textContent.trim()}"`);
        return btn;
      }
    }
    
    return null;
  }

  // Cliquer et attendre la génération NLP
  async clickAndWaitNLP(button, container) {
    this.main.updateInspectorResults(`🎯 Clic sur: "${button.textContent.trim()}"`);
    
    // Surligner le bouton
    this.highlightButton(button, 'processing');
    
    // Enregistrer l'état avant clic
    const beforeContent = container ? container.textContent : '';
    
    // Cliquer
    try {
      button.click();
      this.main.updateInspectorResults('✅ Bouton cliqué');
    } catch (error) {
      this.main.updateInspectorResults(`❌ Erreur clic: ${error.message}`);
      this.highlightButton(button, 'error');
      return false;
    }
    
    // Attendre le changement d'état (passage à l'état 2)
    await this.main.wait(2000);
    
    // Vérifier si on est passé en mode "génération"
    const updatedContainer = this.findNLPContainer();
    if (updatedContainer) {
      const newContent = updatedContainer.textContent;
      
      if (this.isNLPGenerating(newContent)) {
        this.main.updateInspectorResults('⏳ Génération lancée !');
        this.highlightButton(button, 'processing');
        
        // Attendre la completion
        const result = await this.waitForNLPCompletion(updatedContainer);
        this.highlightButton(button, result ? 'success' : 'warning');
        return result;
      }
    }
    
    this.main.updateInspectorResults('⚠️ Pas de changement détecté après clic');
    this.highlightButton(button, 'warning');
    return false;
  }

  // Attendre que la génération NLP soit terminée
  async waitForNLPCompletion(container) {
    this.main.updateInspectorResults('⏳ Attente completion NLP...');
    
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
          clearInterval(checkInterval);
          resolve(true);
          return;
        }
        
        // Afficher le progrès
        if (attempts % 10 === 0) {
          this.main.updateInspectorResults(`⏳ ${attempts}s écoulées...`);
        }
        
        // Timeout
        if (attempts >= maxAttempts) {
          this.main.updateInspectorResults('⚠️ Timeout - Génération trop longue');
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 1000);
    });
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