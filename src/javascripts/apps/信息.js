import { create } from "../window.js";

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

const contacts = [
    { name: "Mia", initial: "M", preview: "you need to try this lol", time: "7:31 PM", color: "#ff6b83" },
    { name: "Alex", initial: "A", preview: "wait send me the photo 😭", time: "6:48 PM", color: "#5b92f5" },
    { name: "Chloe", initial: "C", preview: "okayyy see you tomorrow", time: "5:12 PM", color: "#9866df" },
    { name: "Leo", initial: "L", preview: "i’m outside", time: "4:36 PM", color: "#4bbd7a" },
    { name: "Maya", initial: "M", preview: "that class was actually insane", time: "2:18 PM", color: "#dc5a9c" },
    { name: "Ethan", initial: "E", preview: "did you finish the reading", time: "12:44 PM", color: "#e88c45" },
    { name: "Sophie", initial: "S", preview: "LMAOOO", time: "Yesterday", color: "#7461dc" },
    { name: "Mom", initial: "M", preview: "Call me when you’re free", time: "Yesterday", color: "#777b82" },
    { name: "IMA Group", initial: "I", preview: "David: I uploaded the file", time: "Mon", color: "#2eaaa5" }
];

const backgroundChats = {
    Alex: [
        ["them", "wait send me the photo 😭"],
        ["me", "HAHA okay one sec"]
    ],
    Chloe: [
        ["me", "what time tomorrow"],
        ["them", "okayyy see you tomorrow"]
    ],
    Leo: [
        ["them", "i’m outside"],
        ["me", "coming down"]
    ],
    Maya: [
        ["me", "that quiz was evil"],
        ["them", "that class was actually insane"]
    ],
    Ethan: [
        ["them", "did you finish the reading"],
        ["me", "not even close 💀"]
    ],
    Sophie: [
        ["me", "LOOK AT THIS"],
        ["them", "LMAOOO"]
    ],
    Mom: [
        ["them", "Call me when you’re free"],
        ["me", "okayyy"]
    ],
    "IMA Group": [
        ["them", "David: I uploaded the file"],
        ["me", "got it!"]
    ]
};

const win = document.getElementById("信息");
const sidebar = win.querySelector(".messages-contacts");
const header = win.querySelector(".messages-header");
const chat = win.querySelector(".messages-chat");
const input = win.querySelector(".messages-input");
const sendButton = win.querySelector(".messages-send");

function contactRow(contact, active) {
    return `
        <div class="messages-contact ${active ? "active" : ""}" data-contact="${contact.name}">
            <div class="messages-avatar" style="background:${contact.color}">${contact.initial}</div>
            <div class="messages-contact-copy">
                <div class="messages-contact-top">
                    <div class="messages-contact-name">${contact.name}</div>
                    <div class="messages-contact-time">${contact.time}</div>
                </div>
                <div class="messages-contact-preview">${contact.preview}</div>
            </div>
        </div>
    `;
}

function renderSidebar(activeName) {
    let list = contacts.slice();

    if (state.messageMode === "daniel") {
        list.unshift({
            name: "Daniel",
            initial: "D",
            preview: "New Message",
            time: "Now",
            color: "#586ede"
        });
    }

    sidebar.innerHTML = list.map(contact => contactRow(contact, contact.name === activeName)).join("");

    sidebar.querySelectorAll("[data-contact]").forEach(row => {
        row.addEventListener("click", () => {
            const name = row.dataset.contact;

            if (name === "Daniel") {
                renderConversation("Daniel");
                return;
            }

            if (name === "Mia") {
                renderConversation("Mia");
                return;
            }

            renderConversation(name);
        });
    });
}

function avatar(name) {
    const contact = name === "Daniel"
        ? { initial: "D", color: "#586ede" }
        : contacts.find(contact => contact.name === name);

    return `
        <div class="messages-avatar" style="background:${contact.color}">
            ${contact.initial}
        </div>
    `;
}

