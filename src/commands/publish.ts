import * as vscode from "vscode";
import runTerminalCommand from "../utils/runTerminalCommand";

// @ts-nocheck

export default async function (context?: any) {
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
  if (publishMode.value === "manual") {
    publishVersion = await vscode.window.showInputBox({
      prompt: "Enter the version number",
    });
  } else {
    publishVersion = publishMode.value;
  }
  if (!publishVersion) {
    return;
  }

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
}
