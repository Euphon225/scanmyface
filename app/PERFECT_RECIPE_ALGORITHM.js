/**
 * FC 26 - Perfect Recipe Algorithm
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Algorithmique pour déterminer la "Recette Parfaite" - les ratios faciaux
 * optimaux en analysant les statistiques scannées de tous les presets.
 *
 * Cette approche utilise des analyses statistiques pour extraire les
 * proportions idéales d'une population de visages réputés harmonieux.
 */

class PerfectRecipeAlgorithm {
  constructor(presetsDB) {
    this.presetsDB = presetsDB;
    this.scannedStats = this.extractScannedStats();
    this.perfectRecipe = null;
  }

  /**
   * Extrait toutes les statistiques scannées des presets
   */
  extractScannedStats() {
    const stats = {};
    this.presetsDB.forEach(preset => {
      if (preset.scanned_stats) {
        stats[preset.preset_id] = preset.scanned_stats;
      }
    });
    return stats;
  }

  /**
   * Calcule la moyenne harmonique pour chaque caractéristique faciale
   * La moyenne harmonique est préférée car elle traite les proportions de manière plus équilibrée
   */
  calculateHarmonicMean(values) {
    if (!values || values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + (1 / val), 0);
    return values.length / sum;
  }

  /**
   * Calcule la médiane pour ignorer les valeurs extrêmes
   */
  calculateMedian(values) {
    if (!values || values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  /**
   * Calcule l'écart-type pour déterminer la consistance
   */
  calculateStdDev(values, mean) {
    if (!values || values.length === 0) return 0;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Analyse des proportions de la base du visage
   */
  analyzeBase() {
    const widths = Object.values(this.scannedStats).map(s => s.base?.width).filter(Boolean);
    const heights = Object.values(this.scannedStats).map(s => s.base?.height).filter(Boolean);
    const volumes = Object.values(this.scannedStats).map(s => s.base?.volume).filter(Boolean);

    return {
      width: {
        mean: widths.reduce((a, b) => a + b, 0) / widths.length,
        median: this.calculateMedian(widths),
        harmonic: this.calculateHarmonicMean(widths),
        stdDev: this.calculateStdDev(widths, widths.reduce((a, b) => a + b, 0) / widths.length),
        optimal: this.calculateMedian(widths) // Utilise la médiane comme valeur optimale
      },
      height: {
        mean: heights.reduce((a, b) => a + b, 0) / heights.length,
        median: this.calculateMedian(heights),
        harmonic: this.calculateHarmonicMean(heights),
        stdDev: this.calculateStdDev(heights, heights.reduce((a, b) => a + b, 0) / heights.length),
        optimal: this.calculateMedian(heights)
      },
      volume: {
        mean: volumes.reduce((a, b) => a + b, 0) / volumes.length,
        median: this.calculateMedian(volumes),
        harmonic: this.calculateHarmonicMean(volumes),
        stdDev: this.calculateStdDev(volumes, volumes.reduce((a, b) => a + b, 0) / volumes.length),
        optimal: this.calculateMedian(volumes)
      }
    };
  }

  /**
   * Analyse des proportions du nez (considéré comme un élément-clé de l'harmonie)
   */
  analyzeNose() {
    const widths = Object.values(this.scannedStats).map(s => s.nez?.width).filter(Boolean);
    const heights = Object.values(this.scannedStats).map(s => s.nez?.height).filter(Boolean);
    const projections = Object.values(this.scannedStats).map(s => s.nez?.projection).filter(Boolean);
    const volumes = Object.values(this.scannedStats).map(s => s.nez?.volume).filter(Boolean);
    const narines = Object.values(this.scannedStats).map(s => s.nez?.narine).filter(Boolean);

    return {
      width: {
        optimal: this.calculateMedian(widths),
        consistency: 1 - (this.calculateStdDev(widths, this.calculateMedian(widths)) / this.calculateMedian(widths))
      },
      height: {
        optimal: this.calculateMedian(heights),
        consistency: 1 - (this.calculateStdDev(heights, this.calculateMedian(heights)) / this.calculateMedian(heights))
      },
      projection: {
        optimal: this.calculateMedian(projections),
        consistency: 1 - (this.calculateStdDev(projections, this.calculateMedian(projections)) / this.calculateMedian(projections))
      },
      volume: {
        optimal: this.calculateMedian(volumes),
        consistency: 1 - (this.calculateStdDev(volumes, this.calculateMedian(volumes)) / this.calculateMedian(volumes))
      },
      narine: {
        optimal: this.calculateMedian(narines),
        consistency: 1 - (this.calculateStdDev(narines, this.calculateMedian(narines)) / this.calculateMedian(narines))
      }
    };
  }

  /**
   * Analyse des proportions des yeux
   */
  analyzeEyes() {
    const widths = Object.values(this.scannedStats).map(s => s.yeux?.width).filter(Boolean);
    const heights = Object.values(this.scannedStats).map(s => s.yeux?.height).filter(Boolean);
    const spacings = Object.values(this.scannedStats).map(s => s.yeux?.spacing).filter(Boolean);

    return {
      width: {
        optimal: this.calculateMedian(widths),
        consistency: 1 - (this.calculateStdDev(widths, this.calculateMedian(widths)) / this.calculateMedian(widths))
      },
      height: {
        optimal: this.calculateMedian(heights),
        consistency: 1 - (this.calculateStdDev(heights, this.calculateMedian(heights)) / this.calculateMedian(heights))
      },
      spacing: {
        optimal: this.calculateMedian(spacings),
        consistency: 1 - (this.calculateStdDev(spacings, this.calculateMedian(spacings)) / this.calculateMedian(spacings))
      }
    };
  }

  /**
   * Analyse des proportions de la mâchoire
   */
  analyzeMandible() {
    const widths = Object.values(this.scannedStats).map(s => s.machoire?.width).filter(Boolean);
    const heights = Object.values(this.scannedStats).map(s => s.machoire?.height).filter(Boolean);
    const angles = Object.values(this.scannedStats).map(s => s.machoire?.angle).filter(Boolean);

    return {
      width: {
        optimal: this.calculateMedian(widths),
        consistency: 1 - (this.calculateStdDev(widths, this.calculateMedian(widths)) / this.calculateMedian(widths))
      },
      height: {
        optimal: this.calculateMedian(heights),
        consistency: 1 - (this.calculateStdDev(heights, this.calculateMedian(heights)) / this.calculateMedian(heights))
      },
      angle: {
        optimal: this.calculateMedian(angles),
        consistency: 1 - (this.calculateStdDev(angles, this.calculateMedian(angles)) / this.calculateMedian(angles))
      }
    };
  }

  /**
   * Analyse complète de toutes les caractéristiques faciales
   */
  analyzeAllFeatures() {
    return {
      base: this.analyzeBase(),
      nez: this.analyzeNose(),
      yeux: this.analyzeEyes(),
      machoire: this.analyzeMandible(),
      joues: this.analyzeFeature('joues'),
      bouche: this.analyzeFeature('bouche'),
      sourcils: this.analyzeFeature('sourcils'),
      menton: this.analyzeFeature('menton'),
      front: this.analyzeFeature('front')
    };
  }

  /**
   * Analyse générique pour les caractéristiques simples
   */
  analyzeFeature(featureName) {
    const allValues = {};

    Object.values(this.scannedStats).forEach(stat => {
      const feature = stat[featureName];
      if (feature) {
        Object.entries(feature).forEach(([key, value]) => {
          if (typeof value === 'number') {
            if (!allValues[key]) allValues[key] = [];
            allValues[key].push(value);
          }
        });
      }
    });

    const result = {};
    Object.entries(allValues).forEach(([key, values]) => {
      result[key] = {
        optimal: this.calculateMedian(values),
        consistency: 1 - (this.calculateStdDev(values, this.calculateMedian(values)) / this.calculateMedian(values))
      };
    });

    return result;
  }

  /**
   * Calcule les ratios harmoniques clés
   */
  calculateHarmonicRatios() {
    const baseAnalysis = this.analyzeBase();
    const noseAnalysis = this.analyzeNose();
    const eyeAnalysis = this.analyzeEyes();
    const mandibleAnalysis = this.analyzeMandible();

    return {
      // Ratio largeur/hauteur de la base du visage
      facialWHRatio: baseAnalysis.width.optimal / baseAnalysis.height.optimal,

      // Ratio nez/base du visage
      noseToFaceRatio: noseAnalysis.width.optimal / baseAnalysis.width.optimal,

      // Ratio yeux/nez
      eyeToNoseRatio: eyeAnalysis.spacing.optimal / noseAnalysis.width.optimal,

      // Ratio mâchoire/face
      mandibleToFaceRatio: mandibleAnalysis.width.optimal / baseAnalysis.width.optimal,

      // Harmonie générale (moyenne des consistances)
      overallHarmony: this.calculateOverallHarmony()
    };
  }

  /**
   * Calcule l'harmonie générale
   */
  calculateOverallHarmony() {
    const features = this.analyzeAllFeatures();
    let totalConsistency = 0;
    let featureCount = 0;

    const processFeature = (feature) => {
      if (feature.consistency !== undefined) {
        totalConsistency += feature.consistency;
        featureCount++;
      } else {
        Object.values(feature).forEach(subFeature => {
          if (typeof subFeature === 'object' && subFeature.consistency !== undefined) {
            totalConsistency += subFeature.consistency;
            featureCount++;
          }
        });
      }
    };

    Object.values(features).forEach(feature => {
      if (typeof feature === 'object') {
        Object.values(feature).forEach(subFeature => {
          if (typeof subFeature === 'object') {
            processFeature(subFeature);
          }
        });
      }
    });

    return featureCount > 0 ? totalConsistency / featureCount : 0;
  }

  /**
   * Génère la recette parfaite complète
   */
  generatePerfectRecipe() {
    this.perfectRecipe = {
      metadata: {
        algorithm: "Perfect Recipe Algorithm v1.0",
        description: "Ratios faciaux optimaux basés sur l'analyse statistique des presets scannés",
        generatedAt: new Date().toISOString(),
        presetsAnalyzed: Object.keys(this.scannedStats).length,
        methodology: "Analyse de médiane avec calcul d'écart-type pour validation"
      },

      optimalProportions: this.analyzeAllFeatures(),
      harmonicRatios: this.calculateHarmonicRatios(),

      recommendations: this.generateRecommendations(),

      // Grille de scoring pour évaluer un nouveau visage
      scoringGrid: this.generateScoringGrid()
    };

    return this.perfectRecipe;
  }

  /**
   * Génère les recommandations basées sur l'analyse
   */
  generateRecommendations() {
    const ratios = this.calculateHarmonicRatios();

    return {
      faceShape: {
        targetWHRatio: ratios.facialWHRatio,
        description: `Ratio optimal largeur/hauteur du visage: ${(ratios.facialWHRatio * 100).toFixed(1)}%`,
        advice: ratios.facialWHRatio > 1 ?
          "Visage légèrement plus large que haut - équilibre harmonieux" :
          "Visage légèrement plus haut que large - harmonie classique"
      },

      noseHarmony: {
        targetNoseToFaceRatio: ratios.noseToFaceRatio,
        description: `Le nez représente environ ${(ratios.noseToFaceRatio * 100).toFixed(1)}% de la largeur du visage`,
        advice: "Taille du nez en proportion avec la structure faciale"
      },

      eyeHarmony: {
        targetEyeToNoseRatio: ratios.eyeToNoseRatio,
        description: `Espacement des yeux à ratio nez: ${ratios.eyeToNoseRatio.toFixed(2)}x`,
        advice: "Distance inter-oculaire optimale pour l'équilibre facial"
      },

      jawHarmony: {
        targetMandibleRatio: ratios.mandibleToFaceRatio,
        description: `Mâchoire représente ${(ratios.mandibleToFaceRatio * 100).toFixed(1)}% de la largeur du visage`,
        advice: "Largeur de mâchoire proportionnée à la structure globale"
      },

      overallAssessment: {
        harmonyScore: (ratios.overallHarmony * 100).toFixed(1),
        assessment: this.assessHarmony(ratios.overallHarmony),
        recommendation: "Utiliser ces métriques comme références pour optimiser la morphologie faciale"
      }
    };
  }

  /**
   * Évalue le niveau d'harmonie
   */
  assessHarmony(harmonyScore) {
    if (harmonyScore >= 0.9) return "Harmonie exceptionnelle";
    if (harmonyScore >= 0.8) return "Harmonie très bonne";
    if (harmonyScore >= 0.7) return "Harmonie satisfaisante";
    if (harmonyScore >= 0.6) return "Harmonie acceptable";
    return "Harmonie à améliorer";
  }

  /**
   * Génère une grille de scoring pour évaluer des proportions
   */
  generateScoringGrid() {
    const optimalProportions = this.analyzeAllFeatures();

    return {
      description: "Grille pour scorer les proportions faciales (0-100)",
      features: Object.entries(optimalProportions).reduce((acc, [featureName, analysis]) => {
        acc[featureName] = Object.entries(analysis).reduce((subAcc, [metric, data]) => {
          if (data.optimal !== undefined) {
            subAcc[metric] = {
              optimal: data.optimal,
              tolerance: data.consistency ? (data.consistency * 0.1) : 0.01, // ±10% de variation acceptable
              min: data.optimal * (1 - (data.consistency || 0.1) * 0.15),
              max: data.optimal * (1 + (data.consistency || 0.1) * 0.15)
            };
          }
          return subAcc;
        }, {});
        return acc;
      }, {})
    };
  }

  /**
   * Score un visage basé sur la recette parfaite
   */
  scorePreset(presetStats) {
    if (!this.perfectRecipe) {
      this.generatePerfectRecipe();
    }

    let totalScore = 0;
    let metricsEvaluated = 0;
    const details = {};

    // Évalue chaque caractéristique
    Object.entries(this.perfectRecipe.scoringGrid.features).forEach(([featureName, metrics]) => {
      if (presetStats[featureName]) {
        const featureScore = this.scoreFeature(presetStats[featureName], metrics);
        details[featureName] = featureScore.score;
        totalScore += featureScore.score;
        metricsEvaluated += featureScore.count;
      }
    });

    return {
      overallScore: metricsEvaluated > 0 ? totalScore / metricsEvaluated : 0,
      details: details,
      assessment: this.assessHarmony(totalScore / metricsEvaluated)
    };
  }

  /**
   * Score une seule caractéristique
   */
  scoreFeature(featureData, metrics) {
    let score = 0;
    let count = 0;

    Object.entries(metrics).forEach(([metric, gridData]) => {
      if (featureData[metric] !== undefined) {
        const value = featureData[metric];
        const distance = Math.abs(value - gridData.optimal) / gridData.optimal;

        if (distance <= gridData.tolerance) {
          score += 100; // Score parfait
        } else {
          // Score réduit basé sur la distance
          score += Math.max(0, 100 * (1 - distance / (gridData.tolerance * 5)));
        }
        count++;
      }
    });

    return {
      score: count > 0 ? score / count : 0,
      count: count
    };
  }

  /**
   * Export la recette parfaite au format JSON
   */
  export() {
    if (!this.perfectRecipe) {
      this.generatePerfectRecipe();
    }
    return JSON.stringify(this.perfectRecipe, null, 2);
  }
}

// Export pour utilisation dans l'application
module.exports = PerfectRecipeAlgorithm;
