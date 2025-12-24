import runTerminalCommand from "../utils/runTerminalCommand";
export default async function (context?: any) {
  runTerminalCommand("npm run dev", true, "CAW Dev Server");
}
