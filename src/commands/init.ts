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
    await runTerminalCommand("npm run updateProjectData", false);
    return;
  }

  focusFile("config.caw.js");
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Installing dependencies...",
      cancellable: false,
    },
    async () => {
      await runTerminalCommand("npm run init");
    }
  );
}
