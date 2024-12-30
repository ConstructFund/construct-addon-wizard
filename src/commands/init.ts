import * as vscode from "vscode";
import fs from "fs";
import path from "path";
import runTerminalCommand from "../utils/runTerminalCommand";
import focusFile from "../utils/focusFile";
export default async function () {
  // check if node_modules exists
  const nodeModulesPath = path.join(
    vscode.workspace.workspaceFolders[0].uri.fsPath,
    "node_modules"
  );

  if (fs.existsSync(nodeModulesPath)) {
    vscode.window.showInformationMessage("CAW Extension activated");
    return;
  }

  focusFile("config.caw.js");
  vscode.window.showInformationMessage("Installing dependencies");
  await runTerminalCommand("npm i");

  vscode.window.showInformationMessage("Project created successfully");
}