function bubble(who, text, isLink = false) {
    const element = document.createElement("div");
    element.className = `message-bubble ${who}`;

    if (isLink) {
        element.classList.add("link");
    }

    element.textContent = text;
    chat.appendChild(element);
    chat.scrollTop = chat.scrollHeight;

    return element;
}

function clearConversation(name) {
    renderSidebar(name);
    header.innerHTML = `${avatar(name)}${name}`;
    chat.innerHTML = "";
    input.value = "";
    input.disabled = false;
    sendButton.disabled = false;
}

function renderConversation(name) {
    clearConversation(name);

    if (name === "Mia") {
        runMiaConversation();
        return;
    }

    if (name === "Daniel") {
        runDanielEnding();
        return;
    }

    const messages = backgroundChats[name] || [];

    messages.forEach(message => {
        bubble(message[0], message[1]);
    });
}

function typePresetMessage(text, callback) {
    let visible = 0;

    function keyHandler(event) {
        if (event.key === "Enter") {
            return;
        }

        event.preventDefault();

        if (event.key.length === 1 || event.key === "Backspace") {
            visible += 1;

            if (visible > text.length) {
                visible = text.length;
            }

            input.value = text.slice(0, visible);
        }
    }

    function sendMessage() {
        if (!input.value) {
            return;
        }

        input.removeEventListener("keydown", keyHandler);
        sendButton.removeEventListener("click", sendMessage);

        bubble("me", text);
        input.value = "";

        callback();
    }

    input.addEventListener("keydown", keyHandler);
    sendButton.addEventListener("click", sendMessage);

    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    }, { once: true });

    input.focus();
}

function sendMiaLines(lines, callback) {
    let index = 0;

    function sendNext() {
        if (index >= lines.length) {
            if (callback) {
                callback();
            }
            return;
        }

        setTimeout(() => {
            const text = lines[index];
            const link = text === "choice.app/download";

            const message = bubble("them", text, link);

            if (link) {
                message.addEventListener("click", () => {
                    if (win._closeWindow) {
                        win._closeWindow();
                    } else {
                        win.remove();
                    }

                    setTimeout(() => {
                        state.screen = "installer";
                        create("./assets/apps/CHOICE.html", "CHOICE", null, true);
                    }, 250);
                });
            }

            index += 1;
            sendNext();
        }, 600);
    }

    sendNext();
}

function runMiaConversation() {
    bubble("them", "you need to try this lol");

    if (state.miaStep > 0) {
        return;
    }

    typePresetMessage("what is it?", () => {
        state.miaStep = 1;

        sendMiaLines([
            "this weird app i found",
            "it asks you random stuff and then tries to guess what you're gonna pick",
            "it’s lowkey way too accurate 😭"
        ], () => {
            typePresetMessage("send it lol", () => {
                state.miaStep = 2;

                sendMiaLines([
                    "choice.app/download",
                    "tell me if it gets you right lol"
                ]);
            });
        });
    });
}

function typeAutomatically(text, callback) {
    input.value = "";
    let character = 0;

    const timer = setInterval(() => {
        character += 1;
        input.value = text.slice(0, character);

        if (character >= text.length) {
            clearInterval(timer);
            callback();
        }
    }, 42);
}

function runDanielEnding() {
    input.disabled = true;
    sendButton.disabled = true;

    const lines = [
        "do you want to try something fun???",
        "i found this weird app",
        "it tries to guess what you're gonna choose lol",
        "choice.app/download"
    ];

    let index = 0;

    function next() {
        if (index >= lines.length) {
            setTimeout(() => {
                document.body.style.transition = "filter 1.2s ease";
                document.body.style.filter = "brightness(0)";
            }, 900);
            return;
        }

        const text = lines[index];

        input.disabled = false;

        typeAutomatically(text, () => {
            setTimeout(() => {
                bubble("me", text, text === "choice.app/download");
                input.value = "";
                input.disabled = true;
                index += 1;
                setTimeout(next, 650);
            }, 250);
        });
    }

    setTimeout(next, 900);
}

renderConversation(state.messageMode === "daniel" ? "Daniel" : "Mia");
