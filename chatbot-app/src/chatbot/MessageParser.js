import { detectIntent, correctSpelling } from './utils/spellCorrection.js';

class MessageParser {
  constructor(actionProvider) {
    this.actionProvider = actionProvider;
  }

  // Extract stock symbols from message
  extractStockSymbol(message) {
    const stockPatterns = [
      // Common stock symbols (2-5 uppercase letters)
      /\b([A-Z]{2,5})\b/g,
      // Stock symbols with $ prefix
      /\$([A-Z]{2,5})\b/g,
      // Common stock names
      /\b(apple|aapl)\b/gi,
      /\b(google|googl|alphabet)\b/gi,
      /\b(microsoft|msft)\b/gi,
      /\b(tesla|tsla)\b/gi,
      /\b(amazon|amzn)\b/gi,
      /\b(meta|facebook|fb)\b/gi,
      /\b(nvidia|nvda)\b/gi,
      /\b(netflix|nflx)\b/gi,
    ];

    const stockMappings = {
      'apple': 'AAPL',
      'google': 'GOOGL',
      'alphabet': 'GOOGL',
      'microsoft': 'MSFT',
      'tesla': 'TSLA',
      'amazon': 'AMZN',
      'meta': 'META',
      'facebook': 'META',
      'fb': 'META',
      'nvidia': 'NVDA',
      'netflix': 'NFLX'
    };

    // First check for company names
    for (const [name, symbol] of Object.entries(stockMappings)) {
      if (message.toLowerCase().includes(name)) {
        return symbol;
      }
    }

    // Then check for stock symbol patterns
    const matches = message.match(/\b([A-Z]{2,5})\b/g);
    if (matches) {
      // Return the first match that looks like a stock symbol
      return matches[0];
    }

    return null;
  }

  // Extract years from message
  extractYears(message) {
    const yearPatterns = [
      /(\d+)\s*years?/i,
      /(\d+)\s*yr/i,
      /next\s*(\d+)/i,
      /for\s*(\d+)/i
    ];

    for (const pattern of yearPatterns) {
      const match = message.match(pattern);
      if (match) {
        const years = parseInt(match[1]);
        return years >= 1 && years <= 10 ? years : 2; // Default to 2 years if invalid
      }
    }
    return 2; // Default 2 years
  }

  // Check if message is asking for stock prediction
  isStockPredictionRequest(message) {
    const predictionKeywords = [
      'predict', 'prediction', 'forecast', 'price', 'stock', 'future',
      'trend', 'analysis', 'chart', 'graph', 'projection', 'estimate'
    ];

    return predictionKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  parse(message) {
    const correctedMessage = correctSpelling(message);
    
    // Check for stock prediction requests
    if (this.isStockPredictionRequest(message)) {
      const stockSymbol = this.extractStockSymbol(message);
      if (stockSymbol) {
        const years = this.extractYears(message);
        this.actionProvider.handleStockPrediction(stockSymbol, years);
        return;
      }
    }

    // Check if message contains a stock symbol even without prediction keywords
    const stockSymbol = this.extractStockSymbol(message);
    if (stockSymbol && message.length < 20) { // Short messages with stock symbols
      const years = this.extractYears(message);
      this.actionProvider.handleStockPrediction(stockSymbol, years);
      return;
    }

    // Original intent detection
    const intent = detectIntent(correctedMessage);

    switch (intent) {
      case 'risk':
      case 'predict':
      case 'invest':
      case 'help':
        this.actionProvider.handleRiskAnalysis(message);
        break;
      case 'explain':
        this.actionProvider.handleExplanation(message);
        break;
      case 'hello':
        this.actionProvider.helloChat();
        break;
      case 'goodbye':
        this.actionProvider.exitChat();
        break;
      default:
        this.actionProvider.handleRiskAnalysis(message);
        break;
    }
  }
}

export default MessageParser;
