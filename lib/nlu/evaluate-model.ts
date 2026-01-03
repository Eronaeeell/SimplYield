// Evaluation script for NLU model
import { BaselineNLUModel } from './baseline-model';
import { ModelEvaluator } from './evaluator';
import { fullTrainingDataset, Intent } from './training-data';

// Split data into train/test sets
function trainTestSplit(data: any[], testRatio: number = 0.2) {
  const shuffled = [...data].sort(() => Math.random() - 0.5);
  const splitIndex = Math.floor(data.length * (1 - testRatio));
  
  return {
    train: shuffled.slice(0, splitIndex),
    test: shuffled.slice(splitIndex),
  };
}

// Run evaluation
function evaluateModel() {
  console.log('🚀 Starting NLU Model Evaluation\n');
  
  // Split dataset
  const { train, test } = trainTestSplit(fullTrainingDataset, 0.2);
  console.log(`📊 Dataset Split:`);
  console.log(`   Training: ${train.length} examples`);
  console.log(`   Testing:  ${test.length} examples`);
  console.log(`   Total:    ${fullTrainingDataset.length} examples\n`);
  
  // Train model
  console.log('🔄 Training model...');
  const model = new BaselineNLUModel();
  model.train(train);
  console.log('✅ Model trained successfully\n');
  
  // Make predictions
  console.log('🎯 Making predictions...');
  const predictions: Intent[] = [];
  const labels: Intent[] = [];
  
  test.forEach(example => {
    const predicted = model.predict(example.text);
    predictions.push(predicted);
    labels.push(example.intent as Intent);
  });
  console.log('✅ Predictions complete\n');
  
  // Evaluate
  console.log('📈 Calculating metrics...');
  const metrics = ModelEvaluator.evaluate(predictions, labels);
  
  // Display results
  console.log(ModelEvaluator.formatResults(metrics));
  
  // Additional insights
  console.log('\n🎓 Model Information:');
  console.log(`   Algorithm: Logistic Regression (One-vs-Rest)`);
  console.log(`   Features: TF-IDF Vectorization`);
  console.log(`   Training Examples: ${train.length}`);
  console.log(`   Test Examples: ${test.length}`);
  console.log(`   Number of Intents: ${metrics.perClassMetrics.size}`);
  
  return metrics;
}

// Run if called directly
if (require.main === module) {
  evaluateModel();
}

export { evaluateModel };
