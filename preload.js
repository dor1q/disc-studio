"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("l805Desktop", {
  saveBlob: (payload) => ipcRenderer.invoke("save-blob", payload),
  openTextFile: (options) => ipcRenderer.invoke("open-text-file", options),
  openAudioFolder: () => ipcRenderer.invoke("open-audio-folder")
});
