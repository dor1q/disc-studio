"use strict";

const PRESETS = {
  full: {
    label: "Full face 18-120 мм",
    discOuter: 120,
    printOuter: 120,
    printInner: 18,
    safeOuter: 116,
    safeInner: 22
  },
  classic: {
    label: "Обычный 43-116 мм",
    discOuter: 120,
    printOuter: 116,
    printInner: 43,
    safeOuter: 112,
    safeInner: 47
  },
  mini: {
    label: "Mini CD 18-80 мм",
    discOuter: 80,
    printOuter: 80,
    printInner: 18,
    safeOuter: 76,
    safeInner: 22
  }
};

const SURFACES = {
  disc: {
    label: "Диск",
    kind: "disc",
    width: 120,
    height: 120,
    safe: 4
  },
  front: {
    label: "Передняя обложка",
    kind: "cover",
    width: 120,
    height: 120,
    safe: 5
  },
  back: {
    label: "Задник jewel case",
    kind: "back",
    width: 151,
    height: 118,
    safe: 5,
    spine: 6.5
  },
  booklet: {
    label: "Буклет разворот",
    kind: "booklet",
    width: 240,
    height: 120,
    safe: 5,
    fold: 120
  }
};

const SURFACE_ORDER = ["disc", "front", "back", "booklet"];

const DEFAULT_EFFECTS = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0
};

const DEFAULT_PROJECT = {
  version: 1,
  surface: "disc",
  preset: "full",
  profile: structuredClone(PRESETS.full),
  backgrounds: {
    disc: createEmptyBackground(),
    front: createEmptyBackground(),
    back: createEmptyBackground(),
    booklet: createEmptyBackground()
  },
  background: {
    dataUrl: "",
    scale: 1,
    x: 0,
    y: 0,
    rotation: 0
  },
  calibration: {
    x: 0,
    y: 0,
    scale: 100,
    rotation: 0,
    inkDensity: 100
  },
  objects: [
    {
      id: "title",
      type: "text",
      name: "Название альбома",
      text: "ARTIST / ALBUM",
      x: 60,
      y: 41,
      size: 5.7,
      rotation: 0,
      color: "#111827",
      weight: "800",
      align: "middle",
      fontFamily: "Inter, Segoe UI, Arial",
      opacity: 1,
      visible: true,
      locked: false,
      surface: "disc"
    },
    {
      id: "circle",
      type: "circleText",
      name: "Текст по кругу",
      text: "EPSON L805 PRINTABLE DISC",
      x: 60,
      y: 60,
      size: 4.2,
      rotation: 0,
      color: "#111827",
      weight: "700",
      fontFamily: "Inter, Segoe UI, Arial",
      opacity: 1,
      visible: true,
      locked: false,
      surface: "disc",
      radius: 47,
      start: -118,
      sweep: 236
    },
    {
      id: "tracks",
      type: "tracklist",
      name: "Треклист",
      text: "01. First Track\n02. Second Track\n03. Third Track",
      x: 60,
      y: 86,
      size: 3.2,
      rotation: 0,
      color: "#18212f",
      weight: "400",
      align: "middle",
      fontFamily: "Inter, Segoe UI, Arial",
      opacity: 1,
      visible: true,
      locked: false,
      surface: "disc",
      lineHeight: 1.35
    }
  ],
  selectedId: "title"
};

const STORAGE_KEY = "l805-disc-studio-project";
const CALIBRATION_KEY = "l805-disc-studio-calibration";
const THEME_KEY = "l805-disc-studio-theme";

let state = loadInitialState();
let theme = loadTheme();
let zoom = 1;
let dragState = null;
let historyPast = [JSON.stringify(state)];
let historyFuture = [];

document.body.dataset.theme = theme;

const $ = (selector) => document.querySelector(selector);
const elements = {
  discSvg: $("#discSvg"),
  canvasStage: $("#canvasStage"),
  canvasReadout: $("#canvasReadout"),
  layersList: $("#layersList"),
  statusProfile: $("#statusProfile"),
  statusCalibration: $("#statusCalibration"),
  statusMessage: $("#statusMessage"),
  themeToggleBtn: $("#themeToggleBtn"),
  preflightResults: $("#preflightResults"),
  surfaceSelect: $("#surfaceSelect"),
  presetSelect: $("#presetSelect"),
  outerInput: $("#outerInput"),
  innerInput: $("#innerInput"),
  safeOuterInput: $("#safeOuterInput"),
  safeInnerInput: $("#safeInnerInput"),
  discProfileSection: $("#discProfileSection"),
  coverFormatSection: $("#coverFormatSection"),
  coverFormatInfo: $("#coverFormatInfo"),
  bgScaleInput: $("#bgScaleInput"),
  bgScaleValue: $("#bgScaleValue"),
  bgXInput: $("#bgXInput"),
  bgYInput: $("#bgYInput"),
  bgRotationInput: $("#bgRotationInput"),
  bgBrightnessInput: $("#bgBrightnessInput"),
  bgBrightnessValue: $("#bgBrightnessValue"),
  bgContrastInput: $("#bgContrastInput"),
  bgContrastValue: $("#bgContrastValue"),
  bgSaturationInput: $("#bgSaturationInput"),
  bgSaturationValue: $("#bgSaturationValue"),
  bgGrayscaleInput: $("#bgGrayscaleInput"),
  bgGrayscaleValue: $("#bgGrayscaleValue"),
  emptySelection: $("#emptySelection"),
  objectControls: $("#objectControls"),
  objectTextInput: $("#objectTextInput"),
  objectXInput: $("#objectXInput"),
  objectYInput: $("#objectYInput"),
  objectSizeInput: $("#objectSizeInput"),
  objectRotationInput: $("#objectRotationInput"),
  objectFontInput: $("#objectFontInput"),
  objectColorInput: $("#objectColorInput"),
  objectWeightInput: $("#objectWeightInput"),
  objectAlignInput: $("#objectAlignInput"),
  objectOpacityInput: $("#objectOpacityInput"),
  objectOpacityValue: $("#objectOpacityValue"),
  imageEffectControls: $("#imageEffectControls"),
  objectBrightnessInput: $("#objectBrightnessInput"),
  objectBrightnessValue: $("#objectBrightnessValue"),
  objectContrastInput: $("#objectContrastInput"),
  objectContrastValue: $("#objectContrastValue"),
  objectSaturationInput: $("#objectSaturationInput"),
  objectSaturationValue: $("#objectSaturationValue"),
  objectGrayscaleInput: $("#objectGrayscaleInput"),
  objectGrayscaleValue: $("#objectGrayscaleValue"),
  circleTextControls: $("#circleTextControls"),
  objectRadiusInput: $("#objectRadiusInput"),
  objectSweepInput: $("#objectSweepInput"),
  objectStartInput: $("#objectStartInput"),
  calXInput: $("#calXInput"),
  calYInput: $("#calYInput"),
  calScaleInput: $("#calScaleInput"),
  calRotationInput: $("#calRotationInput"),
  calInkInput: $("#calInkInput"),
  calInkValue: $("#calInkValue"),
  backgroundFileInput: $("#backgroundFileInput"),
  imageLayerFileInput: $("#imageLayerFileInput"),
  projectFileInput: $("#projectFileInput"),
  trackFileInput: $("#trackFileInput")
};

applyTheme(theme);
bindEvents();
render();

