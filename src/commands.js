const vscode = require('vscode');

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

module.exports = {
    insertCodeSnippet,
    insertUserTemplate,
    createUserCodeTemplate,
};
