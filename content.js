// Script de contenu pour extraire les données SEO - Klipboard by Koeki
console.log('🔧 Klipboard: Script chargé');

class SEODataExtractor {
  constructor() {
    console.log('🔧 Klipboard: Constructeur appelé');
    this.collectedData = [];
    this.debugLogs = [];
    this.init();
  }

  init() {
    console.log('🔧 Klipboard: Initialisation...');
    this.addCopyButton();
    this.addDebugPanel();
    this.addVisualInspector();
    this.setupListeners();
    console.log('🔧 Klipboard: Initialisation terminée');
  }

  // Nouveau panneau de debug visuel
  addDebugPanel() {
    const debugPanel = document.createElement('div');
    debugPanel.id = 'klipboard-debug';
    debugPanel.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      width: 350px;
      max-height: 400px;
      background: rgba(0,0,0,0.9);
      color: #00ff00;
      font-family: monospace;
      font-size: 11px;
      padding: 10px;
      border-radius: 8px;
      z-index: 99998;
      overflow-y: auto;
      display: none;
    `;
    debugPanel.innerHTML = `
      <div style="color: #ffff00; font-weight: bold; margin-bottom: 10px;">🔧 Klipboard Debug</div>
      <div id="debug-content"></div>
    `;
    document.body.appendChild(debugPanel);
  }

  // NOUVEAU : Inspecteur visuel qui surligne les boutons
  addVisualInspector() {
    const inspectorPanel = document.createElement('div');
    inspectorPanel.id = 'klipboard-inspector';
    inspectorPanel.style.cssText = `
      position: fixed;
      top: 520px;
      right: 20px;
      width: 350px;
      background: rgba(0,0,100,0.9);
      color: white;
      font-family: Arial, sans-serif;
      font-size: 12px;
      padding: 15px;
      border-radius: 8px;
      z-index: 99997;
    `;
    inspectorPanel.innerHTML = `
      <div style="color: #ffff00; font-weight: bold; margin-bottom: 10px;">🔍 Inspecteur Visuel</div>
      <button id="highlight-buttons" style="width: 100%; padding: 8px; margin-bottom: 10px; background: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
        🎯 Surligner TOUS les boutons cliquables
      </button>
      <button id="test-manual-clicks" style="width: 100%; padding: 8px; margin-bottom: 10px; background: #44ff44; color: black; border: none; border-radius: 4px; cursor: pointer;">
        👆 Test clics manuels sur sections
      </button>
      <button id="show-dom-structure" style="width: 100%; padding: 8px; background: #4444ff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        🏗️ Montrer structure DOM
      </button>
      <div id="inspector-results" style="margin-top: 10px; font-size: 10px; max-height: 200px; overflow-y: auto;"></div>
    `;
    document.body.appendChild(inspectorPanel);

    // Event listeners pour l'inspecteur
    document.getElementById('highlight-buttons').addEventListener('click', () => {
      this.highlightAllClickableElements();
    });

    document.getElementById('test-manual-clicks').addEventListener('click', () => {
      this.testManualClicks();
    });

    document.getElementById('show-dom-structure').addEventListener('click', () => {
      this.showDOMStructure();
    });
  }

  // NOUVEAU : Surligner tous les éléments cliquables
  highlightAllClickableElements() {
    this.logDebug('=== SURLIGNAGE DES ÉLÉMENTS CLIQUABLES ===', 'warning');
    
    // Supprimer les anciens surlignages
    document.querySelectorAll('.klipboard-highlight').forEach(el => {
      el.classList.remove('klipboard-highlight');
      el.style.border = '';
      el.style.boxShadow = '';
    });

    // Trouver TOUS les éléments potentiellement cliquables
    const clickableElements = [];
    
    // 1. Tous les buttons
    document.querySelectorAll('button').forEach(btn => {
      clickableElements.push({element: btn, type: 'button', text: btn.textContent.trim()});
    });

    // 2. Éléments avec cursor: pointer
    document.querySelectorAll('*').forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.cursor === 'pointer' && el.tagName !== 'BUTTON') {
        clickableElements.push({element: el, type: 'cursor-pointer', text: el.textContent.trim().substring(0, 30)});
      }
    });

    // 3. Éléments avec événements onclick
    document.querySelectorAll('*').forEach(el => {
      if (el.onclick || el.getAttribute('onclick')) {
        clickableElements.push({element: el, type: 'onclick', text: el.textContent.trim().substring(0, 30)});
      }
    });

    // 4. Éléments avec data-toggle, data-collapse, etc.
    document.querySelectorAll('[data-toggle], [data-collapse], [aria-expanded], [role="button"]').forEach(el => {
      clickableElements.push({element: el, type: 'data-attribute', text: el.textContent.trim().substring(0, 30)});
    });

    this.logDebug(`Trouvé ${clickableElements.length} éléments cliquables`, 'info');

    // Surligner chaque élément avec une couleur différente
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    clickableElements.forEach((item, index) => {
      const color = colors[index % colors.length];
      item.element.style.border = `3px solid ${color}`;
      item.element.style.boxShadow = `0 0 10px ${color}`;
      item.element.classList.add('klipboard-highlight');
      
      // Ajouter un label
      const label = document.createElement('div');
      label.style.cssText = `
        position: absolute;
        background: ${color};
        color: white;
        padding: 2px 5px;
        font-size: 10px;
        font-weight: bold;
        z-index: 99999;
        border-radius: 3px;
        pointer-events: none;
      `;
      label.textContent = `${index + 1}: ${item.type}`;
      
      const rect = item.element.getBoundingClientRect();
      label.style.left = `${rect.left + window.scrollX}px`;
      label.style.top = `${rect.top + window.scrollY - 20}px`;
      
      document.body.appendChild(label);
      
      // Supprimer le label après 10 secondes
      setTimeout(() => {
        if (label.parentNode) label.remove();
      }, 10000);

      this.updateInspectorResults(`${index + 1}. ${item.type}: "${item.text}"`);
    });

    this.logDebug('Surlignage terminé - regardez les éléments colorés !', 'success');
  }

  // NOUVEAU : Test clics manuels
  testManualClicks() {
    this.logDebug('=== TEST CLICS MANUELS ===', 'warning');
    
    // Rechercher spécifiquement les sections de thot-seo
    const sectionsToFind = [
      { name: 'Intention de recherche', keywords: ['intention'] },
      { name: 'Tous les termes clés', keywords: ['termes', 'clés'] },
      { name: 'Mes prompts', keywords: ['prompts'] },
      { name: 'Entités NLP', keywords: ['entités', 'nlp'] }
    ];

    sectionsToFind.forEach(section => {
      this.logDebug(`--- Recherche section: ${section.name} ---`, 'info');
      
      // Chercher les éléments contenant ces mots-clés
      const elements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent.toLowerCase();
        return section.keywords.some(keyword => text.includes(keyword)) && 
               el.offsetParent !== null && 
               el.textContent.trim().length < 100; // Pas trop de texte (probablement un titre)
      });

      this.logDebug(`Trouvé ${elements.length} éléments pour "${section.name}"`, 'info');
      
      elements.forEach((el, i) => {
        // Chercher un bouton + ou toggle près de cet élément
        const parent = el.closest('div, section, article');
        if (parent) {
          const nearbyButtons = parent.querySelectorAll('button, [role="button"], .toggle, [class*="toggle"], [class*="expand"], [data-toggle]');
          
          nearbyButtons.forEach(btn => {
            // Surligner le bouton potentiel
            btn.style.border = '3px solid orange';
            btn.style.boxShadow = '0 0 15px orange';
            
            this.logDebug(`Bouton potentiel trouvé pour "${section.name}": "${btn.textContent.trim()}" (${btn.tagName})`, 'warning');
            this.updateInspectorResults(`${section.name}: Bouton "${btn.textContent.trim()}"`);
            
            // Essayer de cliquer
            setTimeout(() => {
              const beforeCount = document.querySelectorAll('*').length;
              btn.click();
              
              setTimeout(() => {
                const afterCount = document.querySelectorAll('*').length;
                const diff = afterCount - beforeCount;
                
                if (diff > 0) {
                  this.logDebug(`✅ SUCCÈS! Bouton "${btn.textContent.trim()}" a ajouté ${diff} éléments`, 'success');
                  btn.style.border = '5px solid lime';
                } else {
                  this.logDebug(`⚪ Bouton "${btn.textContent.trim()}" sans effet`, 'info');
                }
              }, 500);
            }, i * 1000); // Délai entre les tests
          });
        }
      });
    });
  }

  // NOUVEAU : Montrer structure DOM
  showDOMStructure() {
    this.logDebug('=== STRUCTURE DOM ===', 'warning');
    this.updateInspectorResults('--- STRUCTURE DOM ---');
    
    // Analyser la structure des sections importantes
    const importantSections = document.querySelectorAll('h1, h2, h3, h4, h5, h6, [class*="section"], [class*="title"], [class*="header"]');
    
    importantSections.forEach((section, i) => {
      if (section.textContent.toLowerCase().includes('intention') ||
          section.textContent.toLowerCase().includes('prompts') ||
          section.textContent.toLowerCase().includes('termes') ||
          section.textContent.toLowerCase().includes('entités')) {
        
        this.updateInspectorResults(`Section ${i + 1}: ${section.tagName} "${section.textContent.trim().substring(0, 50)}"`);
        this.updateInspectorResults(`  Classes: ${section.className}`);
        this.updateInspectorResults(`  ID: ${section.id}`);
        
        // Chercher les boutons dans le parent
        const parent = section.parentElement;
        if (parent) {
          const buttons = parent.querySelectorAll('button, [role="button"]');
          buttons.forEach(btn => {
            this.updateInspectorResults(`  Bouton trouvé: "${btn.textContent.trim()}" (${btn.className})`);
          });
        }
        this.updateInspectorResults('---');
      }
    });
  }

  // NOUVEAU : Mettre à jour les résultats de l'inspecteur
  updateInspectorResults(message) {
    const results = document.getElementById('inspector-results');
    if (results) {
      results.innerHTML += `<div>${message}</div>`;
      results.scrollTop = results.scrollHeight;
    }
  }

  logDebug(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    
    console.log(`🔧 Klipboard: ${message}`);
    this.debugLogs.push(logEntry);
    
    const debugPanel = document.getElementById('klipboard-debug');
    const debugContent = document.getElementById('debug-content');
    
    if (debugPanel && debugContent) {
      debugPanel.style.display = 'block';
      
      const color = type === 'success' ? '#00ff00' : 
                   type === 'error' ? '#ff0000' : 
                   type === 'warning' ? '#ffaa00' : '#ffffff';
      
      debugContent.innerHTML += `<div style="color: ${color};">${logEntry}</div>`;
      debugContent.scrollTop = debugContent.scrollHeight;
      
      // Limiter à 50 lignes
      const lines = debugContent.children;
      if (lines.length > 50) {
        lines[0].remove();
      }
    }
  }

  addCopyButton() {
    // Vérifier si le bouton existe déjà
    const existing = document.getElementById('seo-copy-button');
    if (existing) {
      this.logDebug('Bouton existant supprimé');
      existing.remove();
    }

    // Créer le bouton flottant
    const button = document.createElement('div');
    button.id = 'seo-copy-button';
    button.innerHTML = `
      <div class="seo-copy-btn">
        📋 Klipboard DEBUG
      </div>
    `;
    
    // Ajouter des styles inline pour être sûr que ça marche
    button.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 99999;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      font-family: Arial, sans-serif;
      font-size: 14px;
      transition: all 0.3s ease;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    });

    document.body.appendChild(button);
    this.logDebug('Bouton créé et ajouté au DOM', 'success');

    button.addEventListener('click', (e) => {
      this.logDebug('CLIC DÉTECTÉ SUR BOUTON FLOTTANT !', 'success');
      e.preventDefault();
      e.stopPropagation();
      this.extractAllData();
    });

    // Test de visibilité du bouton
    setTimeout(() => {
      const testButton = document.getElementById('seo-copy-button');
      if (testButton) {
        this.logDebug('Bouton trouvé dans le DOM', 'success');
      } else {
        this.logDebug('Bouton non trouvé dans le DOM', 'error');
      }
    }, 1000);
  }

  setupListeners() {
    // Écouter les changements pour détecter l'apparition des entités NLP
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Détecter si les entités NLP sont apparues
          const nlpEntities = document.querySelector('[id*="entites"]');
          if (nlpEntities && !nlpEntities.dataset.processed) {
            nlpEntities.dataset.processed = 'true';
            this.logDebug('Entités NLP détectées par observer', 'success');
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  async extractAllData() {
    this.logDebug('=== DÉBUT EXTRACTION COMPLÈTE ===', 'success');
    this.collectedData = [];
    
    try {
      this.showNotification('Extraction en cours...', 'warning');
      
      // 1. Déplier les sections nécessaires
      this.logDebug('--- PHASE 1: DÉPLIAGE DES SECTIONS ---', 'warning');
      await this.expandSections();
      
      // 2. Attendre et cliquer sur "obtenir les entités NLP"
      this.logDebug('--- PHASE 2: GESTION NLP ---', 'warning');
      await this.clickNLPButton();
      
      // 3. Extraire toutes les données dans l'ordre
      this.logDebug('--- PHASE 3: EXTRACTION DONNÉES ---', 'warning');
      await this.extractIntentionRecherche();
      await this.extractMotsCles();
      await this.extractEntitesNLP();
      await this.extractGroupesMotsGras();
      await this.extractPrompts();
      
      this.logDebug(`Données collectées: ${this.collectedData.length} sections`, 'success');
      
      // 4. Copier vers le presse-papier
      await this.copyToClipboard();
      
      this.showNotification('Données copiées avec succès !');
      this.logDebug('=== EXTRACTION TERMINÉE AVEC SUCCÈS ===', 'success');
    } catch (error) {
      this.logDebug(`ERREUR lors de l'extraction: ${error.message}`, 'error');
      this.showNotification('Erreur lors de l\'extraction des données', 'error');
    }
  }

  async expandSections() {
    this.logDebug('INSPECTION des sections à déplier...', 'info');
    
    const allElements = document.querySelectorAll('*');
    const sectionsFound = [];
    
    for (const element of allElements) {
      const text = element.textContent.toLowerCase();
      if (text.includes('intention de recherche') || 
          text.includes('mes prompts') || 
          text.includes('tous les termes') ||
          text.includes('entités nlp')) {
        sectionsFound.push({
          text: element.textContent.trim().substring(0, 50),
          element: element,
          tag: element.tagName,
          classes: element.className,
          id: element.id
        });
      }
    }
    
    this.logDebug(`Sections trouvées: ${sectionsFound.length}`, 'info');
    
    const expandButtons = Array.from(document.querySelectorAll('button, div, span')).filter(el => {
      const text = el.textContent.trim();
      return text === '+' || 
             text === '▶' || 
             text === '▷' || 
             text === '►' || 
             text.includes('expand') ||
             text.includes('show') ||
             el.className.includes('expand') ||
             el.className.includes('toggle') ||
             el.className.includes('collapse');
    });
    
    this.logDebug(`${expandButtons.length} boutons d'expansion trouvés`, 'info');
    
    const beforeCount = document.querySelectorAll('*:not([style*="display: none"])').length;
    this.logDebug(`Éléments visibles AVANT dépliage: ${beforeCount}`, 'info');
    
    for (let i = 0; i < expandButtons.length; i++) {
      const btn = expandButtons[i];
      this.logDebug(`Clic sur bouton ${i + 1}: "${btn.textContent.trim()}"`, 'warning');
      try {
        btn.click();
        await this.wait(300);
      } catch (e) {
        this.logDebug(`Erreur clic bouton ${i + 1}: ${e.message}`, 'error');
      }
    }
    
    await this.wait(2000);
    
    const afterCount = document.querySelectorAll('*:not([style*="display: none"])').length;
    const diff = afterCount - beforeCount;
    this.logDebug(`Éléments visibles APRÈS dépliage: ${afterCount} (+${diff})`, diff > 0 ? 'success' : 'warning');
  }

  async clickNLPButton() {
    this.logDebug('Recherche bouton NLP...', 'info');
    
    const existingNLP = document.querySelector('#entities_btn, [id*="entities"], [class*="entities"]');
    if (existingNLP) {
      const content = existingNLP.textContent.trim();
      this.logDebug(`NLP div déjà présent: ${content.length} caractères`, 'info');
      
      if (content.length > 100 && 
          !content.includes('Obtenir les entités') && 
          !content.includes('Analyse de la SERP lancée')) {
        this.logDebug('Résultats NLP déjà présents !', 'success');
        return;
      }
    }
    
    let nlpButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent.toLowerCase().includes('entités') || 
      btn.textContent.toLowerCase().includes('nlp') ||
      btn.textContent.toLowerCase().includes('google') ||
      btn.textContent.toLowerCase().includes('obtenir')
    );
    
    if (nlpButton) {
      this.logDebug(`Bouton NLP trouvé: "${nlpButton.textContent}"`, 'success');
      nlpButton.click();
      this.logDebug('Bouton NLP cliqué - attente transformation...', 'warning');
      
      await this.wait(2000);
      await this.waitForNLPEntities();
    } else {
      this.logDebug('Bouton NLP non trouvé', 'error');
    }
  }

  async waitForNLPEntities() {
    this.logDebug('Attente des entités NLP...', 'warning');
    let attempts = 0;
    const maxAttempts = 15;
    
    while (attempts < maxAttempts) {
      const entitiesDiv = document.querySelector('#entities_btn, [id*="entities"], [class*="entities_btn"]');
      
      if (entitiesDiv) {
        const content = entitiesDiv.textContent.trim();
        this.logDebug(`Tentative ${attempts + 1} - Contenu: ${content.length} caractères`, 'info');
        
        if (content.length > 100 && 
            !content.includes('Analyse de la SERP lancée') && 
            !content.includes('Résultats dans') &&
            (content.includes('Google') || content.includes('entités') || content.length > 200)) {
          this.logDebug(`Entités NLP chargées après ${attempts + 1} secondes`, 'success');
          return;
        }
      }
      
      await this.wait(1000);
      attempts++;
    }
    
    this.logDebug('Timeout - Entités NLP non chargées', 'error');
  }

  extractIntentionRecherche() {
    this.logDebug('Extraction intention de recherche...', 'info');
    const intentionElement = document.querySelector('[class*="intention"], [id*="intention"]');
    if (intentionElement) {
      const text = this.cleanText(intentionElement.textContent);
      this.collectedData.push(`Intention de recherche:\n${text}\n`);
      this.logDebug('Intention extraite', 'success');
    } else {
      this.logDebug('Intention non trouvée', 'warning');
    }
  }

  extractMotsCles() {
    this.logDebug('Extraction mots-clés...', 'info');
    
    const obligatoires = this.extractKeywordSection('obligatoires', 'Obligatoires (par ordre de priorité)');
    if (obligatoires) {
      this.collectedData.push(obligatoires);
      this.logDebug('Mots-clés obligatoires extraits', 'success');
    }

    const complementaires = this.extractKeywordSection('complémentaires', 'Complémentaires');
    if (complementaires) {
      this.collectedData.push(complementaires);
      this.logDebug('Mots-clés complémentaires extraits', 'success');
    }
  }

  extractKeywordSection(sectionType, title) {
    this.logDebug(`Recherche section ${sectionType}...`, 'info');
    
    const selectors = [
      `[class*="${sectionType}"]`,
      `[id*="${sectionType}"]`,
      `[data-section="${sectionType}"]`
    ];

    let section = null;
    for (const selector of selectors) {
      section = document.querySelector(selector);
      if (section) break;
    }

    if (!section) {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, .title, .heading');
      for (const heading of headings) {
        if (heading.textContent.toLowerCase().includes(sectionType.toLowerCase())) {
          section = heading.closest('div, section, article') || heading.parentElement;
          break;
        }
      }
    }

    if (section) {
      this.logDebug(`Section ${sectionType} trouvée`, 'success');
      const keywords = this.extractKeywordsWithMetrics(section);
      if (keywords.length > 0) {
        return `${title}\n${keywords.join(' ')}\n`;
      }
    } else {
      this.logDebug(`Section ${sectionType} non trouvée`, 'warning');
    }
    return null;
  }

  extractKeywordsWithMetrics(section) {
    const keywords = [];
    
    const keywordElements = section.querySelectorAll('[class*="keyword"], [class*="term"], .tag, .chip, .badge');
    
    for (const element of keywordElements) {
      const text = element.textContent.trim();
      if (text.match(/\w+\s+\d+\/\s*\d+-\d+/)) {
        keywords.push(text);
      }
    }

    if (keywords.length === 0) {
      const fullText = section.textContent;
      const matches = fullText.match(/\w+\s+\d+\/\s*\d+-\d+/g);
      if (matches) {
        keywords.push(...matches);
      }
    }

    return keywords;
  }

  extractEntitesNLP() {
    this.logDebug('Extraction entités NLP...', 'info');
    
    const entitiesDiv = document.querySelector('#entities_btn, [id*="entities"], [class*="entities_btn"]');
    
    if (entitiesDiv) {
      const content = entitiesDiv.textContent.trim();
      this.logDebug(`Div entities_btn trouvé: ${content.length} caractères`, 'info');
      
      let cleanContent = content;
      cleanContent = cleanContent.replace(/Analyse de la SERP lancée.*?Résultats dans \d+ minutes\./g, '');
      cleanContent = cleanContent.replace(/Obtenir les entités NLP \(\d+ credit\)/g, '');
      cleanContent = this.cleanText(cleanContent);
      
      if (cleanContent.length > 20) {
        this.collectedData.push(`Entités NLP Google:\n${cleanContent}\n`);
        this.logDebug('Entités NLP extraites', 'success');
      } else {
        this.logDebug('Contenu entités NLP trop court', 'warning');
      }
    } else {
      this.logDebug('Div entities_btn non trouvé', 'warning');
    }
  }

  extractGroupesMotsGras() {
    this.logDebug('Extraction groupes mots gras...', 'info');
    const grasSection = document.querySelector('[class*="gras"], [id*="gras"], [class*="bold"]');
    if (grasSection) {
      const text = this.cleanText(grasSection.textContent);
      this.collectedData.push(`Groupes de mots à mettre en gras:\n${text}\n`);
      this.logDebug('Groupes mots gras extraits', 'success');
    } else {
      this.logDebug('Groupes mots gras non trouvés', 'warning');
    }
  }

  async extractPrompts() {
    this.logDebug('Extraction prompts...', 'info');
    const promptNames = [
      'Gains d\'information',
      'Création d\'un plan MECE',
      'Idées de listes et tableaux',
      'Densification mots-clés',
      'Guide pour la rédaction de contenu'
    ];

    for (const promptName of promptNames) {
      this.logDebug(`Recherche prompt "${promptName}"...`, 'info');
      const promptData = await this.extractSinglePrompt(promptName);
      if (promptData) {
        this.collectedData.push(`${promptName}:\n${promptData}\n`);
        this.logDebug(`Prompt "${promptName}" extrait`, 'success');
      } else {
        this.logDebug(`Prompt "${promptName}" non trouvé`, 'warning');
      }
    }
  }

  async extractSinglePrompt(promptName) {
    const promptElements = document.querySelectorAll('[class*="prompt"], .prompt-item, [data-prompt]');
    
    for (const element of promptElements) {
      if (element.textContent.includes(promptName)) {
        const copyButton = element.querySelector('button[class*="copy"], [title*="copier"], [class*="copier"]');
        if (copyButton) {
          this.logDebug(`Bouton copier trouvé pour "${promptName}"`, 'success');
          copyButton.click();
          await this.wait(200);
          
          try {
            const clipboardText = await navigator.clipboard.readText();
            return clipboardText;
          } catch (e) {
            const textContent = element.querySelector('[class*="content"], .text, .description');
            return textContent ? this.cleanText(textContent.textContent) : null;
          }
        }
      }
    }
    return null;
  }

  cleanText(text) {
    return text.replace(/\s+/g, ' ').trim();
  }

  async copyToClipboard() {
    const finalText = this.collectedData.join('\n---\n\n');
    this.logDebug(`Texte final à copier: ${finalText.length} caractères`, 'info');
    
    try {
      await navigator.clipboard.writeText(finalText);
      this.logDebug('Copie réussie via navigator.clipboard', 'success');
    } catch (err) {
      this.logDebug('navigator.clipboard échoué, fallback...', 'warning');
      const textArea = document.createElement('textarea');
      textArea.value = finalText;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        this.logDebug(successful ? 'Fallback réussi' : 'Fallback échoué', successful ? 'success' : 'error');
      } catch (err) {
        this.logDebug('Toutes les méthodes de copie ont échoué', 'error');
      }
      
      document.body.removeChild(textArea);
    }
  }

  showNotification(message, type = 'success') {
    this.logDebug(`Notification: ${message}`, 'info');
    
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 99999;
      background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#ff9800' : '#f44336'};
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-weight: bold;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Méthode pour extraction rapide des éléments visibles
  async quickExtractVisible() {
    this.logDebug('=== EXTRACTION RAPIDE ===', 'success');
    this.collectedData = [];
    
    try {
      this.showNotification('Copie rapide en cours...', 'warning');
      
      this.extractVisibleIntention();
      this.extractVisibleKeywords();
      this.extractVisibleNLP();
      this.extractVisiblePrompts();
      
      await this.copyToClipboard();
      this.showNotification('Éléments visibles copiés !');
      this.logDebug('Extraction rapide terminée', 'success');
    } catch (error) {
      this.logDebug(`Erreur lors de l'extraction rapide: ${error.message}`, 'error');
      this.showNotification('Erreur lors de l\'extraction rapide', 'error');
      throw error;
    }
  }

  extractVisibleIntention() {
    const intentionTexts = ['intention de recherche', 'recherche intention', 'search intent'];
    
    for (const searchText of intentionTexts) {
      const elements = document.querySelectorAll('*');
      for (const element of elements) {
        if (element.textContent.toLowerCase().includes(searchText) && 
            element.offsetParent !== null) {
          const content = this.extractSectionContent(element);
          if (content) {
            this.collectedData.push(`Intention de recherche:\n${content}\n`);
            return;
          }
        }
      }
    }
  }

  extractVisibleKeywords() {
    const keywordSections = ['obligatoires', 'complémentaires', 'keywords'];
    
    for (const section of keywordSections) {
      const elements = document.querySelectorAll('*');
      for (const element of elements) {
        if (element.textContent.toLowerCase().includes(section) && 
            element.offsetParent !== null) {
          const content = this.extractSectionContent(element);
          if (content) {
            this.collectedData.push(`${section}:\n${content}\n`);
          }
        }
      }
    }
  }

  extractVisibleNLP() {
    const nlpTexts = ['entités', 'nlp', 'google'];
    
    for (const searchText of nlpTexts) {
      const elements = document.querySelectorAll('*');
      for (const element of elements) {
        if (element.textContent.toLowerCase().includes(searchText) && 
            element.offsetParent !== null) {
          const content = this.extractSectionContent(element);
          if (content) {
            this.collectedData.push(`Entités NLP:\n${content}\n`);
            return;
          }
        }
      }
    }
  }

  extractVisiblePrompts() {
    const promptElements = document.querySelectorAll('[class*="prompt"], .prompt-item');
    for (const element of promptElements) {
      if (element.offsetParent !== null) {
        const content = this.cleanText(element.textContent);
        if (content.length > 20) {
          this.collectedData.push(`Prompt:\n${content}\n`);
        }
      }
    }
  }

  extractSectionContent(element) {
    const content = this.cleanText(element.textContent);
    return content.length > 10 ? content : null;
  }
}

