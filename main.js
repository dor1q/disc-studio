"use strict";

const { app, BrowserWindow, Menu, dialog, ipcMain } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1120,
    minHeight: 720,
    title: "L805 Disc Studio",
    backgroundColor: "#0f172a",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.loadFile(path.join(__dirname, "index.html"));
}

function createMenu() {
  const template = [
    {
      label: "Файл",
      submenu: [
        { label: "Печать", accelerator: "Ctrl+P", click: () => mainWindow?.webContents.print() },
        { type: "separator" },
        { label: "Выход", role: "quit" }
      ]
    },
    {
      label: "Вид",
      submenu: [
        { label: "Перезагрузить", role: "reload" },
        { label: "На весь экран", role: "togglefullscreen" },
        { label: "Инструменты разработчика", role: "toggleDevTools" }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

ipcMain.handle("save-blob", async (_event, payload) => {
  const filename = payload?.filename || "l805-layout";
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: "Сохранить файл",
    defaultPath: filename
  });

  if (canceled || !filePath) return { canceled: true };
  await fs.writeFile(filePath, Buffer.from(payload.buffer));
  return { canceled: false, filePath };
});

ipcMain.handle("open-text-file", async (_event, options = {}) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: options.title || "Открыть файл",
    properties: ["openFile"],
    filters: options.filters || [{ name: "JSON", extensions: ["json"] }]
  });

  if (canceled || !filePaths?.[0]) return { canceled: true };
  const text = await fs.readFile(filePaths[0], "utf8");
  return { canceled: false, filePath: filePaths[0], text };
});

ipcMain.handle("open-audio-folder", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: "Выбрать папку альбома",
    properties: ["openDirectory"]
  });

  if (canceled || !filePaths?.[0]) return { canceled: true };
  const folderPath = filePaths[0];
  const entries = await fs.readdir(folderPath, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => ({
      name: entry.name,
      path: path.join(folderPath, entry.name)
    }));

  return {
    canceled: false,
    folderPath,
    folderName: path.basename(folderPath),
    files
  };
});

app.whenReady().then(() => {
  createMenu();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
