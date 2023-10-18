const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

// Language detection and context analysis logic.
function detectLanguageAndContext() {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
        const document = editor.document;
        const code = document.getText();

        // Define regular expressions or patterns to identify common keywords or constructs for each supported language.
        const javascriptPattern = /function|var|const|let|if|else|for|while/g;
        const pythonPattern = /def|if|elif|else|for|while/g;
        const javaPattern = /class|public|private|protected|void|if|else|for|while/g;
        // Add more patterns for other supported languages.
        // Use regular expressions to match keywords or constructs in the code.
        if (javascriptPattern.test(code)) {
            return 'javascript';
        } else if (pythonPattern.test(code)) {
            return 'python';
        } else if (javaPattern.test(code)) {
            return 'java';
        }
        // Add more checks for other languages.
    }

    return 'unknown'; // Return 'unknown' if the language cannot be determined.
}


// Placeholder handling logic.
function handlePlaceholders(codeSnippet, variableMap) {
    // Split the code snippet into lines.
    const lines = codeSnippet.split('\n');

    // Define a regular expression pattern to match placeholders enclosed in curly braces, e.g., {variableName}.
    const placeholderPattern = /{([^}]+)}/g;

    // Iterate through each line of the code snippet.
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Use a regular expression to find all placeholders in the line.
        const placeholders = line.match(placeholderPattern);

        if (placeholders) {
            // Iterate through the found placeholders.
            for (let j = 0; j < placeholders.length; j++) {
                const placeholder = placeholders[j];
                const variableName = placeholder.slice(1, -1); // Remove curly braces.

                // Check if the variableMap contains a value for the variable.
                if (variableMap[variableName]) {
                    // Replace the placeholder with the corresponding value.
                    line = line.replace(placeholder, variableMap[variableName]);
                }
            }
        }

        // Update the line with placeholder replacements.
        lines[i] = line;
    }

    // Join the lines to reconstruct the modified code snippet.
    return lines.join('\n');
}


// Load code snippets from language-specific JSON files.
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

// Load user-defined code templates.
function loadUserTemplates() {
    let userTemplates = {};

    // Define the path to the JSON file where user-defined code templates are stored.
    const userTemplatesFilePath = path.join(__dirname, 'config', 'userTemplates.json');

    if (fs.existsSync(userTemplatesFilePath)) {
        // Read and parse the JSON file containing user-defined code templates.
        const fileContents = fs.readFileSync(userTemplatesFilePath, 'utf8');

        try {
            userTemplates = JSON.parse(fileContents);
        } catch (error) {
            console.error('Error parsing user templates JSON:', error);
        }
    }

    return userTemplates;
}

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

// Function to insert a user-defined code template into the active document.
function insertUserTemplate(templateName, variableMap) {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
        const userTemplates = loadUserTemplates();
        if (userTemplates[templateName]) {
            const codeTemplate = userTemplates[templateName];
            const codeToInsert = handlePlaceholders(codeTemplate, variableMap); // Pass variableMap to handlePlaceholders.
            editor.edit((editBuilder) => {
                editBuilder.insert(editor.selection.start, codeToInsert);
            });
        }
    }
}

// Function to create a user-defined code template.
function createUserCodeTemplate() {
    // Prompt the user to enter a template name.
    vscode.window.showInputBox({ prompt: 'Enter a name for the template' }).then((templateName) => {
        if (!templateName) {
            // User canceled or entered an empty name.
            return;
        }

        // Prompt the user to enter the code template.
        vscode.window.showInputBox({ prompt: 'Enter the code template' }).then((templateCode) => {
            if (!templateCode) {
                // User canceled or entered an empty code template.
                return;
            }

            // Load existing user-defined code templates.
            let userTemplates = loadUserTemplates();

            // Add the new user-defined code template to the object.
            userTemplates[templateName] = templateCode;

            // Define the path to the JSON file where user-defined code templates are stored.
            const userTemplatesFilePath = path.join(__dirname, 'config', 'userTemplates.json');

            // Write the updated user-defined templates object to the JSON file.
            fs.writeFileSync(userTemplatesFilePath, JSON.stringify(userTemplates, null, 4), 'utf8');

            vscode.window.showInformationMessage(`User-defined template '${templateName}' has been created and saved.`);
        });
    });
}
// Register commands for your extension.
function activate(context) {
    const disposableInsertSnippet = vscode.commands.registerCommand('extension.insertCodeSnippet', () => {
        const language = detectLanguageAndContext();
        if (language) {
            // Retrieve code snippets based on the detected language.
            const codeSnippets = loadCodeSnippets();
            if (codeSnippets[language]) {
                // Prompt the user to select a code snippet.
                vscode.window.showQuickPick(Object.keys(codeSnippets[language])).then((snippetKey) => {
                    if (snippetKey) {
                        insertCodeSnippet(language, snippetKey);
                    }
                });
            } else {
                vscode.window.showErrorMessage(`No code snippets available for ${language}.`);
            }
        } else {
            vscode.window.showErrorMessage('Unable to detect the programming language.');
        }
    });

    const disposableInsertUserTemplate = vscode.commands.registerCommand('extension.insertUserTemplate', () => {
        // Load user-defined code templates.
        const userTemplates = loadUserTemplates();
        if (Object.keys(userTemplates).length === 0) {
            vscode.window.showWarningMessage('No user-defined code templates available.');
        } else {
            // Prompt the user to select a user-defined code template.
            vscode.window.showQuickPick(Object.keys(userTemplates)).then((templateName) => {
                if (templateName) {
                    insertUserTemplate(templateName);
                }
            });
        }
    });

    const disposableCreateUserTemplate = vscode.commands.registerCommand('extension.createUserCodeTemplate', () => {
        createUserCodeTemplate();
    });

    context.subscriptions.push(disposableInsertSnippet);
    context.subscriptions.push(disposableInsertUserTemplate);
    context.subscriptions.push(disposableCreateUserTemplate);
}

module.exports = {
    activate
};
