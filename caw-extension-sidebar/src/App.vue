<script setup>
import Button from "primevue/button";
import { ref } from "vue";

const buttonList = ref([]);

// receive message from extension
window.addEventListener("message", (event) => {
  const message = event.data;
  if (message.command === "setQuickActions") {
    // update button list
    buttonList.value = message.quickActions;
  }
});

let vscode = null;
if (window.acquireVsCodeApi) {
  vscode = window.acquireVsCodeApi();
}
function sendCommand(command) {
  if (!vscode) {
    return;
  }
  vscode.postMessage({
    type: "command",
    command,
  });
}
</script>

<template>
  <main>
    <div
      v-for="button in buttonList"
      :key="button.command"
      class="buttonContainer"
    >
      <Button
        :label="button.label"
        @click="sendCommand(button.command)"
        :icon="button.icon"
        size="small"
      />
      <div v-if="button.keybind">{{ button.keybind }}</div>
    </div>
  </main>
</template>
