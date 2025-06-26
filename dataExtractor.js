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

  // Extraire les entités NLP - VERSION CORRIGÉE
  async extractEntitesNLP() {
    this.main.logDebug('Extraction entités NLP...', 'info');
    
    // 1. Essayer d'abord avec le NLPManager
    if (this.main.nlpManager) {
      const content = this.main.nlpManager.extractNLPContent();
      if (content) {
        // Extraire les entités spécifiques du contenu
        const entities = this.parseNLPEntitiesFromText(content);
        if (entities.length > 0) {
          const formattedContent = this.formatNLPEntities(entities);
          this.extractedData.set('entites_nlp', formattedContent);
          this.main.logDebug(`Entités NLP extraites via NLPManager: ${entities.length} entités`, 'success');
          return;
        }
      }
    }
    
    // 2. Extraction directe avec les sélecteurs exacts des captures
    const nlpSelectors = [
      '#liste_entites_nommes',  // Sélecteur exact de l'image 2
      '#load_entities',
      '[id*="entities"]',
      '[id*="entites"]'
    ];
    
    for (const selector of nlpSelectors) {
      const container = document.querySelector(selector);
      if (container && container.offsetParent !== null) {
        // Vérifier si le container contient des entités NLP
        const nlpEntities = this.extractNLPFromContainer(container);
        if (nlpEntities && nlpEntities.length > 0) {
          const formattedContent = this.formatNLPEntities(nlpEntities);
          this.extractedData.set('entites_nlp', formattedContent);
          this.main.logDebug(`Entités NLP extraites par sélecteur ${selector}: ${nlpEntities.length} entités`, 'success');
          return;
        }
      }
    }
    
    // 3. Fallback : chercher par classe spécifique des entités
    const entitiesElements = document.querySelectorAll('.entites_nommees, [class*="entites_nommees"]');
    if (entitiesElements.length > 0) {
      const entities = Array.from(entitiesElements)
        .map(el => el.textContent.trim())
        .filter(text => text.length > 0 && text.length < 50); // Filtrer les entités valides
      
      if (entities.length > 0) {
        const formattedContent = this.formatNLPEntities(entities);
        this.extractedData.set('entites_nlp', formattedContent);
        this.main.logDebug(`Entités NLP extraites par classe: ${entities.length} entités`, 'success');
        return;
      }
    }
    
    // 4. Dernière tentative : chercher des spans avec IDs contenant "-nlp"
    const nlpSpans = document.querySelectorAll('span[id*="-nlp"]');
    if (nlpSpans.length > 0) {
      const entities = Array.from(nlpSpans)
        .map(span => {
          // Extraire le mot de l'ID (ex: "parc-nlp" -> "parc")
          const id = span.id;
          return id.replace('-nlp', '');
        })
        .filter(word => word.length > 0);
      
      if (entities.length > 0) {
        const formattedContent = this.formatNLPEntities(entities);
        this.extractedData.set('entites_nlp', formattedContent);
        this.main.logDebug(`Entités NLP extraites par spans ID: ${entities.length} entités`, 'success');
        return;
      }
    }
    
    this.main.logDebug('Entités NLP non trouvées', 'warning');
  }

  // Nouvelle méthode pour extraire les entités d'un container - APPROCHE STRUCTURE
  extractNLPFromContainer(container) {
    const entities = [];
    
    // Méthode 1: Chercher les spans avec classe entites_nommees (structure exacte ThotSEO)
    const entitySpans = container.querySelectorAll('.entites_nommees, [class*="entites_nommees"]');
    if (entitySpans.length > 0) {
      entitySpans.forEach(span => {
        const text = span.textContent.trim();
        if (text.length > 0 && text.length < 50 && /^[a-zA-ZÀ-ÿ\-']+$/.test(text)) {
          entities.push(text);
        }
      });
      return entities;
    }
    
    // Méthode 2: Chercher les spans avec ID contenant "-nlp" (structure ThotSEO)
    const nlpSpans = container.querySelectorAll('span[id*="-nlp"]');
    if (nlpSpans.length > 0) {
      nlpSpans.forEach(span => {
        const id = span.id;
        const word = id.replace('-nlp', '');
        if (word.length > 0 && /^[a-zA-ZÀ-ÿ\-']+$/.test(word)) {
          entities.push(word);
        }
      });
      return entities;
    }
    
    // Méthode 3: Chercher tous les spans dans le container (fallback)
    const allSpans = container.querySelectorAll('span');
    if (allSpans.length > 5) { // Si beaucoup de spans, probablement des entités
      allSpans.forEach(span => {
        const text = span.textContent.trim();
        // Vérifier que c'est un mot simple (entité potentielle)
        if (text.length > 2 && 
            text.length < 25 && 
            /^[a-zA-ZÀ-ÿ\-']+$/.test(text) &&
            !text.toLowerCase().includes('nlp') &&
            !text.toLowerCase().includes('entités')) {
          entities.push(text);
        }
      });
      return entities;
    }
    
    return [];
  }

  // Parser les entités NLP à partir d'un texte - APPROCHE CORRIGÉE
  parseNLPEntitiesFromText(text) {
    // Ne pas chercher des mots spécifiques, mais extraire TOUTES les entités présentes
    // dans la structure HTML des entités NLP
    
    // Nettoyer le texte et séparer les mots
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Si le texte contient des indicateurs qu'il s'agit bien d'entités NLP
    if (cleanText.toLowerCase().includes('entités nlp') || 
        cleanText.toLowerCase().includes('api de traitement du langage')) {
      
      // Extraire tous les mots significatifs (pas les phrases explicatives)
      const words = cleanText.split(/\s+/)
        .filter(word => 
          word.length > 2 &&                    // Au moins 3 caractères
          word.length < 25 &&                   // Pas trop long
          /^[a-zA-ZÀ-ÿ\-']+$/.test(word) &&    // Seulement lettres, traits d'union, apostrophes
          !word.toLowerCase().includes('nlp') &&
          !word.toLowerCase().includes('entités') &&
          !word.toLowerCase().includes('extraites') &&
          !word.toLowerCase().includes('google') &&
          !word.toLowerCase().includes('serp') &&
          !word.toLowerCase().includes('api') &&
          !word.toLowerCase().includes('traitement') &&
          !word.toLowerCase().includes('langage') &&
          !word.toLowerCase().includes('intégrez') &&
          !word.toLowerCase().includes('considération') &&
          !word.toLowerCase().includes('casse')
        );
      
      // Enlever les doublons et retourner
      return [...new Set(words.map(word => word.toLowerCase()))];
    }
    
    return [];
  }

  // Formater les entités NLP pour l'export
  formatNLPEntities(entities) {
    if (!entities || entities.length === 0) {
      return '';
    }
    
    let formatted = 'Entités NLP Google:\n\n';
    
    entities.forEach((entity, index) => {
      formatted += `${entity}\n`;
    });
    
    formatted += `\nLes entités NLP sont extraites du top 5 de la SERP via l'API de traitement du langage de Google.\n`;
    formatted += `Intégrez-les en prenant en considération la casse.`;
    
    return formatted;
  }

  // Extraire les groupes de mots à mettre en gras
  async extractGroupesMotsGras() {
    this.main.logDebug('Extraction groupes mots gras...', 'info');
    
    // 1. Chercher par ID spécifique visible dans le DOM (image 2)
    const specificSelectors = [
      '#pgrams_liste',  // ID visible dans votre capture
      '#groupe_liste',
      '[id*="pgrams"]',
      '[id*="groupe"]'
    ];
    
    for (const selector of specificSelectors) {
      const element = document.querySelector(selector);
      if (element && element.offsetParent !== null) {
        const content = this.extractOnlyGroupeSpans(element);
        if (content) {
          this.extractedData.set('groupes_mots_gras', content);
          this.main.logDebug(`Groupes mots gras extraits par ${selector}`, 'success');
          return;
        }
      }
    }
    
    // 2. Chercher par titre et cibler SEULEMENT la section suivante
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, div');
    for (const heading of headings) {
      const headingText = heading.textContent.toLowerCase().trim();
      if (headingText === 'groupes de mots à mettre en gras') {
        this.main.logDebug(`Titre exact trouvé: "${heading.textContent}"`, 'info');
        
        // Chercher le container suivant avec les spans colorés
        let nextElement = heading.nextElementSibling;
        while (nextElement) {
          if (nextElement.offsetParent !== null) {
            const content = this.extractOnlyGroupeSpans(nextElement);
            if (content) {
              this.extractedData.set('groupes_mots_gras', content);
              this.main.logDebug('Groupes mots gras extraits par titre exact', 'success');
              return;
            }
          }
          nextElement = nextElement.nextElementSibling;
        }
      }
    }
    
    // 3. Fallback: chercher une div avec beaucoup de spans colorés de groupes
    const allDivs = document.querySelectorAll('div');
    for (const div of allDivs) {
      if (div.offsetParent !== null) {
        const spans = div.querySelectorAll('span[class*="keyword"], span[style*="background-color"]');
        if (spans.length > 5 && spans.length < 50) { // Entre 5 et 50 spans pour éviter la page entière
          const content = this.extractOnlyGroupeSpans(div);
          if (content && content.length > 50 && content.length < 1000) { // Taille raisonnable
            this.extractedData.set('groupes_mots_gras', content);
            this.main.logDebug('Groupes mots gras extraits par fallback spans', 'success');
            return;
          }
        }
      }
    }
    
    this.main.logDebug('Groupes mots gras non trouvés', 'warning');
  }

  // Extraire SEULEMENT les spans de groupes, pas tout le contenu
  extractOnlyGroupeSpans(container) {
    const groupes = [];
    
    // Méthode 1: Chercher les spans avec classes keyword spécifiques
    const keywordSpans = container.querySelectorAll('span[class*="keyword"], span[class*="pgram"]');
    if (keywordSpans.length > 0) {
      keywordSpans.forEach(span => {
        const text = span.textContent.trim();
        // Filtrer pour garder seulement les groupes de mots (pas les mots isolés)
        if (text.length > 5 && text.includes(' ') && !text.includes('NLP') && !text.includes('entités')) {
          groupes.push(text);
        }
      });
    }
    
    // Méthode 2: Si pas de spans keyword, chercher les spans avec background-color
    if (groupes.length === 0) {
      const coloredSpans = container.querySelectorAll('span[style*="background-color"]');
      coloredSpans.forEach(span => {
        const text = span.textContent.trim();
        if (text.length > 5 && text.includes(' ') && !text.includes('NLP') && !text.includes('entités')) {
          groupes.push(text);
        }
      });
    }
    
    // Méthode 3: Si pas de spans colorés, chercher tous les spans mais filtrer strictement
    if (groupes.length === 0) {
      const allSpans = container.querySelectorAll('span');
      if (allSpans.length > 0 && allSpans.length < 100) { // Pas trop de spans pour éviter la page entière
        allSpans.forEach(span => {
          const text = span.textContent.trim();
          // Très strict: doit contenir des espaces (groupe de mots) et avoir une taille raisonnable
          if (text.length > 8 && 
              text.length < 50 && 
              text.includes(' ') && 
              (text.includes('de ') || text.includes('du ') || text.includes('informatique') || text.includes('gestion'))) {
            groupes.push(text);
          }
        });
      }
    }
    
    if (groupes.length > 0) {
      // Enlever les doublons et formater
      const uniqueGroupes = [...new Set(groupes)];
      return `Groupes de mots à mettre en gras:\n\n${uniqueGroupes.join('\n')}`;
    }
    
    return null;
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