import * as vscode from "vscode";
import runTerminalCommand from "../utils/runTerminalCommand";
import { FormPanel, createForm } from "../utils/formSystem";
import * as fs from "fs";
import * as path from "path";

// @ts-nocheck

export default async function (context?: any) {
  if (!context) {
    vscode.window.showErrorMessage('Extension context not available');
    return;
  }

  // Get workspace folder
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('No workspace folder found');
    return;
  }

  const workspacePath = workspaceFolder.uri.fsPath;
  const versionJsPath = path.join(workspacePath, 'version.js');
  const changelogPath = path.join(workspacePath, 'CHANGELOG.json');

  // Read version.js to get current version
  let currentVersion = '0.0.0.0';
  try {
    const versionContent = fs.readFileSync(versionJsPath, 'utf8');
    const match = versionContent.match(/export\s+default\s+["']([^"']+)["']/);
    if (match) {
      currentVersion = match[1];
    }
  } catch (error) {
    vscode.window.showErrorMessage('Failed to read version.js');
    return;
  }

  let publishVersion = "";
  let publishMode = await vscode.window.showQuickPick(
    [
      {
        label: "No change",
        detail: "Keep current version number",
        value: "",
      },
      {
        label: "Major",
        detail: "(x._._._)",
        value: "major",
      },
      {
        label: "Minor",
        detail: "(_.x._._)",
        value: "minor",
      },
      {
        label: "Patch",
        detail: "(_._.x._)",
        value: "patch",
      },
      {
        label: "Revision",
        detail: "(_._._.x)",
        value: "revision",
      },
      {
        label: "",
        kind: -1,
        value: "",
      },
      {
        label: "Other",
        detail: "Type version number manually",
        value: "manual",
      },
    ],
    {
      placeHolder: "Increment version by",
    }
  );

  if (!publishMode) {
    return;
  }

  // Calculate the new version number
  let newVersion = currentVersion;
  if (publishMode.value === "manual") {
    const manualVersion = await vscode.window.showInputBox({
      prompt: "Enter the version number",
      value: currentVersion
    });
    if (!manualVersion) {
      return;
    }
    newVersion = manualVersion;
    publishVersion = manualVersion;
  } else if (publishMode.value) {
    // Calculate the incremented version
    const parts = currentVersion.split('.').map(Number);
    while (parts.length < 4) {
      parts.push(0);
    }
    
    switch (publishMode.value) {
      case 'major':
        parts[0]++;
        parts[1] = 0;
        parts[2] = 0;
        parts[3] = 0;
        break;
      case 'minor':
        parts[1]++;
        parts[2] = 0;
        parts[3] = 0;
        break;
      case 'patch':
        parts[2]++;
        parts[3] = 0;
        break;
      case 'revision':
        parts[3]++;
        break;
    }
    
    newVersion = parts.join('.');
    publishVersion = publishMode.value;
  }

  // Read existing changelog data
  let changelogData: Record<string, { added?: string; changed?: string; fixed?: string }> = {};
  if (fs.existsSync(changelogPath)) {
    try {
      const changelogContent = fs.readFileSync(changelogPath, 'utf8');
      changelogData = JSON.parse(changelogContent);
    } catch (error) {
      console.log('Could not parse existing changelog, starting fresh');
    }
  }

  // Get existing changelog for this version (if any)
  const existingChangelog = changelogData[newVersion] || { added: '', changed: '', fixed: '' };

  // Create and show the changelog form
  const changelogForm = createForm('changelog', `Changelog Wizard for v${newVersion}`)
    .description('Provide changelog information for this release')
    .addStep('changelog', 'What changed?')
    .stepDescription('All fields are optional')
    .addLongText('added', 'Added', {
      placeholder: 'New features, functionality...',
      rows: 6,
      defaultValue: existingChangelog.added || '',
      description: 'New features and additions in this release'
    })
    .addLongText('changed', 'Changed', {
      placeholder: 'Changes to existing functionality...',
      rows: 6,
      defaultValue: existingChangelog.changed || '',
      description: 'Changes to existing features'
    })
    .addLongText('fixed', 'Fixed', {
      placeholder: 'Bug fixes...',
      rows: 6,
      defaultValue: existingChangelog.fixed || '',
      description: 'Bug fixes and corrections'
    })
    .build();

  // Show the form and wait for completion
  let formSubmitted = false;
  let changelogFormData: any = null;

  FormPanel.createOrShow(
    context.extensionUri,
    changelogForm,
    async (data) => {
      formSubmitted = true;
      changelogFormData = data;

      // Update changelog data
      changelogData[newVersion] = {
        added: data.added || '',
        changed: data.changed || '',
        fixed: data.fixed || ''
      };

      // Write CHANGELOG.json
      const changelogContent = JSON.stringify(changelogData, null, 2);
      fs.writeFileSync(changelogPath, changelogContent, 'utf8');

      // Proceed with publishing
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Publishing...",
          cancellable: false,
        },
        async () => {
          await runTerminalCommand("npm run publish " + publishVersion);
        }
      );
    },
    () => {
      // Form was cancelled
      vscode.window.showInformationMessage('Publish cancelled');
    }
  );
}