function loadInitialState() {
  const saved = readJson(localStorage.getItem(STORAGE_KEY));
  const calibration = readJson(localStorage.getItem(CALIBRATION_KEY));
  const project = saved ? normalizeProject(saved) : structuredClone(DEFAULT_PROJECT);

  if (calibration) {
    project.calibration = {
      ...project.calibration,
      ...calibration
    };
  }

  return project;
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(nextTheme) {
  theme = nextTheme === "dark" ? "dark" : "light";
  document.body.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  elements.themeToggleBtn.textContent = theme === "dark" ? "Светлая" : "Темная";
  elements.themeToggleBtn.title = theme === "dark" ? "Включить светлую тему" : "Включить темную тему";
}

function toggleTheme() {
  applyTheme(theme === "dark" ? "light" : "dark");
  setStatus(theme === "dark" ? "Темная тема включена" : "Светлая тема включена");
}

function normalizeProject(project) {
  const normalized = structuredClone(DEFAULT_PROJECT);
  const preset = project.preset && PRESETS[project.preset] ? project.preset : "full";
  const surface = project.surface && SURFACES[project.surface] ? project.surface : "disc";
  const backgrounds = normalizeBackgrounds(project.backgrounds, project.background);

  return {
    ...normalized,
    ...project,
    surface,
    preset,
    profile: {
      ...PRESETS[preset],
      ...(project.profile || {})
    },
    backgrounds,
    background: {
      ...normalized.background,
      ...(project.background || {})
    },
    calibration: {
      ...normalized.calibration,
      ...(project.calibration || {})
    },
    objects: (Array.isArray(project.objects) ? project.objects : normalized.objects).map(normalizeObject),
    selectedId: project.selectedId || normalized.selectedId
  };
}

function normalizeObject(object) {
  const normalized = {
    fontFamily: "Inter, Segoe UI, Arial",
    opacity: 1,
    visible: true,
    locked: false,
    surface: "disc",
    ...object
  };
  return {
    ...normalized,
    ...normalizeVisualEffects(normalized)
  };
}

function normalizeBackgrounds(backgrounds, legacyBackground) {
  const normalized = {};
  SURFACE_ORDER.forEach((surface) => {
    normalized[surface] = {
      ...createEmptyBackground(),
      ...(backgrounds?.[surface] || {})
    };
  });

  if (legacyBackground && !backgrounds?.disc?.dataUrl) {
    normalized.disc = {
      ...normalized.disc,
      ...legacyBackground
    };
  }

  return normalized;
}

function createEmptyBackground() {
  return {
    dataUrl: "",
    scale: 1,
    x: 0,
    y: 0,
    rotation: 0,
    ...DEFAULT_EFFECTS
  };
}

function normalizeVisualEffects(source = {}) {
  return {
    brightness: clamp(Number(source.brightness ?? DEFAULT_EFFECTS.brightness), 50, 150),
    contrast: clamp(Number(source.contrast ?? DEFAULT_EFFECTS.contrast), 50, 150),
    saturation: clamp(Number(source.saturation ?? DEFAULT_EFFECTS.saturation), 0, 200),
    grayscale: clamp(Number(source.grayscale ?? DEFAULT_EFFECTS.grayscale), 0, 100)
  };
}

function readJson(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getSurface() {
  return SURFACES[state.surface] || SURFACES.disc;
}

function getSurfaceSize() {
  const surface = getSurface();
  if (surface.kind === "disc") {
    return {
      width: state.profile.discOuter,
      height: state.profile.discOuter
    };
  }

  return {
    width: surface.width,
    height: surface.height
  };
}

function getSurfaceCenter() {
  const size = getSurfaceSize();
  return {
    x: size.width / 2,
    y: size.height / 2
  };
}

function getActiveBackground() {
  state.backgrounds ||= {};
  state.backgrounds[state.surface] ||= createEmptyBackground();
  return state.backgrounds[state.surface];
}

function getCurrentObjects() {
  return state.objects.filter((object) => (object.surface || "disc") === state.surface);
}

function ensureSelectedForSurface() {
  const selected = getSelectedObject();
  if (selected && (selected.surface || "disc") === state.surface) return;
  state.selectedId = getCurrentObjects()[0]?.id || "";
}

function bindEvents() {
  $("#newProjectBtn").addEventListener("click", () => {
    if (!confirm("Создать новый проект и очистить текущий макет?")) return;
    const savedCalibration = structuredClone(state.calibration);
    state = structuredClone(DEFAULT_PROJECT);
    state.calibration = savedCalibration;
    persistProject();
    setStatus("Создан новый проект");
    render();
  });

  $("#saveProjectBtn").addEventListener("click", saveProjectFile);
  $("#openProjectBtn").addEventListener("click", openProjectFile);
  $("#undoBtn").addEventListener("click", undoChange);
  $("#redoBtn").addEventListener("click", redoChange);
  $("#themeToggleBtn").addEventListener("click", toggleTheme);
  $("#exportSvgBtn").addEventListener("click", exportSvg);
  $("#exportPngBtn").addEventListener("click", exportPng);
  $("#exportPdfBtn").addEventListener("click", () => openPrintWindow("pdf"));
  $("#printBtn").addEventListener("click", () => openPrintWindow("design"));
  $("#testPrintBtn").addEventListener("click", () => openPrintWindow("test"));
  $("#uploadBgBtn").addEventListener("click", () => elements.backgroundFileInput.click());
  $("#addImageBtn").addEventListener("click", () => elements.imageLayerFileInput.click());
  $("#addTextBtn").addEventListener("click", addText);
  $("#addCircleTextBtn").addEventListener("click", addCircleText);
  $("#addTracklistBtn").addEventListener("click", addTracklist);
  $("#importTracklistBtn").addEventListener("click", () => elements.trackFileInput.click());
  $("#albumTemplateBtn").addEventListener("click", applyAlbumTemplate);
  $("#coverTemplateBtn").addEventListener("click", applyCoverTemplate);
  $("#moveLayerUpBtn").addEventListener("click", () => moveSelectedLayer(1));
  $("#moveLayerDownBtn").addEventListener("click", () => moveSelectedLayer(-1));
  $("#deleteLayerBtn").addEventListener("click", deleteSelectedObject);
  $("#duplicateLayerBtn").addEventListener("click", duplicateSelectedObject);
  $("#centerBgBtn").addEventListener("click", centerBackground);
  $("#coverBgBtn").addEventListener("click", coverBackground);
  $("#clearBgBtn").addEventListener("click", clearBackground);
  $("#toggleVisibleBtn").addEventListener("click", toggleSelectedVisibility);
  $("#toggleLockBtn").addEventListener("click", toggleSelectedLock);
  $("#alignCenterXBtn").addEventListener("click", () => alignSelectedObject("x"));
  $("#alignCenterYBtn").addEventListener("click", () => alignSelectedObject("y"));
  $("#snapSafeBtn").addEventListener("click", snapSelectedToSafeArea);
  $("#preflightBtn").addEventListener("click", runPreflight);
  $("#resetCalibrationBtn").addEventListener("click", resetCalibration);
  $("#saveCalibrationBtn").addEventListener("click", saveCalibration);

  elements.backgroundFileInput.addEventListener("change", handleBackgroundUpload);
  elements.imageLayerFileInput.addEventListener("change", handleImageLayerUpload);
  elements.projectFileInput.addEventListener("change", handleProjectUpload);
  elements.trackFileInput.addEventListener("change", handleTrackFileUpload);

  elements.surfaceSelect.addEventListener("change", () => {
    state.surface = elements.surfaceSelect.value;
    ensureSelectedForSurface();
    persistAndRender(`Открыт макет: ${getSurface().label}`);
  });

  document.querySelectorAll("[data-zoom]").forEach((button) => {
    button.addEventListener("click", () => {
      zoom = Number(button.dataset.zoom);
      document.querySelectorAll("[data-zoom]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      elements.canvasStage.style.transform = `scale(${zoom})`;
    });
  });

  elements.presetSelect.addEventListener("change", () => {
    const preset = elements.presetSelect.value;
    state.preset = preset;
    state.profile = structuredClone(PRESETS[preset]);
    persistAndRender("Пресет диска изменен");
  });

  [
    ["outerInput", "printOuter"],
    ["innerInput", "printInner"],
    ["safeOuterInput", "safeOuter"],
    ["safeInnerInput", "safeInner"]
  ].forEach(([elementKey, stateKey]) => {
    elements[elementKey].addEventListener("input", () => {
      state.profile[stateKey] = clamp(Number(elements[elementKey].value), 0, 120);
      persistAndRender();
    });
  });

  [
    ["bgScaleInput", "scale", (value) => Number(value) / 100],
    ["bgXInput", "x", Number],
    ["bgYInput", "y", Number],
    ["bgRotationInput", "rotation", Number],
    ["bgBrightnessInput", "brightness", Number],
    ["bgContrastInput", "contrast", Number],
    ["bgSaturationInput", "saturation", Number],
    ["bgGrayscaleInput", "grayscale", Number]
  ].forEach(([elementKey, stateKey, parser]) => {
    elements[elementKey].addEventListener("input", () => {
      getActiveBackground()[stateKey] = parser(elements[elementKey].value);
      persistAndRender();
    });
  });

  [
    ["calXInput", "x"],
    ["calYInput", "y"],
    ["calScaleInput", "scale"],
    ["calRotationInput", "rotation"],
    ["calInkInput", "inkDensity"]
  ].forEach(([elementKey, stateKey]) => {
    elements[elementKey].addEventListener("input", () => {
      state.calibration[stateKey] = Number(elements[elementKey].value);
      persistAndRender();
    });
  });

  [
    ["objectTextInput", "text", String],
    ["objectXInput", "x", Number],
    ["objectYInput", "y", Number],
    ["objectSizeInput", "size", Number],
    ["objectRotationInput", "rotation", Number],
    ["objectFontInput", "fontFamily", String],
    ["objectColorInput", "color", String],
    ["objectWeightInput", "weight", String],
    ["objectAlignInput", "align", String],
    ["objectOpacityInput", "opacity", (value) => Number(value) / 100],
    ["objectBrightnessInput", "brightness", Number],
    ["objectContrastInput", "contrast", Number],
    ["objectSaturationInput", "saturation", Number],
    ["objectGrayscaleInput", "grayscale", Number],
    ["objectRadiusInput", "radius", Number],
    ["objectSweepInput", "sweep", Number],
    ["objectStartInput", "start", Number]
  ].forEach(([elementKey, stateKey, parser]) => {
    elements[elementKey].addEventListener("input", () => {
      const object = getSelectedObject();
      if (!object) return;
      object[stateKey] = parser(elements[elementKey].value);
      object.name = getObjectDisplayName(object);
      persistAndRender();
    });
  });

  elements.discSvg.addEventListener("pointerdown", handlePointerDown);
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);

  window.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      undoChange();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
      event.preventDefault();
      redoChange();
      return;
    }

    if (event.key === "Delete" || event.key === "Backspace") {
      if (document.activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;
      deleteSelectedObject();
      return;
    }

    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      if (document.activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;
      event.preventDefault();
      nudgeSelectedObject(event.key, event.shiftKey ? 1 : 0.2);
    }
  });
}

