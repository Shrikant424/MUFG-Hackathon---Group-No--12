import { detectIntent, correctSpelling } from './utils/spellCorrection.js';

class MessageParser {
  constructor(actionProvider) {
    this.actionProvider = actionProvider;
  }

  extractStockSymbol(message) {
    const stockPatterns = [
     
      /\b([A-Z]{4,5})\b/g,
    
      /\$([A-Z]{4,5})\b/g,
 
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
    for (const [name, symbol] of Object.entries(stockMappings)) {
      if (message.toLowerCase().includes(name)) {
        return symbol;
      }
    }

    const matches = message.match(/\b([A-Z]{2,5})\b/g);
    if (matches) {
      return matches[0];
    }

    return null;
  }


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
        return years >= 1 && years <= 10 ? years : 2; 
      }
    }
    return 2; 
  }

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
    console.log("Parsing message:", message); // Debug log
    
    const correctedMessage = correctSpelling(message);
    const intent = detectIntent(correctedMessage);
    console.log("Intent:", intent); // Debug log

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
