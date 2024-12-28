import * as vscode from "vscode";
import fs from "fs";
import path from "path";
import degit from "degit";

export default async function () {
  vscode.window.showInformationMessage("Scaffolding new CAW project");

  // get input
  const projectName = await vscode.window.showInputBox({
    prompt: "Enter project name",
  });

  if (!projectName) {
    vscode.window.showErrorMessage("No project name provided");
    return;
  }

  // get preferred folder from settings
  let rootPath: string = vscode.workspace
    .getConfiguration("cawExtension")
    .get("preferredFolderPath");

  console.log(rootPath);
  console.log(vscode.workspace.getConfiguration("cawExtension"));

  if (!rootPath || !fs.existsSync(rootPath)) {
    // open folder picker
    let folder = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectFiles: false,
      canSelectMany: false,
      openLabel: "Select",
    });

    if (!folder) {
      vscode.window.showErrorMessage("No folder selected");
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

  // create folder
  const folderPath = path.join(rootPath, projectName);
  fs.mkdirSync(folderPath);

  // scaffold project
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

  // open folder
  vscode.commands.executeCommand(
    "vscode.openFolder",
    vscode.Uri.file(folderPath)
  );
}