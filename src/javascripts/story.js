import "./english-ui.js";

import { create } from "./window.js";
import { createNotification } from "./ui/notification.js";
import { appMenu } from "./finderbar.js";

window.choiceStory = Object.assign({
    installed: false,
    choiceStep: 0,
    messageMode: "mia",
    miaStep: 0,
    deleting: false,
    choiceDesktopItem: null,
    screen: "welcome",
    answers: {},
    metrics: {},
    sessionLog: [],
    storyStarted: false,
    desktopDressed: false
}, window.choiceStory || {});

appMenu["信息"] = ["File", "Edit", "View", "Window", "Help"];
appMenu["VOLI"] = ["File", "Edit", "View", "Window", "Help"];

const ambientDesktopItems = [
    { name: "Time-Based Media", icon: "./assets/images/Folder.png" },
    { name: "Screenshots", icon: "./assets/images/Folder.png" },
    { name: "midterm proposal.docx", icon: "./assets/images/document-word.svg" },
    { name: "week 5 notes.txt", icon: "./assets/images/document-text.svg" },
    { name: "audio ideas.m4a", icon: "./assets/images/document-audio.svg" }
];

function dressDesktop() {
    const state = window.choiceStory;
    const container = document.querySelector(".desktop .container");
    const desktop = document.querySelector(".desktop");

    if (!container || !desktop || state.desktopDressed) {
        return;
    }

    const secondColumn = document.createElement("div");
    secondColumn.className = "container story-desktop-column";
    desktop.appendChild(secondColumn);

    ambientDesktopItems.forEach((file, index) => {
        const item = document.createElement("div");
        item.className = "item story-desktop-item";
        item.innerHTML = `
            <img src="${file.icon}" alt="">
            <p>${file.name}</p>
        `;

        item.addEventListener("mousedown", event => {
            document.querySelectorAll(".item.selected").forEach(element => {
                element.classList.remove("selected");
            });
            item.classList.add("selected");
            event.stopPropagation();
        });

        (index < 3 ? container : secondColumn).appendChild(item);
    });

    state.desktopDressed = true;
}

function startChoiceStory() {
    const state = window.choiceStory;

    if (state.storyStarted) {
        return;
    }

    state.storyStarted = true;
    dressDesktop();

    setTimeout(() => {
        createNotification(
            "./assets/icons/信息.svg",
            "Mia",
            "you need to try this lol",
            () => {
                window.choiceStory.messageMode = "mia";
                create("./assets/apps/信息.html", "信息");
            },
            "Now"
        );
    }, 2600);
}

if (document.readyState === "complete") {
    startChoiceStory();
} else {
    window.addEventListener("load", startChoiceStory, { once: true });
}
