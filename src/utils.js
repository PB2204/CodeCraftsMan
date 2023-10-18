const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

// Function to load code snippets from language-specific JSON files.
function loadCodeSnippets() {
    const snippets = {};

    // Define the path to the directory where your language-specific JSON snippet files are stored.
    const snippetDirectory = path.join(__dirname, 'config', 'codeSnippets');

    // List of supported languages and their corresponding snippet file names.
    const supportedLanguages = {
        javascript: 'javascript.json',
        python: 'python.json',
        java: 'java.json',
        cpp: 'cpp.json',
        // Add more languages and file names as needed.
    };

    // Iterate through the supported languages and load their snippet files.
    for (const language in supportedLanguages) {
        const snippetFileName = supportedLanguages[language];
        const snippetFilePath = path.join(snippetDirectory, snippetFileName);

        if (fs.existsSync(snippetFilePath)) {
            // Load and parse the JSON snippet file for the current language.
            const snippetData = JSON.parse(fs.readFileSync(snippetFilePath, 'utf8'));
            snippets[language] = snippetData;
        }
    }

    return snippets;
}

module.exports = {
    loadCodeSnippets,
};
