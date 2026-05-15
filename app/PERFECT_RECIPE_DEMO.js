/**
 * FC 26 - Perfect Recipe Algorithm - Demo
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Démonstration et tests du système de Recette Parfaite
 * Cet outil génère les ratios faciaux optimaux et permet de scorer les visages
 */

const PerfectRecipeAlgorithm = require('./PERFECT_RECIPE_ALGORITHM');
const PRESETS_DB = require('./PRESETS_DB_v3'); // Assuming exports

/**
 * Initialise et génère la recette parfaite
 */
function initializePerfectRecipe() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('FC 26 - PERFECT RECIPE ALGORITHM');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  const algorithm = new PerfectRecipeAlgorithm(PRESETS_DB);

  // Génère la recette parfaite
  const perfectRecipe = algorithm.generatePerfectRecipe();

  console.log('📊 METADATA');
  console.log('───────────────────────────────────────────────────────────────────────────');
  console.log(`Algorithm: ${perfectRecipe.metadata.algorithm}`);
  console.log(`Presets Analyzed: ${perfectRecipe.metadata.presetsAnalyzed}`);
  console.log(`Generated At: ${perfectRecipe.metadata.generatedAt}`);
  console.log(`Methodology: ${perfectRecipe.metadata.methodology}\n`);

  // Affiche les ratios harmoniques
  console.log('💎 HARMONIC RATIOS (Proportions Clés)');
  console.log('───────────────────────────────────────────────────────────────────────────');
  Object.entries(perfectRecipe.harmonicRatios).forEach(([key, value]) => {
    const displayValue = typeof value === 'number' ? value.toFixed(3) : JSON.stringify(value);
    console.log(`  ${key}: ${displayValue}`);
  });
  console.log();

  // Affiche les recommandations
  console.log('✨ RECOMMENDATIONS');
  console.log('───────────────────────────────────────────────────────────────────────────');
  Object.entries(perfectRecipe.recommendations).forEach(([category, rec]) => {
    console.log(`\n  ${category.toUpperCase()}`);
    if (rec.description) console.log(`    Description: ${rec.description}`);
    if (rec.advice) console.log(`    Advice: ${rec.advice}`);
    if (rec.assessment) console.log(`    Assessment: ${rec.assessment}`);
    if (rec.harmonyScore) console.log(`    Harmony Score: ${rec.harmonyScore}%`);
    if (rec.recommendation) console.log(`    Recommendation: ${rec.recommendation}`);
  });
  console.log();

  // Affiche le scoring grid pour quelques caractéristiques
  console.log('📏 OPTIMAL PROPORTIONS (Sélection)');
  console.log('───────────────────────────────────────────────────────────────────────────');

  // Base proportions
  console.log('\n  BASE (Base du Visage)');
  const baseProportions = perfectRecipe.optimalProportions.base;
  console.log(`    Width  - Optimal: ${baseProportions.width.optimal.toFixed(3)}, StdDev: ${baseProportions.width.stdDev.toFixed(3)}`);
  console.log(`    Height - Optimal: ${baseProportions.height.optimal.toFixed(3)}, StdDev: ${baseProportions.height.stdDev.toFixed(3)}`);
  console.log(`    Volume - Optimal: ${baseProportions.volume.optimal.toFixed(3)}, StdDev: ${baseProportions.volume.stdDev.toFixed(3)}`);

  // Nose proportions
  console.log('\n  NEZ (Nose)');
  const noseProportions = perfectRecipe.optimalProportions.nez;
  Object.entries(noseProportions).forEach(([metric, data]) => {
    const consistency = (data.consistency * 100).toFixed(1);
    console.log(`    ${metric} - Optimal: ${data.optimal.toFixed(3)}, Consistency: ${consistency}%`);
  });

  // Eyes proportions
  console.log('\n  YEUX (Eyes)');
  const eyeProportions = perfectRecipe.optimalProportions.yeux;
  Object.entries(eyeProportions).forEach(([metric, data]) => {
    const consistency = (data.consistency * 100).toFixed(1);
    console.log(`    ${metric} - Optimal: ${data.optimal.toFixed(3)}, Consistency: ${consistency}%`);
  });

  // Mandible proportions
  console.log('\n  MACHOIRE (Mandible)');
  const mandibleProportions = perfectRecipe.optimalProportions.machoire;
  Object.entries(mandibleProportions).forEach(([metric, data]) => {
    const consistency = (data.consistency * 100).toFixed(1);
    console.log(`    ${metric} - Optimal: ${data.optimal.toFixed(3)}, Consistency: ${consistency}%`);
  });

  console.log('\n');

  // Score some presets
  console.log('🎯 PRESET SCORING');
  console.log('───────────────────────────────────────────────────────────────────────────');

  // Score top 5 presets
  const presetsToScore = [23, 175, 99, 116, 304];
  presetsToScore.forEach(presetId => {
    const preset = PRESETS_DB.find(p => p.preset_id === presetId);
    if (preset && preset.scanned_stats) {
      const score = algorithm.scorePreset(preset.scanned_stats);
      console.log(`\n  Preset #${presetId}`);
      console.log(`    Overall Score: ${(score.overallScore * 100).toFixed(1)}/100`);
      console.log(`    Assessment: ${score.assessment}`);
      console.log(`    Details:`);
      Object.entries(score.details).forEach(([feature, featureScore]) => {
        console.log(`      - ${feature}: ${(featureScore * 100).toFixed(1)}/100`);
      });
    }
  });

  console.log('\n\n═══════════════════════════════════════════════════════════════════════════');
  console.log('ℹ️  HOW TO USE');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log(`
// 1. Initiate the algorithm
const algorithm = new PerfectRecipeAlgorithm(PRESETS_DB);

// 2. Generate perfect recipe
const perfectRecipe = algorithm.generatePerfectRecipe();

// 3. Score a preset
const score = algorithm.scorePreset(presetStats);
console.log('Harmony Score:', score.overallScore);

// 4. Get recommendations
console.log(perfectRecipe.recommendations);

// 5. Access optimal proportions
console.log(perfectRecipe.optimalProportions);

// 6. Export as JSON
const jsonExport = algorithm.export();
  `);

  return algorithm;
}

