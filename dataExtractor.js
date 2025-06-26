// Module d'extraction des données - Klipboard by Koeki
class DataExtractor {
  constructor(mainExtractor) {
    this.main = mainExtractor;
    this.extractedData = new Map();
    console.log('🔧 DataExtractor: Module initialisé');
  }

  // Extraction complète de toutes les données
  async extractAllData() {
    this.main.logDebug('=== EXTRACTION COMPLÈTE DES DONNÉES ===', 'warning');
    this.extractedData.clear();
    
    // Extraire chaque section une par une
    await this.extractIntentionRecherche();
    await this.extractMotsClesObligatoires();
    await this.extractMotsClesComplementaires();
    await this.extractEntitesNLP();
    await this.extractGroupesMotsGras();
    await this.extractPrompts();
    await this.extractIdeesSujets();
    
    // Assembler et copier le résultat final
    await this.assembleAndCopy();
    
    this.main.logDebug(`Extraction terminée: ${this.extractedData.size} sections`, 'success');
    return this.extractedData;
  }

  // Extraire l'intention de recherche
  async extractIntentionRecherche() {
    this.main.logDebug('Extraction intention de recherche...', 'info');
    
    const selectors = [
      '#success_rate',
      '[id*="intention"]',
      '[class*="intention"]'
    ];
    
    let content = null;
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.offsetParent !== null) {
        content = this.cleanText(element.textContent);
        break;
      }
    }
    
    // Fallback: chercher par contenu
    if (!content) {
      const elements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent.toLowerCase();
        return text.includes('comment optimiser') && 
               text.includes('gestion') && 
               el.offsetParent !== null &&
               el.textContent.length > 50 &&
               el.textContent.length < 500;
      });
      
      if (elements.length > 0) {
        content = this.cleanText(elements[0].textContent);
      }
    }
    
    if (content) {
      this.extractedData.set('intention_recherche', content);
      this.main.logDebug('Intention de recherche extraite', 'success');
    } else {
      this.main.logDebug('Intention de recherche non trouvée', 'warning');
    }
  }

  // Extraire les mots-clés obligatoires
  async extractMotsClesObligatoires() {
    this.main.logDebug('Extraction mots-clés obligatoires...', 'info');
    
    const content = this.extractKeywordSection('obligatoires', [
      '#liste_KW_obligatoires',
      '[id*="obligatoires"]',
      '[class*="obligatoires"]'
    ]);
    
    if (content) {
      this.extractedData.set('mots_cles_obligatoires', content);
      this.main.logDebug('Mots-clés obligatoires extraits', 'success');
    }
  }

  // Extraire les mots-clés complémentaires
  async extractMotsClesComplementaires() {
    this.main.logDebug('Extraction mots-clés complémentaires...', 'info');
    
    const content = this.extractKeywordSection('complémentaires', [
      '#liste_KW_complementaires',
      '[id*="complementaires"]',
      '[class*="complementaires"]'
    ]);
    
    if (content) {
      this.extractedData.set('mots_cles_complementaires', content);
      this.main.logDebug('Mots-clés complémentaires extraits', 'success');
    }
  }

  // Extraire une section de mots-clés
  extractKeywordSection(sectionType, selectors) {
    // Méthode 1: Par sélecteurs directs
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.offsetParent !== null) {
        return this.cleanText(element.textContent);
      }
    }
    
    // Méthode 2: Chercher par titre
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    for (const heading of headings) {
      if (heading.textContent.toLowerCase().includes(sectionType)) {
        const container = heading.closest('div') || heading.parentElement;
        if (container) {
          const content = this.extractKeywordsFromContainer(container);
          if (content) {
            return content;
          }
        }
      }
    }
    
    // Méthode 3: Chercher dans le contenu visible
    const elements = Array.from(document.querySelectorAll('*')).filter(el => {
      const text = el.textContent.toLowerCase();
      return text.includes(sectionType) && 
             el.offsetParent !== null &&
             el.textContent.length > 50;
    });
    
    for (const element of elements) {
      const content = this.extractKeywordsFromContainer(element);
      if (content) {
        return content;
      }
    }
    
    return null;
  }

  // Extraire les mots-clés d'un container
  extractKeywordsFromContainer(container) {
    const keywords = [];
    
    // Chercher les éléments avec structure "mot 0/X-Y"
    const elements = container.querySelectorAll('*');
    for (const element of elements) {
      const text = element.textContent.trim();
      if (text.match(/\w+\s+\d+\/\s*\d+-\d+/)) {
        keywords.push(text);
      }
    }
    
    // Si pas de structure spécifique, extraire le texte brut
    if (keywords.length === 0) {
      const text = container.textContent;
      const matches = text.match(/\w+\s+\d+\/\s*\d+-\d+/g);
      if (matches) {
        keywords.push(...matches);
      }
    }
    
    return keywords.length > 0 ? keywords.join('\n') : null;
  }

  // Extraire les entités NLP
  async extractEntitesNLP() {
    this.main.logDebug('Extraction entités NLP...', 'info');
    
    if (this.main.nlpManager) {
      const content = this.main.nlpManager.extractNLPContent();
      if (content) {
        this.extractedData.set('entites_nlp', content);
        this.main.logDebug('Entités NLP extraites', 'success');
        return;
      }
    }
    
    // Fallback: extraction directe
    const selectors = [
      '#load_entities',
      '#liste_entites_nommes',
      '[id*="entities"]'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.offsetParent !== null) {
        const content = this.cleanText(element.textContent);
        if (content.length > 100) {
          this.extractedData.set('entites_nlp', content);
          this.main.logDebug('Entités NLP extraites (fallback)', 'success');
          return;
        }
      }
    }
    
    this.main.logDebug('Entités NLP non trouvées', 'warning');
  }

  // Extraire les groupes de mots à mettre en gras
  async extractGroupesMotsGras() {
    this.main.logDebug('Extraction groupes mots gras...', 'info');
    
    const selectors = [
      '#groupe_liste',
      '[id*="gras"]',
      '[class*="gras"]',
      '[id*="groupe"]'
    ];
    
    let content = null;
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.offsetParent !== null) {
        content = this.cleanText(element.textContent);
        break;
      }
    }
    
    // Fallback: chercher par titre "Groupes de mots"
    if (!content) {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      for (const heading of headings) {
        if (heading.textContent.toLowerCase().includes('groupes de mots')) {
          const nextElement = heading.nextElementSibling;
          if (nextElement) {
            content = this.cleanText(nextElement.textContent);
            break;
          }
        }
      }
    }
    
    if (content) {
      this.extractedData.set('groupes_mots_gras', content);
      this.main.logDebug('Groupes mots gras extraits', 'success');
    } else {
      this.main.logDebug('Groupes mots gras non trouvés', 'warning');
    }
  }

  // Extraire les prompts
  async extractPrompts() {
    this.main.logDebug('Extraction prompts...', 'info');
    
    if (this.main.promptsManager) {
      const prompts = this.main.promptsManager.getExtractedPrompts();
      if (prompts.length > 0) {
        const formatted = this.main.promptsManager.formatPromptsForExport();
        this.extractedData.set('mes_prompts', formatted);
        this.main.logDebug(`${prompts.length} prompts extraits`, 'success');
        return;
      }
    }
    
    // Fallback: extraction directe
    const promptsSection = document.querySelector('#liste_des_prompts, [id*="prompts"]');
    if (promptsSection && promptsSection.offsetParent !== null) {
      const content = this.cleanText(promptsSection.textContent);
      this.extractedData.set('mes_prompts', content);
      this.main.logDebug('Prompts extraits (fallback)', 'success');
    } else {
      this.main.logDebug('Prompts non trouvés', 'warning');
    }
  }

  // Extraire les idées de sujets
  async extractIdeesSujets() {
    this.main.logDebug('Extraction idées de sujets...', 'info');
    
    const selectors = [
      '#liste_idees',
      '[id*="idees"]',
      '[id*="sujets"]'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.offsetParent !== null) {
        const content = this.cleanText(element.textContent);
        this.extractedData.set('idees_sujets', content);
        this.main.logDebug('Idées de sujets extraites', 'success');
        return;
      }
    }
    
    this.main.logDebug('Idées de sujets non trouvées', 'warning');
  }

  // Assembler et copier toutes les données
  async assembleAndCopy() {
    this.main.logDebug('Assemblage des données...', 'info');
    
    const sections = [
      { key: 'intention_recherche', title: 'INTENTION DE RECHERCHE' },
      { key: 'mots_cles_obligatoires', title: 'MOTS-CLÉS OBLIGATOIRES' },
      { key: 'mots_cles_complementaires', title: 'MOTS-CLÉS COMPLÉMENTAIRES' },
      { key: 'entites_nlp', title: 'ENTITÉS NLP GOOGLE' },
      { key: 'groupes_mots_gras', title: 'GROUPES DE MOTS À METTRE EN GRAS' },
      { key: 'mes_prompts', title: 'MES PROMPTS' },
      { key: 'idees_sujets', title: 'IDÉES DE SUJETS' }
    ];
    
    let finalContent = '';
    let extractedCount = 0;
    
    sections.forEach(section => {
      const content = this.extractedData.get(section.key);
      if (content) {
        finalContent += `${section.title}:\n`;
        finalContent += `${content}\n\n`;
        finalContent += '---\n\n';
        extractedCount++;
      }
    });
    
    if (finalContent) {
      // Ajouter header
      const header = `DONNÉES EXTRAITES DE THOT-SEO\n`;
      const timestamp = `Extracté le: ${new Date().toLocaleString()}\n`;
      const summary = `Sections extraites: ${extractedCount}/${sections.length}\n\n`;
      const separator = '='.repeat(50) + '\n\n';
      
      finalContent = header + timestamp + summary + separator + finalContent;
      
      // Copier vers le presse-papier
      await this.copyToClipboard(finalContent);
      
      this.main.logDebug(`${finalContent.length} caractères copiés`, 'success');
    } else {
      this.main.logDebug('Aucune donnée à copier', 'warning');
    }
  }

  // Copier vers le presse-papier
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.main.logDebug('Copie réussie via navigator.clipboard', 'success');
    } catch (err) {
      this.main.logDebug('Fallback vers execCommand...', 'warning');
      
      // Fallback avec textarea
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        this.main.logDebug(successful ? 'Fallback réussi' : 'Fallback échoué', successful ? 'success' : 'error');
      } catch (err) {
        this.main.logDebug('Toutes les méthodes de copie ont échoué', 'error');
      }
      
      document.body.removeChild(textArea);
    }
  }

  // Nettoyer le texte
  cleanText(text) {
    return text.replace(/\s+/g, ' ').trim();
  }

  // Extraire une section spécifique
  async extractSpecificSection(sectionName) {
    switch (sectionName.toLowerCase()) {
      case 'intention':
      case 'intention de recherche':
        await this.extractIntentionRecherche();
        break;
      case 'obligatoires':
      case 'mots-clés obligatoires':
        await this.extractMotsClesObligatoires();
        break;
      case 'complémentaires':
      case 'mots-clés complémentaires':
        await this.extractMotsClesComplementaires();
        break;
      case 'nlp':
      case 'entités nlp':
        await this.extractEntitesNLP();
        break;
      case 'prompts':
      case 'mes prompts':
        await this.extractPrompts();
        break;
      case 'groupes':
      case 'groupes de mots':
        await this.extractGroupesMotsGras();
        break;
      case 'idées':
      case 'idées de sujets':
        await this.extractIdeesSujets();
        break;
    }
  }

  // Obtenir les données extraites
  getExtractedData() {
    return this.extractedData;
  }

  // Vérifier si des données ont été extraites
  hasExtractedData() {
    return this.extractedData.size > 0;
  }

  // Obtenir une section spécifique
  getSection(sectionKey) {
    return this.extractedData.get(sectionKey);
  }

  // Nettoyer toutes les données extraites
  clearExtractedData() {
    this.extractedData.clear();
  }

  // Obtenir un résumé des données extraites
  getExtractionSummary() {
    const summary = {
      total_sections: this.extractedData.size,
      sections: Array.from(this.extractedData.keys()),
      total_characters: 0
    };
    
    this.extractedData.forEach(content => {
      summary.total_characters += content.length;
    });
    
    return summary;
  }
}

console.log('🔧 DataExtractor: Module chargé');