function render() {
  ensureSelectedForSurface();
  updateCanvasViewport();
  elements.discSvg.innerHTML = buildDiscSvg({ interactive: true });
  renderLayers();
  renderControls();
  renderStatus();
}

function updateCanvasViewport() {
  const { width, height } = getSurfaceSize();
  const viewBox = getSurface().kind === "disc" ? getViewBox() : `0 0 ${width} ${height}`;
  elements.discSvg.setAttribute("viewBox", viewBox);
  elements.canvasStage.style.aspectRatio = `${width} / ${height}`;
  elements.canvasStage.style.width = width > height ? "min(78vw, 900px)" : "min(68vh, 660px)";
}

function buildDiscSvg({ interactive = false, standalone = false, test = false, guides = true } = {}) {
  if (getSurface().kind !== "disc") {
    return buildCoverSvg({ interactive, standalone, guides });
  }

  const maskId = standalone ? "discPrintMask" : "discMask";
  const physicalRadius = state.profile.discOuter / 2;
  const outerRadius = state.profile.printOuter / 2;
  const innerRadius = state.profile.printInner / 2;
  const safeOuterRadius = state.profile.safeOuter / 2;
  const safeInnerRadius = state.profile.safeInner / 2;
  const viewBox = getViewBox();
  const svgStart = standalone
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="${state.profile.discOuter}mm" height="${state.profile.discOuter}mm" viewBox="${viewBox}">`
    : "";
  const svgEnd = standalone ? "</svg>" : "";
  const selectedId = interactive ? state.selectedId : "";
  const bg = test
    ? `<rect x="0" y="0" width="120" height="120" fill="white"></rect>`
    : (getActiveBackground().dataUrl ? buildBackground(maskId) : (interactive ? buildEmptyBackground(maskId) : ""));
  const objectMarkup = test
    ? ""
    : getCurrentObjects().filter((object) => object.visible !== false).map((object) => buildObject(object, selectedId)).join("");
  const testMarkup = test ? buildTestMarkup() : "";
  const guideMarkup = guides ? `
    <circle cx="60" cy="60" r="${outerRadius}" fill="none" stroke="#2563eb" stroke-width="0.35" stroke-dasharray="1.2 1.2"></circle>
    <circle cx="60" cy="60" r="${innerRadius}" fill="#f8fafc" stroke="#94a3b8" stroke-width="0.35"></circle>
    <circle cx="60" cy="60" r="${safeOuterRadius}" fill="none" stroke="#0f9f6e" stroke-width="0.28" stroke-dasharray="0.8 1.1"></circle>
    <circle cx="60" cy="60" r="${safeInnerRadius}" fill="none" stroke="#0f9f6e" stroke-width="0.28" stroke-dasharray="0.8 1.1"></circle>
    <line x1="3" y1="60" x2="117" y2="60" stroke="#d97706" stroke-width="0.18" stroke-dasharray="1 1.4"></line>
    <line x1="60" y1="3" x2="60" y2="117" stroke="#d97706" stroke-width="0.18" stroke-dasharray="1 1.4"></line>
  ` : "";

  return `${svgStart}
    <defs>
      <mask id="${maskId}" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
        <rect x="0" y="0" width="120" height="120" fill="black"></rect>
        <circle cx="60" cy="60" r="${outerRadius}" fill="white"></circle>
        <circle cx="60" cy="60" r="${innerRadius}" fill="black"></circle>
      </mask>
      <pattern id="emptyPattern" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#f8fafc"></rect>
        <path d="M0 8 L8 0" stroke="#e2e8f0" stroke-width="0.25"></path>
      </pattern>
    </defs>

    <circle cx="60" cy="60" r="${physicalRadius}" fill="#ffffff" stroke="${guides ? "#b8c2d1" : "none"}" stroke-width="0.35"></circle>
    <g mask="url(#${maskId})">
      ${bg}
      ${objectMarkup}
      ${testMarkup}
    </g>
    ${guideMarkup}
  ${svgEnd}`;
}

function buildCoverSvg({ interactive = false, standalone = false, guides = true } = {}) {
  const surface = getSurface();
  const { width, height } = getSurfaceSize();
  const clipId = standalone ? "coverPrintClip" : "coverClip";
  const svgStart = standalone
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="${width}mm" height="${height}mm" viewBox="0 0 ${width} ${height}">`
    : "";
  const svgEnd = standalone ? "</svg>" : "";
  const selectedId = interactive ? state.selectedId : "";
  const bg = getActiveBackground().dataUrl ? buildBackground("", width, height) : (interactive ? buildEmptyBackground("", width, height) : "");
  const objectMarkup = getCurrentObjects()
    .filter((object) => object.visible !== false)
    .map((object) => buildObject(object, selectedId))
    .join("");
  const guideMarkup = guides ? buildCoverGuides(surface, width, height) : "";

  return `${svgStart}
    <defs>
      <clipPath id="${clipId}">
        <rect x="0" y="0" width="${width}" height="${height}"></rect>
      </clipPath>
      <pattern id="emptyPattern" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#f8fafc"></rect>
        <path d="M0 8 L8 0" stroke="#e2e8f0" stroke-width="0.25"></path>
      </pattern>
    </defs>
    <rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" stroke="${guides ? "#b8c2d1" : "none"}" stroke-width="0.35"></rect>
    <g clip-path="url(#${clipId})">
      ${bg}
      ${objectMarkup}
    </g>
    ${guideMarkup}
  ${svgEnd}`;
}

