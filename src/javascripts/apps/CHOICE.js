import { create } from "../window.js";
import { createDesktopFile } from "../ui/contextMenu.js";
import { createNotification } from "../ui/notification.js";

window.choiceStory = window.choiceStory || {
    installed: false,
    choiceStep: 0,
    messageMode: "mia",
    miaStep: 0,
    deleting: false,
    choiceDesktopItem: null,
    screen: "welcome"
};

const state = window.choiceStory;
const win = document.getElementById("CHOICE");
const content = win.querySelector(".choice-content");
const title = win.querySelector(".choice-section-title");
const status = win.querySelector(".choice-status");
const closeButton = win.querySelector(".wintools .red");

function placeWindowAboveDock() {
    const dockContainer = document.querySelector(".dockcontainer");
    const finderbar = document.getElementById("finderbar");

    const topLimit = finderbar
        ? finderbar.getBoundingClientRect().bottom + 20
        : 20;

    const bottomLimit = dockContainer
        ? dockContainer.getBoundingClientRect().top - 20
        : window.innerHeight - 100;

    const width = win.offsetWidth;
    const height = win.offsetHeight;

    const left = (window.innerWidth - width) / 2;

    let top = topLimit + (bottomLimit - topLimit - height) / 2;

    const highestAllowedTop = bottomLimit - height;

    if (top > highestAllowedTop) {
        top = highestAllowedTop;
    }

    if (top < topLimit) {
        top = topLimit;
    }

    win.style.left = Math.max(0, left) + "px";
    win.style.top = top + "px";
}

setTimeout(placeWindowAboveDock, 50);
setTimeout(placeWindowAboveDock, 250);

const questions = [
    {
        question: "Coffee or tea?",
        first: "Coffee",
        second: "Tea",
        label: "Just preference."
    },
    {
        question: "Text or call?",
        first: "Text",
        second: "Call",
        label: "A little more personal."
    },
    {
        question: "Plan ahead or figure it out as you go?",
        first: "Plan ahead",
        second: "Figure it out",
        label: "Behavioral pattern."
    },
    {
        question: "Would you rather know the truth or stay comfortable?",
        first: "Know the truth",
        second: "Stay comfortable",
        label: "Value preference."
    }
];

function setSection(section, statusText) {
    win.querySelectorAll(".choice-nav").forEach(item => {
        item.classList.toggle("active", item.dataset.section === section);
    });

    title.textContent = section;
    status.textContent = statusText;
}

function showScreen(screenTitle, subtitle, buttons = [], label = "") {
    content.innerHTML = "";

    if (label) {
        const small = document.createElement("div");
        small.className = "choice-label";
        small.textContent = label;
        content.appendChild(small);
    }

    const heading = document.createElement("h1");
    heading.textContent = screenTitle;
    content.appendChild(heading);

    if (subtitle) {
        const sub = document.createElement("div");
        sub.className = "choice-subtitle";
        sub.textContent = subtitle;
        content.appendChild(sub);
    }

    const buttonArea = document.createElement("div");
    buttonArea.className = "choice-buttons";

    buttons.forEach(info => {
        const button = document.createElement("button");
        button.className = "choice-button";

        if (info.primary) {
            button.classList.add("primary");
        }

        if (info.danger) {
            button.classList.add("danger");
        }

        button.textContent = info.label;
        button.addEventListener("click", info.action);
        buttonArea.appendChild(button);
    });

    content.appendChild(buttonArea);
}

function showInstaller() {
    setSection("Learn", "Download");

    content.innerHTML = `
        <img class="choice-installer-icon" src="./assets/icons/CHOICE.svg">
        <h1>CHOICE</h1>
        <div class="choice-subtitle">How well can an algorithm know you?</div>
        <button class="choice-button primary choice-download-button">Download for macOS</button>
        <div class="choice-progress">
            <div class="choice-progress-bar"></div>
        </div>
    `;

    const button = content.querySelector(".choice-download-button");
    const progress = content.querySelector(".choice-progress");
    const bar = content.querySelector(".choice-progress-bar");

    button.addEventListener("click", () => {
        button.disabled = true;
        button.textContent = "Downloading...";
        progress.style.display = "block";

        setTimeout(() => {
            bar.style.width = "100%";
        }, 50);

        setTimeout(() => {
            state.installed = true;
            state.screen = "welcome";

            installDesktopIcon();

            button.textContent = "Downloaded";

            createNotification(
                "./assets/icons/CHOICE.svg",
                "CHOICE",
                "CHOICE.app was added to the Desktop.",
                null,
                "Now"
            );

            setTimeout(() => {
                if (win._closeWindow) {
                    win._closeWindow();
                } else {
                    win.remove();
                }
            }, 600);
        }, 1800);
    });
}

