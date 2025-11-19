// Evaluation script to test NLU models
import { BaselineNLUModel } from './baseline-model';
import { ModelEvaluator, RuleBasedEvaluator } from './evaluator';
import { fullTrainingDataset, TrainingExample, Intent } from './training-data';

// Split dataset into train and test
function splitDataset(
  data: TrainingExample[],
  testSize: number = 0.2
): { train: TrainingExample[]; test: TrainingExample[] } {
  // Shuffle data
  const shuffled = [...data].sort(() => Math.random() - 0.5);
  
  const splitIndex = Math.floor(shuffled.length * (1 - testSize));
  
  return {
    train: shuffled.slice(0, splitIndex),
    test: shuffled.slice(splitIndex),
  };
}

// Main evaluation function
export async function evaluateModels() {
  console.log('\n🔬 Starting Model Evaluation...\n');
  
  // Split dataset
  const { train, test } = splitDataset(fullTrainingDataset, 0.2);
  console.log(`📊 Dataset Split:`);
  console.log(`   Training: ${train.length} examples`);
  console.log(`   Testing:  ${test.length} examples\n`);
  
  // Train baseline model
  console.log('🎯 Training Baseline NLU Model...');
  const baselineModel = new BaselineNLUModel();
  baselineModel.train(train);
  console.log('✅ Baseline model trained\n');
  
  // Predict on test set - Baseline
  console.log('🔮 Running predictions - Baseline Model...');
  const baselineTestTexts = test.map(ex => ex.text);
  const baselineTestLabels = test.map(ex => ex.intent as Intent);
  const baselinePredictions = baselineModel.predictBatch(baselineTestTexts);
  console.log('✅ Baseline predictions complete\n');
  
  // Predict on test set - Rule-based
  console.log('🔮 Running predictions - Rule-based System...');
  const ruleBasedEvaluator = new RuleBasedEvaluator();
  const ruleBasedPredictions = ruleBasedEvaluator.predictBatch(baselineTestTexts);
  
  // Convert null predictions to 'EXPLAIN' (default fallback)
  const ruleBasedPredictionsFiltered = ruleBasedPredictions.map(
    pred => pred || 'EXPLAIN'
  ) as Intent[];
  console.log('✅ Rule-based predictions complete\n');
  
  // Evaluate baseline model
  console.log('📈 Evaluating Baseline Model...');
  const baselineMetrics = ModelEvaluator.evaluate(
    baselinePredictions,
    baselineTestLabels
  );
  console.log(ModelEvaluator.formatResults(baselineMetrics));
  
  // Evaluate rule-based system
  console.log('\n📈 Evaluating Rule-based System...');
  const ruleBasedMetrics = ModelEvaluator.evaluate(
    ruleBasedPredictionsFiltered,
    baselineTestLabels
  );
  console.log(ModelEvaluator.formatResults(ruleBasedMetrics));
  
  // Compare models
  console.log(
    ModelEvaluator.compareModels(
      ruleBasedMetrics,
      baselineMetrics,
      'Rule-based',
      'AI (Baseline)'
    )
  );
  
  // Additional insights
  console.log('\n💡 Key Insights:');
  const improvement = (baselineMetrics.accuracy - ruleBasedMetrics.accuracy) * 100;
  if (improvement > 0) {
    console.log(`✨ AI model shows ${improvement.toFixed(2)}% accuracy improvement over rules`);
  } else {
    console.log(`⚠️ Rule-based system performs ${Math.abs(improvement).toFixed(2)}% better`);
  }
  
  console.log(`🎯 Baseline F1 Score: ${(baselineMetrics.f1Score * 100).toFixed(2)}%`);
  console.log(`📏 Rule-based F1 Score: ${(ruleBasedMetrics.f1Score * 100).toFixed(2)}%`);
  
  return {
    baseline: baselineMetrics,
    ruleBased: ruleBasedMetrics,
    train,
    test,
  };
}

// Test with custom examples
export function testCustomExamples() {
  console.log('\n🧪 Testing Custom Examples...\n');
  
  const model = new BaselineNLUModel();
  model.train(fullTrainingDataset);
  
  const testCases = [
    "stake 2 sol in msol",
    "can you put 2 SOL into mSOL for me?",
    "pls send 1 sol to GZXs9Dy4GzPD3PYZ2pz6ggPYPjDYKE3fFMDVZ8ZdEJ3m",
    "i want to stake 5 native sol",
    "unstake 3 bsol please",
    "what is staking?",
    "show me my balance",
    "what's the price of sol",
    "stak 10 SOl to bsol", // with typos
    "unstke 2 msol pls", // with typo
  ];
  
  testCases.forEach(text => {
    const result = model.predictWithConfidence(text);
    console.log(`Input: "${text}"`);
    console.log(`  → Intent: ${result.intent} (${(result.confidence * 100).toFixed(1)}% confidence)\n`);
  });
}

// Export for use in other files
export { ModelEvaluator, RuleBasedEvaluator };
