// Evaluation metrics for NLU models
import { Intent } from './training-data';

export interface EvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: Map<Intent, Map<Intent, number>>;
  perClassMetrics: Map<Intent, {
    precision: number;
    recall: number;
    f1Score: number;
    support: number;
  }>;
}

export class ModelEvaluator {
  // Calculate accuracy
  static calculateAccuracy(predictions: Intent[], labels: Intent[]): number {
    if (predictions.length !== labels.length) {
      throw new Error('Predictions and labels must have the same length');
    }

    const correct = predictions.filter((pred, i) => pred === labels[i]).length;
    return correct / predictions.length;
  }

  // Build confusion matrix
  static buildConfusionMatrix(
    predictions: Intent[],
    labels: Intent[]
  ): Map<Intent, Map<Intent, number>> {
    const matrix = new Map<Intent, Map<Intent, number>>();
    const uniqueLabels = [...new Set([...predictions, ...labels])];

    // Initialize matrix
    uniqueLabels.forEach(label => {
      matrix.set(label, new Map());
      uniqueLabels.forEach(pred => {
        matrix.get(label)!.set(pred, 0);
      });
    });

    // Fill matrix
    predictions.forEach((pred, i) => {
      const actual = labels[i];
      const count = matrix.get(actual)!.get(pred)! + 1;
      matrix.get(actual)!.set(pred, count);
    });

    return matrix;
  }

  // Calculate precision, recall, F1 for a single class
  static calculateClassMetrics(
    confusionMatrix: Map<Intent, Map<Intent, number>>,
    targetClass: Intent
  ): { precision: number; recall: number; f1Score: number; support: number } {
    let truePositive = 0;
    let falsePositive = 0;
    let falseNegative = 0;
    let support = 0;

    // Calculate TP, FP, FN
    confusionMatrix.forEach((predictions, actualClass) => {
      predictions.forEach((count, predictedClass) => {
        if (actualClass === targetClass && predictedClass === targetClass) {
          truePositive += count;
        }
        if (actualClass !== targetClass && predictedClass === targetClass) {
          falsePositive += count;
        }
        if (actualClass === targetClass && predictedClass !== targetClass) {
          falseNegative += count;
        }
        if (actualClass === targetClass) {
          support += count;
        }
      });
    });

    const precision = truePositive + falsePositive > 0
      ? truePositive / (truePositive + falsePositive)
      : 0;
    
    const recall = truePositive + falseNegative > 0
      ? truePositive / (truePositive + falseNegative)
      : 0;
    
    const f1Score = precision + recall > 0
      ? 2 * (precision * recall) / (precision + recall)
      : 0;

    return { precision, recall, f1Score, support };
  }

  // Calculate macro-averaged metrics
  static calculateMacroMetrics(
    perClassMetrics: Map<Intent, { precision: number; recall: number; f1Score: number }>
  ): { precision: number; recall: number; f1Score: number } {
    let totalPrecision = 0;
    let totalRecall = 0;
    let totalF1 = 0;
    const numClasses = perClassMetrics.size;

    perClassMetrics.forEach(metrics => {
      totalPrecision += metrics.precision;
      totalRecall += metrics.recall;
      totalF1 += metrics.f1Score;
    });

    return {
      precision: totalPrecision / numClasses,
      recall: totalRecall / numClasses,
      f1Score: totalF1 / numClasses,
    };
  }

  // Comprehensive evaluation
  static evaluate(predictions: Intent[], labels: Intent[]): EvaluationMetrics {
    const accuracy = this.calculateAccuracy(predictions, labels);
    const confusionMatrix = this.buildConfusionMatrix(predictions, labels);
    const uniqueLabels = [...new Set(labels)];
    
    const perClassMetrics = new Map();
    uniqueLabels.forEach(label => {
      perClassMetrics.set(label, this.calculateClassMetrics(confusionMatrix, label));
    });

    const macroMetrics = this.calculateMacroMetrics(perClassMetrics);

    return {
      accuracy,
      precision: macroMetrics.precision,
      recall: macroMetrics.recall,
      f1Score: macroMetrics.f1Score,
      confusionMatrix,
      perClassMetrics,
    };
  }

