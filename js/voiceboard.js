// The public API for Voiceboard modules. Modules import it as 'voiceboard' through the page's import map:
//   import { apps, h, t } from 'voiceboard';
export { apps, effects } from './registry.js';
export { h, icon, appLink } from './dom.js';
export { t, num, lang, dir, addStrings } from './i18n.js';
export { text, lower, int, flag, list, names, players, slug, MAX_PLAYERS } from './params.js';
export { header, scoreStrip, verdict, answerCard, say, sharedScreens } from './screens.js';
