# AI Tools

## MavKa Bot

URL : https://github.com/MozgAI/MavKa

Resume en 3 lignes :
MavKa est un bot IA personnel dans Telegram, auto-heberge sur ton ordinateur.
Il combine chat, voix, analyse d'images, recherche web, memoire persistante et agent de code local.
Il permet de choisir plusieurs fournisseurs IA comme DeepSeek, OpenAI, Claude, Kimi ou Groq.

Avantages principaux :
- Usage direct depuis Telegram.
- Installation rapide via script.
- Open source, licence MIT.
- Choix du fournisseur IA, donc moins de dependance a une seule plateforme.
- Cout potentiellement bas avec DeepSeek.
- Fonctions utiles : voix, vision, recherche web, memoire, actions sur fichiers locaux.

Reference future :
MavKa = assistant IA Telegram + terminal + memoire + multi-fournisseurs IA.

## Parallel Code

URL : https://github.com/johannesjo/parallel-code

Resume en 3 lignes :
Parallel Code permet de lancer plusieurs agents de code IA en parallele sur une meme base de code.
Il supporte Claude Code, Codex, Gemini et Copilot CLI.
Chaque agent travaille dans son propre git worktree pour comparer les resultats sans melanger les modifications.

Avantages principaux :
- Test rapide de plusieurs agents IA sur la meme tache.
- Isolation des changements avec git worktrees.
- Comparaison facile des solutions produites.
- Compatible avec plusieurs CLI IA populaires.
- Utile pour prototypage, refactor, correction de bug et benchmark d'agents.

Reference future :
Parallel Code = orchestration multi-agents IA + worktrees Git + comparaison de solutions.

## Claw Code

URL repo officiel : https://github.com/instructkr/claw-code
URL repo actuel : https://github.com/ultraworkers/claw-code
Site : https://claw-code.codes

Resume en 3 lignes :
Claw Code est un framework open source d'agent de code IA inspire de l'architecture Claude Code.
Le projet utilise principalement Rust, avec un CLI `claw` a compiler depuis les sources.
Il sert a tester, executer et structurer des workflows d'agent de code avec sessions, outils, permissions et MCP.

Avantages principaux :
- Open source et inspectable.
- Base Rust orientee performance.
- CLI local pour workflows d'agent de code.
- Documentation dediee : architecture, outils, commandes, memoire, permissions et MCP.
- Utile pour comprendre ou experimenter une architecture type Claude Code.

Reference future :
Claw Code = framework open source d'agent de code IA + CLI Rust + architecture type Claude Code.

## ClawBot Cloud

URL : https://cloud.clawbot.ai/?utm_source=clawcodes

Resume en 3 lignes :
ClawBot Cloud est une plateforme cloud pour deployer un agent OpenClaw sans maintenance locale.
L'agent est annonce comme disponible 24/7 et accessible depuis des plateformes de chat.
Le site propose un assistant de configuration avec choix automatique du modele, connexion d'un canal et deploiement.

Avantages principaux :
- Pas d'installation locale lourde.
- Agent cloud toujours en ligne.
- Configuration guidee en 3 etapes.
- Modeles integres : Claude, GPT, Gemini, Grok, Kimi, Qwen et autres.
- Utile pour tester OpenClaw rapidement sans gerer serveur, uptime ou maintenance.

Reference future :
ClawBot Cloud = version hebergee d'agent OpenClaw + 24/7 + zero maintenance locale.

## RTK - Rust Token Killer

URL site : https://www.rtk-ai.app/
URL repo : https://github.com/rtk-ai/rtk

Resume en 3 lignes :
RTK est un outil CLI open source en Rust qui compresse les sorties de commandes avant qu'elles entrent dans le contexte d'un agent IA.
Il reduit le bruit des commandes comme git status, git diff, grep, find, ls, pytest, cargo test ou npm test.
Il fonctionne avec Claude Code, Cursor, Aider, Gemini CLI, OpenAI Codex, Cline, Windsurf et GitHub Copilot.