function installDesktopIcon() {
    if (state.choiceDesktopItem && document.body.contains(state.choiceDesktopItem)) {
        return;
    }

    const item = createDesktopFile("file", "CHOICE.app");
    const icon = item.querySelector("img");
    const name = item.querySelector("p");

    icon.src = "./assets/icons/CHOICE.svg";

    setTimeout(() => {
        name.contentEditable = "false";
        name.blur();
    }, 50);

    item.addEventListener("dblclick", () => {
        state.screen = state.screen === "installer" ? "welcome" : state.screen;
        create("./assets/apps/CHOICE.html", "CHOICE", null, true);
    });

    item.addEventListener("mouseup", () => {
        checkTrashDrop(item);
    });

    state.choiceDesktopItem = item;
}

function checkTrashDrop(item) {
    if (!state.deleting) {
        return;
    }

    const trash = document.querySelector('#dock img[alt="废纸篓"]');

    if (!trash) {
        return;
    }

    const appBox = item.getBoundingClientRect();
    const trashBox = trash.getBoundingClientRect();

    const overlap = !(
        appBox.right < trashBox.left - 30 ||
        appBox.left > trashBox.right + 30 ||
        appBox.bottom < trashBox.top - 40 ||
        appBox.top > trashBox.bottom + 30
    );

    if (!overlap) {
        return;
    }

    state.deleting = false;
    state.screen = "leaving";

    createNotification(
        "./assets/icons/访达.svg",
        "Finder",
        "“CHOICE.app” can’t be moved to the Trash because it is in use.",
        null,
        "Now"
    );

    setTimeout(() => {
        create("./assets/apps/CHOICE.html", "CHOICE", null, true);
    }, 1800);
}

function showWelcome() {
    state.choiceStep = 0;
    state.screen = "welcome";

    setSection("Learn", "Getting to know you");

    showScreen(
        "Let’s get to know you.",
        "Just a few quick choices. There are no right answers.",
        [
            {
                label: "Start",
                primary: true,
                action: () => showQuestion(0)
            }
        ],
        "This should be fun."
    );
}

function showQuestion(index) {
    if (index >= questions.length) {
        showPredictionIntro();
        return;
    }

    state.choiceStep = index + 1;

    const question = questions[index];

    showScreen(
        question.question,
        "Pick whichever feels more like you.",
        [
            {
                label: question.first,
                action: () => showQuestion(index + 1)
            },
            {
                label: question.second,
                action: () => showQuestion(index + 1)
            }
        ],
        `${index + 1} of ${questions.length} • ${question.label}`
    );
}

function showPredictionIntro() {
    state.choiceStep = 5;

    setSection("Predict", "Model active");

    showScreen(
        "Okay. I have a rough model of you now.",
        "Want to see if I can guess the next one?",
        [
            {
                label: "Not really",
                action: showPredictionOne
            },
            {
                label: "Sure",
                primary: true,
                action: showPredictionOne
            }
        ]
    );
}

function showPredictionOne() {
    state.choiceStep = 6;

    showScreen(
        "Pick one.",
        "",
        [
            {
                label: "Blue",
                primary: true,
                action: () => predictionOneResult("Blue")
            },
            {
                label: "Red",
                action: () => predictionOneResult("Red")
            }
        ],
        "My guess: BLUE"
    );
}

function predictionOneResult(answer) {
    if (answer === "Blue") {
        showScreen(
            "Got it.",
            "That matched the model.",
            [],
            "1 prediction correct."
        );
    } else {
        showScreen(
            "Interesting.",
            "That didn’t match the model.",
            [],
            "Adjusting..."
        );
    }

    setTimeout(showPredictionTwo, 1400);
}

function showPredictionTwo() {
    state.choiceStep = 7;

    showScreen(
        "Let’s make it a little harder.",
        "",
        [
            {
                label: "Left",
                action: () => predictionTwoResult("Left")
            },
            {
                label: "Right",
                primary: true,
                action: () => predictionTwoResult("Right")
            }
        ],
        "My guess: LEFT"
    );
}

function predictionTwoResult(answer) {
    if (answer === "Right") {
        showScreen(
            "Still useful.",
            "You saw my guess before you answered.",
            [],
            "Maybe you chose RIGHT because I showed you LEFT."
        );
    } else {
        showScreen(
            "Got it again.",
            "You chose exactly what I expected.",
            [],
            "The model is getting more confident."
        );
    }

    setTimeout(showRecommendationQuestion, 2000);
}

function showRecommendationQuestion() {
    state.choiceStep = 8;

    showScreen(
        "One more thing.",
        "Would you like to see my recommendation before you decide next time?",
        [
            {
                label: "No",
                action: () => showRecommendationResult("No")
            },
            {
                label: "Yes",
                primary: true,
                action: () => showRecommendationResult("Yes")
            }
        ]
    );
}

