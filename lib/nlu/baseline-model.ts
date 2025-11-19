// Baseline NLU Model using Logistic Regression with TF-IDF
import { TrainingExample, Intent, INTENTS } from './training-data';

// Simple TF-IDF implementation
class TfidfVectorizer {
  private vocabulary: Map<string, number> = new Map();
  private idf: Map<string, number> = new Map();
  private vocabSize: number = 0;

  // Tokenize text
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }

  // Build vocabulary and calculate IDF
  fit(documents: string[]): void {
    const docCount = documents.length;
    const termDocCount = new Map<string, number>();

    // Build vocabulary
    documents.forEach(doc => {
      const tokens = this.tokenize(doc);
      const uniqueTokens = new Set(tokens);

      uniqueTokens.forEach(token => {
        if (!this.vocabulary.has(token)) {
          this.vocabulary.set(token, this.vocabSize++);
        }
        termDocCount.set(token, (termDocCount.get(token) || 0) + 1);
      });
    });

    // Calculate IDF
    this.vocabulary.forEach((_, term) => {
      const df = termDocCount.get(term) || 1;
      this.idf.set(term, Math.log(docCount / df));
    });
  }

  // Transform text to TF-IDF vector
  transform(text: string): number[] {
    const vector = new Array(this.vocabSize).fill(0);
    const tokens = this.tokenize(text);
    const termFreq = new Map<string, number>();

    // Calculate term frequency
    tokens.forEach(token => {
      termFreq.set(token, (termFreq.get(token) || 0) + 1);
    });

    // Calculate TF-IDF
    termFreq.forEach((freq, term) => {
      const idx = this.vocabulary.get(term);
      if (idx !== undefined) {
        const tf = freq / tokens.length;
        const idf = this.idf.get(term) || 0;
        vector[idx] = tf * idf;
      }
    });

    return vector;
  }

  // Transform multiple documents
  fitTransform(documents: string[]): number[][] {
    this.fit(documents);
    return documents.map(doc => this.transform(doc));
  }
}

// Logistic Regression Classifier (One-vs-Rest for multiclass)
class LogisticRegression {
  private weights: Map<Intent, number[]> = new Map();
  private bias: Map<Intent, number> = new Map();
  private learningRate: number = 0.01;
  private epochs: number = 100;

  // Sigmoid function
  private sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-z));
  }

  // Dot product
  private dotProduct(a: number[], b: number[]): number {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
  }

  // Train on binary classification (one class vs rest)
  private trainBinary(
    X: number[][],
    y: number[],
    intent: Intent
  ): void {
    const n = X.length;
    const m = X[0].length;
    const w = new Array(m).fill(0);
    let b = 0;

    for (let epoch = 0; epoch < this.epochs; epoch++) {
      for (let i = 0; i < n; i++) {
        const z = this.dotProduct(w, X[i]) + b;
        const prediction = this.sigmoid(z);
        const error = y[i] - prediction;

        // Update weights
        for (let j = 0; j < m; j++) {
          w[j] += this.learningRate * error * X[i][j];
        }
        b += this.learningRate * error;
      }
    }

    this.weights.set(intent, w);
    this.bias.set(intent, b);
  }

  // Train multi-class classifier (One-vs-Rest)
  fit(X: number[][], y: Intent[]): void {
    const intents = [...new Set(y)];

    intents.forEach(intent => {
      const binaryY = y.map(label => (label === intent ? 1 : 0));
      this.trainBinary(X, binaryY, intent);
    });
  }

  // Predict probability for a single sample
  private predictProba(x: number[]): Map<Intent, number> {
    const probabilities = new Map<Intent, number>();

    this.weights.forEach((w, intent) => {
      const b = this.bias.get(intent) || 0;
      const z = this.dotProduct(w, x) + b;
      probabilities.set(intent, this.sigmoid(z));
    });

    return probabilities;
  }

  // Predict class for a single sample
  predict(x: number[]): Intent {
    const probabilities = this.predictProba(x);
    let maxProb = -1;
    let bestIntent: Intent = INTENTS.EXPLAIN;

    probabilities.forEach((prob, intent) => {
      if (prob > maxProb) {
        maxProb = prob;
        bestIntent = intent;
      }
    });

    return bestIntent;
  }

  // Predict for multiple samples
  predictBatch(X: number[][]): Intent[] {
    return X.map(x => this.predict(x));
  }

  // Get prediction with confidence
  predictWithConfidence(x: number[]): { intent: Intent; confidence: number } {
    const probabilities = this.predictProba(x);
    let maxProb = -1;
    let bestIntent: Intent = INTENTS.EXPLAIN;

    probabilities.forEach((prob, intent) => {
      if (prob > maxProb) {
        maxProb = prob;
        bestIntent = intent;
      }
    });

    return { intent: bestIntent, confidence: maxProb };
  }
}

// Baseline NLU Model
export class BaselineNLUModel {
  private vectorizer: TfidfVectorizer;
  private classifier: LogisticRegression;
  private isTrained: boolean = false;

  constructor() {
    this.vectorizer = new TfidfVectorizer();
    this.classifier = new LogisticRegression();
  }

  // Train the model
  train(examples: TrainingExample[]): void {
    const texts = examples.map(ex => ex.text);
    const labels = examples.map(ex => ex.intent as Intent);

    // Vectorize texts
    const X = this.vectorizer.fitTransform(texts);

    // Train classifier
    this.classifier.fit(X, labels);

    this.isTrained = true;
    console.log(`✅ Baseline model trained on ${examples.length} examples`);
  }

  // Predict intent
  predict(text: string): Intent {
    if (!this.isTrained) {
      throw new Error('Model not trained. Call train() first.');
    }

    const vector = this.vectorizer.transform(text);
    return this.classifier.predict(vector);
  }

  // Predict with confidence
  predictWithConfidence(text: string): { intent: Intent; confidence: number } {
    if (!this.isTrained) {
      throw new Error('Model not trained. Call train() first.');
    }

    const vector = this.vectorizer.transform(text);
    return this.classifier.predictWithConfidence(vector);
  }

  // Batch prediction
  predictBatch(texts: string[]): Intent[] {
    if (!this.isTrained) {
      throw new Error('Model not trained. Call train() first.');
    }

    const vectors = texts.map(text => this.vectorizer.transform(text));
    return this.classifier.predictBatch(vectors);
  }

  // Save model (for serialization)
  serialize(): string {
    return JSON.stringify({
      vectorizer: {
        vocabulary: Array.from(this.vectorizer['vocabulary'].entries()),
        idf: Array.from(this.vectorizer['idf'].entries()),
        vocabSize: this.vectorizer['vocabSize'],
      },
      classifier: {
        weights: Array.from(this.classifier['weights'].entries()).map(([k, v]) => [k, v]),
        bias: Array.from(this.classifier['bias'].entries()),
      },
    });
  }

  // Load model (for deserialization)
  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    
    this.vectorizer['vocabulary'] = new Map(parsed.vectorizer.vocabulary);
    this.vectorizer['idf'] = new Map(parsed.vectorizer.idf);
    this.vectorizer['vocabSize'] = parsed.vectorizer.vocabSize;
    
    this.classifier['weights'] = new Map(parsed.classifier.weights);
    this.classifier['bias'] = new Map(parsed.classifier.bias);
    
    this.isTrained = true;
  }
}