  // Format evaluation results
  static formatResults(metrics: EvaluationMetrics): string {
    let output = '\n=== Evaluation Results ===\n\n';
    
    output += `Overall Metrics:\n`;
    output += `  Accuracy:  ${(metrics.accuracy * 100).toFixed(2)}%\n`;
    output += `  Precision: ${(metrics.precision * 100).toFixed(2)}%\n`;
    output += `  Recall:    ${(metrics.recall * 100).toFixed(2)}%\n`;
    output += `  F1 Score:  ${(metrics.f1Score * 100).toFixed(2)}%\n\n`;
    
    output += `Per-Class Metrics:\n`;
    metrics.perClassMetrics.forEach((classMetrics, intent) => {
      output += `\n  ${intent}:\n`;
      output += `    Precision: ${(classMetrics.precision * 100).toFixed(2)}%\n`;
      output += `    Recall:    ${(classMetrics.recall * 100).toFixed(2)}%\n`;
      output += `    F1 Score:  ${(classMetrics.f1Score * 100).toFixed(2)}%\n`;
      output += `    Support:   ${classMetrics.support}\n`;
    });
    
    output += `\nConfusion Matrix:\n`;
    const intents = Array.from(metrics.confusionMatrix.keys());
    
    // Header
    output += '\n  Actual \\ Predicted | ';
    intents.forEach(intent => {
      output += `${intent.substring(0, 8).padEnd(8)} | `;
    });
    output += '\n  ' + '-'.repeat(20 + intents.length * 11) + '\n';
    
    // Rows
    intents.forEach(actual => {
      output += `  ${actual.substring(0, 18).padEnd(18)} | `;
      intents.forEach(predicted => {
        const count = metrics.confusionMatrix.get(actual)?.get(predicted) || 0;
        output += `${count.toString().padEnd(8)} | `;
      });
      output += '\n';
    });
    
    return output;
  }

  // Compare two models
  static compareModels(
    model1Results: EvaluationMetrics,
    model2Results: EvaluationMetrics,
    model1Name: string = 'Model 1',
    model2Name: string = 'Model 2'
  ): string {
    let output = '\n=== Model Comparison ===\n\n';
    
    const metrics = ['accuracy', 'precision', 'recall', 'f1Score'] as const;
    const metricNames = ['Accuracy', 'Precision', 'Recall', 'F1 Score'];
    
    output += `Metric       | ${model1Name.padEnd(15)} | ${model2Name.padEnd(15)} | Improvement\n`;
    output += '-'.repeat(70) + '\n';
    
    metrics.forEach((metric, i) => {
      const val1 = model1Results[metric] * 100;
      const val2 = model2Results[metric] * 100;
      const diff = val2 - val1;
      const diffStr = diff >= 0 ? `+${diff.toFixed(2)}%` : `${diff.toFixed(2)}%`;
      
      output += `${metricNames[i].padEnd(12)} | `;
      output += `${val1.toFixed(2)}%`.padEnd(15) + ' | ';
      output += `${val2.toFixed(2)}%`.padEnd(15) + ' | ';
      output += diffStr + '\n';
    });
    
    return output;
  }
}

// Rule-based system evaluator (for comparison)
export class RuleBasedEvaluator {
  private stakeRegex = /^stake\s+(\d+(\.\d+)?)\s+(\w+)$/i;
  private unstakeRegex = /^unstake\s+(\d+(\.\d+)?)?\s*(\w+)?$/i;
  private sendRegex = /^send\s+(\d+(?:\.\d+)?)\s+sol\s+to\s+([a-zA-Z0-9]{32,44})$/i;

  predict(text: string): Intent | null {
    const lower = text.toLowerCase().trim();
    
    // Stake commands
    if (this.stakeRegex.test(lower)) {
      if (lower.includes('msol') || lower.includes('marinade')) return 'STAKE_MSOL';
      if (lower.includes('bsol') || lower.includes('blaze')) return 'STAKE_BSOL';
      return 'STAKE_NATIVE';
    }
    
    // Unstake commands
    if (this.unstakeRegex.test(lower)) {
      if (lower.includes('msol')) return 'UNSTAKE_MSOL';
      if (lower.includes('bsol')) return 'UNSTAKE_BSOL';
      return 'UNSTAKE_NATIVE';
    }
    
    // Send commands
    if (this.sendRegex.test(lower)) {
      return 'SEND';
    }
    
    // Balance
    if (lower.includes('balance')) return 'BALANCE';
    
    // Price
    if (lower.includes('price')) return 'PRICE';
    
    // Market data
    if (lower.includes('market')) return 'MARKET_DATA';
    
    // Explain
    if (lower.includes('what') || lower.includes('explain') || lower.includes('how')) {
      return 'EXPLAIN';
    }
    
    return null;
  }

  predictBatch(texts: string[]): (Intent | null)[] {
    return texts.map(text => this.predict(text));
  }
}
