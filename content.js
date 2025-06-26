// Script de contenu amélioré pour extraire les données SEO - Klipboard by Koeki
console.log('🔧 Klipboard: Script chargé - Version améliorée');

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
      <div style="color: #ffff00; font-weight: bold; margin-bottom: 10px;">🔍 Inspecteur ThotSEO</div>
      <button id="find-thotseo-sections" style="width: 100%; padding: 8px; margin-bottom: 5px; background: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
        🎯 Trouver sections ThotSEO
      </button>
      <button id="targeted-expansion" style="width: 100%; padding: 8px; margin-bottom: 5px; background: #44ff44; color: black; border: none; border-radius: 4px; cursor: pointer;">
        📂 Expansion ciblée ThotSEO
      </button>
      <button id="test-nlp-button" style="width: 100%; padding: 8px; margin-bottom: 5px; background: #ff8800; color: white; border: none; border-radius: 4px; cursor: pointer;">
        🧠 Tester bouton NLP
      </button>
      <button id="smart-scan" style="width: 100%; padding: 8px; background: #4444ff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        🔬 Scan intelligent DOM
      </button>
      <div id="inspector-results" style="margin-top: 10px; font-size: 10px; max-height: 200px; overflow-y: auto;"></div>
    `;
    document.body.appendChild(inspectorPanel);

    // Event listeners pour l'inspecteur
    document.getElementById('find-thotseo-sections').addEventListener('click', () => {
      this.findThotSEOSections();
    });

    document.getElementById('targeted-expansion').addEventListener('click', () => {
      this.targetedThotSEOExpansion();
    });

    document.getElementById('test-nlp-button').addEventListener('click', () => {
      this.testNLPButton();
    });

    document.getElementById('smart-scan').addEventListener('click', () => {
      this.smartDOMScan();
    });
  }

  // NOUVEAU : Scan intelligent du DOM pour trouver les sections
  smartDOMScan() {
    this.logDebug('=== SCAN INTELLIGENT DOM ===', 'warning');
    this.clearInspectorResults();
    
    const targetSections = [
      'intention de recherche',
      'tous les termes clés',
      'mes prompts',
      'entités nlp',
      'groupes de mots',
      'maillage interne',
      'cannibalisation',
      'concurrents'
    ];

    const foundSections = new Map();

    // Scanner tous les éléments pour trouver les sections
    document.querySelectorAll('*').forEach(element => {
      const text = element.textContent.toLowerCase().trim();
      
      targetSections.forEach(section => {
        if (text.includes(section) && text.length < 100) { // Éviter le contenu trop long
          if (!foundSections.has(section) || foundSections.get(section).textContent.length > text.length) {
            foundSections.set(section, element);
          }
        }
      });
    });

    this.updateInspectorResults(`Sections trouvées: ${foundSections.size}`);
    
    foundSections.forEach((element, sectionName) => {
      this.updateInspectorResults(`📍 ${sectionName}: ${element.tagName}.${element.className}`);
      
      // Chercher les boutons d'expansion près de cette section
      this.findExpandButtonsNear(element, sectionName);
    });
  }

  // Trouver les boutons d'expansion près d'un élément
  findExpandButtonsNear(element, sectionName) {
    const searchRadius = [
      element,
      element.parentElement,
      element.parentElement?.parentElement,
      element.closest('div'),
      element.closest('[class*="section"]'),
      element.closest('[class*="panel"]')
    ].filter(Boolean);

    searchRadius.forEach(container => {
      // Chercher différents types de boutons d'expansion
      const expandSelectors = [
        'button:contains("+")',
        '[class*="expand"]',
        '[class*="toggle"]',
        '[class*="collapse"]',
        '[data-toggle]',
        '[aria-expanded]',
        'button[title*="expand"]',
        'button[title*="ouvrir"]',
        '.fa-plus',
        '.fa-chevron'
      ];

      expandSelectors.forEach(selector => {
        try {
          let buttons;
          if (selector.includes(':contains')) {
            // Pour les sélecteurs :contains, on fait une recherche manuelle
            buttons = Array.from(container.querySelectorAll('button')).filter(btn => 
              btn.textContent.trim() === '+' || 
              btn.textContent.trim() === '▶' ||
              btn.textContent.trim() === '►' ||
              btn.innerHTML.includes('fa-plus') ||
              btn.innerHTML.includes('fa-chevron')
            );
          } else {
            buttons = container.querySelectorAll(selector);
          }

          if (buttons.length > 0) {
            buttons.forEach(btn => {
              this.updateInspectorResults(`  🔘 Bouton trouvé: "${btn.textContent.trim()}" (${btn.className})`);
              
              // Surligner le bouton
              btn.style.border = '3px solid lime';
              btn.style.boxShadow = '0 0 15px lime';
              
              // Ajouter un listener temporaire pour tester
              const testClick = () => {
                this.logDebug(`Test clic sur bouton pour "${sectionName}"`, 'warning');
                btn.click();
                setTimeout(() => {
                  btn.style.border = '3px solid gold';
                  this.updateInspectorResults(`  ✅ Bouton testé pour "${sectionName}"`);
                }, 500);
              };
              
              btn.addEventListener('click', testClick, { once: true });
            });
          }
        } catch (e) {
          // Ignorer les erreurs de sélecteur
        }
      });
    });
  }

  // NOUVEAU : Trouver spécifiquement les sections pliées de ThotSEO - VERSION CORRIGÉE
  findThotSEOSections() {
    this.logDebug('=== RECHERCHE SECTIONS THOTSEO V2 ===', 'warning');
    this.clearInspectorResults();
    
    const sectionsFound = [];
    
    // 1. Chercher les H2 avec attribut onclick (structure ThotSEO)
    const clickableHeaders = document.querySelectorAll('h2[onclick], h3[onclick], [onclick*="open_close"]');
    
    this.updateInspectorResults(`Headers cliquables trouvés: ${clickableHeaders.length}`);
    
    clickableHeaders.forEach(header => {
      const text = header.textContent.toLowerCase();
      const onclick = header.getAttribute('onclick');
      
      this.updateInspectorResults(`Header: "${text.substring(0, 30)}..." onclick="${onclick}"`);
      
      // Mapping des sections importantes
      const sectionMappings = [
        { keywords: ['intention', 'recherche'], name: 'intention de recherche' },
        { keywords: ['termes', 'clés', 'keywords'], name: 'tous les termes clés' },
        { keywords: ['prompts'], name: 'mes prompts' },
        { keywords: ['entités', 'nlp'], name: 'entités nlp' },
        { keywords: ['maillage', 'interne'], name: 'maillage interne' },
        { keywords: ['cannibalisation'], name: 'cannibalisation' },
        { keywords: ['concurrents'], name: 'concurrents' },
        { keywords: ['idées', 'sujets'], name: 'idées de sujets' }
      ];
      
      sectionMappings.forEach(mapping => {
        const matches = mapping.keywords.some(keyword => 
          text.includes(keyword) || onclick.includes(keyword)
        );
        
        if (matches) {
          this.updateInspectorResults(`✅ Section trouvée: "${mapping.name}"`);
          
          // Trouver la div associée (style display: none)
          const associatedDiv = this.findAssociatedDiv(header);
          
          sectionsFound.push({
            section: mapping.name,
            header: header,
            onclick: onclick,
            associatedDiv: associatedDiv
          });
        }
      });
    });
    
    this.updateInspectorResults(`--- RÉSULTAT: ${sectionsFound.length} sections trouvées ---`);
    return sectionsFound;
  }

  // Trouver la div associée à un header
  findAssociatedDiv(header) {
    // 1. Chercher la div suivante avec display: none
    let nextElement = header.nextElementSibling;
    while (nextElement) {
      if (nextElement.tagName === 'DIV') {
        const style = window.getComputedStyle(nextElement);
        if (style.display === 'none' || nextElement.style.display === 'none') {
          return nextElement;
        }
      }
      nextElement = nextElement.nextElementSibling;
    }
    
    // 2. Chercher par ID (basé sur l'onclick)
    const onclick = header.getAttribute('onclick');
    if (onclick) {
      // Extraire l'ID de la fonction (ex: open_close_keywords_all() -> keywords_all)
      const match = onclick.match(/open_close_(\w+)/);
      if (match) {
        const targetId = match[1];
        const targetDiv = document.getElementById(`liste_${targetId}`) || 
                         document.getElementById(targetId) ||
                         document.getElementById(`${targetId}_content`);
        if (targetDiv) {
          return targetDiv;
        }
      }
    }
    
    return null;
  }

  // CORRIGÉ : Expansion ciblée sur ThotSEO - VERSION HEADER ONCLICK
  async targetedThotSEOExpansion() {
    this.logDebug('=== EXPANSION CIBLÉE THOTSEO V2 ===', 'warning');
    
    const sectionsData = this.findThotSEOSections();
    
    if (sectionsData.length === 0) {
      this.logDebug('Aucune section ThotSEO trouvée avec onclick', 'error');
      this.updateInspectorResults('❌ Aucune section avec onclick trouvée');
      return;
    }
    
    this.updateInspectorResults(`Sections à déplier: ${sectionsData.length}`);
    
    for (let i = 0; i < sectionsData.length; i++) {
      const {section, header, onclick, associatedDiv} = sectionsData[i];
      
      this.logDebug(`Dépliage section ${i + 1}: "${section}"`, 'warning');
      this.updateInspectorResults(`Dépliage: ${section}`);
      
      try {
        // Surligner le header avant clic
        header.style.border = '3px solid orange';
        header.style.backgroundColor = 'rgba(255, 165, 0, 0.3)';
        
        // Vérifier l'état initial
        let beforeState = 'unknown';
        if (associatedDiv) {
          const beforeDisplay = window.getComputedStyle(associatedDiv).display;
          beforeState = beforeDisplay === 'none' ? 'fermé' : 'ouvert';
          this.updateInspectorResults(`  État initial: ${beforeState}`);
        }
        
        // Cliquer sur le header (exécuter la fonction onclick)
        header.click();
        
        // Attendre l'animation
        await this.wait(1000);
        
        // Vérifier si ça a fonctionné
        let afterState = 'unknown';
        let success = false;
        
        if (associatedDiv) {
          const afterDisplay = window.getComputedStyle(associatedDiv).display;
          afterState = afterDisplay === 'none' ? 'fermé' : 'ouvert';
          success = beforeState !== afterState;
        } else {
          // Si pas de div associée trouvée, vérifier s'il y a plus d'éléments visibles
          const visibleElements = document.querySelectorAll('*:not([style*="display: none"])').length;
          success = true; // On suppose que ça a marché
        }
        
        if (success) {
          this.logDebug(`✅ Section "${section}" basculée (${beforeState} → ${afterState})`, 'success');
          this.updateInspectorResults(`  ✅ Basculée (${beforeState} → ${afterState})`);
          header.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
        } else {
          this.logDebug(`⚠️ Section "${section}" - pas de changement`, 'warning');
          this.updateInspectorResults(`  ⚠️ Pas de changement`);
          header.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
        }
        
      } catch (error) {
        this.logDebug(`❌ Erreur dépliage "${section}": ${error.message}`, 'error');
        this.updateInspectorResults(`  ❌ Erreur: ${error.message}`);
        header.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
      }
    }
    
    this.logDebug('Expansion ciblée terminée', 'success');
  }

  // Trouver tous les boutons d'expansion possibles - VERSION AMÉLIORÉE
  findAllExpandButtons() {
    const buttons = [];
    this.logDebug('Recherche des vrais boutons d\'expansion...', 'info');
    
    // 1. SPÉCIFIQUE : Chercher les boutons "+" dans la sidebar gauche
    const sidebarSelectors = [
      '.sidebar',
      '.left-panel', 
      '.menu-left',
      '[class*="sidebar"]',
      '[class*="nav"]',
      '#sidebar',
      '.navigation'
    ];
    
    sidebarSelectors.forEach(sidebarSelector => {
      try {
        const sidebar = document.querySelector(sidebarSelector);
        if (sidebar) {
          this.logDebug(`Sidebar trouvée: ${sidebarSelector}`, 'success');
          
          // Chercher les "+" dans cette sidebar
          const plusButtons = sidebar.querySelectorAll('*');
          plusButtons.forEach(el => {
            const text = el.textContent.trim();
            if (text === '+' && el.offsetWidth < 30 && el.offsetHeight < 30) {
              buttons.push(el);
              this.logDebug(`Bouton + trouvé dans sidebar: ${el.tagName}.${el.className}`, 'success');
            }
          });
        }
      } catch (e) {
        // Ignorer les erreurs
      }
    });
    
    // 2. Chercher spécifiquement les éléments avec "+" comme contenu EXACT
    document.querySelectorAll('*').forEach(el => {
      const text = el.textContent.trim();
      const hasOnlyPlus = text === '+' || text === '⊕' || text === '⊞';
      const isSmall = el.offsetWidth <= 50 && el.offsetHeight <= 50;
      const hasClickCursor = window.getComputedStyle(el).cursor === 'pointer';
      
      if (hasOnlyPlus && isSmall && (hasClickCursor || el.tagName === 'BUTTON')) {
        // Vérifier que ce n'est pas dans l'éditeur de texte
        const isInEditor = el.closest('.fr-toolbar') || 
                          el.closest('[class*="editor"]') ||
                          el.closest('[class*="wysiwyg"]') ||
                          el.className.includes('fr-');
        
        if (!isInEditor && !buttons.includes(el)) {
          buttons.push(el);
          this.logDebug(`Bouton + pur trouvé: ${el.tagName}.${el.className}`, 'success');
        }
      }
    });
    
    // 3. Chercher les éléments avec des classes de toggle spécifiques
    const specificToggleSelectors = [
      '[class*="collapsed"]',
      '[aria-expanded="false"]',
      '[class*="closed"]',
      '[data-state="closed"]',
      '[class*="minimize"]'
    ];
    
    specificToggleSelectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => {
          // Exclure l'éditeur de texte
          if (!el.closest('.fr-toolbar') && !el.className.includes('fr-')) {
            if (!buttons.includes(el)) {
              buttons.push(el);
              this.logDebug(`Élément toggle trouvé: ${selector}`, 'info');
            }
          }
        });
      } catch (e) {
        // Ignorer les erreurs de sélecteur
      }
    });
    
    // 4. NOUVEAU : Recherche par proximité avec les titres de sections
    const sectionTitles = [
      'intention de recherche',
      'tous les termes clés', 
      'mes prompts',
      'entités nlp',
      'maillage interne',
      'cannibalisation',
      'concurrents'
    ];
    
    sectionTitles.forEach(title => {
      const titleElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent.toLowerCase().includes(title) && 
        el.textContent.length < 100
      );
      
      titleElements.forEach(titleEl => {
        // Chercher un bouton "+" dans les 3 parents
        let parent = titleEl;
        for (let i = 0; i < 3; i++) {
          if (parent) {
            const nearbyPlus = Array.from(parent.querySelectorAll('*')).find(el => 
              el.textContent.trim() === '+' && 
              el.offsetWidth < 30 && 
              !el.closest('.fr-toolbar')
            );
            
            if (nearbyPlus && !buttons.includes(nearbyPlus)) {
              buttons.push(nearbyPlus);
              this.logDebug(`Bouton + trouvé près de "${title}": ${nearbyPlus.tagName}`, 'success');
            }
            parent = parent.parentElement;
          }
        }
      });
    });
    
    this.logDebug(`Total boutons d'expansion trouvés: ${buttons.length}`, 'warning');
    return buttons;
  }

  // AMÉLIORÉ : Test spécifique du bouton NLP avec gestion des 3 états
  async testNLPButton() {
    this.logDebug('=== TEST BOUTON NLP AMÉLIORÉ ===', 'warning');
    this.clearInspectorResults();
    
    // 1. Chercher d'abord le contenu NLP existant
    const nlpContainer = this.findNLPContainer();
    
    if (nlpContainer) {
      const currentContent = nlpContainer.textContent.trim();
      
      // Vérifier si les entités sont déjà générées (état 3)
      if (this.isNLPAlreadyGenerated(currentContent)) {
        this.updateInspectorResults('✅ Entités NLP déjà générées !');
        this.updateInspectorResults(`Contenu: ${currentContent.substring(0, 100)}...`);
        return true;
      }
      
      // Vérifier si en cours de génération (état 2)
      if (this.isNLPGenerating(currentContent)) {
        this.updateInspectorResults('⏳ Génération déjà en cours...');
        return await this.waitForNLPCompletion(nlpContainer);
      }
      
      // État 1 : Bouton pas encore cliqué
      this.updateInspectorResults('🎯 Bouton NLP à cliquer');
    }
    
    // 2. Chercher le bouton NLP
    const nlpButton = this.findNLPButton();
    
    if (!nlpButton) {
      this.updateInspectorResults('❌ Bouton NLP non trouvé');
      return false;
    }
    
    // 3. Cliquer et surveiller
    return await this.clickAndWaitNLP(nlpButton, nlpContainer);
  }

  // Trouver le conteneur des entités NLP
  findNLPContainer() {
    const selectors = [
      '#load_entities',
      '#entities_btn', 
      '[id*="entities"]',
      '[class*="entities"]'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        this.updateInspectorResults(`Container NLP trouvé: ${selector}`);
        return element;
      }
    }
    
    return null;
  }

  // Vérifier si les entités sont déjà générées
  isNLPAlreadyGenerated(content) {
    const indicators = [
      'entreprises', 'ensemble', 'coûts', 'normes', // Mots-clés typiques
      'infogérance', 'accroissement', 'utilisateurs',
      'Les entités NLP sont extraites', // Text explicatif
    ];
    
    return indicators.some(indicator => content.toLowerCase().includes(indicator)) &&
           content.length > 200 && // Contenu substantiel
           !content.includes('Analyse de la SERP lancée') &&
           !content.includes('Obtenir les entités');
  }

  // Vérifier si la génération est en cours
  isNLPGenerating(content) {
    return content.includes('Analyse de la SERP lancée') || 
           content.includes('Résultats dans') ||
           content.includes('minutes');
  }

  // Trouver le bouton NLP
  findNLPButton() {
    // 1. Chercher par texte spécifique
    const buttons = Array.from(document.querySelectorAll('button, [role="button"], .commande')).filter(btn => {
      const text = btn.textContent.toLowerCase();
      return text.includes('obtenir les entités') && text.includes('nlp');
    });
    
    if (buttons.length > 0) {
      this.updateInspectorResults(`Bouton trouvé par texte: "${buttons[0].textContent.trim()}"`);
      return buttons[0];
    }
    
    // 2. Chercher par ID ou span spécifique
    const spanButton = document.querySelector('#toggleButton, [id*="toggle"]');
    if (spanButton && spanButton.textContent.includes('entités')) {
      this.updateInspectorResults(`Bouton trouvé par ID: ${spanButton.id}`);
      return spanButton;
    }
    
    // 3. Chercher dans le container NLP
    const nlpContainer = this.findNLPContainer();
    if (nlpContainer) {
      const innerButtons = nlpContainer.querySelectorAll('button, span[class*="commande"], [onclick]');
      for (const btn of innerButtons) {
        if (btn.textContent.toLowerCase().includes('obtenir')) {
          this.updateInspectorResults(`Bouton trouvé dans container: "${btn.textContent.trim()}"`);
          return btn;
        }
      }
    }
    
    return null;
  }

  // Cliquer et attendre la génération NLP
  async clickAndWaitNLP(button, container) {
    this.updateInspectorResults(`🎯 Clic sur: "${button.textContent.trim()}"`);
    
    // Surligner le bouton
    button.style.border = '3px solid red';
    button.style.boxShadow = '0 0 15px red';
    
    // Enregistrer l'état avant clic
    const beforeContent = container ? container.textContent : '';
    
    // Cliquer
    try {
      button.click();
      this.updateInspectorResults('✅ Bouton cliqué');
    } catch (error) {
      this.updateInspectorResults(`❌ Erreur clic: ${error.message}`);
      return false;
    }
    
    // Attendre le changement d'état (passage à l'état 2)
    await this.wait(1000);
    
    // Vérifier si on est passé en mode "génération"
    const updatedContainer = this.findNLPContainer();
    if (updatedContainer) {
      const newContent = updatedContainer.textContent;
      
      if (this.isNLPGenerating(newContent)) {
        this.updateInspectorResults('⏳ Génération lancée !');
        button.style.border = '3px solid orange';
        
        // Attendre la completion
        return await this.waitForNLPCompletion(updatedContainer);
      }
    }
    
    this.updateInspectorResults('⚠️ Pas de changement détecté après clic');
    return false;
  }

  // Attendre que la génération NLP soit terminée
  async waitForNLPCompletion(container) {
    this.updateInspectorResults('⏳ Attente completion NLP...');
    
    let attempts = 0;
    const maxAttempts = 180; // 3 minutes max
    
    const checkInterval = setInterval(() => {
      attempts++;
      const currentContent = container.textContent;
      
      // Vérifier si terminé (état 3)
      if (this.isNLPAlreadyGenerated(currentContent)) {
        this.updateInspectorResults(`✅ NLP générées après ${attempts} secondes !`);
        this.updateInspectorResults(`Entités trouvées: ${this.countNLPEntities(currentContent)}`);
        clearInterval(checkInterval);
        
        // Surligner en vert
        const button = this.findNLPButton();
        if (button) {
          button.style.border = '3px solid green';
          button.style.boxShadow = '0 0 15px green';
        }
        
        return true;
      }
      
      // Afficher le progrès
      if (attempts % 10 === 0) {
        this.updateInspectorResults(`⏳ ${attempts}s écoulées...`);
      }
      
      // Timeout
      if (attempts >= maxAttempts) {
        this.updateInspectorResults('⚠️ Timeout - Génération trop longue');
        clearInterval(checkInterval);
        return false;
      }
    }, 1000);
    
    return new Promise((resolve) => {
      const originalSetInterval = setInterval;
      // Cette promesse sera résolue par le clearInterval ci-dessus
    });
  }

  // Compter le nombre d'entités NLP trouvées
  countNLPEntities(content) {
    // Compter les mots séparés par des espaces (approximation)
    const words = content.split(/\s+/).filter(word => 
      word.length > 3 && 
      !word.includes('NLP') && 
      !word.includes('entités')
    );
    return Math.min(words.length, 50); // Max 50 pour ne pas compter le texte explicatif
  }

  // Surligner les sections importantes
  highlightImportantSections() {
    this.logDebug('=== SURLIGNAGE SECTIONS IMPORTANTES ===', 'warning');
    this.clearInspectorResults();
    
    const importantSections = [
      'intention de recherche',
      'tous les termes clés',
      'mes prompts',
      'entités nlp',
      'groupes de mots'
    ];
    
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
    
    importantSections.forEach((section, index) => {
      const elements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent.toLowerCase();
        return text.includes(section) && text.length < 100;
      });
      
      if (elements.length > 0) {
        const color = colors[index % colors.length];
        elements[0].style.border = `3px solid ${color}`;
        elements[0].style.boxShadow = `0 0 15px ${color}`;
        
        this.updateInspectorResults(`${section}: trouvé (${elements[0].tagName})`);
      } else {
        this.updateInspectorResults(`${section}: NON TROUVÉ`);
      }
    });
  }

  // Utilitaires
  clearInspectorResults() {
    const results = document.getElementById('inspector-results');
    if (results) {
      results.innerHTML = '';
    }
  }

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
    const existing = document.getElementById('seo-copy-button');
    if (existing) {
      existing.remove();
    }

    const button = document.createElement('div');
    button.id = 'seo-copy-button';
    button.innerHTML = `<div class="seo-copy-btn">📋 Klipboard AUTO</div>`;
    
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

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.fullAutoExtraction();
    });

    document.body.appendChild(button);
    this.logDebug('Bouton principal créé', 'success');
  }

  // NOUVEAU : Extraction automatique complète avec expansion ciblée
  async fullAutoExtraction() {
    this.logDebug('=== EXTRACTION AUTOMATIQUE COMPLÈTE ===', 'success');
    this.showNotification('Début extraction automatique...', 'warning');
    
    try {
      // 1. Scanner et déplier les sections ThotSEO spécifiquement
      await this.targetedThotSEOExpansion();
      await this.wait(2000);
      
      // 2. Gérer les entités NLP
      await this.testNLPButton();
      await this.wait(3000);
      
      // 3. Extraire toutes les données
      await this.extractAllData();
      
      this.showNotification('Extraction terminée avec succès !', 'success');
      
    } catch (error) {
      this.logDebug(`Erreur extraction auto: ${error.message}`, 'error');
      this.showNotification('Erreur lors de l\'extraction automatique', 'error');
    }
  }

  // Extraction complète des données (version simplifiée)
  async extractAllData() {
    this.logDebug('=== EXTRACTION DES DONNÉES ===', 'warning');
    this.collectedData = [];
    
    // Extraire chaque section
    this.extractVisibleSection('intention de recherche', 'Intention de recherche');
    this.extractVisibleSection('obligatoires', 'Mots-clés obligatoires');
    this.extractVisibleSection('complémentaires', 'Mots-clés complémentaires');
    this.extractVisibleSection('entités', 'Entités NLP');
    this.extractVisibleSection('prompts', 'Mes prompts');
    this.extractVisibleSection('groupes', 'Groupes de mots');
    
    // Copier vers le presse-papier
    await this.copyToClipboard();
  }

  extractVisibleSection(keyword, title) {
    const elements = Array.from(document.querySelectorAll('*')).filter(el => 
      el.textContent.toLowerCase().includes(keyword) && 
      el.offsetParent !== null &&
      el.textContent.length > 20
    );
    
    if (elements.length > 0) {
      const content = this.cleanText(elements[0].textContent);
      this.collectedData.push(`${title}:\n${content}\n`);
      this.logDebug(`${title} extrait`, 'success');
    }
  }

  cleanText(text) {
    return text.replace(/\s+/g, ' ').trim();
  }

  async copyToClipboard() {
    const finalText = this.collectedData.join('\n---\n\n');
    this.logDebug(`Copie vers presse-papier: ${finalText.length} caractères`, 'info');
    
    try {
      await navigator.clipboard.writeText(finalText);
      this.logDebug('Copie réussie', 'success');
    } catch (err) {
      this.logDebug('Fallback copie...', 'warning');
      const textArea = document.createElement('textarea');
      textArea.value = finalText;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  showNotification(message, type = 'success') {
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

  setupListeners() {
    // Observer les changements DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
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
}

// Gestion des messages depuis l'extension
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('🔧 Klipboard: Message reçu:', request);
  
  if (request.action === 'fullExtract') {
    const extractor = new SEODataExtractor();
    extractor.fullAutoExtraction().then(() => {
      sendResponse({success: true});
    }).catch(() => {
      sendResponse({success: false});
    });
    return true;
  }
});

// Initialisation
function initKlipboard() {
  console.log('🔧 Klipboard: Initialisation...');
  try {
    new SEODataExtractor();
    console.log('🔧 Klipboard: Extracteur créé avec succès');
  } catch (error) {
    console.error('❌ Klipboard: Erreur initialisation:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initKlipboard);
} else {
  initKlipboard();
}

console.log('🔧 Klipboard: Script terminé');