function buildCoverGuides(surface, width, height) {
  const safe = surface.safe || 5;
  const guides = [
    `<rect x="${safe}" y="${safe}" width="${width - safe * 2}" height="${height - safe * 2}" fill="none" stroke="#0f9f6e" stroke-width="0.28" stroke-dasharray="0.8 1.1"></rect>`,
    `<line x1="${width / 2}" y1="0" x2="${width / 2}" y2="${height}" stroke="#d97706" stroke-width="0.18" stroke-dasharray="1 1.4"></line>`,
    `<line x1="0" y1="${height / 2}" x2="${width}" y2="${height / 2}" stroke="#d97706" stroke-width="0.18" stroke-dasharray="1 1.4"></line>`
  ];

  if (surface.kind === "back") {
    const spine = surface.spine || 6.5;
    guides.push(`<line x1="${spine}" y1="0" x2="${spine}" y2="${height}" stroke="#2563eb" stroke-width="0.3"></line>`);
    guides.push(`<line x1="${width - spine}" y1="0" x2="${width - spine}" y2="${height}" stroke="#2563eb" stroke-width="0.3"></line>`);
  }

  if (surface.kind === "booklet") {
    const fold = surface.fold || width / 2;
    guides.push(`<line x1="${fold}" y1="0" x2="${fold}" y2="${height}" stroke="#2563eb" stroke-width="0.3"></line>`);
  }

  return guides.join("");
}

function getViewBox() {
  const min = 60 - state.profile.discOuter / 2;
  const size = state.profile.discOuter;
  return `${min} ${min} ${size} ${size}`;
}

function buildBackground(maskId = "", width = 120, height = 120) {
  const bg = getActiveBackground();
  const scale = Number(bg.scale || 1);
  const x = Number(bg.x || 0);
  const y = Number(bg.y || 0);
  const rotation = Number(bg.rotation || 0);
  const centerX = width / 2;
  const centerY = height / 2;
  const mask = maskId ? ` mask="url(#${maskId})"` : "";
  const transform = `translate(${centerX + x} ${centerY + y}) rotate(${rotation}) scale(${scale}) translate(-${centerX} -${centerY})`;
  const filterStyle = buildFilterStyle(bg);
  return `<image href="${escapeAttribute(bg.dataUrl)}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" transform="${transform}"${mask}${filterStyle}></image>`;
}

function buildEmptyBackground(maskId = "", width = 120, height = 120) {
  const mask = maskId ? ` mask="url(#${maskId})"` : "";
  return `
    <rect x="0" y="0" width="${width}" height="${height}" fill="url(#emptyPattern)"${mask}></rect>
    <text x="${width / 2}" y="${height / 2}" fill="#94a3b8" font-size="3.2" font-weight="700" text-anchor="middle" dominant-baseline="middle">ЗАГРУЗИ ФОН</text>
  `;
}

function buildFilterStyle(source) {
  const effects = normalizeVisualEffects(source);
  if (
    effects.brightness === 100 &&
    effects.contrast === 100 &&
    effects.saturation === 100 &&
    effects.grayscale === 0
  ) {
    return "";
  }

  const value = [
    `brightness(${effects.brightness}%)`,
    `contrast(${effects.contrast}%)`,
    `saturate(${effects.saturation}%)`,
    `grayscale(${effects.grayscale}%)`
  ].join(" ");
  return ` style="filter: ${escapeAttribute(value)}"`;
}

function buildObject(object, selectedId) {
  const selectedClass = object.id === selectedId ? " selected" : "";
  const common = `data-object-id="${escapeAttribute(object.id)}" class="disc-object${selectedClass}"`;
  const fontFamily = escapeAttribute(object.fontFamily || "Inter, Segoe UI, Arial");
  const opacity = clamp(Number(object.opacity ?? 1), 0.1, 1);
  const center = getSurfaceCenter();
  const rotation = Number(object.rotation || 0);
  const x = Number(object.x ?? center.x);
  const y = Number(object.y ?? center.y);
  const size = Number(object.size || 4);

  if (object.type === "image") {
    const imageSize = Math.max(1, size || 24);
    const half = imageSize / 2;
    return `
      <image ${common}
        href="${escapeAttribute(object.dataUrl || "")}"
        x="${x - half}" y="${y - half}"
        width="${imageSize}" height="${imageSize}"
        preserveAspectRatio="xMidYMid meet"
        transform="rotate(${rotation} ${x} ${y})"
        opacity="${opacity}"${buildFilterStyle(object)}></image>
    `;
  }

  if (object.type === "circleText") {
    const pathId = `arc-${escapeAttribute(object.id)}`;
    const path = describeArc(center.x, center.y, Number(object.radius || 45), Number(object.start || -120), Number(object.start || -120) + Number(object.sweep || 240));
    return `
      <defs><path id="${pathId}" d="${path}"></path></defs>
      <text ${common} font-size="${number(object.size)}" font-family="${fontFamily}" font-weight="${escapeAttribute(object.weight || "700")}" fill="${escapeAttribute(object.color || "#111827")}" opacity="${opacity}" letter-spacing="0.35">
        <textPath href="#${pathId}" startOffset="50%" text-anchor="middle">${escapeText(object.text)}</textPath>
      </text>
    `;
  }

  const lines = String(object.text || "").split("\n");
  const anchor = object.align || "middle";
  const lineHeight = Number(object.lineHeight || 1.25);
  const tspans = lines.map((line, index) => {
    const dy = index === 0 ? 0 : size * lineHeight;
    return `<tspan x="${x}" dy="${index === 0 ? 0 : dy}">${escapeText(line)}</tspan>`;
  }).join("");

  return `
    <text ${common}
      x="${x}" y="${y}"
      transform="rotate(${rotation} ${x} ${y})"
      font-size="${size}"
      font-family="${fontFamily}"
      font-weight="${escapeAttribute(object.weight || "400")}"
      fill="${escapeAttribute(object.color || "#18212f")}"
      opacity="${opacity}"
      text-anchor="${anchor}"
      dominant-baseline="middle">${tspans}</text>
  `;
}

function buildTestMarkup() {
  const rings = [];
  for (let radius = 10; radius <= 60; radius += 10) {
    rings.push(`<circle cx="60" cy="60" r="${radius}" fill="none" stroke="#111827" stroke-width="0.18" stroke-dasharray="0.9 1.2"></circle>`);
  }

  const ticks = [];
  for (let angle = 0; angle < 360; angle += 10) {
    const outer = polarToCartesian(60, 60, 59, angle);
    const inner = polarToCartesian(60, 60, angle % 30 === 0 ? 54 : 56, angle);
    ticks.push(`<line x1="${inner.x}" y1="${inner.y}" x2="${outer.x}" y2="${outer.y}" stroke="#111827" stroke-width="${angle % 30 === 0 ? 0.32 : 0.18}"></line>`);
  }

  return `
    <rect x="0" y="0" width="120" height="120" fill="white"></rect>
    ${rings.join("")}
    ${ticks.join("")}
    <line x1="0" y1="60" x2="120" y2="60" stroke="#dc2626" stroke-width="0.35"></line>
    <line x1="60" y1="0" x2="60" y2="120" stroke="#dc2626" stroke-width="0.35"></line>
    <text x="60" y="53" text-anchor="middle" font-size="4" font-weight="800" fill="#111827">L805 TEST</text>
    <text x="60" y="66" text-anchor="middle" font-size="3" fill="#334155">проверь центр и введи смещение X/Y</text>
  `;
}

function renderLayers() {
  elements.layersList.innerHTML = "";
  const reversed = [...getCurrentObjects()].reverse();

  reversed.forEach((object) => {
    const row = document.createElement("div");
    row.className = `layer-row${object.id === state.selectedId ? " active" : ""}`;
    row.innerHTML = `
      <button type="button" class="layer-main">
        <span class="layer-name">${escapeText(getObjectDisplayName(object))}</span>
        <span class="layer-type">${getTypeLabel(object.type)}</span>
      </button>
      <span class="layer-actions">
        <button type="button" class="layer-action ${object.visible === false ? "off" : ""}" data-layer-action="visible" title="Показать/скрыть">V</button>
        <button type="button" class="layer-action ${object.locked ? "" : "off"}" data-layer-action="lock" title="Блокировка">L</button>
      </span>
    `;
    row.querySelector(".layer-main").addEventListener("click", () => {
      state.selectedId = object.id;
      persistAndRender();
    });
    row.querySelector('[data-layer-action="visible"]').addEventListener("click", (event) => {
      event.stopPropagation();
      state.selectedId = object.id;
      toggleSelectedVisibility();
    });
    row.querySelector('[data-layer-action="lock"]').addEventListener("click", (event) => {
      event.stopPropagation();
      state.selectedId = object.id;
      toggleSelectedLock();
    });
    elements.layersList.appendChild(row);
  });
}

