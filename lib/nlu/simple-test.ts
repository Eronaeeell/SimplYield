// Simple NLU Test Script
import { BaselineNLUModel } from './baseline-model';
import { fullTrainingDataset } from './training-data';
import { extractEntities } from './entity-extractor';

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║        SimplYield NLU Model Test                           ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Train model
console.log('🚀 Training model...');
const model = new BaselineNLUModel();
model.train(fullTrainingDataset);
console.log(`✅ Model trained on ${fullTrainingDataset.length} examples\n`);

// Test cases
console.log('🧪 Testing Natural Language Inputs:\n');
console.log('─'.repeat(60));

const testCases = [
  "stake 5 sol to msol",
  "can you stake 5 sol to msol for me?",
  "please stake marinade for me",
  "can we do 0.1 marinade",
  "i wanna unstake 3 bsol",
  "send 1 sol to GZXs9Dy4GzPD3PYZ2pz6ggPYPjDYKE3fFMDVZ8ZdEJ3m",
  "what's my balance",
  "stak 10 SOl", // typo
  "unstke 2 msol", // typo
  "pls stake 5 to blazestake",
];

testCases.forEach((text, i) => {
  const result = model.predictWithConfidence(text);
  const entities = extractEntities(text);
  
  console.log(`\n${i + 1}. Input: "${text}"`);
  console.log(`   Intent: ${result.intent}`);
  console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
  
  if (Object.keys(entities).length > 0) {
    console.log(`   Entities:`);
    if (entities.amount) console.log(`     • Amount: ${entities.amount}`);
    if (entities.token) console.log(`     • Token: ${entities.token}`);
    if (entities.address) console.log(`     • Address: ${entities.address.substring(0, 8)}...`);
  }
});

console.log('\n' + '─'.repeat(60));
console.log('\n✅ All tests complete!\n');

// Quick stats
console.log('📊 Model Statistics:');
console.log(`   Training Examples: ${fullTrainingDataset.length}`);
console.log(`   Supported Intents: 11`);
console.log(`   Model Type: Logistic Regression + TF-IDF\n`);
