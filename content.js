// Script principal - Klipboard by Koeki
console.log('🔧 Klipboard: Script chargé - Version modulaire');

// Import des modules (simulé avec des classes globales)
class SEODataExtractor {
  constructor() {
    console.log('🔧 Klipboard: Constructeur appelé');
    this.collectedData = [];
    this.debugLogs = [];
    
    // Instancier les modules
    this.sectionExpander = new SectionExpander(this);
    this.nlpManager = new NLPManager(this);
    this.promptsManager = new PromptsManager(this);
    this.dataExtractor = new DataExtractor(this);
    
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
      <button id="test-prompts-copy" style="width: 100%; padding: 8px; margin-bottom: 5px; background: #8844ff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        📝 Tester copie prompts
      </button>
      <button id="smart-scan" style="width: 100%; padding: 8px; background: #4444ff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        🔬 Scan intelligent DOM
      </button>
      <div id="inspector-results" style="margin-top: 10px; font-size: 10px; max-height: 200px; overflow-y: auto;"></div>
    `;
    document.body.appendChild(inspectorPanel);

    // Event listeners délégués aux modules
    document.getElementById('find-thotseo-sections').addEventListener('click', () => {
      this.sectionExpander.findThotSEOSections();
    });

    document.getElementById('targeted-expansion').addEventListener('click', () => {
      this.sectionExpander.targetedThotSEOExpansion();
    });

    document.getElementById('test-nlp-button').addEventListener('click', () => {
      this.nlpManager.testNLPButton();
    });

    document.getElementById('test-prompts-copy').addEventListener('click', () => {
      this.promptsManager.testPromptsCopy();
    });

    document.getElementById('smart-scan').addEventListener('click', () => {
      this.smartDOMScan();
    });
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

  // Processus principal d'extraction automatique
  async fullAutoExtraction() {
    this.logDebug('=== EXTRACTION AUTOMATIQUE COMPLÈTE ===', 'success');
    this.showNotification('Début extraction automatique...', 'warning');
    
    try {
      // 1. Déplier les sections ThotSEO
      await this.sectionExpander.targetedThotSEOExpansion();
      await this.wait(2000);
      
      // 2. Gérer les entités NLP
      await this.nlpManager.testNLPButton();
      await this.wait(3000);
      
      // 3. Copier les prompts si nécessaire
      await this.promptsManager.extractPrompts();
      await this.wait(1000);
      
      // 4. Extraire toutes les données
      await this.dataExtractor.extractAllData();
      
      this.showNotification('Extraction terminée avec succès !', 'success');
      
    } catch (error) {
      this.logDebug(`Erreur extraction auto: ${error.message}`, 'error');
      this.showNotification('Erreur lors de l\'extraction automatique', 'error');
    }
  }

  // Scan intelligent du DOM (fonction partagée)
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

    document.querySelectorAll('*').forEach(element => {
      const text = element.textContent.toLowerCase().trim();
      
      targetSections.forEach(section => {
        if (text.includes(section) && text.length < 100) {
          if (!foundSections.has(section) || foundSections.get(section).textContent.length > text.length) {
            foundSections.set(section, element);
          }
        }
      });
    });

    this.updateInspectorResults(`Sections trouvées: ${foundSections.size}`);
    
    foundSections.forEach((element, sectionName) => {
      this.updateInspectorResults(`📍 ${sectionName}: ${element.tagName}.${element.className}`);
    });
  }

  // Utilitaires partagés
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
      
      const lines = debugContent.children;
      if (lines.length > 50) {
        lines[0].remove();
      }
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

// Gestion des messages Chrome Extension
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

console.log('🔧 Klipboard: Script principal terminé');