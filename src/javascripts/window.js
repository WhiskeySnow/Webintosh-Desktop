import { createAlert } from "./ui/alert.js";
import { updateMenu } from "./finderbar.js";

let fd = document.querySelector(".finderbar");
export let zIndex = 5;
window.specialCloses = {};

let activeDraggingWindow = null;
let activeResizingWindow = null;

function getWorkspaceBounds() {
  const finderbar = document.getElementById("finderbar");
  const dockContainer = document.querySelector(".dockcontainer");

  const top = finderbar ? finderbar.getBoundingClientRect().bottom : 0;

  let bottom = window.innerHeight;

  if (dockContainer) {
    const dockRect = dockContainer.getBoundingClientRect();

    if (dockRect.top > 0 && dockRect.top < window.innerHeight) {
      bottom = dockRect.top;
    }
  }

  return {
    top,
    bottom,
    left: 0,
    right: window.innerWidth,
    width: window.innerWidth,
    height: Math.max(0, bottom - top)
  };
}

function clampWindowToWorkspace(win, center = false) {
  if (!win) return;

  const workspace = getWorkspaceBounds();

  if (win.offsetHeight > workspace.height) {
    win.style.height = workspace.height + "px";
  }

  if (win.offsetWidth > workspace.width) {
    win.style.width = workspace.width + "px";
  }

  const width = win.offsetWidth;
  const height = win.offsetHeight;

  let left = parseFloat(win.style.left);
  let top = parseFloat(win.style.top);

  if (Number.isNaN(left)) {
    left = win.getBoundingClientRect().left;
  }

  if (Number.isNaN(top)) {
    top = win.getBoundingClientRect().top;
  }

  if (center) {
    left = workspace.left + (workspace.width - width) / 2;
    top = workspace.top + (workspace.height - height) / 2;
  }

  const maxLeft = Math.max(workspace.left, workspace.right - width);
  const maxTop = Math.max(workspace.top, workspace.bottom - height);

  left = Math.min(Math.max(left, workspace.left), maxLeft);
  top = Math.min(Math.max(top, workspace.top), maxTop);

  win.style.left = left + "px";
  win.style.top = top + "px";
}

function clampAllWindowsToWorkspace() {
  document.querySelectorAll(".window").forEach((win) => {
    if (!win.isFullscreen && !win.isStretched) {
      clampWindowToWorkspace(win, false);
    }
  });
}

export function create(file, name, light = null, centered = false) {
  const cleanFile = file.split("/").pop().split(".")[0];
  if (!name) name = cleanFile;
  const existing = document.getElementById(name);
  if (existing) {
    bringToFront(existing, name);
    return;
  }

  fetch(file)
    .then((response) => {
      if (response.status !== 200) {
        createAlert(
          "./assets/icons/访达.svg",
          "加载 App 时遇到错误",
          `此 App 仍在开发中<br/>服务器返回状态码: ${response.status}`,
          "好",
          "close",
        );
        return;
      }
      response.text().then((content) => {
        document.body.insertAdjacentHTML("beforeend", content);
        const wins = document.querySelectorAll(".window");
        if (wins.length) {
          const newWin = wins[wins.length - 1];
          if (newWin && !newWin.id) newWin.id = name;

          clampWindowToWorkspace(newWin, centered);

          setTimeout(() => {
            clampWindowToWorkspace(newWin, centered);
          }, 50);

          setTimeout(() => {
            clampWindowToWorkspace(newWin, centered);
          }, 200);

          const resizer = document.createElement("div");
          resizer.className = "resizer";
          newWin.appendChild(resizer);
          addResizeListener(newWin, resizer);
        }
        let script = document.createElement("script");
        script.src = `./src/javascripts/apps/${cleanFile}.js?v=${Date.now()}`;
        script.type = "module";
        script.setAttribute("app", cleanFile);
        document.body.appendChild(script);
        let link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = `./assets/stylesheets/apps/${cleanFile}/index.css`;
        document.querySelector("head").appendChild(link);
      });
    })
    .catch((error) => {
      console.error("Error opening app:", error);
    });
  setTimeout(() => {
    resetWindowListeners(name, light);
  }, 150);
  setTimeout(() => {
    resetWindowListeners(name, light);
  }, 300);
  setTimeout(() => {
    resetWindowListeners(name, light);
  }, 450);
}

