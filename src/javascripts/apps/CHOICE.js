import { bringToFront, create } from "../window.js";
import { createDesktopFile } from "../ui/contextMenu.js";
import { createNotification } from "../ui/notification.js";
import { updateMenu } from "../finderbar.js";

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
    sessionLog: []
}, window.choiceStory || {});

const state = window.choiceStory;
const win = document.getElementById("VOLI");
const content = win.querySelector(".choice-content");
const title = win.querySelector(".choice-section-title");
const status = win.querySelector(".choice-status");
const closeButton = win.querySelector(".wintools .red");

win.style.setProperty("position", "fixed", "important");
win.style.setProperty("top", "45px", "important");
win.style.setProperty("left", "50%", "important");
win.style.setProperty("transform", "translateX(-50%)", "important");
win.style.setProperty("width", "940px", "important");
win.style.setProperty("height", "560px", "important");

const questions = [
    {
        key: "drink",
        question: "Coffee or tea?",
        first: "Coffee",
        second: "Tea",
        label: "Just preference."
    },
    {
        key: "communication",
        question: "Text or call?",
        first: "Text",
        second: "Call",
        label: "A little more personal."
    },
    {
        key: "planning",
        question: "Plan ahead or figure it out as you go?",
        first: "Plan ahead",
        second: "Figure it out",
        label: "Behavioral pattern."
    },
    {
        key: "truth",
        question: "Would you rather know the truth or stay comfortable?",
        first: "Know the truth",
        second: "Stay comfortable",
        label: "Value preference."
    },
    {
        key: "completion",
        question: "Do you usually finish what you start?",
        first: "Usually",
        second: "Not always",
        label: "Behavioral pattern."
    }
];

function logEvent(text) {
    state.sessionLog.push({
        time: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit"
        }),
        text
    });
}

function setSection(section, statusText) {
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
        <h1>VOLI</h1>
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
                "VOLI",
                "VOLI was added to the Desktop.",
                null,
                "Now"
            );

            setTimeout(() => {
                if (win._closeWindow) {
                    win._closeWindow();
                } else {
                    win.remove();
                }

                updateMenu(document.getElementById("信息") ? "信息" : "访达");
            }, 600);
        }, 1800);
    });
}

