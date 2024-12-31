import * as vscode from "vscode";
import fs from "fs";
import path from "path";

// @ts-nocheck

export default async function () {
  let rootPath: string = vscode.workspace
    .getConfiguration("cawExtension")
    .get("preferredFolderPath");

  if (rootPath && fs.existsSync(rootPath)) {
    let iconPerType = {
      plugin: "person",
      theme: "symbol-color",
      behavior: "jersey",
      effect: "zap",
    };
    let folders: vscode.QuickPickItem[] = fs
      .readdirSync(rootPath)
      .filter((folder) => {
        return fs.existsSync(path.resolve(rootPath, folder, "config.caw.js"));
      })
      .map((folder) => {
        if (
          fs.existsSync(
            path.resolve(rootPath, folder, "template", "projectData.json")
          )
        ) {
          let projectData = JSON.parse(
            fs.readFileSync(
              path.resolve(rootPath, folder, "template", "projectData.json"),
              "utf8"
            )
          );
          let iconPath = vscode.Uri.file(
            path.resolve(rootPath, folder, "src", projectData.iconPath)
          );
          return {
            label: `${projectData.name}\t\t$(${
              iconPerType[projectData.addonType] || "question"
            }) ${projectData.id}\t\t$(account) ${projectData.author}`,
            detail: `${folder}/ - ${projectData.description}`,
            iconPath,
            value: rootPath + "/" + folder,
            timeStamp: projectData.timeStamp || 0,
          };
        }

        return {
          label: folder,
          detail: rootPath + "/" + folder,
          value: rootPath + "/" + folder,
          timeStamp: 0,
        };
      })
      .sort((a, b) => {
        return a.timeStamp > b.timeStamp ? -1 : 1;
      });

    folders.push(
      {
        label: "",
        kind: -1,
        value: "openFolderPicker",
      },
      {
        label: "Open Folder Picker",
        detail: "Select a different folder",
        value: "openFolderPicker",
      }
    );

    let folder = await vscode.window.showQuickPick(folders, {
      placeHolder: "Select CAW Project",
    });

    if (!folder) {
      return;
    }

    if (folder.value !== "openFolderPicker") {
      vscode.commands.executeCommand(
        "vscode.openFolder",
        vscode.Uri.file(folder.value)
      );
      return;
    }
    // vscode.window.showInformationMessage(JSON.stringify(folder));
  }

  let folder = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    canSelectFiles: false,
    canSelectMany: false,
    openLabel: "Select CAW Project",
  });

  if (!folder) {
    return;
  }
  vscode.commands.executeCommand(
    "vscode.openFolder",
    vscode.Uri.file(folder[0].fsPath)
  );
}
