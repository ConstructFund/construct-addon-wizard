import * as vscode from "vscode";
export default async function (
  command: string,
  showTerminal = true,
  terminalName = "CAW Terminal"
) {
  const window = vscode.window;
  return new Promise((resolve) => {
    const existingTerm = window.terminals.find(
      (term) => term.name === terminalName
    );
    if (existingTerm) {
      existingTerm.dispose();
    }
    const myTerm = window.createTerminal(terminalName);
    if (showTerminal) {
      myTerm.show(true);
    }
    let alreadyRanCommand = false;
    window.onDidChangeTerminalShellIntegration((event) => {
      if (event.terminal === myTerm && !alreadyRanCommand) {
        alreadyRanCommand = true;
        const execution = myTerm.shellIntegration.executeCommand(command);
        window.onDidEndTerminalShellExecution((event) => {
          if (event.execution === execution) {
            resolve(event);
          }
        });
      }
    });
  });
}
