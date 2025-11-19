// Main NLU Service - integrates all components
import { BaselineNLUModel } from './baseline-model';
import { extractEntities, validateEntities, getMissingEntitiesMessage, ExtractedEntities } from './entity-extractor';
import { Intent, INTENTS, fullTrainingDataset } from './training-data';

export interface NLUResult {
  intent: Intent;
  confidence: number;
  entities: ExtractedEntities;
  valid: boolean;
  errorMessage?: string;
  originalText: string;
}

export class NLUService {
  private model: BaselineNLUModel;
  private isInitialized: boolean = false;

  constructor() {
    this.model = new BaselineNLUModel();
  }

  // Initialize and train the model
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ NLU Service already initialized');
      return;
    }

    console.log('🚀 Initializing NLU Service...');
    console.log(`📊 Training dataset size: ${fullTrainingDataset.length} examples`);
    
    // Train the model
    this.model.train(fullTrainingDataset);
    
    this.isInitialized = true;
    console.log('✅ NLU Service initialized successfully');
  }

  // Process user input
  async processInput(text: string): Promise<NLUResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Get intent prediction with confidence
    const { intent, confidence } = this.model.predictWithConfidence(text);

    // Extract entities
    const entities = extractEntities(text);

    // Validate entities
    const validation = validateEntities(intent, entities);

    // Build result
    const result: NLUResult = {
      intent,
      confidence,
      entities,
      valid: validation.valid,
      originalText: text,
    };

      // Add error message if validation failed
    if (!validation.valid) {
      result.errorMessage = getMissingEntitiesMessage(intent, validation.missing, text);
    }    return result;
  }

  // Batch processing
  async processBatch(texts: string[]): Promise<NLUResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return Promise.all(texts.map(text => this.processInput(text)));
  }

  // Get model info
  getModelInfo(): { initialized: boolean; modelType: string } {
    return {
      initialized: this.isInitialized,
      modelType: 'Baseline (Logistic Regression + TF-IDF)',
    };
  }

  // Re-initialize (useful for hot-reloading)
  async reinitialize(): Promise<void> {
    this.isInitialized = false;
    await this.initialize();
  }
}

// Singleton instance
let nluServiceInstance: NLUService | null = null;

export const getNLUService = (): NLUService => {
  if (!nluServiceInstance) {
    nluServiceInstance = new NLUService();
  }
  return nluServiceInstance;
};

// Helper function to format NLU result for display
export const formatNLUResult = (result: NLUResult): string => {
  let output = `🎯 Intent: ${result.intent} (${(result.confidence * 100).toFixed(1)}% confidence)\n`;
  
  if (Object.keys(result.entities).length > 0) {
    output += `📦 Entities:\n`;
    if (result.entities.amount) output += `  • Amount: ${result.entities.amount}\n`;
    if (result.entities.token) output += `  • Token: ${result.entities.token}\n`;
    if (result.entities.address) output += `  • Address: ${result.entities.address}\n`;
    if (result.entities.duration) output += `  • Duration: ${result.entities.duration}\n`;
    if (result.entities.risk_level) output += `  • Risk Level: ${result.entities.risk_level}\n`;
  }
  
  output += `✓ Valid: ${result.valid ? 'Yes' : 'No'}`;
  
  if (result.errorMessage) {
    output += `\n⚠️ ${result.errorMessage}`;
  }
  
  return output;
};

// Export types
export type { Intent, ExtractedEntities };
export { INTENTS };
