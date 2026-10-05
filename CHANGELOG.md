# Changelog

## [0.11.0](https://github.com/josephfusco/voiceboard/compare/v0.10.0...v0.11.0) (2026-10-05)


### Features

* a sayable /rules address that assistants read before hosting ([a6b1bb0](https://github.com/josephfusco/voiceboard/commit/a6b1bb0f0ef2c0b24b2f76ecf191ad73c75649e3))

## [0.10.0](https://github.com/josephfusco/voiceboard/compare/v0.9.0...v0.10.0) (2026-10-05)


### Features

* AAA contrast in every game, a chess board readable from the back seat, and a flat angular Cyber theme ([8958f1a](https://github.com/josephfusco/voiceboard/commit/8958f1a36851ef42fbecab195a6f381a6812af32))

## [0.9.0](https://github.com/josephfusco/voiceboard/compare/v0.8.0...v0.9.0) (2026-10-05)


### Features

* the default theme is called Classic; theme=classic replaces the old name, and saved choices fall back to it ([bb5cdca](https://github.com/josephfusco/voiceboard/commit/bb5cdcae0b4061e3c46a50e07bdaeaa4c75b3d52))

## [0.8.0](https://github.com/josephfusco/voiceboard/compare/v0.7.0...v0.8.0) (2026-10-05)


### Features

* Cyber theme refresh; theme and New game move into a ⋮ menu ([c035789](https://github.com/josephfusco/voiceboard/commit/c035789ca7474dedc4595c2b0dcf02f4485683b5))


### Performance Improvements

* insert-only URL log table, lighter heartbeat with backoff, short user agent in the log ([60820fa](https://github.com/josephfusco/voiceboard/commit/60820fa122b1ffe78db2523bfb9372700de93475))

## [0.7.0](https://github.com/josephfusco/voiceboard/compare/v0.6.0...v0.7.0) (2026-10-05)


### Features

* sidebar holds only system controls; games launch from Home; new adventure icon; screenshots show the live address ([5ab3d31](https://github.com/josephfusco/voiceboard/commit/5ab3d3123d69625e15f9e1cb7d3ec66e17336fd4))

## [0.6.0](https://github.com/josephfusco/voiceboard/compare/v0.5.0...v0.6.0) (2026-10-05)


### Features

* adventure module with characters, scene cards, and board-rolled dice ([4f44127](https://github.com/josephfusco/voiceboard/commit/4f44127a4fe8f5903136cba3c518ebd865a70126))
* auto-advance, recap page with QR code, and emailing the recap ([2ced19c](https://github.com/josephfusco/voiceboard/commit/2ced19c6347cc2d5a83644b4e34508e4b3abdf7c))
* chess undo, corrections, resign and draw results, captured pieces ([77f9f6a](https://github.com/josephfusco/voiceboard/commit/77f9f6a8d8c6bf53a8feb7ab4a3b6710c3f7c422))
* home fits every screen, chess fills the screen, every module tests itself ([676d2fe](https://github.com/josephfusco/voiceboard/commit/676d2fe69a7d683f7e5af7fc172421fc6a4ffc5c))

## [0.5.0](https://github.com/josephfusco/voiceboard/compare/v0.4.0...v0.5.0) (2026-10-04)


### Features

* behave like an app: no pinch or double-tap zoom, no bounce or long-press selection ([8914d99](https://github.com/josephfusco/voiceboard/commit/8914d99ff568e1e0c8430fb0258ab30c67ec6634))
* spoken chess moves, tap to see moves, and a full-game demo from a voice script ([bf6b0c1](https://github.com/josephfusco/voiceboard/commit/bf6b0c1bc7c6ef8e6936a2528e509ccd4c4287c1))


### Bug Fixes

* no scrollbars on load or on any car screen; manifest and theme color ([2cdc2c5](https://github.com/josephfusco/voiceboard/commit/2cdc2c533215042c4f7769e6eeaca52b93dbfea2))

## [0.4.0](https://github.com/josephfusco/voiceboard/compare/v0.3.0...v0.4.0) (2026-10-04)


### Features

* chess by voice, and version stamps that bust year-long asset caching ([5f4d563](https://github.com/josephfusco/voiceboard/commit/5f4d563df6fb55aa0c691d594c212a4a14f19a61))

## [0.3.0](https://github.com/josephfusco/voiceboard/compare/v0.2.0...v0.3.0) (2026-10-04)


### Features

* final-screen credit and GPL-3.0-or-later with attribution terms ([c984720](https://github.com/josephfusco/voiceboard/commit/c9847204c8ee04ae36d4691b39bea5a17448c839))
* pluggable core with every feature as a module in plugins/ ([696e64a](https://github.com/josephfusco/voiceboard/commit/696e64aad9ffae55d12a8874cb59354b68fb30db))
* sessions, transcript, URL log, presence, abilities, and turn-taking ([e930078](https://github.com/josephfusco/voiceboard/commit/e9300785acf72a7b8b13e8957cfaa2f3acdb1f86))


### Bug Fixes

* allow the host edge's injected bot-detection script; cache board HTML for 60s ([80112ab](https://github.com/josephfusco/voiceboard/commit/80112abc8244a6a59c774edb4e46e32a16142de6))
* block session takeover and session flooding; add security headers ([461c39a](https://github.com/josephfusco/voiceboard/commit/461c39ae1043ad1fa6a11794a3122912dcee1ab5))
* language applies per URL instead of sticking to the device ([3164cf8](https://github.com/josephfusco/voiceboard/commit/3164cf81c005f7b9cfed6c8a0bbf7ea4807919fe))
* plain browsing never creates sessions; check ownership before presence ([7e55ccd](https://github.com/josephfusco/voiceboard/commit/7e55ccde0de721e46e196464113ccc3e2024091c))

## [0.2.0](https://github.com/josephfusco/voiceboard/compare/v0.1.0...v0.2.0) (2026-10-03)


### Features

* board labels in nine languages with right-to-left layout ([dff3794](https://github.com/josephfusco/voiceboard/commit/dff379437b46ba3116aeb270fd5a6cb2479fbf63))
* Cyber theme with touch toggle, site theme, architecture doc, more examples ([8918609](https://github.com/josephfusco/voiceboard/commit/8918609ac4aab4227c05b6814e426f3b287fdfbb))
* dark site theme with a type scale, vertical rhythm, and reading-first defaults ([e81fd2b](https://github.com/josephfusco/voiceboard/commit/e81fd2b20e3dd5103c16fc924a5647d33eb4c9d2))
* host-aware board URLs and automated releases with release-please ([e97613e](https://github.com/josephfusco/voiceboard/commit/e97613ef6d21ab34be2123fa22991847c50fdc09))
* New game button with confirmation; document URL length limits ([29d17e0](https://github.com/josephfusco/voiceboard/commit/29d17e02c804d6017dac7fb65064afa3e61a6192))


### Bug Fixes

* hairline tables and a minimal footer in the site theme ([b622a8f](https://github.com/josephfusco/voiceboard/commit/b622a8fe12c1e6c4939136bc209124102099d7f5))
* keep header and footer links at their own size ([7b1397e](https://github.com/josephfusco/voiceboard/commit/7b1397ed12b824c2a4c7109842dd594a5379810c))
* out-of-range answers, root-path WordPress URLs, dimmed-choice contrast ([2e61c50](https://github.com/josephfusco/voiceboard/commit/2e61c5035112c7dbb5f275708abc82cf6f2aa1b4))
