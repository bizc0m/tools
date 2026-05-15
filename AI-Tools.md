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
