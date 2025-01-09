import runTerminalCommand from "../utils/runTerminalCommand";
export default async function () {
  runTerminalCommand("npm run dev", true, "CAW Dev Server");
}
