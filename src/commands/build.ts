import * as vscode from "vscode";
import runTerminalCommand from "../utils/runTerminalCommand";
export default async function (context?: any) {
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Building project...",
      cancellable: false,
    },
    async () => {
      await runTerminalCommand("npm run build");
    }
  );
}
