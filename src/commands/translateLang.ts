import * as vscode from "vscode";
export default async function translateLang(language: string | undefined) {
  if (!language) {
    language = await vscode.window.showInputBox({
      prompt: "Enter the language code",
    });
  }

  // show loading indicator
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Translating",
      cancellable: false,
    },
    async (progress) => {
      progress.report({ increment: 0, message: "Saving files" });
      await vscode.commands.executeCommand("workbench.action.files.saveAll");
      progress.report({ increment: 10, message: "Building project" });
      await vscode.commands.executeCommand("cawExtension.buildProject");

      progress.report({
        increment: 20,
        message: "Getting english translation",
      });
      let englishFile =
        vscode.workspace.workspaceFolders?.[0].uri.fsPath +
        "/template/en-US.json";
      let englishContent = await vscode.workspace.fs.readFile(
        vscode.Uri.file(englishFile)
      );

      progress.report({ increment: 10, message: "Getting language model" });

      const craftedPrompt = [
        vscode.LanguageModelChatMessage.User(
          "You are a translator, I send you files to translate and you reply ONLY with the translated content. Translate the content of the following file to the following language " +
            language
        ),
        vscode.LanguageModelChatMessage.User(englishContent.toString()),
      ];
      const [model] = await vscode.lm.selectChatModels();
      if (!model) {
        vscode.window.showErrorMessage(
          "Could not use the translate feature. No chat model found"
        );
        return;
      }

      progress.report({ increment: 10, message: "Requesting translation" });

      const chatResponse = await model.sendRequest(
        craftedPrompt,
        {},
        new vscode.CancellationTokenSource().token
      );

      progress.report({ increment: 10, message: "Translating" });
      let text = "";
      for await (const fragment of chatResponse.text) {
        text += fragment;
      }
      // write to file
      let filePath =
        vscode.workspace.workspaceFolders?.[0].uri.fsPath +
        "/src/extraLangs/" +
        language +
        ".json";

      progress.report({ increment: 10, message: "Saving translation to file" });
      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(filePath),
        Buffer.from(text)
      );
      vscode.window.showInformationMessage("Translation completed");
      // open file

      progress.report({ increment: 10, message: "Opening file" });

      let doc = await vscode.workspace.openTextDocument(filePath);
      vscode.window.showTextDocument(doc);
    }
  );
}