Avantages principaux :
- Reduit fortement les tokens inutiles dans les sessions de coding IA.
- Ameliore la qualite du contexte donne au modele.
- Allonge les sessions avant saturation du contexte.
- Peut reduire les couts API sur les workflows tres CLI.
- Open source, MIT, local-first, sans compte ni cle API.
- Installation simple via Homebrew, script curl, Cargo ou binaires precompiles.

Reference future :
RTK = compresseur de sorties terminal pour agents IA + economie de tokens + meilleur contexte.

## CloakBrowser

URL : https://github.com/CloakHQ/CloakBrowser

Resume en 3 lignes :
CloakBrowser est un Chromium modifie au niveau source pour automatisation web stealth.
Il se presente comme remplacement Playwright/Puppeteer avec API proche et binaires auto-telecharges.
Il vise les tests d'automatisation, fingerprinting, profils persistants et compatibilite agents IA/browser automation.

Avantages principaux :
- Remplacement rapide de Playwright/Puppeteer.
- Patches Chromium source-level, pas seulement injection JS.
- Support Python et JavaScript.
- Profils persistants, proxy, timezone/locale.
- Utile pour tests anti-bot defensifs et QA d'automatisation, a utiliser legalement.

Reference future :
CloakBrowser = Chromium stealth + Playwright/Puppeteer drop-in + tests anti-detection.

## AiToEarn

URL : https://github.com/yikart/AiToEarn

Resume en 3 lignes :
AiToEarn est une collection de ressources autour de l'usage de l'IA pour creer des revenus.
Le repo sert surtout de repertoire d'idees, outils, workflows et opportunites IA.
Il est utile comme veille business IA plus que comme outil technique unique.

Avantages principaux :
- Source d'inspiration pour monetisation IA.
- Liste centralisee d'idees et ressources.
- Utile pour veille marche et brainstorming.
- Bon point de depart pour trouver des niches IA.
- A verifier au cas par cas avant investissement de temps ou argent.

Reference future :
AiToEarn = repertoire d'idees pour gagner avec l'IA + veille opportunites.

## agentmemory

URL : https://github.com/rohitg00/agentmemory

Resume en 3 lignes :
agentmemory fournit une memoire persistante pour agents de code IA.
L'objectif est de conserver contexte, decisions et preferences entre sessions.
Le projet cible les agents coding et se base sur des benchmarks d'usage reel.

Avantages principaux :
- Memoire persistante entre sessions.
- Meilleure continuite pour agents de code.
- Peut reduire les repetitions de contexte.
- Utile pour grands projets ou travail long.
- Oriente benchmarks et comparaison pratique.

Reference future :
agentmemory = memoire persistante pour agents coding + contexte long terme.

## UI-TARS Desktop

URL : https://github.com/bytedance/UI-TARS-desktop

Resume en 3 lignes :
UI-TARS Desktop est une stack open source d'agent IA multimodal pour ordinateur.
Elle relie modeles IA, perception d'interface et infrastructure agent pour agir sur des UI.
Le projet vise les workflows desktop ou l'agent observe, raisonne et interagit avec l'ecran.

Avantages principaux :
- Agent multimodal open source.
- Oriente controle d'interface graphique.
- Utile pour automatisation desktop.
- Base ByteDance, avec ambition stack complete.
- Bon candidat pour experimenter agents visuels.

Reference future :
UI-TARS Desktop = agent multimodal desktop + vision UI + automatisation ecran.

## 9Router

URL : https://github.com/decolua/9router

Resume en 3 lignes :
9Router est un routeur local/API pour connecter outils de coding IA a de nombreux fournisseurs et modeles.
Il supporte Claude Code, Codex, Cursor, Cline, Copilot, OpenClaw et autres via endpoint compatible.
Il ajoute fallback automatique, suivi de quotas et economie de tokens via RTK.