function renderControls() {
  const profile = state.profile;
  const surface = getSurface();
  const size = getSurfaceSize();
  const bg = getActiveBackground();
  elements.surfaceSelect.value = state.surface;
  elements.discProfileSection.hidden = surface.kind !== "disc";
  elements.coverFormatSection.hidden = surface.kind === "disc";
  elements.coverFormatInfo.textContent = `${surface.label}: ${number(size.width, 1)}x${number(size.height, 1)} мм`;
  elements.presetSelect.value = state.preset;
  elements.outerInput.value = number(profile.printOuter, 1);
  elements.innerInput.value = number(profile.printInner, 1);
  elements.safeOuterInput.value = number(profile.safeOuter, 1);
  elements.safeInnerInput.value = number(profile.safeInner, 1);

  elements.bgScaleInput.value = Math.round(Number(bg.scale || 1) * 100);
  elements.bgScaleValue.value = `${elements.bgScaleInput.value}%`;
  elements.bgScaleValue.textContent = `${elements.bgScaleInput.value}%`;
  elements.bgXInput.value = number(bg.x, 1);
  elements.bgYInput.value = number(bg.y, 1);
  elements.bgRotationInput.value = number(bg.rotation, 1);
  setPercentControl("bgBrightness", bg.brightness);
  setPercentControl("bgContrast", bg.contrast);
  setPercentControl("bgSaturation", bg.saturation);
  setPercentControl("bgGrayscale", bg.grayscale);

  elements.calXInput.value = number(state.calibration.x, 1);
  elements.calYInput.value = number(state.calibration.y, 1);
  elements.calScaleInput.value = number(state.calibration.scale, 1);
  elements.calRotationInput.value = number(state.calibration.rotation, 1);
  setPercentControl("calInk", state.calibration.inkDensity);

  const selected = getSelectedObject();
  elements.objectControls.hidden = !selected;
  elements.emptySelection.hidden = Boolean(selected);

  if (!selected) return;

  const isImage = selected.type === "image";
  elements.objectTextInput.value = selected.text || "";
  elements.objectTextInput.disabled = isImage;
  elements.objectTextInput.closest(".field").querySelector("span").textContent = isImage ? "Изображение" : "Текст";
  elements.objectXInput.value = number(selected.x, 1);
  elements.objectYInput.value = number(selected.y, 1);
  elements.objectSizeInput.value = number(selected.size, 1);
  elements.objectRotationInput.value = number(selected.rotation || 0, 1);
  elements.objectFontInput.value = selected.fontFamily || "Inter, Segoe UI, Arial";
  elements.objectColorInput.value = selected.color || "#111827";
  elements.objectWeightInput.value = selected.weight || "400";
  elements.objectAlignInput.value = selected.align || "middle";
  elements.objectOpacityInput.value = Math.round(clamp(Number(selected.opacity ?? 1), 0.1, 1) * 100);
  elements.objectOpacityValue.value = `${elements.objectOpacityInput.value}%`;
  elements.objectOpacityValue.textContent = `${elements.objectOpacityInput.value}%`;
  setPercentControl("objectBrightness", selected.brightness);
  setPercentControl("objectContrast", selected.contrast);
  setPercentControl("objectSaturation", selected.saturation);
  setPercentControl("objectGrayscale", selected.grayscale);
  $("#toggleVisibleBtn").textContent = selected.visible === false ? "Показать" : "Скрыть";
  $("#toggleLockBtn").textContent = selected.locked ? "Разблок" : "Блок";

  const isCircle = selected.type === "circleText";
  elements.circleTextControls.classList.toggle("visible", isCircle);
  elements.objectXInput.disabled = isCircle;
  elements.objectYInput.disabled = isCircle;
  elements.objectRotationInput.disabled = isCircle;
  elements.objectFontInput.disabled = isImage;
  elements.objectColorInput.disabled = isImage;
  elements.objectWeightInput.disabled = isImage;
  elements.objectAlignInput.disabled = isCircle || isImage;
  elements.imageEffectControls.classList.toggle("visible", isImage);

  if (isCircle) {
    elements.objectRadiusInput.value = number(selected.radius, 1);
    elements.objectSweepInput.value = number(selected.sweep, 0);
    elements.objectStartInput.value = number(selected.start, 0);
  }
}

function setPercentControl(prefix, value) {
  const input = elements[`${prefix}Input`];
  const output = elements[`${prefix}Value`];
  if (!input || !output) return;
  input.value = Math.round(Number(value ?? 100));
  output.value = `${input.value}%`;
  output.textContent = `${input.value}%`;
}

function renderStatus() {
  const preset = PRESETS[state.preset] || PRESETS.full;
  const surface = getSurface();
  const size = getSurfaceSize();
  elements.canvasReadout.textContent = surface.kind === "disc"
    ? `${state.profile.discOuter} мм / ${preset.label}`
    : `${surface.label} / ${number(size.width, 1)}x${number(size.height, 1)} мм`;
  elements.statusProfile.textContent = surface.kind === "disc"
    ? `Epson L805 / ${preset.label}`
    : `Epson L805 / ${surface.label}`;
  elements.statusCalibration.textContent = `X ${number(state.calibration.x, 1)} мм, Y ${number(state.calibration.y, 1)} мм, ${number(state.calibration.scale, 1)}%, ink ${number(state.calibration.inkDensity ?? 100, 0)}%`;
}

function handleBackgroundUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const bg = getActiveBackground();
    bg.dataUrl = String(reader.result || "");
    bg.scale = 1;
    bg.x = 0;
    bg.y = 0;
    bg.rotation = 0;
    Object.assign(bg, DEFAULT_EFFECTS);
    persistAndRender("Фон загружен");
  };
  reader.readAsDataURL(file);
  event.target.value = "";
}

function handleImageLayerUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const center = getSurfaceCenter();
    const object = {
      id: createId("image"),
      type: "image",
      name: file.name.replace(/\.[^.]+$/, "") || "Лого",
      text: file.name,
      dataUrl: String(reader.result || ""),
      x: center.x,
      y: state.surface === "disc" ? 28 : center.y,
      size: 16,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      surface: state.surface,
      ...DEFAULT_EFFECTS
    };
    state.objects.push(object);
    state.selectedId = object.id;
    persistAndRender("Картинка добавлена");
  };
  reader.readAsDataURL(file);
  event.target.value = "";
}

function handleProjectUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    loadProjectText(String(reader.result || ""));
  };
  reader.readAsText(file, "utf-8");
  event.target.value = "";
}

async function openProjectFile() {
  if (window.l805Desktop?.openTextFile) {
    const result = await window.l805Desktop.openTextFile({
      title: "Открыть проект L805",
      filters: [{ name: "L805 project", extensions: ["json"] }]
    });
    if (result?.canceled || !result?.text) return;
    loadProjectText(result.text);
    return;
  }

  elements.projectFileInput.click();
}

function loadProjectText(text) {
  const project = readJson(text);
  if (!project) {
    setStatus("Не удалось открыть JSON проекта");
    return;
  }
  state = normalizeProject(project);
  persistProject();
  setStatus("Проект открыт");
  render();
}

function handleTrackFileUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const parsed = parseTrackText(String(reader.result || ""), file.name);
    if (!parsed.tracks.length) {
      setStatus("Треки не найдены");
      return;
    }

    const tracklistText = parsed.tracks.map((track, index) => `${String(index + 1).padStart(2, "0")}. ${track}`).join("\n");
    let trackObject = getCurrentObjects().find((object) => object.type === "tracklist");
    if (!trackObject) {
      trackObject = createTracklistObject(tracklistText);
      state.objects.push(trackObject);
    } else {
      trackObject.text = tracklistText;
      trackObject.name = getObjectDisplayName(trackObject);
      trackObject.visible = true;
    }

    const titleObject = getCurrentObjects().find((object) => object.id === "title" || object.type === "text");
    if (titleObject && (parsed.artist || parsed.album)) {
      titleObject.text = [parsed.artist, parsed.album].filter(Boolean).join(" / ");
      titleObject.name = getObjectDisplayName(titleObject);
      titleObject.visible = true;
    }

    state.selectedId = trackObject.id;
    persistAndRender(`Импортировано треков: ${parsed.tracks.length}`);
  };
  reader.readAsText(file, "utf-8");
  event.target.value = "";
}

