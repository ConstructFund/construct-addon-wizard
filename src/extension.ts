import * as vscode from "vscode";
import QuickActionsProvider from "./panels/QuickActions";
import InspectorProvider from "./panels/Inspector";
import registerCommands from "./commands/_index";
import shouldActivate from "./utils/shouldActivate";

export function activate(context: vscode.ExtensionContext) {
  registerCommands(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "cawWebViewQuickActions",
      new QuickActionsProvider(context),
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
      }
    )
  );
  // context.subscriptions.push(
  //   vscode.window.registerWebviewViewProvider(
  //     "cawWebViewInspector",
  //     new InspectorProvider(context),
  //     {
  //       webviewOptions: {
  //         retainContextWhenHidden: true,
  //       },
  //     }
  //   )
  // );

  if (shouldActivate()) {
    vscode.commands.executeCommand("cawWebViewQuickActions.focus");
    vscode.commands.executeCommand("cawExtension.init");
  }
}

export function deactivate() {}
