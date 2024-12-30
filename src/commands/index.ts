import vscode from "vscode";
import scaffold from "./scaffold";
import build from "./build";
import init from "./init";
import translateLang from "./translateLang";

const commands = [
  {
    command: "cawExtension.scaffoldNewProject",
    callback: scaffold,
    includedInCommandPalette: true,
    includeInQuickActions: false,
  },
  {
    command: "cawExtension.buildProject",
    callback: build,
    title: "Build",
    icon: "pi pi-cog",
    includedInCommandPalette: true,
    includeInQuickActions: true,
  },
  {
    command: "cawExtension.init",
    callback: init,
    includedInCommandPalette: false,
    includeInQuickActions: false,
  },
  {
    command: "cawExtension.translateLang",
    callback: translateLang,
    includedInCommandPalette: false,
    includeInQuickActions: true,
    title: "Translate Language",
    icon: "pi pi-globe",
  },
];

export function getCommands() {
  return commands;
}

export function getCommand(command: string) {
  return commands.find((c) => c.command === command);
}

export function getQuickActions() {
  return commands
    .filter((c) => c.includeInQuickActions)
    .map((x) => {
      return {
        label: x.title,
        icon: x.icon,
        command: x.command,
        keybind: vscode.workspace.getConfiguration().get(`caw.${x.command}`),
      };
    });
}

export function getCommandPalette() {
  return commands.filter((c) => c.includedInCommandPalette);
}

export default function registerCommands(context: vscode.ExtensionContext) {
  commands.forEach((command) => {
    context.subscriptions.push(
      vscode.commands.registerCommand(command.command, command.callback)
    );
  });
}
