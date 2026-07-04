export type Locale = 'en' | 'es' | 'pt';

export type ToolId = 'ahorcado';

export type TranslationDict = {
  siteTitle: string;
  siteTagline: string;
  home: string;
  language: string;
  allRightsReserved: string;
  ahorcado: {
    siteTitle: string;
    siteTagline: string;
    category: string;
    newGame: string;
    guess: string;
    wrongGuesses: string;
    youWon: string;
    youLost: string;
    wordWas: string;
    remaining: string;
    hint: string;
    lettersUsed: string;
    categories: {
      animales: string;
      comidas: string;
      paises: string;
      ciudades: string;
      naturaleza: string;
    };
  };
};
