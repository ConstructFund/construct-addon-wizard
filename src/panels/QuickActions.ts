import * as vscode from "vscode";
import fs from "fs";

import { getQuickActions } from "../commands";

export default class CawViewProvider implements vscode.WebviewViewProvider {
  private panelHtmlPath: string;
  private webviewView: vscode.WebviewView;
  constructor(private context: vscode.ExtensionContext) {
    this.context = context;
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this.webviewView = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
    };
    this.panelHtmlPath = this.context.asAbsolutePath(
      "html/QuickActions/index.html"
    );

    fs.watch(this.panelHtmlPath, (event, filename) => {
      if (event === "change") {
        this.setWebviewContent();
      }
    });

    this.setWebviewContent();
  }

  setWebviewContent() {
    const panelHtml = fs.readFileSync(this.panelHtmlPath, "utf8");
    this.webviewView.webview.html = panelHtml;
    this.webviewView.webview.postMessage({
      command: "setQuickActions",
      quickActions: getQuickActions(),
    });
    this.webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case "command":
          vscode.commands.executeCommand(message.command);
          break;
      }
    });
  }
}
