import vscode from "vscode";
import scaffold from "./scaffold";
import build from "./build";
import init from "./init";
import translateLang from "./translateLang";
import generateLang from "./generateLang";
import shouldActivate from "../utils/shouldActivate";
import openProject from "./openProject";

const commands = [
  {
    command: "cawExtension.scaffoldNewProject",
    title: "New Project",
    callback: scaffold,
    includedInCommandPalette: true,
    includeInQuickActions: false,
    includeInNoProjectQuickActions: true,
  },
  {
    command: "cawExtension.openProject",
    title: "Open Project",
    callback: openProject,
    includedInCommandPalette: true,
    includeInQuickActions: false,
    includeInNoProjectQuickActions: true,
  },
  {
    command: "cawExtension.buildProject",
    title: "Build",
    callback: build,
    includedInCommandPalette: true,
    includeInQuickActions: true,
    includeInNoProjectQuickActions: false,
  },
  {
    command: "cawExtension.init",
    callback: init,
    includedInCommandPalette: false,
    includeInQuickActions: false,
    includeInNoProjectQuickActions: false,
  },
  {
    command: "cawExtension.translateLang",
    title: "Translate Language",
    callback: translateLang,
    includedInCommandPalette: false,
    includeInQuickActions: true,
    includeInNoProjectQuickActions: false,
  },
  {
    command: "cawExtension.generateLang",
    callback: generateLang,
    includedInCommandPalette: true,
    includeInQuickActions: false,
    includeInNoProjectQuickActions: false,
  },
];

export function getCommands() {
  return commands;
}

export function getCommand(command: string) {
  return commands.find((c) => c.command === command);
}

export function getQuickActions() {
  if (!shouldActivate()) {
    return commands
      .filter((c) => c.includeInNoProjectQuickActions)
      .map((x) => {
        return {
          label: x.title,
          command: x.command,
          keybind: vscode.workspace.getConfiguration().get(`caw.${x.command}`),
        };
      });
  }
  return commands
    .filter((c) => c.includeInQuickActions)
    .map((x) => {
      return {
        label: x.title,
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