// 通用设置窗口位置（大小）的函数
export function setWindowPosition(win, left, top, width, height, zIndex) {
  if (left !== undefined) win.style.left = left;
  if (top !== undefined) win.style.top = top;
  if (width !== undefined) win.style.width = width;
  if (height !== undefined) win.style.height = height;
  if (zIndex !== undefined) win.style.zIndex = zIndex;
}

export function resetWindowListeners(name, light = null) {
  let windows = document.querySelectorAll(".window");
  windows.forEach((win) => {
    let closeBtn = win.querySelector(".wintools .red");
    let miniBtn =
      win.querySelector(".wintools .yellow") ||
      win.querySelectorAll(".wintools .gray")[0];
    let zoomBtn =
      win.querySelector(".wintools .green") ||
      win.querySelectorAll(".wintools .gray")[1];

    if (!win.isStretched) win.isStretched = false;

    // 关闭窗口
    const closeWindow = () => {
      win.remove();
      const s = document.querySelector(`script[app="${name}"]`);
      if (s) s.remove();
      if (light) light.classList.remove("on");
      if (window.appStatus) window.appStatus[name] = false;
    };

    // 切换拉伸窗口至桌面空白（保留顶部状态栏和底部dock的全屏）
    const toggleStretchWindow = (withTransition = true) => {
      if (withTransition) {
        win.style.transition =
          "left 0.3s ease, top 0.3s ease, width 0.3s ease, height 0.3s ease";
      }
      if (!win.isStretched) {
        const workspace = getWorkspaceBounds();

        win._preStretchState = {
          left: win.style.left,
          top: win.style.top,
          width: win.style.width,
          height: win.style.height,
        };

        setWindowPosition(
          win,
          workspace.left + "px",
          workspace.top + "px",
          workspace.width + "px",
          workspace.height + "px",
        );

        win.isStretched = true;
      } else {
        if (win._preStretchState) {
          setWindowPosition(
            win,
            win._preStretchState.left,
            win._preStretchState.top,
            win._preStretchState.width,
            win._preStretchState.height,
          );
        }
        win.isStretched = false;
        clampWindowToWorkspace(win, false);
      }
      if (withTransition) {
        setTimeout(() => {
          win.style.transition = "";
        }, 300);
      }
    };
    // 切换全屏窗口至桌面
    const toggleFullscreenWindow = (withTransition = true) => {
      if (withTransition) {
        win.style.transition =
          "left 0.3s ease, top 0.3s ease, width 0.3s ease, height 0.3s ease";
      }
      if (!win.isFullscreen) {
        win._preFullscreenState = {
          left: win.style.left,
          top: win.style.top,
          width: win.style.width,
          height: win.style.height,
          zIndex: win.style.zIndex,
        };
        const workspace = getWorkspaceBounds();

        setWindowPosition(
          win,
          workspace.left + "px",
          workspace.top + "px",
          workspace.width + "px",
          workspace.height + "px",
          2050
        );

        win.isFullscreen = true;
      } else {
        if (win._preFullscreenState) {
          setWindowPosition(
            win,
            win._preFullscreenState.left,
            win._preFullscreenState.top,
            win._preFullscreenState.width,
            win._preFullscreenState.height,
            win._preFullscreenState.zIndex,
          );
        }
        win.isFullscreen = false;
        clampWindowToWorkspace(win, false);
      }
      if (withTransition) {
        setTimeout(() => {
          win.style.transition = "";
        }, 300);
      }
    };

    win._closeWindow = closeWindow;
    win._toggleStretchWindow = toggleStretchWindow;
    win._toggleFullscreenWindow = toggleFullscreenWindow;

    addWindowDrag(win, name);

    // 点击关闭按钮关闭窗口
    if (closeBtn) closeBtn.addEventListener("click", () => closeWindow());
    // 点击最小化按钮最小化窗口
    // if (miniBtn) miniBtn.addEventListener("click", () => toggleMinimizeWindow());
    // 点击最大化按钮最大化窗口
    if (zoomBtn)
      zoomBtn.addEventListener("click", () => toggleFullscreenWindow());

    // 双击窗口标题栏切换拉伸窗口至桌面空白（保留顶部状态栏和底部dock的全屏）
    const wintools = win.querySelector(".wintools");
    if (wintools) {
      wintools.addEventListener("dblclick", (e) => {
        if (
          !e.target.closest(".red") &&
          !e.target.closest(".yellow") &&
          !e.target.closest(".green") &&
          !e.target.closest(".gray")
        ) {
          toggleStretchWindow();
        }
      });
    }

    win.addEventListener("mousedown", function (e) {
      if (!e.target.closest(".wintools div")) {
        bringToFront(win, name);
      }
    });
  });
}