function parseTrackText(content, filename) {
  const lines = content.split(/\r?\n/);
  const isCue = /\.cue$/i.test(filename) || lines.some((line) => /^\s*TRACK\s+\d+/i.test(line));
  const result = {
    artist: "",
    album: "",
    tracks: []
  };

  if (isCue) {
    let inTrack = false;
    for (const line of lines) {
      if (/^\s*TRACK\s+\d+/i.test(line)) {
        inTrack = true;
        continue;
      }

      const title = line.match(/^\s*TITLE\s+"?(.+?)"?\s*$/i);
      if (title) {
        const value = cleanCueValue(title[1]);
        if (inTrack) {
          result.tracks.push(value);
        } else if (!result.album) {
          result.album = value;
        }
        continue;
      }

      const performer = line.match(/^\s*PERFORMER\s+"?(.+?)"?\s*$/i);
      if (performer && !inTrack && !result.artist) {
        result.artist = cleanCueValue(performer[1]);
      }
    }
  } else {
    result.tracks = lines
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^\d+[\s)._-]+/, "").split(/[;,]\s*/).filter(Boolean).at(-1) || line);
  }

  result.tracks = result.tracks.map(cleanCueValue).filter(Boolean);
  return result;
}

function cleanCueValue(value) {
  return String(value || "").trim().replace(/^"|"$/g, "");
}

function addText() {
  const center = getSurfaceCenter();
  const object = {
    id: createId("text"),
    type: "text",
    name: "Новый текст",
    text: "NEW TEXT",
    x: center.x,
    y: center.y,
    size: 5,
    rotation: 0,
    color: "#111827",
    weight: "700",
    align: "middle",
    fontFamily: "Inter, Segoe UI, Arial",
    opacity: 1,
    visible: true,
    locked: false,
    surface: state.surface
  };
  state.objects.push(object);
  state.selectedId = object.id;
  persistAndRender("Добавлен текст");
}

function addCircleText() {
  if (getSurface().kind !== "disc") {
    setStatus("Круговой текст доступен только для диска");
    return;
  }

  const object = {
    id: createId("circle"),
    type: "circleText",
    name: "Текст по кругу",
    text: "PRINTABLE DISC",
    x: 60,
    y: 60,
    size: 4,
    rotation: 0,
    color: "#111827",
    weight: "700",
    fontFamily: "Inter, Segoe UI, Arial",
    opacity: 1,
    visible: true,
    locked: false,
    surface: "disc",
    radius: 48,
    start: -115,
    sweep: 230
  };
  state.objects.push(object);
  state.selectedId = object.id;
  persistAndRender("Добавлен круговой текст");
}

function addTracklist() {
  const object = createTracklistObject("01. Track Name\n02. Track Name\n03. Track Name");
  state.objects.push(object);
  state.selectedId = object.id;
  persistAndRender("Добавлен треклист");
}

function createTracklistObject(text) {
  const center = getSurfaceCenter();
  return {
    id: createId("tracks"),
    type: "tracklist",
    name: "Треклист",
    text,
    x: center.x,
    y: state.surface === "disc" ? 86 : center.y,
    size: 3.2,
    rotation: 0,
    color: "#18212f",
    weight: "400",
    align: "middle",
    fontFamily: "Inter, Segoe UI, Arial",
    opacity: 1,
    visible: true,
    locked: false,
    surface: state.surface,
    lineHeight: 1.35
  };
}

function deleteSelectedObject() {
  if (!state.selectedId) return;
  const index = state.objects.findIndex((object) => object.id === state.selectedId);
  if (index < 0) return;
  if (state.objects[index].locked) {
    setStatus("Слой заблокирован");
    return;
  }
  state.objects.splice(index, 1);
  state.selectedId = state.objects[index - 1]?.id || state.objects[0]?.id || "";
  persistAndRender("Слой удален");
}

function duplicateSelectedObject() {
  const selected = getSelectedObject();
  if (!selected) return;
  const copy = structuredClone(selected);
  copy.id = createId(selected.type);
  copy.name = `${getObjectDisplayName(selected)} copy`;
  copy.locked = false;
  copy.visible = true;
  if (copy.type !== "circleText") {
    const { width, height } = getSurfaceSize();
    copy.x = clamp(Number(copy.x ?? width / 2) + 4, 0, width);
    copy.y = clamp(Number(copy.y ?? height / 2) + 4, 0, height);
  }
  state.objects.push(copy);
  state.selectedId = copy.id;
  persistAndRender("Слой скопирован");
}

function moveSelectedLayer(direction) {
  const index = state.objects.findIndex((object) => object.id === state.selectedId);
  if (index < 0) return;
  const nextIndex = clamp(index + direction, 0, state.objects.length - 1);
  if (nextIndex === index) return;
  const [object] = state.objects.splice(index, 1);
  state.objects.splice(nextIndex, 0, object);
  persistAndRender(direction > 0 ? "Слой поднят" : "Слой опущен");
}

function nudgeSelectedObject(key, step) {
  const selected = getSelectedObject();
  if (!selected || selected.locked || selected.type === "circleText") return;
  const { width, height } = getSurfaceSize();

  if (key === "ArrowLeft") selected.x = clamp(Number(selected.x ?? width / 2) - step, 0, width);
  if (key === "ArrowRight") selected.x = clamp(Number(selected.x ?? width / 2) + step, 0, width);
  if (key === "ArrowUp") selected.y = clamp(Number(selected.y ?? height / 2) - step, 0, height);
  if (key === "ArrowDown") selected.y = clamp(Number(selected.y ?? height / 2) + step, 0, height);

  persistAndRender("Объект сдвинут");
}

function alignSelectedObject(axis) {
  const selected = getSelectedObject();
  if (!selected || selected.locked || selected.type === "circleText") return;
  const center = getSurfaceCenter();

  if (axis === "x") selected.x = center.x;
  if (axis === "y") selected.y = center.y;
  persistAndRender(axis === "x" ? "Объект по центру X" : "Объект по центру Y");
}

function snapSelectedToSafeArea() {
  const selected = getSelectedObject();
  if (!selected || selected.locked) return;

  if (selected.type === "circleText") {
    selected.radius = Math.max(state.profile.safeInner / 2 + 2, state.profile.safeOuter / 2 - 6);
  } else {
    const center = getSurfaceCenter();
    selected.x = center.x;
    selected.y = center.y;
  }

  persistAndRender("Объект привязан к safe zone");
}

