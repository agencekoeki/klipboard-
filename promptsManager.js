// Module de gestion des prompts - Klipboard by Koeki
class PromptsManager {
  constructor(mainExtractor) {
    this.main = mainExtractor;
    this.extractedPrompts = new Map();
    console.log('🔧 PromptsManager: Module initialisé');
  }

  // Test de copie des prompts
  async testPromptsCopy() {
    this.main.logDebug('=== TEST COPIE PROMPTS ===', 'warning');
    this.main.clearInspectorResults();
    
    // 1. Trouver la section prompts
    const promptsSection = this.findPromptsSection();
    if (!promptsSection) {
      this.main.updateInspectorResults('❌ Section prompts non trouvée');
      return false;
    }
    
    // 2. Chercher tous les prompts disponibles
    const prompts = this.findAllPrompts(promptsSection);
    this.main.updateInspectorResults(`Prompts trouvés: ${prompts.length}`);
    
    if (prompts.length === 0) {
      this.main.updateInspectorResults('❌ Aucun prompt trouvé');
      return false;
    }
    
    // 3. Tester la copie de chaque prompt
    let successCount = 0;
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      this.main.updateInspectorResults(`Test prompt ${i + 1}: "${prompt.name}"`);
      
      const success = await this.copyPrompt(prompt);
      if (success) {
        successCount++;
        this.main.updateInspectorResults(`  ✅ Copié`);
      } else {
        this.main.updateInspectorResults(`  ❌ Échec`);
      }
      
      await this.main.wait(500); // Délai entre les copies
    }
    
