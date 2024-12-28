import vscode from "vscode";
import path from "path";
import fs from "fs";
export default function shouldActivate() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return false;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;
  const configPath = path.join(rootPath, "config.caw.js");

  if (fs.existsSync(configPath)) {
    return true;
  }
  return false;
}
