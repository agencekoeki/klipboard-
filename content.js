// Script de contenu pour extraire les données SEO - Klipboard by Koeki
class SEODataExtractor {
  constructor() {
    this.collectedData = [];
    this.init();
  }

  init() {
    this.addCopyButton();
    this.setupListeners();
  }

  addCopyButton() {
    // Créer le bouton flottant
    const button = document.createElement('div');
    button.id = 'seo-copy-button';
    button.innerHTML = `
      <div class="seo-copy-btn">
        📋 Klipboard
      </div>
    `;
    document.body.appendChild(button);

    button.addEventListener('click', () => this.extractAllData());
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
            console.log('Entités NLP détectées');
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
    this.collectedData = [];
    
    try {
      // 1. Déplier les sections nécessaires
      await this.expandSections();
      
      // 2. Attendre et cliquer sur "obtenir les entités NLP"
      await this.clickNLPButton();
      
      // 3. Extraire toutes les données dans l'ordre
      await this.extractIntentionRecherche();
      await this.extractMotsCles();
      await this.extractEntitesNLP();
      await this.extractGroupesMotsGras();
      await this.extractPrompts();
      
      // 4. Copier vers le presse-papier
      this.copyToClipboard();
      
      this.showNotification('Données copiées avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'extraction:', error);
      this.showNotification('Erreur lors de l\'extraction des données', 'error');
    }
  }

  async expandSections() {
    // Déplier "Intention de recherche"
    const intentionSection = document.querySelector('[id*="intention"], .intention, [class*="intention"]');
    if (intentionSection) {
      const toggleBtn = intentionSection.querySelector('button, [role="button"], .toggle');
      if (toggleBtn) toggleBtn.click();
    }

    // Déplier "Tous les termes clés"
    const termesSection = document.querySelector('[class*="termes"], [id*="termes"], [class*="keywords"]');
    if (termesSection) {
      const toggleBtn = termesSection.querySelector('button, [role="button"], .toggle');
      if (toggleBtn) toggleBtn.click();
    }

    // Déplier "Mes prompts"
    const promptsSection = document.querySelector('[class*="prompts"], [id*="prompts"]');
    if (promptsSection) {
      const toggleBtn = promptsSection.querySelector('button, [role="button"], .toggle');
      if (toggleBtn) toggleBtn.click();
    }

    await this.wait(500); // Attendre que les sections se déplient
  }

  async clickNLPButton() {
    // Chercher le bouton "obtenir les entités NLP"
    const nlpButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent.toLowerCase().includes('entités') || 
      btn.textContent.toLowerCase().includes('nlp') ||
      btn.textContent.toLowerCase().includes('google')
    );
    
    if (nlpButton) {
      nlpButton.click();
      await this.wait(3000); // Attendre que les entités se chargent
      
      // Attendre que les entités apparaissent réellement
      await this.waitForNLPEntities();
    }
  }

