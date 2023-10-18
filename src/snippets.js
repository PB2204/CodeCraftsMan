const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { loadCodeSnippets, loadUserTemplates, handlePlaceholders } = require('./commands');

// Function to insert a code snippet into the active document.
function insertCodeSnippet(language, snippetKey, variableMap) {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
        const codeSnippets = loadCodeSnippets();
        if (codeSnippets[language] && codeSnippets[language][snippetKey]) {
            const codeSnippet = codeSnippets[language][snippetKey];
            const codeToInsert = handlePlaceholders(codeSnippet, variableMap); // Pass variableMap to handlePlaceholders.
            editor.edit((editBuilder) => {
                editBuilder.insert(editor.selection.start, codeToInsert);
            });
        }
    }
}

module.exports = {
    insertCodeSnippet,
};
