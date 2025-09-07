import Fuse from 'fuse.js';

const keywords = {
  risk: ["risk", "risky", "danger", "threat", "unsafe", "hazard", "peril"],
  predict: ["predict", "prediction", "forecast", "estimate", "anticipate", "foresee"],
  invest: ["invest", "investment", "investing", "money", "finance", "portfolio", "stocks"],
  explain: ["explain", "explanation", "why", "how", "clarify", "describe", "elaborate"],
  help: ["help", "assist", "support", "guide", "aid", "advice"],
  hello: ["hello", "hi", "hey", "greetings", "hola", "bonjour", "good morning", "good evening", "good afternoon"],
  goodbye: ["bye", "goodbye", "farewell", "see you", "toodles", "exit", "good night", "later"]
};

const allKeywords = Object.values(keywords).flat();

const fuseOptions = {
  threshold: 0.6, 
  distance: 100,
  includeScore: true,
  keys: ['word']
};

const keywordData = allKeywords.map(word => ({ word }));
const fuse = new Fuse(keywordData, fuseOptions);

export function correctSpelling(input) {
  const words = input.toLowerCase().split(/\s+/);
  const correctedWords = [];

  words.forEach(word => {
    const results = fuse.search(word);
    if (results.length > 0 && results[0].score < 0.6) {
      correctedWords.push(results[0].item.word);
    } else {
      correctedWords.push(word);
    }
  });

  return correctedWords.join(' ');
}

export function detectIntent(message) {
  const correctedMessage = correctSpelling(message);
  const lowerMsg = correctedMessage.toLowerCase();

  for (const [intent, words] of Object.entries(keywords)) {
    if (words.some(word => lowerMsg.includes(word))) {
      return intent;
    }
  }

  return 'general';
}

export function getSuggestions(input) {
  const results = fuse.search(input);
  return results.slice(0, 3).map(result => result.item.word);
}