export function createContextMenu(x, y, items) {
    const existingMenu = document.querySelector("div.menu.contextmenu");
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement("div");
    menu.classList.add("menu", "contextmenu", "visible");
    menu.style.opacity = "1";
    menu.style.left = x + "px";
    menu.style.top = y + "px";

    items.forEach(item => {
        if (item.type === "separator") {
            const hr = document.createElement("hr");
            menu.appendChild(hr);
        } else {
            const menuItem = document.createElement("p");
            menuItem.textContent = item.label;
            if (item.disabled) menuItem.setAttribute("disabled", "");
            if (item.action) {
                menuItem.addEventListener("click", () => {
                    item.action();
                    menu.remove();
                });
            }
            menu.appendChild(menuItem);
        }
    });

    document.body.appendChild(menu);

    const closeMenu = (e) => {
        if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener("click", closeMenu);
        }
    };
    setTimeout(() => document.addEventListener("click", closeMenu), 0);

    return menu;
}

export function createDesktopFile(type, name = "未命名") {
    const container = document.querySelector(".desktop .container");
    const item = document.createElement("div");
    item.classList.add("item");

    const icon = document.createElement("img");
    icon.src = type === "folder"
        ? "./assets/images/Folder.png"
        : "./assets/images/GenericDocumentIcon.png";

    const nameEl = document.createElement("p");
    nameEl.textContent = name;
    nameEl.contentEditable = "true";
    nameEl.addEventListener("blur", () => {
        nameEl.contentEditable = "false";
        if (!nameEl.textContent.trim()) nameEl.textContent = "未命名";
    });
    nameEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            nameEl.blur();
        }
    });

    item.appendChild(icon);
    item.appendChild(nameEl);
    // item.style.cursor = "grab";

    const makeDraggable = (item) => {
        let isDragging = false;
        let offsetX, offsetY;

        item.addEventListener("mousedown", (e) => {
            if (e.button !== 0) return;

            document.querySelectorAll(".item.selected").forEach(el => el.classList.remove("selected"));
            item.classList.add("selected");

            isDragging = true;
            const rect = item.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            item.style.position = "fixed";
            item.style.margin = "0";
            item.style.left = (e.clientX - offsetX) + "px";
            item.style.top = (e.clientY - offsetY) + "px";
            item.style.zIndex = "9999";
            // item.style.cursor = "grabbing";
            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            item.style.left = (e.clientX - offsetX) + "px";
            item.style.top = (e.clientY - offsetY) + "px";
        });

        document.addEventListener("mouseup", () => {
            if (isDragging) {
                isDragging = false;
                item.style.zIndex = "0";
                item.dispatchEvent(new CustomEvent("desktop-item-dropped"));
                // item.style.cursor = "grab";
            }
        });
    };

    makeDraggable(item);
    container.appendChild(item);

    setTimeout(() => {
        nameEl.contentEditable = "true";
        nameEl.focus();
        const range = document.createRange();
        range.selectNodeContents(nameEl);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }, 0);

    return item;
}