// Test si on est sur la bonne URL
console.log('🔧 Klipboard: URL actuelle:', window.location.href);
console.log('🔧 Klipboard: Sur thot-seo?', window.location.href.includes('thot-seo.fr'));

// Écouter les messages de la popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('🔧 Klipboard: Message reçu:', request);
  
  if (request.action === 'fullExtract') {
    console.log('🔧 Klipboard: Action extraction complète demandée');
    const extractor = new SEODataExtractor();
    extractor.extractAllData().then(() => {
      sendResponse({success: true});
    }).catch(() => {
      sendResponse({success: false});
    });
    return true;
  }
  
  if (request.action === 'quickCopy') {
    console.log('🔧 Klipboard: Action copie rapide demandée');
    const extractor = new SEODataExtractor();
    extractor.quickExtractVisible().then(() => {
      sendResponse({success: true});
    }).catch(() => {
      sendResponse({success: false});
    });
    return true;
  }
});

// Initialisation
function initKlipboard() {
  console.log('🔧 Klipboard: Début initialisation...');
  try {
    const extractor = new SEODataExtractor();
    console.log('🔧 Klipboard: Extracteur créé avec succès');
  } catch (error) {
    console.error('❌ Klipboard: Erreur lors de l\'initialisation:', error);
  }
}

// Lancer l'initialisation
if (document.readyState === 'loading') {
  console.log('🔧 Klipboard: DOM en cours de chargement, attente...');
  document.addEventListener('DOMContentLoaded', initKlipboard);
} else {
  console.log('🔧 Klipboard: DOM déjà chargé, initialisation immédiate');
  initKlipboard();
}

console.log('🔧 Klipboard: Fin du script');