function runPreflight() {
  const messages = [];
  const errors = [];
  const warnings = [];
  const surface = getSurface();
  const { width, height } = getSurfaceSize();
  const visibleObjects = getCurrentObjects().filter((object) => object.visible !== false);
  const hiddenCount = getCurrentObjects().length - visibleObjects.length;
  const printOuter = state.profile.printOuter / 2;
  const printInner = state.profile.printInner / 2;
  const safeOuter = state.profile.safeOuter / 2;
  const safeInner = state.profile.safeInner / 2;
  const safe = surface.safe || 5;

  if (surface.kind === "disc" && state.profile.printInner >= state.profile.printOuter) {
    errors.push("Внутренний диаметр больше или равен внешнему.");
  }

  if (surface.kind === "disc" && state.profile.safeInner >= state.profile.safeOuter) {
    errors.push("Safe in больше или равен Safe out.");
  }

  if (!getActiveBackground().dataUrl) {
    warnings.push("Фон не загружен. Если нужен полный принт, добавь обложку.");
  }

  if (!visibleObjects.length && !getActiveBackground().dataUrl) {
    warnings.push("Нет видимых объектов и фона.");
  }

  if (hiddenCount) {
    messages.push(`Скрытых слоев: ${hiddenCount}.`);
  }

  visibleObjects.forEach((object) => {
    if (object.type !== "image" && !String(object.text || "").trim()) {
      warnings.push(`Пустой слой: ${getObjectDisplayName(object)}.`);
      return;
    }

    const rect = estimateObjectRect(object);
    if (!rect) return;

    if (surface.kind === "disc") {
      const bounds = estimateObjectBounds(object);
      if (!bounds) return;

      if (bounds.outer > printOuter || bounds.inner < printInner) {
        errors.push(`Слой "${getObjectDisplayName(object)}" выходит за область печати.`);
      } else if (bounds.outer > safeOuter || bounds.inner < safeInner) {
        warnings.push(`Слой "${getObjectDisplayName(object)}" близко к краю или отверстию.`);
      }
    } else if (rect.left < 0 || rect.top < 0 || rect.right > width || rect.bottom > height) {
      errors.push(`Слой "${getObjectDisplayName(object)}" выходит за край обложки.`);
    } else if (rect.left < safe || rect.top < safe || rect.right > width - safe || rect.bottom > height - safe) {
      warnings.push(`Слой "${getObjectDisplayName(object)}" близко к краю safe zone.`);
    }
  });

  const cssClass = errors.length ? "error" : (warnings.length ? "warn" : "ok");
  const summary = errors.length
    ? `Ошибки: ${errors.length}, предупреждения: ${warnings.length}.`
    : (warnings.length ? `Предупреждения: ${warnings.length}.` : "Макет готов к печати.");
  const items = [...errors, ...warnings, ...messages];

  elements.preflightResults.className = `preflight-results ${cssClass}`;
  elements.preflightResults.innerHTML = items.length
    ? `<strong>${escapeText(summary)}</strong><ul>${items.map((item) => `<li>${escapeText(item)}</li>`).join("")}</ul>`
    : `<strong>${escapeText(summary)}</strong>`;
  setStatus(summary);
}

function estimateObjectBounds(object) {
  if (object.type === "circleText") {
    const radius = Number(object.radius || 0);
    const size = Number(object.size || 4);
    return {
      inner: radius - size,
      outer: radius + size
    };
  }

  const rect = estimateObjectRect(object);
  if (!rect) return null;
  return estimateRectangleBounds(rect.left, rect.right, rect.top, rect.bottom);
}

function estimateObjectRect(object) {
  const center = getSurfaceCenter();
  const x = Number(object.x ?? center.x);
  const y = Number(object.y ?? center.y);

  if (object.type === "image") {
    const size = Number(object.size || 24);
    return {
      left: x - size / 2,
      right: x + size / 2,
      top: y - size / 2,
      bottom: y + size / 2
    };
  }

  if (object.type === "circleText") {
    const radius = Number(object.radius || 0);
    const size = Number(object.size || 4);
    return {
      left: center.x - radius - size,
      right: center.x + radius + size,
      top: center.y - radius - size,
      bottom: center.y + radius + size
    };
  }

  const lines = String(object.text || "").split("\n");
  const size = Number(object.size || 4);
  const width = Math.max(...lines.map((line) => line.length), 1) * size * 0.55;
  const lineHeight = Number(object.lineHeight || 1.25);
  const textHeight = lines.length === 1
    ? size
    : (lines.length - 1) * size * lineHeight + size;
  const anchor = object.align || "middle";
  const left = anchor === "start" ? x : (anchor === "end" ? x - width : x - width / 2);
  const right = anchor === "start" ? x + width : (anchor === "end" ? x : x + width / 2);
  const top = lines.length === 1 ? y - textHeight / 2 : y - size / 2;
  const bottom = lines.length === 1 ? y + textHeight / 2 : y + (lines.length - 1) * size * lineHeight + size / 2;

  return { left, right, top, bottom };
}

function estimateRectangleBounds(left, right, top, bottom) {
  const center = getSurfaceCenter();
  const corners = [
    [left, top],
    [right, top],
    [right, bottom],
    [left, bottom]
  ];
  const outer = Math.max(...corners.map(([x, y]) => Math.hypot(x - center.x, y - center.y)));
  const dx = left > center.x ? left - center.x : (right < center.x ? center.x - right : 0);
  const dy = top > center.y ? top - center.y : (bottom < center.y ? center.y - bottom : 0);
  const inner = Math.hypot(dx, dy);

  return { inner, outer };
}

function toggleSelectedVisibility() {
  const selected = getSelectedObject();
  if (!selected) return;
  selected.visible = selected.visible === false;
  persistAndRender(selected.visible ? "Слой показан" : "Слой скрыт");
}

function toggleSelectedLock() {
  const selected = getSelectedObject();
  if (!selected) return;
  selected.locked = !selected.locked;
  persistAndRender(selected.locked ? "Слой заблокирован" : "Слой разблокирован");
}

function centerBackground() {
  const bg = getActiveBackground();
  bg.x = 0;
  bg.y = 0;
  bg.rotation = 0;
  persistAndRender("Фон выровнен по центру");
}

function coverBackground() {
  const bg = getActiveBackground();
  bg.scale = 1;
  bg.x = 0;
  bg.y = 0;
  bg.rotation = 0;
  persistAndRender("Фон заполнен по диску");
}

function clearBackground() {
  state.backgrounds[state.surface] = createEmptyBackground();
  persistAndRender("Фон удален");
}

function applyAlbumTemplate() {
  state.surface = "disc";
  const discObjects = structuredClone(DEFAULT_PROJECT.objects).map((object) => ({
    ...normalizeObject(object),
    id: object.id === "title" ? "title" : createId(object.type)
  }));
  replaceSurfaceObjects("disc", discObjects);
  state.selectedId = "title";
  persistAndRender("Шаблон альбома применен");
}

function applyCoverTemplate() {
  if (getSurface().kind === "disc") {
    state.surface = "front";
  }

  const surface = getSurface();
  const { width, height } = getSurfaceSize();
  const center = getSurfaceCenter();
  const objects = [];

  if (state.surface === "front") {
    objects.push(createTextObject("cover-title", "ARTIST / ALBUM", center.x, 50, 7.2, "800"));
    objects.push(createTextObject(createId("text"), "SPECIAL EDITION", center.x, 72, 3.4, "600"));
  } else if (state.surface === "back") {
    objects.push(createTextObject(createId("text"), "ARTIST / ALBUM", center.x, 14, 5.2, "800"));
    objects.push(createTracklistObject("01. First Track\n02. Second Track\n03. Third Track"));
    objects.at(-1).x = center.x;
    objects.at(-1).y = 34;
    objects.at(-1).size = 3.4;
    objects.push(createTextObject(createId("spine"), "ARTIST - ALBUM", 3.4, height / 2, 3.2, "700", -90));
    objects.push(createTextObject(createId("spine"), "ARTIST - ALBUM", width - 3.4, height / 2, 3.2, "700", 90));
  } else if (state.surface === "booklet") {
    objects.push(createTextObject(createId("text"), "ARTIST / ALBUM", width * 0.25, center.y, 6.4, "800"));
    objects.push(createTextObject(createId("text"), "LINER NOTES", width * 0.75, 28, 4.2, "700"));
    objects.push(createTracklistObject("01. First Track\n02. Second Track\n03. Third Track"));
    objects.at(-1).x = width * 0.75;
    objects.at(-1).y = 48;
  }

  replaceSurfaceObjects(state.surface, objects);
  state.selectedId = objects[0]?.id || "";
  persistAndRender(`Шаблон обложки: ${surface.label}`);
}

function createTextObject(id, text, x, y, size, weight = "700", rotation = 0) {
  return {
    id,
    type: "text",
    name: text,
    text,
    x,
    y,
    size,
    rotation,
    color: "#111827",
    weight,
    align: "middle",
    fontFamily: "Inter, Segoe UI, Arial",
    opacity: 1,
    visible: true,
    locked: false,
    surface: state.surface
  };
}

function replaceSurfaceObjects(surface, objects) {
  state.objects = state.objects.filter((object) => (object.surface || "disc") !== surface);
  state.objects.push(...objects);
}

function resetCalibration() {
  state.calibration = { x: 0, y: 0, scale: 100, rotation: 0 };
  localStorage.removeItem(CALIBRATION_KEY);
  persistAndRender("Калибровка сброшена");
}

function saveCalibration() {
  localStorage.setItem(CALIBRATION_KEY, JSON.stringify(state.calibration));
  setStatus("Калибровка L805 сохранена");
}

