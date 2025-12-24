import * as vscode from "vscode";
import fs from "fs";
import path from "path";
import degit from "degit";
import { FormPanel, FormDefinition } from "../utils/formSystem";

export default async function (context?: any) {
  if (!context) {
    vscode.window.showErrorMessage('Extension context not available');
    return;
  }

  // Helper function to convert to snake_case
  const toSnakeCase = (str: string) => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  // Get preferred folder from settings
  let rootPath: string = vscode.workspace
    .getConfiguration("cawExtension")
    .get("preferredFolderPath");

  if (!rootPath || !fs.existsSync(rootPath)) {
    // open folder picker
    let folder = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectFiles: false,
      canSelectMany: false,
      openLabel: "Select",
    });

    if (!folder) {
      return;
    }

    rootPath = folder[0].fsPath;

    // ask user to save preferred folder
    let savePreferredFolder = await vscode.window.showQuickPick(["Yes", "No"], {
      placeHolder: "Save this folder as preferred?",
    });

    if (savePreferredFolder === "Yes") {
      vscode.workspace
        .getConfiguration("cawExtension")
        .update("preferredFolderPath", rootPath, true);
    }
  }

  // Get last used author name from settings
  const lastAuthor = vscode.workspace
    .getConfiguration("cawExtension")
    .get<string>("lastAuthorName", "");

  // Create the form definition
  const scaffoldForm: FormDefinition = {
    id: 'scaffoldProject',
    title: 'Construct Addon Wizard',
    description: 'Create a new Construct 3 addon project',
    steps: [
      {
        id: 'basic',
        title: 'Basic Information',
        description: 'Provide basic information about your addon',
        fields: [
          {
            id: 'addonName',
            label: 'Addon Name',
            type: 'text',
            required: true,
            placeholder: 'My Awesome Addon',
            description: 'The display name of your addon'
          },
          {
            id: 'author',
            label: 'Author',
            type: 'text',
            required: true,
            placeholder: 'Your Name',
            defaultValue: lastAuthor,
            description: 'Your name or organization'
          },
          {
            id: 'id',
            label: 'Addon ID',
            type: 'text',
            required: true,
            placeholder: 'author_addon_name',
            description: 'Unique identifier for your addon (auto-generated from author and name)'
          },
          {
            id: 'description',
            label: 'Description',
            type: 'longtext',
            placeholder: 'Describe what your addon does...',
            rows: 4,
            description: 'A brief description of your addon'
          }
        ]
      },
      {
        id: 'type',
        title: 'Addon Type',
        description: 'Choose the type of addon you want to create',
        fields: [
          {
            id: 'addonType',
            label: 'Addon Type',
            type: 'dropdown',
            required: true,
            defaultValue: 'PLUGIN',
            options: [
              { label: 'Plugin', value: 'PLUGIN' },
              { label: 'Behavior', value: 'BEHAVIOR' }
            ],
            description: 'The type of addon to create'
          },
          {
            id: 'pluginType',
            label: 'Plugin Type',
            type: 'dropdown',
            defaultValue: 'OBJECT',
            options: [
              { label: 'World (2D objects in the layout)', value: 'WORLD' },
              { label: 'Object (Non-visual global objects)', value: 'OBJECT' },
              { label: 'DOM (HTML overlay elements)', value: 'DOM' }
            ],
            description: 'The type of plugin (only for plugins)'
          },
          {
            id: 'category',
            label: 'Category',
            type: 'dropdown',
            required: true,
            defaultValue: 'GENERAL',
            options: [
              { label: 'General', value: 'GENERAL' },
              { label: '3D', value: '_3D' },
              { label: 'Data and Storage', value: 'DATA_AND_STORAGE' },
              { label: 'Form Controls', value: 'FORM_CONTROLS' },
              { label: 'Input', value: 'INPUT' },
              { label: 'Media', value: 'MEDIA' },
              { label: 'Monetisation', value: 'MONETISATION' },
              { label: 'Platform Specific', value: 'PLATFORM_SPECIFIC' },
              { label: 'Web', value: 'WEB' },
              { label: 'Other', value: 'OTHER' }
            ],
            description: 'The category for your addon'
          }
        ]
      }
    ],
    customScript: `
      // Auto-generate ID from author and addon name
      (function() {
        const addonNameField = document.getElementById('addonName');
        const authorField = document.getElementById('author');
        const idField = document.getElementById('id');
        const addonTypeField = document.getElementById('addonType');
        const pluginTypeField = document.getElementById('pluginType');
        const categoryField = document.getElementById('category');

        if (!addonNameField || !authorField || !idField) {
          return;
        }

        let idManuallyEdited = false;

        // Helper to convert to snake_case
        const toSnakeCase = (str) => {
          return str
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
        };

        // Auto-generate ID
        const autoGenerateId = () => {
          if (!idManuallyEdited) {
            const author = toSnakeCase(authorField.value);
            const name = toSnakeCase(addonNameField.value);
            if (author || name) {
              idField.value = [author, name].filter(Boolean).join('_');
            }
          }
        };

        // Watch for changes
        addonNameField.addEventListener('input', autoGenerateId);
        authorField.addEventListener('input', autoGenerateId);
        
        // Mark as manually edited if user types in ID field
        idField.addEventListener('input', () => {
          idManuallyEdited = true;
        });

        // Handle addon type changes and update category options
        const updateCategoryOptions = () => {
          if (!addonTypeField || !categoryField) return;
          
          const isPlugin = addonTypeField.value === 'PLUGIN';
          const pluginTypeFieldContainer = pluginTypeField?.closest('.form-field');
          const currentCategory = categoryField.value; // Save current selection
          
          // Show/hide plugin type based on addon type
          if (pluginTypeFieldContainer) {
            pluginTypeFieldContainer.style.display = isPlugin ? 'flex' : 'none';
            // Toggle required attribute based on visibility
            if (pluginTypeField) {
              if (isPlugin) {
                pluginTypeField.setAttribute('required', 'required');
              } else {
                pluginTypeField.removeAttribute('required');
              }
            }
          }

          // Update category options based on addon type
          if (isPlugin) {
            categoryField.innerHTML = \`
              <option value="">Select an option</option>
              <option value="GENERAL">General</option>
              <option value="_3D">3D</option>
              <option value="DATA_AND_STORAGE">Data and Storage</option>
              <option value="FORM_CONTROLS">Form Controls</option>
              <option value="INPUT">Input</option>
              <option value="MEDIA">Media</option>
              <option value="MONETISATION">Monetisation</option>
              <option value="PLATFORM_SPECIFIC">Platform Specific</option>
              <option value="WEB">Web</option>
              <option value="OTHER">Other</option>
            \`;
          } else {
            categoryField.innerHTML = \`
              <option value="">Select an option</option>
              <option value="ATTRIBUTES">Attributes</option>
              <option value="GENERAL">General</option>
              <option value="MOVEMENTS">Movements</option>
              <option value="OTHER">Other</option>
            \`;
          }

          // Restore previous selection if it's still valid, otherwise default to GENERAL
          const options = Array.from(categoryField.options).map(opt => opt.value);
          if (currentCategory && options.includes(currentCategory)) {
            categoryField.value = currentCategory;
          } else {
            categoryField.value = '';
          }
        };

        if (addonTypeField) {
          addonTypeField.addEventListener('change', updateCategoryOptions);
          // Initialize on load
          setTimeout(updateCategoryOptions, 0);
        }
      })();
    `
  };

  // Show the form
  FormPanel.createOrShow(
    context.extensionUri,
    scaffoldForm,
    async (data) => {
      // Save the author name to settings for future use
      await vscode.workspace
        .getConfiguration("cawExtension")
        .update("lastAuthorName", data.author, true);

      const projectName = toSnakeCase(data.addonName);
      const folderPath = path.join(rootPath, projectName);

      // Check if folder already exists
      if (fs.existsSync(folderPath)) {
        const overwrite = await vscode.window.showWarningMessage(
          `Folder "${projectName}" already exists. Overwrite?`,
          'Yes',
          'No'
        );
        if (overwrite !== 'Yes') {
          return;
        }
        fs.rmSync(folderPath, { recursive: true, force: true });
      }

      vscode.window.showInformationMessage("CAW: Scaffolding new project");

      // Create folder
      fs.mkdirSync(folderPath, { recursive: true });

      // Scaffold project
      const emitter = degit("ConstructFund/construct-addon-wizard-scaffold", {
        cache: false,
        force: true,
        verbose: true,
      });

      emitter.on("info", (info) => {
        console.log(info.message);
      });

      emitter.on("warn", (info) => {
        console.warn(info.message);
      });

      await emitter.clone(folderPath);

      // Update config.caw.js with form data
      await updateConfigFile(folderPath, data);

      // open folder
      vscode.commands.executeCommand(
        "vscode.openFolder",
        vscode.Uri.file(folderPath)
      );
    },
    () => {
      vscode.window.showInformationMessage('Project creation cancelled');
    }
  );
}