function addWindowDrag(windowElement, name) {
  windowElement.addEventListener("mousedown", function (e) {
    if (
      e.target.closest(".wintools div") ||
      e.target.closest(".resizer") ||
      e.target.closest("input") ||
      e.target.closest("textarea") ||
      e.target.closest("button") ||
      e.target.closest("select") ||
      e.target.closest("a") ||
      e.target.closest('[contenteditable="true"]')
    ) {
      return;
    }

    activeDraggingWindow = {
      element: windowElement,
      name: name,
      offsetX: e.clientX - windowElement.getBoundingClientRect().left,
      offsetY: e.clientY - windowElement.getBoundingClientRect().top,
    };

    bringToFront(windowElement, name);
    e.preventDefault();
  });
}

document.addEventListener("mousemove", function (e) {
  if (activeDraggingWindow) {
    const { element, offsetX, offsetY } = activeDraggingWindow;

    if (element.isStretched && element._toggleStretchWindow) {
      element._toggleStretchWindow(false);
    }
    if (element.isFullscreen && element._toggleFullscreenWindow) {
      element._toggleFullscreenWindow(false);
    }

    const workspace = getWorkspaceBounds();

    const newX = e.clientX - offsetX;
    const newY = e.clientY - offsetY;

    const maxX = Math.max(
      workspace.left,
      workspace.right - element.offsetWidth
    );

    const maxY = Math.max(
      workspace.top,
      workspace.bottom - element.offsetHeight
    );

    const clampedX = Math.min(
      Math.max(newX, workspace.left),
      maxX
    );

    const clampedY = Math.min(
      Math.max(newY, workspace.top),
      maxY
    );

    element.style.left = clampedX + "px";
    element.style.top = clampedY + "px";
  }

  if (activeResizingWindow) {
    const workspace = getWorkspaceBounds();
    const rect = activeResizingWindow.getBoundingClientRect();

    const requestedWidth = e.clientX - rect.left;
    const requestedHeight = e.clientY - rect.top;

    const maxWidth = workspace.right - rect.left;
    const maxHeight = workspace.bottom - rect.top;

    const newWidth = Math.min(requestedWidth, maxWidth);
    const newHeight = Math.min(requestedHeight, maxHeight);

    if (newWidth > 200) {
      activeResizingWindow.style.width = newWidth + "px";
    }

    if (newHeight > 150) {
      activeResizingWindow.style.height = newHeight + "px";
    }
  }
});

function addResizeListener(windowElement, resizer) {
  resizer.addEventListener("mousedown", function (e) {
    activeResizingWindow = windowElement;
    e.preventDefault();
  });
}

document.addEventListener("mouseup", function () {
  if (activeDraggingWindow) {
    updateMenu(activeDraggingWindow.name);
    activeDraggingWindow = null;
  }
  activeResizingWindow = null;
});

window.addEventListener("resize", () => {
  setTimeout(clampAllWindowsToWorkspace, 0);
});

export function bringToFront(windowElement, name) {
  zIndex += 1;
  windowElement.style.zIndex = zIndex;
  updateMenu(name);
}