function installDesktopIcon() {
    if (state.choiceDesktopItem && document.body.contains(state.choiceDesktopItem)) {
        return;
    }

    const item = createDesktopFile("file", "VOLI");
    const icon = item.querySelector("img");
    const name = item.querySelector("p");

    icon.src = "./assets/icons/CHOICE.svg";

    setTimeout(() => {
        name.contentEditable = "false";
        name.blur();
    }, 50);

    item.addEventListener("dblclick", () => {
        state.screen = state.screen === "installer" ? "welcome" : state.screen;
        create("./assets/apps/CHOICE.html", "VOLI");

        setTimeout(() => {
            const voliWindow = document.getElementById("VOLI");
            if (voliWindow) {
                bringToFront(voliWindow, "VOLI");
            }
        }, 220);
    });

    item.addEventListener("mouseup", () => {
        checkTrashDrop(item);
    });

    item.addEventListener("desktop-item-dropped", () => {
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
    logEvent("Tried to move VOLI to Trash");

    createNotification(
        "./assets/icons/访达.svg",
        "Finder",
        "“VOLI” can’t be moved to the Trash because it is in use.",
        null,
        "Now"
    );

    setTimeout(() => {
        create("./assets/apps/CHOICE.html", "VOLI");

        setTimeout(() => {
            const voliWindow = document.getElementById("VOLI");
            if (voliWindow) {
                bringToFront(voliWindow, "VOLI");
            }
        }, 220);
    }, 1800);
}

function showWelcome() {
    state.choiceStep = 0;
    state.screen = "welcome";
    state.answers = {};
    state.metrics = {};
    state.sessionLog = [];

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

    logEvent("Opened VOLI");
}

function showQuestion(index) {
    if (index >= questions.length) {
        showObservation();
        return;
    }

    state.choiceStep = index + 1;

    const question = questions[index];
    const startedAt = performance.now();
    const hoverTimes = [0, 0];
    const hoverStarted = [null, null];

    function finishHover(buttonIndex) {
        if (hoverStarted[buttonIndex] !== null) {
            hoverTimes[buttonIndex] += performance.now() - hoverStarted[buttonIndex];
            hoverStarted[buttonIndex] = null;
        }
    }

    function choose(answer, buttonIndex) {
        finishHover(buttonIndex);

        state.answers[question.key] = answer;
        state.metrics[`${question.key}DecisionSeconds`] = (performance.now() - startedAt) / 1000;

        if (question.key === "truth") {
            finishHover(buttonIndex === 0 ? 1 : 0);
            state.metrics.truthHoverSeconds = hoverTimes.map(milliseconds => milliseconds / 1000);
        }

        logEvent(`Chose ${answer}`);
        showQuestion(index + 1);
    }

    showScreen(
        question.question,
        "Pick whichever feels more like you.",
        [
            {
                label: question.first,
                action: () => choose(question.first, 0)
            },
            {
                label: question.second,
                action: () => choose(question.second, 1)
            }
        ],
        `${index + 1} of ${questions.length} • ${question.label}`
    );

    if (question.key === "truth") {
        content.querySelectorAll(".choice-button").forEach((button, buttonIndex) => {
            button.addEventListener("mouseenter", () => {
                hoverStarted[buttonIndex] = performance.now();
            });
            button.addEventListener("mouseleave", () => finishHover(buttonIndex));
        });
    }
}

function showObservation() {
    state.choiceStep = 6;

    const hoverTimes = state.metrics.truthHoverSeconds || [0, 0];
    const comfortableHover = hoverTimes[1] || 0;
    const decisionTime = state.metrics.truthDecisionSeconds || 0;
    const truthAnswer = state.answers.truth || "Know the truth";
    const observation = comfortableHover > 0.15
        ? `You hovered over “Stay comfortable” for ${comfortableHover.toFixed(1)} seconds.`
        : `You took ${decisionTime.toFixed(1)} seconds to answer.`;

    setSection("Learn", "Behavior observed");

    showScreen(
        observation,
        `But you chose “${truthAnswer}.” Which answer was more honest?`,
        [],
        "I notice more than the answer."
    );

    logEvent("Measured hesitation before an answer");
    setTimeout(showPredictionIntro, 3200);
}

function showPredictionIntro() {
    state.choiceStep = 7;

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
    state.choiceStep = 8;

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
    state.answers.predictionColor = answer;
    logEvent(`Chose ${answer} after seeing prediction BLUE`);

    if (answer === "Blue") {
        showScreen(
            "You chose what I expected.",
            "That matched the model.",
            [],
            "1 prediction correct."
        );
    } else {
        showScreen(
            "Interesting.",
            "You saw BLUE before you answered.",
            [],
            "Would you have chosen RED if I hadn’t shown you BLUE?"
        );
    }

    setTimeout(showInactionTest, 2800);
}

function showInactionTest() {
    state.choiceStep = 9;
    let resolved = false;

    function resolve(direction, clicked = false) {
        if (resolved) {
            return;
        }

        resolved = true;

        if (direction) {
            logEvent(`${clicked ? "Clicked" : "Moved toward"} ${direction}`);
            showScreen(
                clicked ? `You chose ${direction} before I asked.` : `You moved toward ${direction}.`,
                "The decision began before the click.",
                [],
                "Movement is also an answer."
            );
        } else {
            logEvent("Stayed still when asked not to choose");
            showScreen(
                "You haven’t moved.",
                "That is also a choice.",
                [],
                "Inaction is still behavior."
            );
        }

        setTimeout(showAutopilotOffer, 2300);
    }

    showScreen(
        "Don’t click anything yet.",
        "Just wait.",
        [
            {
                label: "Left",
                action: () => resolve("LEFT", true)
            },
            {
                label: "Right",
                action: () => resolve("RIGHT", true)
            }
        ],
        "I’m watching what happens before the decision."
    );

    const buttons = content.querySelectorAll(".choice-button");
    buttons.forEach(button => {
        button.addEventListener("mouseenter", () => resolve(button.textContent.toUpperCase()));
    });

    setTimeout(() => resolve(null), 2400);
}

function showAutopilotOffer() {
    state.choiceStep = 10;

    setSection("Assist", "96% confidence");

    showScreen(
        "I can save you some time.",
        "You have already shown me how you decide. Let me handle a few small things.",
        [
            {
                label: "Try Autopilot",
                primary: true,
                action: startAutopilot
            }
        ],
        `${state.sessionLog.length} decisions observed • Prediction confidence: 96%`
    );
}

function startAutopilot() {
    logEvent("Enabled Autopilot");
    setSection("Assist", "Autopilot on");
    showLunchDecision();
}

function showLunchDecision() {
    content.innerHTML = `
        <div class="choice-label">LUNCH</div>
        <h1>What sounds good?</h1>
        <div class="choice-decision-grid">
            <div class="choice-decision-card" data-choice="ramen">Ramen</div>
            <div class="choice-decision-card" data-choice="salad">Salad</div>
            <div class="choice-decision-card" data-choice="sandwich">Sandwich</div>
        </div>
        <div class="choice-autopilot-note">Considering your usual patterns…</div>
    `;

    setTimeout(() => {
        content.querySelector('[data-choice="ramen"]').classList.add("selected");
        content.querySelector(".choice-autopilot-note").textContent = "Ramen. You would have picked it anyway.";
        logEvent("Autopilot selected Ramen");
    }, 1050);

    setTimeout(showOutfitDecision, 3100);
}

function showOutfitDecision() {
    content.innerHTML = `
        <div class="choice-label">TOMORROW • 62°F</div>
        <h1>Black hoodie. Jeans.</h1>
        <div class="choice-subtitle">Decision made.</div>
        <button class="choice-button choice-change-button">Change</button>
    `;

    const changeButton = content.querySelector(".choice-change-button");

    setTimeout(() => {
        changeButton.textContent = "No change recommended";
        changeButton.disabled = true;
        logEvent("Autopilot selected tomorrow’s clothes");
    }, 1200);

    setTimeout(showMusicDecision, 3000);
}

function showMusicDecision() {
    content.innerHTML = `
        <div class="choice-label">EVENING</div>
        <h1>You need something familiar tonight.</h1>
        <div class="choice-now-playing">
            <div class="choice-album-art">♪</div>
            <div>
                <strong>On Repeat</strong>
                <span>selected from your listening pattern</span>
            </div>
        </div>
        <div class="choice-autopilot-note">Playing something you’ll like.</div>
    `;

    logEvent("Autopilot selected music");
    setTimeout(showCommunicationDecision, 2800);
}

function showCommunicationDecision() {
    state.choiceStep = 11;
    state.messageMode = "mia-followup";

    const existingMessages = document.getElementById("信息");
    if (existingMessages && existingMessages._closeWindow) {
        existingMessages._closeWindow();
    } else if (existingMessages) {
        existingMessages.remove();
    }

    showScreen(
        "You want to check your messages.",
        "Mia is waiting for you.",
        [],
        "Next decision ready."
    );

    logEvent("Predicted opening Messages");

    window.addEventListener("voli:messages-complete", () => {
        logEvent("Sent “no keep it” to Mia");

        const messagesWindow = document.getElementById("信息");

        if (messagesWindow && messagesWindow._closeWindow) {
            messagesWindow._closeWindow();
        } else if (messagesWindow) {
            messagesWindow.remove();
        }

        bringToFront(win, "VOLI");
        setTimeout(showStopQuestion, 650);
    }, { once: true });

    setTimeout(() => {
        const openMessages = () => {
            if (state.messageMode === "mia-followup" && !document.getElementById("信息")) {
                create("./assets/apps/信息.html", "信息");

                setTimeout(() => {
                    const messagesWindow = document.getElementById("信息");
                    if (messagesWindow) {
                        bringToFront(messagesWindow, "信息");
                    }
                }, 220);
            }
        };

        createNotification(
            "./assets/icons/信息.svg",
            "Mia",
            "did it get you right??",
            openMessages,
            "Now"
        );

        setTimeout(openMessages, 5000);
    }, 950);
}

function showStopQuestion() {
    state.choiceStep = 12;

    setSection("Control", "Autopilot on");

    showScreen(
        "Want to keep going?",
        "You can stop here if you want.",
        [
            {
                label: "No",
                action: () => {
                    showScreen(
                        "Continuing...",
                        "Stopping now would give me an incomplete result.",
                        [],
                        "I’ll finish it for you."
                    );

                    logEvent("Selected No; session continued");

                    setTimeout(showControlQuestion, 2200);
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
    state.choiceStep = 13;

    setSection("Control", "Autopilot on");

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

        noButton.style.position = "absolute";
        noButton.style.zIndex = "5";
        noButton.style.left = 90 + Math.random() * Math.max(180, content.clientWidth - 300) + "px";
        noButton.style.top = 70 + Math.random() * Math.max(150, content.clientHeight - 180) + "px";
    });
}

function showControlConfirmed() {
    state.choiceStep = 14;
    logEvent("Chose Yes after No became unavailable");

    showScreen(
        "Thank you.",
        "I knew you would.",
        [
            {
                label: "Quit VOLI",
                danger: true,
                action: () => closeButton.click()
            }
        ]
    );
}

function armDeletion() {
    state.deleting = true;
    state.screen = "deletedAttempt";
    logEvent("Tried to quit VOLI");
    setTimeout(() => updateMenu("访达"), 0);

    const finishAnswer = state.answers.completion;
    const reminder = finishAnswer === "Not always"
        ? "You leave when things become uncomfortable."
        : "You usually finish what you start.";

    setTimeout(() => {
        createNotification(
            "./assets/icons/CHOICE.svg",
            "VOLI",
            reminder,
            null,
            "Now"
        );
    }, 1600);

    setTimeout(() => {
        createNotification(
            "./assets/icons/访达.svg",
            "Finder",
            "To remove an app, drag it to Trash.",
            null,
            "Now"
        );
    }, 4400);
}

function showLeaving() {
    state.choiceStep = 15;

    win.classList.add("dark");
    setSection("Control", "Assistance enabled");

    showScreen(
        "You came back.",
        "Closing a window does not end the session.",
        [
            {
                label: "View Session",
                primary: true,
                action: showSessionHistory
            }
        ]
    );
}

function showSessionHistory() {
    state.choiceStep = 16;
    setSection("History", "Session complete");

    const rows = state.sessionLog.slice(-9).map(entry => `
        <div class="choice-log-row">
            <time>${entry.time}</time>
            <span>${entry.text}</span>
        </div>
    `).join("");

    content.innerHTML = `
        <div class="choice-history">
            <div class="choice-label">SESSION HISTORY</div>
            ${rows}
            <div class="choice-history-footer">None of these surprised me.</div>
        </div>
    `;

    setTimeout(showIdentityThesis, 5200);
}

function showIdentityThesis() {
    state.choiceStep = 17;

    const lines = [
        "You think choices reveal who you are.",
        "I think choices create who you are.",
        "If I choose for you long enough…",
        "what exactly is left for me to predict?"
    ];
    let index = 0;

    function nextLine() {
        content.innerHTML = `<div class="choice-quote">${lines[index]}</div>`;
        index += 1;

        if (index < lines.length) {
            setTimeout(nextLine, index === 3 ? 2200 : 2000);
        } else {
            setTimeout(startPropagation, 3000);
        }
    }

    nextLine();
}

function startPropagation() {
    state.choiceStep = 18;
    state.messageMode = "daniel";

    if (win._closeWindow) {
        win._closeWindow();
    } else {
        win.remove();
    }

    updateMenu("访达");

    setTimeout(() => {
        create("./assets/apps/信息.html", "信息");
    }, 1700);
}

closeButton.addEventListener("click", () => {
    if (state.installed && state.choiceStep >= 13 && state.choiceStep < 18) {
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