    this.main.updateInspectorResults(`--- RÉSULTAT: ${successCount}/${prompts.length} prompts copiés ---`);
    return successCount > 0;
  }

  // Trouver la section des prompts
  findPromptsSection() {
    const selectors = [
      '#liste_des_prompts',
      '[id*="prompts"]',
      '[class*="prompts"]'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        this.main.updateInspectorResults(`Section prompts trouvée: ${selector}`);
        return element;
      }
    }
    
    // Chercher par titre
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    for (const heading of headings) {
      if (heading.textContent.toLowerCase().includes('mes prompts')) {
        const section = heading.parentElement || heading.nextElementSibling;
        if (section) {
          this.main.updateInspectorResults(`Section prompts trouvée par titre`);
          return section;
        }
      }
    }
    
    return null;
  }

  // Trouver tous les prompts dans une section
  findAllPrompts(section) {
    const prompts = [];
    
    // Chercher les prompts par différentes structures
    const promptSelectors = [
      '.prompt-item',
      '[class*="prompt"]',
      '[data-prompt]',
      '.commande'
    ];
    
    promptSelectors.forEach(selector => {
      const elements = section.querySelectorAll(selector);
      elements.forEach(element => {
        const prompt = this.parsePromptElement(element);
        if (prompt && !prompts.find(p => p.name === prompt.name)) {
          prompts.push(prompt);
        }
      });
    });
    
    // Si pas de structure spécifique, chercher les boutons de copie
    if (prompts.length === 0) {
      const copyButtons = section.querySelectorAll('button, [onclick], .commande');
      copyButtons.forEach(button => {
        if (this.isCopyButton(button)) {
          const prompt = this.parsePromptFromCopyButton(button);
          if (prompt) {
            prompts.push(prompt);
          }
        }
      });
    }
    
    return prompts;
  }

  // Parser un élément prompt
  parsePromptElement(element) {
    const text = element.textContent.trim();
    
    // Chercher le nom du prompt
    let name = 'Prompt inconnu';
    const nameElement = element.querySelector('.prompt-name, .title, h3, h4, h5, h6');
    if (nameElement) {
      name = nameElement.textContent.trim();
    } else {
      // Prendre les premiers mots comme nom
      const words = text.split(' ').slice(0, 5).join(' ');
      if (words.length > 0) {
        name = words;
      }
    }
    
    // Chercher le bouton de copie
    const copyButton = element.querySelector('button[class*="copy"], [title*="copier"], [onclick*="copy"]');
    
    // Chercher le contenu
    const contentElement = element.querySelector('.prompt-content, .content, .text');
    const content = contentElement ? contentElement.textContent.trim() : text;
    
    return {
      name: name,
      element: element,
      copyButton: copyButton,
      content: content
    };
  }

  // Vérifier si un élément est un bouton de copie
  isCopyButton(button) {
    const text = button.textContent.toLowerCase();
    const classes = button.className.toLowerCase();
    const onclick = button.getAttribute('onclick') || '';
    
    return text.includes('copier') || 
           text.includes('copy') ||
           classes.includes('copy') ||
           onclick.includes('copy') ||
           button.title && button.title.toLowerCase().includes('copier');
  }

  // Parser un prompt à partir de son bouton de copie
  parsePromptFromCopyButton(button) {
    // Chercher le container parent du prompt
    let container = button.parentElement;
    let attempts = 0;
    
    while (container && attempts < 5) {
      // Si on trouve un container avec suffisamment de texte
      if (container.textContent.trim().length > 50) {
        break;
      }
      container = container.parentElement;
      attempts++;
    }
    
    if (!container) {
      return null;
    }
    
    // Extraire le nom du prompt
    let name = 'Prompt';
    const titleElement = container.querySelector('h3, h4, h5, h6, .title, .prompt-name');
    if (titleElement) {
      name = titleElement.textContent.trim();
    } else {
      // Utiliser le texte du bouton précédent ou du container
      const siblings = Array.from(container.children);
      const buttonIndex = siblings.indexOf(button.parentElement);
      if (buttonIndex > 0) {
        name = siblings[buttonIndex - 1].textContent.trim().substring(0, 50);
      }
    }
    
    return {
      name: name,
      element: container,
      copyButton: button,
      content: container.textContent.trim()
    };
  }

  // Copier un prompt spécifique
  async copyPrompt(prompt) {
    try {
      if (prompt.copyButton) {
        // Méthode 1: Cliquer sur le bouton de copie
        this.highlightButton(prompt.copyButton, 'processing');
        prompt.copyButton.click();
        
        await this.main.wait(200);
        
        // Essayer de lire le presse-papier
        try {
          const clipboardText = await navigator.clipboard.readText();
          if (clipboardText && clipboardText.length > 10) {
            this.extractedPrompts.set(prompt.name, clipboardText);
            this.highlightButton(prompt.copyButton, 'success');
            return true;
          }
        } catch (clipboardError) {
          // Fallback si clipboard API échoue
        }
      }
      
      // Méthode 2: Extraire directement le contenu
      if (prompt.content && prompt.content.length > 10) {
        this.extractedPrompts.set(prompt.name, prompt.content);
        this.main.logDebug(`Prompt "${prompt.name}" extrait par contenu`, 'success');
        return true;
      }
      
      return false;
      
    } catch (error) {
      this.main.logDebug(`Erreur copie prompt "${prompt.name}": ${error.message}`, 'error');
      if (prompt.copyButton) {
        this.highlightButton(prompt.copyButton, 'error');
      }
      return false;
    }
  }

  // Extraire tous les prompts
  async extractPrompts() {
    this.main.logDebug('=== EXTRACTION PROMPTS ===', 'warning');
    
    // S'assurer que la section prompts est ouverte
    const isOpen = await this.ensurePromptsSection();
    if (!isOpen) {
      this.main.logDebug('Impossible d\'ouvrir la section prompts', 'error');
      return [];
    }
    
    const promptsSection = this.findPromptsSection();
    if (!promptsSection) {
      return [];
    }
    
    const prompts = this.findAllPrompts(promptsSection);
    this.main.logDebug(`${prompts.length} prompts trouvés`, 'info');
    
    // Copier chaque prompt
    for (const prompt of prompts) {
      await this.copyPrompt(prompt);
      await this.main.wait(300);
    }
    
    this.main.logDebug(`${this.extractedPrompts.size} prompts extraits`, 'success');
    return Array.from(this.extractedPrompts.entries());
  }

  // S'assurer que la section prompts est ouverte
  async ensurePromptsSection() {
    // Vérifier si la section existe déjà
    const existingSection = this.findPromptsSection();
    if (existingSection && existingSection.offsetParent !== null) {
      return true; // Déjà ouverte
    }
    
    // Essayer de l'ouvrir via le sectionExpander
    if (this.main.sectionExpander) {
      const success = await this.main.sectionExpander.expandSpecificSection('mes prompts');
      await this.main.wait(1000);
      return success;
    }
    
    return false;
  }

  // Surligner un bouton
  highlightButton(button, status) {
    const styles = {
      processing: { border: '2px solid orange', backgroundColor: 'rgba(255, 165, 0, 0.2)' },
      success: { border: '2px solid green', backgroundColor: 'rgba(0, 255, 0, 0.2)' },
      error: { border: '2px solid red', backgroundColor: 'rgba(255, 0, 0, 0.2)' }
    };
    
    const style = styles[status] || styles.processing;
    button.style.border = style.border;
    button.style.backgroundColor = style.backgroundColor;
  }

  // Obtenir tous les prompts extraits
  getExtractedPrompts() {
    return Array.from(this.extractedPrompts.entries());
  }

  // Nettoyer les prompts extraits
  clearExtractedPrompts() {
    this.extractedPrompts.clear();
  }

  // Obtenir un prompt spécifique par nom
  getPromptByName(name) {
    return this.extractedPrompts.get(name);
  }

  // Formater les prompts pour l'export
  formatPromptsForExport() {
    const prompts = this.getExtractedPrompts();
    if (prompts.length === 0) {
      return '';
    }
    
    let formatted = 'MES PROMPTS:\n\n';
    
    prompts.forEach(([name, content], index) => {
      formatted += `${index + 1}. ${name}\n`;
      formatted += `${content}\n\n`;
      formatted += '---\n\n';
    });
    
    return formatted;
  }

  // Vérifier si des prompts sont disponibles
  hasPrompts() {
    return this.extractedPrompts.size > 0;
  }
}

console.log('🔧 PromptsManager: Module chargé');