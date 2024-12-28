import * as vscode from "vscode";
import QuickActionsProvider from "./panels/QuickActions";
import InspectorProvider from "./panels/Inspector";
import scaffold from "./commands/scaffold";
import shouldActivate from "./utils/shouldActivate";
import focusFile from "./utils/focusFile";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("cawExtension.scaffoldNewProject", scaffold)
  );
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "cawWebViewQuickActions",
      new QuickActionsProvider(context)
    )
  );
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "cawWebViewInspector",
      new InspectorProvider(context)
    )
  );

  if (shouldActivate()) {
    vscode.commands.executeCommand("cawWebViewQuickActions.focus");
    vscode.window.showInformationMessage("CAW Extension activated");

    // find file config.caw.js and focus on inspector
    focusFile("config.caw.js");
  }
}

export function deactivate() {}