  async waitForNLPEntities() {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const nlpEntities = document.querySelector('[id*="entites"], [class*="entities"], [class*="nlp"]');
      if (nlpEntities && nlpEntities.textContent.trim().length > 0) {
        break;
      }
      await this.wait(1000);
      attempts++;
    }
  }

  extractIntentionRecherche() {
    const intentionElement = document.querySelector('[class*="intention"], [id*="intention"]');
    if (intentionElement) {
      const text = this.cleanText(intentionElement.textContent);
      this.collectedData.push(`Intention de recherche:\n${text}\n`);
    }
  }

  extractMotsCles() {
    // Extraire les mots-clés obligatoires
    const obligatoires = this.extractKeywordSection('obligatoires', 'Obligatoires (par ordre de priorité)');
    if (obligatoires) this.collectedData.push(obligatoires);

    // Extraire les mots-clés complémentaires
    const complementaires = this.extractKeywordSection('complémentaires', 'Complémentaires');
    if (complementaires) this.collectedData.push(complementaires);
  }

  extractKeywordSection(sectionType, title) {
    // Chercher la section par différents sélecteurs possibles
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
      // Chercher par le texte du titre
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, .title, .heading');
      for (const heading of headings) {
        if (heading.textContent.toLowerCase().includes(sectionType.toLowerCase())) {
          section = heading.closest('div, section, article') || heading.parentElement;
          break;
        }
      }
    }

    if (section) {
      // Extraire les mots-clés avec leurs métriques
      const keywords = this.extractKeywordsWithMetrics(section);
      if (keywords.length > 0) {
        return `${title}\n${keywords.join(' ')}\n`;
      }
    }
    return null;
  }

  extractKeywordsWithMetrics(section) {
    const keywords = [];
    
    // Chercher les éléments contenant des mots-clés avec métriques
    const keywordElements = section.querySelectorAll('[class*="keyword"], [class*="term"], .tag, .chip, .badge');
    
    for (const element of keywordElements) {
      const text = element.textContent.trim();
      // Vérifier si l'élément contient un format comme "mot 0/10-223"
      if (text.match(/\w+\s+\d+\/\s*\d+-\d+/)) {
        keywords.push(text);
      }
    }

    // Si pas trouvé avec la méthode précédente, essayer d'extraire depuis le texte brut
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
    const nlpSection = document.querySelector('[id*="entites"], [class*="entities"], [class*="nlp"]');
    if (nlpSection) {
      const text = this.cleanText(nlpSection.textContent);
      this.collectedData.push(`Entités NLP Google:\n${text}\n`);
    }
  }

  extractGroupesMotsGras() {
    const grasSection = document.querySelector('[class*="gras"], [id*="gras"], [class*="bold"]');
    if (grasSection) {
      const text = this.cleanText(grasSection.textContent);
      this.collectedData.push(`Groupes de mots à mettre en gras:\n${text}\n`);
    }
  }

  async extractPrompts() {
    const promptNames = [
      'Gains d\'information',
      'Création d\'un plan MECE',
      'Idées de listes et tableaux',
      'Densification mots-clés',
      'Guide pour la rédaction de contenu'
    ];

    for (const promptName of promptNames) {
      const promptData = await this.extractSinglePrompt(promptName);
      if (promptData) {
        this.collectedData.push(`${promptName}:\n${promptData}\n`);
      }
    }
  }

  async extractSinglePrompt(promptName) {
    // Chercher le prompt par son nom
    const promptElements = document.querySelectorAll('[class*="prompt"], .prompt-item, [data-prompt]');
    
    for (const element of promptElements) {
      if (element.textContent.includes(promptName)) {
        // Chercher le bouton copier
        const copyButton = element.querySelector('button[class*="copy"], [title*="copier"], [class*="copier"]');
        if (copyButton) {
          copyButton.click();
          await this.wait(200);
          
          // Essayer de récupérer le contenu copié (si accessible)
          try {
            const clipboardText = await navigator.clipboard.readText();
            return clipboardText;
          } catch (e) {
            // Si pas d'accès au clipboard, récupérer le texte visible
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
    
    try {
      await navigator.clipboard.writeText(finalText);
    } catch (err) {
      // Fallback pour les navigateurs plus anciens
      const textArea = document.createElement('textarea');
      textArea.value = finalText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `seo-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Écouter les messages de la popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'fullExtract') {
    const extractor = new SEODataExtractor();
    extractor.extractAllData().then(() => {
      sendResponse({success: true});
    }).catch(() => {
      sendResponse({success: false});
    });
    return true; // Permet la réponse asynchrone
  }
  
  if (request.action === 'quickCopy') {
    const extractor = new SEODataExtractor();
    extractor.quickExtractVisible().then(() => {
      sendResponse({success: true});
    }).catch(() => {
      sendResponse({success: false});
    });
    return true;
  }
});

// Méthode pour extraction rapide des éléments visibles
SEODataExtractor.prototype.quickExtractVisible = async function() {
  this.collectedData = [];
  
  try {
    // Extraire seulement ce qui est visible sans interactions
    this.extractVisibleIntention();
    this.extractVisibleKeywords();
    this.extractVisibleNLP();
    this.extractVisiblePrompts();
    
    await this.copyToClipboard();
    this.showNotification('Éléments visibles copiés !');
  } catch (error) {
    console.error('Erreur lors de l\'extraction rapide:', error);
    this.showNotification('Erreur lors de l\'extraction rapide', 'error');
    throw error;
  }
};

SEODataExtractor.prototype.extractVisibleIntention = function() {
  // Chercher l'intention de recherche visible
  const intentionTexts = [
    'intention de recherche',
    'recherche intention',
    'search intent'
  ];
  
  for (const searchText of intentionTexts) {
    const elements = document.querySelectorAll('*');
    for (const element of elements) {
      if (element.textContent.toLowerCase().includes(searchText) && 
          element.offsetParent !== null) { // Vérifier si visible
        const content = this.extractSectionContent(element);
        if (content) {
          this.collectedData.push(`Intention de recherche:\n${content}\n`);
          return;
        }
      }
    }
  }
};

SEODataExtractor.prototype.extractVisibleKeywords = function() {
  // Chercher les sections de mots-clés visibles
  const keywordSections = ['obligatoires', 'complémentaires', 'keywords'];
  
  for (const section of keywordSections) {
    const elements = document.querySelectorAll('*');
    for (const