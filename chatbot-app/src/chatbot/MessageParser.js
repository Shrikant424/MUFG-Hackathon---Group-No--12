import { detectIntent, correctSpelling } from './utils/spellCorrection.js';

class MessageParser {
  constructor(actionProvider) {
    this.actionProvider = actionProvider;
  }

  parse(message) {
    const correctedMessage = correctSpelling(message);
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