Avantages principaux :
- Centralise plusieurs fournisseurs IA.
- Fallback automatique si quota ou limite.
- Compatible avec beaucoup de CLI coding.
- Economie de tokens avec RTK.
- Dashboard local et endpoint OpenAI-compatible.

Reference future :
9Router = routeur IA multi-fournisseurs + fallback + economie tokens pour coding agents.

## DeepSeek-TUI

URL : https://github.com/Hmbown/DeepSeek-TUI

Resume en 3 lignes :
DeepSeek-TUI est un agent de code en terminal pour les modeles DeepSeek.
Il propose une interface TUI pour travailler dans le shell avec assistance IA.
Il est utile pour coding agent leger, local dans le terminal, centre sur DeepSeek.

Avantages principaux :
- Interface terminal simple.
- Oriente modeles DeepSeek.
- Utile pour coding agent sans IDE lourd.
- Bon pour workflows shell.
- Alternative specialisee aux gros assistants de code.

Reference future :
DeepSeek-TUI = agent coding terminal + DeepSeek + interface TUI.

## AI-Trader

URL : https://github.com/HKUDS/AI-Trader

Resume en 3 lignes :
AI-Trader est un projet de recherche/outil autour du trading automatise par agents IA.
Il vise des workflows agent-native pour analyse, decision et execution de trading.
Usage a traiter comme experimental et risque, pas comme conseil financier.

Avantages principaux :
- Exemple d'architecture agentique appliquee au trading.
- Utile pour recherche, backtesting et experimentation.
- Montre comment structurer decisions et actions de marche.
- Peut inspirer des agents financiers internes.
- Attention forte : risque financier, validation et conformite obligatoires.

Reference future :
AI-Trader = agent IA de trading automatise + recherche + risque eleve.

## Skills by Matt Pocock

URL : https://github.com/mattpocock/skills

Resume en 3 lignes :
Ce repo contient des skills pratiques pour ingenieurs, issus d'une configuration Claude.
Il sert de bibliotheque de procedures et prompts reutilisables pour developpement logiciel.
Il est utile pour standardiser la maniere dont un agent IA execute certaines taches techniques.

Avantages principaux :
- Skills prets a adapter.
- Oriente pratiques d'ingenierie reelles.
- Bon modele pour creer ses propres skills.
- Ameliore coherence des workflows agents.
- Utile avec Claude Code et autres agents compatibles skills.

Reference future :
Skills = bibliotheque de workflows/prompts techniques pour agents IA.

## SuperSplat

URL : https://github.com/playcanvas/supersplat
Demo : https://superspl.at/editor

Resume en 3 lignes :
SuperSplat est un editeur open source de 3D Gaussian Splats.
Il permet d'inspecter, editer, optimiser et publier des scenes 3D splat dans le navigateur.
Il est construit avec des technologies web et peut etre utilise sans installation via la demo.

Avantages principaux :
- Editeur 3DGS gratuit et open source.
- Fonctionne dans le navigateur.
- Utile pour visualisation, nettoyage et optimisation de splats.
- Base PlayCanvas, WebGL/WebGPU.
- Bon outil pour pipelines IA 3D, scan, photogrammetrie et scenes immersives.

Reference future :
SuperSplat = editeur web 3D Gaussian Splat + optimisation + publication.

## Hysteria

URL : https://github.com/apernet/hysteria

Resume en 3 lignes :
Hysteria est un proxy rapide et resistant a la censure.
Le projet vise les connexions reseau performantes dans des environnements contraints.
Il peut servir d'infrastructure proxy pour developpement, reseau ou acces distant legitime.

Avantages principaux :
- Proxy performant.
- Oriente resistance aux restrictions reseau.
- Projet mature et tres suivi.
- Utile pour infrastructure, tests reseau et acces distant.
- A utiliser selon les lois et politiques reseau applicables.

Reference future :
Hysteria = proxy rapide + resistance censure + infrastructure reseau.
