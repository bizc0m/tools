# LLM-ROX Prototype

Prototype statique pour valider l'UX avant l'enveloppe Electron.

## Ouvrir

Ouvrir `index.html` dans un navigateur.

## Ce qui est couvert

- Sidebar unique : les LLM remplacent la colonne app et deviennent racines d'outliner.
- Dossiers colores par categorie.
- Zone chat/webview simulee.
- Inspecteur `Capture / Prompts / Notes`.
- Bouton `Send to LLM` avec route clipboard + focus humain.
- Export Markdown simule avec cartouche YAML.
- Preferences workspace, heritage, skills, macros, exports.
- Macro demo : `..d`, `..dh`, `#Date`, `#DateHeure`, `#Projet`, `#LLM`, `#Compte`.

## Decision V1

Le Markdown est la source canonique.
Le PDF sera un rendu derive depuis Markdown via Electron `printToPDF`.
Le workspace local sera le dossier source de verite.
L'index SQLite/FTS eventuel sera reconstructible.

## Suite technique

1. Convertir cette preview en app React ou Svelte.
2. Ajouter Electron main process.
3. Utiliser `WebContentsView`, pas la balise `webview`.
4. Ajouter partitions par compte.
5. Ajouter file IO via IPC strict.
6. Ajouter export `.md`, `.pdf`, `.zip`.
7. Ajouter settings par niveau : global, projet, compte, chat.
