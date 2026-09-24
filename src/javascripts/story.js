import "./english-ui.js";

import { create } from "./window.js";
import { createNotification } from "./ui/notification.js";
import { appMenu } from "./finderbar.js";

window.choiceStory = window.choiceStory || {
    installed: false,
    choiceStep: 0,
    messageMode: "mia",
    miaStep: 0,
    deleting: false,
    choiceDesktopItem: null,
    screen: "welcome"
};

appMenu["信息"] = ["File", "Edit", "View", "Window", "Help"];
appMenu["CHOICE"] = ["File", "Edit", "View", "Window", "Help"];

function startChoiceStory() {
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
    }, 1200);
}

if (document.readyState === "complete") {
    startChoiceStory();
} else {
    window.addEventListener("load", startChoiceStory, { once: true });
}