/**
 * Update the config.caw.js file with user input
 */
async function updateConfigFile(folderPath: string, data: any) {
  const configPath = path.join(folderPath, 'config.caw.js');
  
  if (!fs.existsSync(configPath)) {
    vscode.window.showWarningMessage('config.caw.js not found in scaffolded project');
    return;
  }

  try {
    let configContent = fs.readFileSync(configPath, 'utf8');

    const addonTypeValue = `ADDON_TYPE.${data.addonType}`;
    const pluginTypeValue = data.pluginType ? `PLUGIN_TYPE.${data.pluginType}` : 'PLUGIN_TYPE.OBJECT';
    const categoryValue = `ADDON_CATEGORY.${data.category}`;
    const descriptionValue = data.description?.trim() || '-';

    // Replace values in config
    configContent = configContent
      .replace(/export const addonType = ADDON_TYPE\.\w+;/, `export const addonType = ${addonTypeValue};`)
      .replace(/export const type = PLUGIN_TYPE\.\w+;/, `export const type = ${pluginTypeValue};`)
      .replace(/export const id = ["'][^"']*["'];/, `export const id = "${data.id}";`)
      .replace(/export const name = ["'][^"']*["'];/, `export const name = "${data.addonName}";`)
      .replace(/export const author = ["'][^"']*["'];/, `export const author = "${data.author}";`)
      .replace(/export const description = ["'][^"']*["'];/, `export const description = "${descriptionValue}";`)
      .replace(/export const category = ADDON_CATEGORY\.\w+;/, `export const category = ${categoryValue};`);

    fs.writeFileSync(configPath, configContent, 'utf8');
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to update config.caw.js: ${error}`);
  }
}

