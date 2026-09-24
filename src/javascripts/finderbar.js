import { zIndex } from "./window.js";

export let appMenu = {
    "访达": ["文件", "编辑", "显示", "前往", "窗口", "帮助"],
    "系统设置": ["编辑", "显示", "窗口", "帮助"],
    "计算器": ["编辑", "显示", "窗口", "帮助"],
    "Safari浏览器": ["文件", "编辑", "显示", "历史记录", "书签", "窗口", "帮助"],
};
let appControl = [
    "switch.2", "magnifyingglass", "wifi"
]
let tempMenuElements = [];

export const finderbar = document.getElementById("finderbar");

const appMenuContainer = document.createElement("div");
appMenuContainer.classList.add("left");
appMenuContainer.id = "left";
finderbar.appendChild(appMenuContainer);
const appControlContainer = document.createElement("div");
appControlContainer.classList.add("right");
appControlContainer.id = "right";
finderbar.appendChild(appControlContainer);

const logoMenu = document.createElement("p");
logoMenu.classList.add("logo");
logoMenu.innerHTML = "";
appMenuContainer.appendChild(logoMenu);
const timeControl = document.createElement("p");
timeControl.classList.add("time");
// timeControl.innerHTML = "4月12日 周六 18:26";
timeControl.innerHTML = "13:20";
const dateControl = document.createElement("p");
dateControl.classList.add("date");
dateControl.innerHTML = "9月14日 周日";

appControlContainer.appendChild(timeControl);
appControlContainer.appendChild(dateControl);

let openingMenu = null;

export function updateMenu(app) {
    if (!appMenu[app]) {
        return;
    }
    tempMenuElements.forEach(ele => {
        ele.parentNode.removeChild(ele);
    });
    tempMenuElements = [];
    let appMenuElement = document.createElement("p");
    appMenuElement.innerHTML = app;
    appMenuElement.classList.add("appname");
    appMenuContainer.appendChild(appMenuElement);
    tempMenuElements.push(appMenuElement);
    appMenu[app].forEach((menu, index) => {
        let nowMenu = document.createElement("p");
        index = index + 1;
        nowMenu.innerHTML = menu;
        appMenuContainer.appendChild(nowMenu);
        tempMenuElements.push(nowMenu);
    });
    resetMenuHandle();
}

function updateControl() {
    appControl.forEach((control) => {
        let nowControl = document.createElement("img");
        nowControl.src = `./assets/images/${control}.svg`;
        appControlContainer.appendChild(nowControl);
    })
}

export let parentMenuStates = {};

export function closeAllMenus() {
    let subMenus = document.querySelectorAll("div.menu:not(.contextmenu)");
    subMenus.forEach(subMenu => {
        subMenu.classList.remove("visible");
        const menuKey = `${subMenu.getAttribute("menu")}_${subMenu.getAttribute("app")}`;
        parentMenuStates[menuKey] = false;
        setTimeout(() => { subMenu.style.transition = "none"; }, 300);
    });
    document.querySelectorAll("#finderbar p.active").forEach(p => p.classList.remove("active"));
    openingMenu = null;
}

function resetMenuHandle() {
    let subMenus = document.querySelectorAll("div.menu:not(.contextmenu)");

    subMenus.forEach(subMenu => {
        if (document.querySelectorAll(".finderbar .left p")[1].innerHTML != subMenu.getAttribute("app")) {
            if (!subMenu.getAttribute("nomatchapp")) {
                return;
            }
        }

        let parentMenu = document.querySelector(`#finderbar p.${subMenu.getAttribute("menu")}`);
        if (!parentMenu) return;

        const menuKey = `${subMenu.getAttribute("menu")}_${subMenu.getAttribute("app")}`;
        parentMenuStates[menuKey] = false;
        const newHandler = function (e) {
            e.stopPropagation();

            if (parentMenuStates[menuKey] === false) {
                if (openingMenu && openingMenu !== subMenu) {
                    closeAllMenus();
                }

                subMenu.classList.add("visible");
                parentMenu.classList.add("active");
                subMenu.style.left = `${parentMenu.offsetLeft}px`;
                subMenu.style.top = "25px";
                parentMenuStates[menuKey] = true;

                setTimeout(() => {
                    subMenu.style.transition = "opacity 0.15s ease";
                    openingMenu = subMenu;
                }, 50);
            } else {
                closeAllMenus();
            }
        };

        parentMenu.onclick = newHandler;
    });
}

document.addEventListener("click", () => {
    closeAllMenus();
});

function updateTime() {
    const currentDateTime = new Date();

    dateControl.innerHTML = currentDateTime
        .toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric"
        })
        .replace(",", "");

    timeControl.innerHTML = currentDateTime
        .toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit"
        });
}

updateMenu("访达");
updateControl();
updateTime();
setInterval(updateTime, 1000);
window.onload = resetMenuHandle;