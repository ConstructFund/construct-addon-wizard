import * as vscode from "vscode";
import runTerminalCommand from "../utils/runTerminalCommand";
export default async function () {
  vscode.window.showInformationMessage("Building project");
  await runTerminalCommand("npm run build");
}