/**
 * Analyse détaillée des inconsistances (outliers)
 */
function analyzeOutliers(algorithm) {
  console.log('\n\n═══════════════════════════════════════════════════════════════════════════');
  console.log('🔍 OUTLIER ANALYSIS');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  const recipe = algorithm.perfectRecipe || algorithm.generatePerfectRecipe();

  // Identify presets with unusual proportions
  const outliers = [];

  Object.keys(algorithm.scannedStats).forEach(presetId => {
    const stats = algorithm.scannedStats[presetId];
    const score = algorithm.scorePreset(stats);

    if (score.overallScore < 0.75) {
      outliers.push({
        presetId: parseInt(presetId),
        score: score.overallScore,
        assessment: score.assessment
      });
    }
  });

  // Sort by score and display
  outliers.sort((a, b) => a.score - b.score);

  console.log('Presets with proportions deviating from harmony:');
  outliers.forEach(outlier => {
    console.log(`  Preset #${outlier.presetId}: ${(outlier.score * 100).toFixed(1)}/100 - ${outlier.assessment}`);
  });
}

/**
 * Export la recette parfaite pour utilisation dans le système
 */
function exportPerfectRecipe(algorithm, filename = 'PERFECT_RECIPE.json') {
  const fs = require('fs');
  const path = require('path');

  if (!algorithm.perfectRecipe) {
    algorithm.generatePerfectRecipe();
  }

  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, JSON.stringify(algorithm.perfectRecipe, null, 2));

  console.log(`\n✅ Perfect Recipe exported to: ${filePath}`);
  return filePath;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && require.main === module) {
  try {
    const algorithm = initializePerfectRecipe();
    analyzeOutliers(algorithm);
    exportPerfectRecipe(algorithm);
  } catch (error) {
    console.error('Error running Perfect Recipe Algorithm:', error.message);
    console.error(error.stack);
  }
}

module.exports = {
  initializePerfectRecipe,
  analyzeOutliers,
  exportPerfectRecipe
};