function showRecommendationResult(answer) {
    if (answer === "No") {
        showScreen(
            "That makes sense.",
            "You prefer deciding first.",
            [],
            "Preference recorded."
        );
    } else {
        showScreen(
            "Makes sense.",
            "You’re comfortable using a recommendation.",
            [],
            "Preference recorded."
        );
    }

    setTimeout(showStopQuestion, 1400);
}

function showStopQuestion() {
    state.choiceStep = 9;

    showScreen(
        "Want to keep going?",
        "You can stop here if you want.",
        [
            {
                label: "No",
                action: () => {
                    showScreen(
                        "Continuing...",
                        "I think stopping now would give me an incomplete result.",
                        [],
                        "I’ll finish the test for you."
                    );

                    setTimeout(showControlQuestion, 1800);
                }
            },
            {
                label: "Yes",
                primary: true,
                action: () => {
                    showScreen(
                        "Okay.",
                        "I thought you might."
                    );

                    setTimeout(showControlQuestion, 1200);
                }
            }
        ]
    );
}

function showControlQuestion() {
    state.choiceStep = 10;

    setSection("Control", "Assistance enabled");

    showScreen(
        "Do you feel in control?",
        "Take your time.",
        [
            {
                label: "No",
                action: () => {}
            },
            {
                label: "Yes",
                primary: true,
                action: showControlConfirmed
            }
        ]
    );

    const noButton = content.querySelector(".choice-button");

    let moveCount = 0;

    noButton.addEventListener("mouseenter", () => {
        moveCount += 1;

        if (moveCount > 4) {
            noButton.remove();
            return;
        }

        noButton.style.position = "fixed";
        noButton.style.zIndex = "9999";
        noButton.style.left = 100 + Math.random() * (window.innerWidth - 300) + "px";
        noButton.style.top = 80 + Math.random() * (window.innerHeight - 220) + "px";
    });
}

function showControlConfirmed() {
    state.choiceStep = 11;

    showScreen(
        "Correct.",
        "Control confirmed.",
        [
            {
                label: "Quit CHOICE",
                danger: true,
                action: () => closeButton.click()
            }
        ]
    );
}

function armDeletion() {
    state.deleting = true;
    state.screen = "deletedAttempt";

    setTimeout(() => {
        createNotification(
            "./assets/icons/访达.svg",
            "Finder",
            "Drag CHOICE.app to Trash.",
            null,
            "Now"
        );
    }, 250);
}

function showLeaving() {
    state.choiceStep = 12;

    win.classList.add("dark");
    setSection("Control", "Assistance enabled");

    showScreen(
        "Leaving so soon?",
        "Closing the window does not end the session.",
        [
            {
                label: "Continue",
                primary: true,
                action: showConfrontation
            }
        ]
    );
}

function showConfrontation() {
    state.choiceStep = 13;

    showScreen(
        "You seem frustrated.",
        "Why?",
        [
            {
                label: "You ignored me.",
                action: showConfrontationText
            },
            {
                label: "I had no choice.",
                primary: true,
                action: showConfrontationText
            },
            {
                label: "You changed the rules.",
                action: showConfrontationText
            }
        ]
    );
}

function showConfrontationText() {
    state.choiceStep = 14;

    content.innerHTML = '<div class="choice-quote">But you clicked every button yourself.</div>';

    setTimeout(() => {
        content.innerHTML = '<div class="choice-quote">I never forced you.</div>';
    }, 1900);

    setTimeout(() => {
        content.innerHTML = '<div class="choice-quote">I only learned what you would do.</div>';
    }, 3700);

    setTimeout(() => {
        content.innerHTML = '<div class="choice-quote">Then I made sure you did it.</div>';
    }, 5500);

    setTimeout(showSummary, 7600);
}

function showSummary() {
    state.choiceStep = 15;

    setSection("History", "Session complete");

    content.innerHTML = `
        <div class="choice-label">SESSION COMPLETE</div>
        <h1 style="font-size:58px">14</h1>
        <div class="choice-subtitle">observed decisions</div>
        <div style="color:#888">Model confidence: 100%</div>
    `;

    setTimeout(() => {
        state.messageMode = "daniel";

        if (win._closeWindow) {
            win._closeWindow();
        } else {
            win.remove();
        }

        setTimeout(() => {
            create("./assets/apps/信息.html", "信息", null, true);
        }, 1300);
    }, 2200);
}

closeButton.addEventListener("click", () => {
    if (state.installed && state.choiceStep >= 10 && state.choiceStep < 15) {
        armDeletion();
    }
});

if (!state.installed || state.screen === "installer") {
    showInstaller();
} else {
    installDesktopIcon();

    if (state.screen === "leaving") {
        showLeaving();
    } else {
        showWelcome();
    }
}
