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

  // Extraire l'intention de recherche - VERSION STRUCTURE EXACTE
  async extractIntentionRecherche() {
    this.main.logDebug('Extraction intention de recherche...', 'info');
    
    // 1. Chercher la section "Intention de recherche" avec sa vraie structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, div, span');
    for (const heading of headings) {
      const headingText = heading.textContent.toLowerCase().trim();
      if (headingText === 'intention de recherche') {
        this.main.logDebug(`Section Intention de recherche trouvée: "${heading.textContent}"`, 'info');
        
        // Chercher le container suivant avec les questions et mots-clés
        let container = heading.nextElementSibling;
        let attempts = 0;
        
        while (container && attempts < 5) {
          if (container.offsetParent !== null) {
            const content = this.extractIntentionStructure(container);
            if (content) {
              this.extractedData.set('intention_recherche', content);
              this.main.logDebug('Intention de recherche extraite par structure', 'success');
              return;
            }
          }
          container = container.nextElementSibling;
          attempts++;
        }
        
        // Si pas trouvé dans les éléments suivants, chercher dans le parent
        const parentContainer = heading.parentElement;
        if (parentContainer) {
          const content = this.extractIntentionStructure(parentContainer);
          if (content) {
            this.extractedData.set('intention_recherche', content);
            this.main.logDebug('Intention de recherche extraite par parent', 'success');
            return;
          }
        }
      }
    }
    
    // 2. Fallback: chercher par structure de questions
    const questionElements = Array.from(document.querySelectorAll('*')).filter(el => {
      const text = el.textContent.toLowerCase();
      return (text.includes('qu\'est-ce qui') || 
              text.includes('comment ') ||
              text.includes('pourquoi ') ||
              text.includes('quel est ') ||
              text.includes('quelles sont ')) && 
             el.offsetParent !== null &&
             el.textContent.length > 20 &&
             el.textContent.length < 200;
    });
    
    if (questionElements.length > 0) {
      // Prendre le container parent qui contient plusieurs questions
      const containers = questionElements.map(el => el.closest('div, section')).filter(c => c);
      for (const container of containers) {
        const content = this.extractIntentionStructure(container);
        if (content) {
          this.extractedData.set('intention_recherche', content);
          this.main.logDebug('Intention de recherche extraite par questions', 'success');
          return;
        }
      }
    }
    
    this.main.logDebug('Intention de recherche non trouvée', 'warning');
  }

  // Nouvelle méthode pour extraire la structure des intentions
  extractIntentionStructure(container) {
    const intentions = [];
    
    // Chercher les questions et leurs mots-clés associés
    const textContent = container.textContent;
    
    // Vérifier qu'on a bien des questions (pattern de questions)
    const questionPatterns = [
      /qu'est-ce qui[^?]*\?/gi,
      /comment [^?]*\?/gi, 
      /pourquoi [^?]*\?/gi,
      /quel est [^?]*\?/gi,
      /quelles sont [^?]*\?/gi,
      /quelle est [^?]*\?/gi
    ];
    
    let hasQuestions = false;
    for (const pattern of questionPatterns) {
      if (pattern.test(textContent)) {
        hasQuestions = true;
        break;
      }
    }
    
    if (!hasQuestions) {
      return null;
    }
    
    // Méthode 1: Extraire par structure HTML (h3, h4 + spans)
    const questionHeaders = container.querySelectorAll('h3, h4, h5, div, p');
    for (const header of questionHeaders) {
      const questionText = header.textContent.trim();
      if (questionText.match(/^(qu'est-ce qui|comment|pourquoi|quel est|quelles sont|quelle est)/i) && 
          questionText.includes('?')) {
        
        // Chercher les mots-clés associés dans les éléments suivants
        const keywords = this.findKeywordsAfterQuestion(header);
        
        if (keywords.length > 0) {
          intentions.push({
            question: questionText,
            keywords: keywords
          });
        }
      }
    }
    
    // Méthode 2: Si pas de structure HTML claire, parser le texte
    if (intentions.length === 0) {
      const lines = textContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      let currentQuestion = null;
      let currentKeywords = [];
      
      for (const line of lines) {
        if (line.match(/^(qu'est-ce qui|comment|pourquoi|quel est|quelles sont|quelle est)/i) && line.includes('?')) {
          // Sauvegarder la question précédente si elle existe
          if (currentQuestion && currentKeywords.length > 0) {
            intentions.push({
              question: currentQuestion,
              keywords: currentKeywords
            });
          }
          
          // Nouvelle question
          currentQuestion = line;
          currentKeywords = [];
        } else if (currentQuestion && line.length > 0 && !line.includes('Intention de recherche')) {
          // Traiter comme des mots-clés
          const words = line.split(/\s+/).filter(word => word.length > 2);
          currentKeywords.push(...words);
        }
      }
      
      // Ajouter la dernière question
      if (currentQuestion && currentKeywords.length > 0) {
        intentions.push({
          question: currentQuestion,
          keywords: currentKeywords
        });
      }
    }
    
    // Formater le résultat
    if (intentions.length > 0) {
      let formatted = '';
      
      intentions.forEach(intention => {
        formatted += `${intention.question}\n`;
        // CORRECTION: Utiliser des retours à la ligne comme les autres colonnes !
        formatted += `${intention.keywords.join('\n')}\n\n`;
      });
      
      return formatted.trim();
    }
    
    return null;
  }

  // Trouver les mots-clés après une question - VERSION STRUCTURE EXACTE
  findKeywordsAfterQuestion(questionElement) {
    const keywords = [];
    
    // Chercher dans les éléments suivants
    let nextElement = questionElement.nextElementSibling;
    let attempts = 0;
    
    while (nextElement && attempts < 5) {
      // Si c'est une nouvelle question, arrêter
      if (nextElement.textContent.match(/^(qu'est-ce qui|comment|pourquoi|quel est|quelles sont|quelle est)/i)) {
        break;
      }
      
      // Chercher les spans avec classe IDR_tag ou keyword (structure exacte)
      const keywordSpans = nextElement.querySelectorAll('span.IDR_tag, span[class*="keyword"], span[class*="IDR_tag"]');
      if (keywordSpans.length > 0) {
        keywordSpans.forEach(span => {
          const text = span.textContent.trim();
          if (text.length > 1 && text.length < 30 && !text.includes('?') && !text.includes('span')) {
            keywords.push(text);
          }
        });
      } else {
        // Si pas de spans spécifiques, chercher tous les spans
        const spans = nextElement.querySelectorAll('span');
        if (spans.length > 0) {
          spans.forEach(span => {
            const text = span.textContent.trim();
            if (text.length > 1 && text.length < 30 && !text.includes('?')) {
              keywords.push(text);
            }
          });
        } else {
          // Si pas de spans, traiter le texte directement (fallback)
          const text = nextElement.textContent.trim();
          if (text.length > 0 && !text.includes('?') && text.length < 200) {
            const words = text.split(/\s+/).filter(word => word.length > 1 && word.length < 30);
            keywords.push(...words);
          }
        }
      }
      
      nextElement = nextElement.nextElementSibling;
      attempts++;
    }
    
    return keywords;
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
        return this.extractKeywordsFromContainer(element);
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

  // Extraire les mots-clés d'un container - VERSION STRUCTURE HTML
  extractKeywordsFromContainer(container) {
    const keywords = [];
    
    // Méthode 1: Utiliser la structure HTML exacte (spans avec classes keyword)
    const keywordSpans = container.querySelectorAll('span.keyword, span[class*="keyword"]');
    if (keywordSpans.length > 0) {
      keywordSpans.forEach(span => {
        const leftSide = span.querySelector('.keyword-left-side');
        const rightSide = span.querySelector('.keyword-right-side');
        
        if (leftSide && rightSide) {
          // Prendre left-side + " " + right-side
          const keyword = leftSide.textContent.trim() + ' ' + rightSide.textContent.trim();
          keywords.push(keyword);
        } else {
          // Fallback: prendre tout le contenu du span s'il a l'air correct
          const text = span.textContent.trim();
          if (text.match(/\w+.*0\/.*\d+/)) {
            keywords.push(text);
          }
        }
      });
    }
    
    // Méthode 2: Si pas de structure keyword, essayer par regex sur le texte
    if (keywords.length === 0) {
      const text = container.textContent.trim();
      const regex = /(\w+\s+0\/\s*[\d\-]+)/g;
      const matches = text.match(regex);
      
      if (matches && matches.length > 0) {
        const cleanMatches = matches.map(match => match.trim()).filter(match => match.length > 0);
        return cleanMatches.join('\n');
      }
    }
    
    // Formatage final : un mot-clé par ligne
    if (keywords.length > 0) {
      return keywords.join('\n');
    }
    
    return null;
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

  // Extraire SEULEMENT les spans de groupes, pas tout le contenu - VERSION STRUCTURE EXACTE
  extractOnlyGroupeSpans(container) {
    const groupes = [];
    
    // Méthode 1: Structure exacte des groupes de mots (spans avec classes pgram keyword)
    const pgramSpans = container.querySelectorAll('span.pgram, span[class*="pgram"]');
    if (pgramSpans.length > 0) {
      pgramSpans.forEach(span => {
        const text = span.textContent.trim();
        // Prendre le contenu de chaque span pgram
        if (text.length > 2 && !text.includes('NLP') && !text.includes('entités')) {
          groupes.push(text);
        }
      });
    }
    
    // Méthode 2: Si pas de spans pgram, chercher les spans avec ID contenant "keyword_"
    if (groupes.length === 0) {
      const keywordSpans = container.querySelectorAll('span[id*="keyword_"]');
      keywordSpans.forEach(span => {
        const text = span.textContent.trim();
        if (text.length > 2 && !text.includes('NLP') && !text.includes('entités')) {
          groupes.push(text);
        }
      });
    }
    
    // Méthode 3: Chercher les spans avec classes keyword mais pas de left-side/right-side
    if (groupes.length === 0) {
      const keywordSpans = container.querySelectorAll('span[class*="keyword"]');
      keywordSpans.forEach(span => {
        // Éviter les spans qui sont des sous-éléments (left-side, right-side)
        if (!span.classList.contains('keyword-left-side') && 
            !span.classList.contains('keyword-right-side')) {
          const text = span.textContent.trim();
          if (text.length > 2 && !text.includes('NLP') && !text.includes('entités') && !text.includes('0/')) {
            groupes.push(text);
          }
        }
      });
    }
    
    // Méthode 4: Fallback - spans avec background-color
    if (groupes.length === 0) {
      const coloredSpans = container.querySelectorAll('span[style*="background-color"]');
      coloredSpans.forEach(span => {
        const text = span.textContent.trim();
        if (text.length > 2 && !text.includes('NLP') && !text.includes('entités') && !text.includes('0/')) {
          groupes.push(text);
        }
      });
    }
    
    if (groupes.length > 0) {
      // Enlever les doublons et formater proprement
      const uniqueGroupes = [...new Set(groupes)]
        .filter(group => group.length > 2)
        .slice(0, 30); // Limiter à 30 groupes maximum
      
      return uniqueGroupes.join('\n');
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

  // Assembler et copier toutes les données - FORMAT EXCEL TSV AVEC PROMPTS CORRIGÉ
  async assembleAndCopy() {
    this.main.logDebug('Assemblage des données pour Excel...', 'info');
    
    // Ordre exact des colonnes demandées
    const columnOrder = [
      'intention_recherche',           // Termes pour les intention de recherche
      'mots_cles_obligatoires',       // Termes de recherches obligatoires  
      'mots_cles_complementaires',    // Termes de recherches complémentaires
      'entites_nlp',                  // Entitées NLP Google
      'groupes_mots_gras',           // Groupes de mots à mettre en gras
      'gains_information',           // Gains d'information (prompt)
      'plan_mece',                   // Création d'un plan MECE (prompt)  
      'idees_listes_tableaux',       // Idées de listes et tableaux (prompt)
      'densification_mots_cles',     // Densification mots-clés (prompt)
      'guide_redaction'              // Guide pour la rédaction de contenu (prompt)
    ];
    
    // Extraire le contenu de chaque colonne (SANS les titres)
    const columnContents = columnOrder.map(columnKey => {
      let rawContent = '';
      
      // Pour les 5 premières colonnes : utiliser les données extraites
      if (columnKey === 'intention_recherche' || 
          columnKey === 'mots_cles_obligatoires' || 
          columnKey === 'mots_cles_complementaires' || 
          columnKey === 'entites_nlp' || 
          columnKey === 'groupes_mots_gras') {
        rawContent = this.extractedData.get(columnKey) || '';
      } 
      // Pour les 5 dernières colonnes : utiliser les prompts
      else {
        rawContent = this.getPromptForColumn(columnKey);
      }
      
      if (!rawContent) {
        return ''; // Colonne vide
      }
      
      // Nettoyer le contenu : enlever TOUS les titres et formatage
      let cleanContent = rawContent;
      
      // Enlever les titres de sections (plus agressif)
      cleanContent = cleanContent
        .replace(/^[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜŸÇ\s\-:]+:\s*/i, '') // Enlever "ENTITÉS NLP GOOGLE:", etc.
        .replace(/^Entités NLP Google:\s*/i, '')
        .replace(/^Groupes de mots à mettre en gras:\s*/i, '')
        .replace(/^Intention de recherche:\s*/i, '') // CORRECTION: enlever ce titre aussi
        .replace(/^Les entités NLP sont extraites.*$/m, '') // Enlever les explications
        .replace(/^Intégrez-les en prenant.*$/m, '')
        .trim();
      
      // CORRECTION: Formatage spécifique selon le type de colonne
      if (columnKey === 'intention_recherche') {
        // CORRECTION: Intention aussi avec retours à la ligne dans Excel !
        cleanContent = cleanContent.replace(/\n/g, String.fromCharCode(10));
      } 
      else if (columnKey === 'mots_cles_obligatoires' || 
               columnKey === 'mots_cles_complementaires' || 
               columnKey === 'entites_nlp') {
        // CORRECTION: Pour les listes - utiliser le caractère LF pour Excel
        // Remplacer \n par le caractère ASCII 10 (Line Feed) pour retours à la ligne dans la cellule
        cleanContent = cleanContent.replace(/\n/g, String.fromCharCode(10));
      } 
      else {
        // Pour les textes longs (groupes de mots et prompts) : remplacer par des espaces
        cleanContent = cleanContent.replace(/\n+/g, ' ').replace(/\s+/g, ' ');
      }
      
      // Pour Excel TSV : quoter les cellules qui contiennent des retours à la ligne
      if (cleanContent.includes(String.fromCharCode(10))) {
        cleanContent = `"${cleanContent}"`;
      }
      
      return cleanContent;
    });
    
    // Créer une ligne TSV (Tab-Separated Values)
    const tsvLine = columnContents.join('\t');
    
    if (tsvLine.trim()) {
      // Copier vers le presse-papier
      await this.copyToClipboard(tsvLine);
      
      const filledColumns = columnContents.filter(content => content.length > 0).length;
      this.main.logDebug(`Données Excel copiées: ${filledColumns}/10 colonnes remplies`, 'success');
      this.main.showNotification(`📊 ${filledColumns}/10 colonnes Excel copiées !`, 'success');
    } else {
      this.main.logDebug('Aucune donnée à copier', 'warning');
      this.main.showNotification('⚠️ Aucune donnée à copier', 'warning');
    }
  }

  // Obtenir le prompt correspondant à une colonne spécifique
  getPromptForColumn(columnKey) {
    if (!this.main.promptsManager) {
      return '';
    }
    
    const prompts = this.main.promptsManager.getExtractedPrompts();
    if (prompts.length === 0) {
      return '';
    }
    
    // Mapping des colonnes vers les noms de prompts ThotSEO
    const promptMappings = {
      'gains_information': ['gains', 'information', 'gain d\'information'],
      'plan_mece': ['mece', 'plan mece', 'plan', 'structure'],
      'idees_listes_tableaux': ['listes', 'tableaux', 'idées', 'liste', 'tableau'],
      'densification_mots_cles': ['densification', 'mots-clés', 'densité', 'mot-clé'],
      'guide_redaction': ['guide', 'rédaction', 'guide rédaction', 'contenu', 'redaction']
    };
    
    const keywords = promptMappings[columnKey] || [];
    
    // Chercher le prompt qui correspond le mieux
    for (const [promptName, promptContent] of prompts) {
      const lowerName = promptName.toLowerCase();
      
      // Vérifier si le nom du prompt contient un des mots-clés
      for (const keyword of keywords) {
        if (lowerName.includes(keyword.toLowerCase())) {
          this.main.logDebug(`Prompt trouvé pour ${columnKey}: "${promptName}"`, 'success');
          return promptContent;
        }
      }
    }
    
    // Si pas de correspondance exacte, essayer par ordre d'apparition
    const promptIndex = this.getPromptIndexForColumn(columnKey);
    if (promptIndex < prompts.length) {
      const [promptName, promptContent] = prompts[promptIndex];
      this.main.logDebug(`Prompt assigné par index pour ${columnKey}: "${promptName}"`, 'info');
      return promptContent;
    }
    
    return '';
  }

  // Obtenir l'index du prompt par ordre d'apparition
  getPromptIndexForColumn(columnKey) {
    const columnToIndex = {
      'gains_information': 0,
      'plan_mece': 1,
      'idees_listes_tableaux': 2,
      'densification_mots_cles': 3,
      'guide_redaction': 4
    };
    
    return columnToIndex[columnKey] || 0;
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