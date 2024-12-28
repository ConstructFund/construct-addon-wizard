import vscode from "vscode";

export default function focusFile(filePath: string) {
  filePath = vscode.workspace.workspaceFolders![0].uri.fsPath + "/" + filePath;
  const uri = vscode.Uri.file(filePath);

  vscode.commands.executeCommand("vscode.open", uri);
}