function saveProjectFile() {
  persistProject();
  downloadText("l805-disc-project.json", JSON.stringify(state, null, 2), "application/json");
  setStatus("Проект сохранен в JSON");
}

function exportSvg() {
  const svg = buildDiscSvg({ standalone: true, guides: false });
  downloadText(`${getExportBaseName()}.svg`, svg, "image/svg+xml");
  setStatus("SVG экспортирован");
}

function getExportBaseName() {
  return `l805-${state.surface}-layout`;
}

function exportPng() {
  const svg = buildDiscSvg({ standalone: true, guides: false });
  const dpi = 300;
  const { width, height } = getSurfaceSize();
  const pixelsWidth = Math.round(width / 25.4 * dpi);
  const pixelsHeight = Math.round(height / 25.4 * dpi);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const image = new Image();

  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = pixelsWidth;
    canvas.height = pixelsHeight;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, pixelsWidth, pixelsHeight);
    canvas.toBlob((pngBlob) => {
      URL.revokeObjectURL(url);
      if (!pngBlob) {
        setStatus("PNG не создан");
        return;
      }
      downloadBlob(`${getExportBaseName()}-300dpi.png`, pngBlob);
      setStatus(`PNG экспортирован: ${pixelsWidth}x${pixelsHeight}`);
    }, "image/png");
  };

  image.onerror = () => {
    URL.revokeObjectURL(url);
    setStatus("Не удалось экспортировать PNG");
  };

  image.src = url;
}

function openPrintWindow(mode) {
  const isTest = mode === "test";
  const isPdf = mode === "pdf";
  const surface = getSurface();
  const { width, height } = getSurfaceSize();
  const svg = buildDiscSvg({
    standalone: true,
    test: isTest && surface.kind === "disc",
    guides: isTest || surface.kind !== "disc"
  });
  const transform = `translate(${state.calibration.x}mm, ${state.calibration.y}mm) rotate(${state.calibration.rotation}deg) scale(${state.calibration.scale / 100})`;
  const inkDensity = clamp(Number(state.calibration.inkDensity ?? 100), 40, 120);
  const printFilter = isTest ? "none" : `saturate(${inkDensity}%)`;
  const title = isTest ? "L805 calibration test" : (isPdf ? "L805 PDF export" : `L805 ${state.surface} print`);
  const noteText = isPdf
    ? "Экспорт PDF: в диалоге печати выбери Save as PDF, масштаб 100%, без подгонки под страницу."
    : "Печать Epson L805: выбери источник CD/DVD Tray, масштаб 100%, без подгонки под страницу. После теста внеси поправку X/Y в основной программе.";
  const printWindow = window.open("", "_blank", "width=820,height=720");

  if (!printWindow) {
    setStatus("Браузер заблокировал окно печати");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
    <html lang="ru">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          @page { size: ${width}mm ${height}mm; margin: 0; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #eef1f5;
            font-family: "Segoe UI", Arial, sans-serif;
            color: #18212f;
          }
          .screen-note {
            position: fixed;
            top: 18px;
            left: 18px;
            right: 18px;
            padding: 12px 14px;
            border: 1px solid #d8dee8;
            border-radius: 8px;
            background: white;
            font-size: 13px;
            box-shadow: 0 14px 38px rgba(28, 39, 61, 0.13);
          }
          .print-stage {
            width: ${width}mm;
            height: ${height}mm;
            transform: ${transform};
            transform-origin: center center;
            filter: ${printFilter};
          }
          .print-stage svg {
            display: block;
            width: ${width}mm;
            height: ${height}mm;
          }
          @media print {
            body {
              display: block;
              min-height: 0;
              background: transparent;
            }
            .screen-note {
              display: none;
            }
            .print-stage {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="screen-note">
          ${noteText}
        </div>
        <main class="print-stage">${svg}</main>
        <script>
          window.addEventListener("load", () => setTimeout(() => window.print(), 300));
        </script>
      </body>
    </html>`);
  printWindow.document.close();
  setStatus(isTest ? "Открыт тест печати" : (isPdf ? "Открыт экспорт PDF" : "Открыт макет печати"));
}

function handlePointerDown(event) {
  const target = event.target.closest("[data-object-id]");
  if (!target) {
    state.selectedId = "";
    persistAndRender();
    return;
  }

  const id = target.getAttribute("data-object-id");
  const object = state.objects.find((item) => item.id === id);
  if (!object) return;

  state.selectedId = id;

  if (object.locked) {
    persistAndRender("Слой заблокирован");
    return;
  }

  if (object.type !== "circleText") {
    const point = clientToSvgPoint(event.clientX, event.clientY);
    const center = getSurfaceCenter();
    dragState = {
      id,
      startPoint: point,
      startX: Number(object.x ?? center.x),
      startY: Number(object.y ?? center.y)
    };
    elements.discSvg.setPointerCapture?.(event.pointerId);
  }

  persistAndRender();
}

function handlePointerMove(event) {
  if (!dragState) return;
  const object = state.objects.find((item) => item.id === dragState.id);
  if (!object) return;
  const point = clientToSvgPoint(event.clientX, event.clientY);
  const { width, height } = getSurfaceSize();
  object.x = clamp(dragState.startX + point.x - dragState.startPoint.x, 0, width);
  object.y = clamp(dragState.startY + point.y - dragState.startPoint.y, 0, height);
  render();
}

function handlePointerUp() {
  if (!dragState) return;
  dragState = null;
  persistProject();
}

function clientToSvgPoint(clientX, clientY) {
  const point = elements.discSvg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const matrix = elements.discSvg.getScreenCTM();
  if (!matrix) return getSurfaceCenter();
  return point.matrixTransform(matrix.inverse());
}

function persistAndRender(message) {
  persistProject();
  if (message) setStatus(message);
  render();
}

function persistProject(options = {}) {
  const { record = true } = options;
  if (record) recordHistory();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function recordHistory() {
  const snapshot = JSON.stringify(state);
  if (historyPast[historyPast.length - 1] === snapshot) return;
  historyPast.push(snapshot);
  if (historyPast.length > 60) historyPast.shift();
  historyFuture = [];
}

function undoChange() {
  if (historyPast.length <= 1) {
    setStatus("Нечего отменять");
    return;
  }

  const current = historyPast.pop();
  historyFuture.push(current);
  state = normalizeProject(JSON.parse(historyPast[historyPast.length - 1]));
  persistProject({ record: false });
  setStatus("Отменено");
  render();
}

function redoChange() {
  if (!historyFuture.length) {
    setStatus("Нечего повторять");
    return;
  }

  const snapshot = historyFuture.pop();
  historyPast.push(snapshot);
  state = normalizeProject(JSON.parse(snapshot));
  persistProject({ record: false });
  setStatus("Повторено");
  render();
}

function getSelectedObject() {
  return state.objects.find((object) => object.id === state.selectedId) || null;
}

function getObjectDisplayName(object) {
  if (object.type === "image") return object.name || "Картинка";
  const text = String(object.text || "").split("\n")[0].trim();
  if (text) return text.slice(0, 42);
  return object.name || getTypeLabel(object.type);
}

function getTypeLabel(type) {
  if (type === "image") return "картинка";
  if (type === "circleText") return "текст по кругу";
  if (type === "tracklist") return "треклист";
  return "текст";
}

function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function setStatus(message) {
  elements.statusMessage.textContent = message;
}

function downloadText(filename, text, mimeType) {
  const blob = new Blob([text], { type: mimeType });
  downloadBlob(filename, blob);
}

async function downloadBlob(filename, blob) {
  if (window.l805Desktop?.saveBlob) {
    const result = await window.l805Desktop.saveBlob({
      filename,
      buffer: await blob.arrayBuffer()
    });
    if (!result?.canceled) {
      setStatus(`Файл сохранен: ${result.filePath || filename}`);
    }
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function describeArc(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, endAngle);
  const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

function polarToCartesian(cx, cy, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians)
  };
}

function escapeText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttribute(value) {
  return escapeText(value).replaceAll('"', "&quot;");
}

function number(value, digits = 2) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "0";
  return parsed.toFixed(digits).replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}
