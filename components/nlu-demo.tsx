"use client"

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getNLUService, formatNLUResult } from '@/lib/nlu/nlu-service'
import { Brain, Sparkles, Target, CheckCircle, XCircle } from 'lucide-react'

export function NLUDemo() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const nluService = getNLUService()

  const testExamples = [
    "stake 5 sol to msol",
    "can you put 2 SOL into bSOL for me?",
    "pls send 1 sol to GZXs9Dy4GzPD3PYZ2pz6ggPYPjDYKE3fFMDVZ8ZdEJ3m",
    "i wanna unstake 3 bsol",
    "what's my balance",
    "stak 10 SOl", // with typo
  ]

  const handleProcess = async () => {
    if (!input.trim()) return
    
    setIsProcessing(true)
    try {
      await nluService.initialize()
      const nluResult = await nluService.processInput(input)
      setResult(nluResult)
    } catch (error) {
      console.error('NLU error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return 'bg-green-500'
    if (confidence >= 0.7) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-900/95 to-gray-800/95 border-gray-700">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-6 w-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">NLU Demo</h2>
          <Badge variant="outline" className="ml-auto">
            AI-Powered
          </Badge>
        </div>

        <p className="text-gray-400 text-sm">
          Test the Natural Language Understanding system. Try typing naturally or with typos!
        </p>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
            placeholder="Type a command (e.g., stake 5 sol to msol)..."
            className="flex-1 bg-gray-800 border-gray-600 text-white"
          />
          <Button
            onClick={handleProcess}
            disabled={!input.trim() || isProcessing}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isProcessing ? 'Processing...' : 'Analyze'}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-400">Quick tests:</span>
          {testExamples.map((example, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => setInput(example)}
              className="text-xs border-gray-600 hover:border-purple-500"
            >
              {example}
            </Button>
          ))}
        </div>

        {result && (
          <Card className="p-4 bg-gray-800/50 border-gray-700 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-400" />
                <span className="text-white font-semibold">Intent:</span>
                <Badge className="bg-purple-600">{result.intent}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-24 rounded-full overflow-hidden bg-gray-700`}
                >
                  <div
                    className={`h-full ${getConfidenceColor(result.confidence)}`}
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">
                  {(result.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {Object.keys(result.entities).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span className="text-white text-sm font-semibold">Entities:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {result.entities.amount && (
                    <div className="bg-gray-700/50 rounded px-3 py-2">
                      <span className="text-xs text-gray-400">Amount</span>
                      <p className="text-white font-mono">{result.entities.amount}</p>
                    </div>
                  )}
                  {result.entities.token && (
                    <div className="bg-gray-700/50 rounded px-3 py-2">
                      <span className="text-xs text-gray-400">Token</span>
                      <p className="text-white font-mono">{result.entities.token}</p>
                    </div>
                  )}
                  {result.entities.address && (
                    <div className="bg-gray-700/50 rounded px-3 py-2 col-span-2">
                      <span className="text-xs text-gray-400">Address</span>
                      <p className="text-white font-mono text-xs truncate">
                        {result.entities.address}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
              {result.valid ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-green-400 text-sm">Valid command</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-yellow-400" />
                  <span className="text-yellow-400 text-sm">{result.errorMessage}</span>
                </>
              )}
            </div>
          </Card>
        )}

        <div className="pt-4 border-t border-gray-700">
          <h3 className="text-sm font-semibold text-white mb-2">How it works:</h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• <strong>Intent Classification:</strong> AI determines what you want to do</li>
            <li>• <strong>Entity Extraction:</strong> Extracts amounts, tokens, addresses</li>
            <li>• <strong>Typo Handling:</strong> Understands "stak", "unstke", etc.</li>
            <li>• <strong>Natural Language:</strong> "can you", "i wanna", "please"</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}
