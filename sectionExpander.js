// Module de dépliage des sections ThotSEO - Klipboard by Koeki
class SectionExpander {
  constructor(mainExtractor) {
    this.main = mainExtractor;
    console.log('🔧 SectionExpander: Module initialisé');
  }

  // Trouver spécifiquement les sections pliées de ThotSEO
  findThotSEOSections() {
    this.main.logDebug('=== RECHERCHE SECTIONS THOTSEO V2 ===', 'warning');
    this.main.clearInspectorResults();
    
    const sectionsFound = [];
    
    // Chercher les H2 avec attribut onclick (structure ThotSEO)
    const clickableHeaders = document.querySelectorAll('h2[onclick], h3[onclick], [onclick*="open_close"]');
    
    this.main.updateInspectorResults(`Headers cliquables trouvés: ${clickableHeaders.length}`);
    
    clickableHeaders.forEach(header => {
      const text = header.textContent.toLowerCase();
      const onclick = header.getAttribute('onclick');
      
      this.main.updateInspectorResults(`Header: "${text.substring(0, 30)}..." onclick="${onclick}"`);
      
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
          this.main.updateInspectorResults(`✅ Section trouvée: "${mapping.name}"`);
          
          // Trouver la div associée
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
    
    this.main.updateInspectorResults(`--- RÉSULTAT: ${sectionsFound.length} sections trouvées ---`);
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

  // Expansion ciblée sur ThotSEO
  async targetedThotSEOExpansion() {
    this.main.logDebug('=== EXPANSION CIBLÉE THOTSEO V2 ===', 'warning');
    
    const sectionsData = this.findThotSEOSections();
    
    if (sectionsData.length === 0) {
      this.main.logDebug('Aucune section ThotSEO trouvée avec onclick', 'error');
      this.main.updateInspectorResults('❌ Aucune section avec onclick trouvée');
      return false;
    }
    
    this.main.updateInspectorResults(`Sections à déplier: ${sectionsData.length}`);
    
    let successCount = 0;
    
    for (let i = 0; i < sectionsData.length; i++) {
      const {section, header, onclick, associatedDiv} = sectionsData[i];
      
      this.main.logDebug(`Dépliage section ${i + 1}: "${section}"`, 'warning');
      this.main.updateInspectorResults(`Dépliage: ${section}`);
      
      try {
        const success = await this.expandSingleSection(header, associatedDiv, section);
        if (success) {
          successCount++;
        }
      } catch (error) {
        this.main.logDebug(`❌ Erreur dépliage "${section}": ${error.message}`, 'error');
        this.main.updateInspectorResults(`  ❌ Erreur: ${error.message}`);
        this.highlightHeader(header, 'error');
      }
    }
    
    this.main.logDebug(`Expansion terminée: ${successCount}/${sectionsData.length} sections dépliées`, 'success');
    return successCount > 0;
  }

  // Déplier une seule section
  async expandSingleSection(header, associatedDiv, sectionName) {
    // Surligner le header avant clic
    this.highlightHeader(header, 'processing');
    
    // Vérifier l'état initial
    let beforeState = 'unknown';
    if (associatedDiv) {
      const beforeDisplay = window.getComputedStyle(associatedDiv).display;
      beforeState = beforeDisplay === 'none' ? 'fermé' : 'ouvert';
      this.main.updateInspectorResults(`  État initial: ${beforeState}`);
    }
    
    // Si déjà ouvert, pas besoin de cliquer
    if (beforeState === 'ouvert') {
      this.main.updateInspectorResults(`  ℹ️ Déjà ouvert`);
      this.highlightHeader(header, 'success');
      return true;
    }
    
    // Cliquer sur le header
    header.click();
    
    // Attendre l'animation
    await this.main.wait(1000);
    
    // Vérifier si ça a fonctionné
    let afterState = 'unknown';
    let success = false;
    
    if (associatedDiv) {
      const afterDisplay = window.getComputedStyle(associatedDiv).display;
      afterState = afterDisplay === 'none' ? 'fermé' : 'ouvert';
      success = beforeState !== afterState;
    } else {
      // Si pas de div associée, on suppose que ça a marché
      success = true;
    }
    
    if (success) {
      this.main.logDebug(`✅ Section "${sectionName}" basculée (${beforeState} → ${afterState})`, 'success');
      this.main.updateInspectorResults(`  ✅ Basculée (${beforeState} → ${afterState})`);
      this.highlightHeader(header, 'success');
    } else {
      this.main.logDebug(`⚠️ Section "${sectionName}" - pas de changement`, 'warning');
      this.main.updateInspectorResults(`  ⚠️ Pas de changement`);
      this.highlightHeader(header, 'warning');
    }
    
    return success;
  }

  // Surligner un header avec code couleur
  highlightHeader(header, status) {
    const colors = {
      processing: 'rgba(255, 165, 0, 0.3)', // Orange
      success: 'rgba(0, 255, 0, 0.3)',      // Vert
      warning: 'rgba(255, 255, 0, 0.3)',    // Jaune
      error: 'rgba(255, 0, 0, 0.3)'         // Rouge
    };
    
    const borderColors = {
      processing: '3px solid orange',
      success: '3px solid green',
      warning: '3px solid yellow',
      error: '3px solid red'
    };
    
    header.style.backgroundColor = colors[status] || colors.processing;
    header.style.border = borderColors[status] || borderColors.processing;
  }

  // Déplier toutes les sections importantes
  async expandAllImportantSections() {
    this.main.logDebug('=== EXPANSION DE TOUTES LES SECTIONS IMPORTANTES ===', 'warning');
    
    const result = await this.targetedThotSEOExpansion();
    
    if (result) {
      this.main.showNotification('Sections dépliées avec succès !', 'success');
    } else {
      this.main.showNotification('Aucune section à déplier trouvée', 'warning');
    }
    
    return result;
  }

  // Vérifier si une section spécifique est ouverte
  isSectionOpen(sectionName) {
    const sectionsData = this.findThotSEOSections();
    const section = sectionsData.find(s => s.section === sectionName);
    
    if (section && section.associatedDiv) {
      const display = window.getComputedStyle(section.associatedDiv).display;
      return display !== 'none';
    }
    
    return false;
  }

  // Déplier une section spécifique par nom
  async expandSpecificSection(sectionName) {
    this.main.logDebug(`=== DÉPLIAGE SPÉCIFIQUE: ${sectionName} ===`, 'warning');
    
    const sectionsData = this.findThotSEOSections();
    const targetSection = sectionsData.find(s => s.section === sectionName);
    
    if (!targetSection) {
      this.main.logDebug(`Section "${sectionName}" non trouvée`, 'error');
      return false;
    }
    
    const success = await this.expandSingleSection(
      targetSection.header, 
      targetSection.associatedDiv, 
      sectionName
    );
    
    this.main.logDebug(`Dépliage "${sectionName}": ${success ? 'succès' : 'échec'}`, success ? 'success' : 'error');
    return success;
  }
}

console.log('🔧 SectionExpander: Module chargé');