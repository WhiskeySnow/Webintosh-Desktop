const exactText = {
    "访达": "Finder",
    "启动台": "Launchpad",
    "Safari浏览器": "Safari",
    "信息": "Messages",
    "邮件": "Mail",
    "地图": "Maps",
    "照片": "Photos",
    "FaceTime通话": "FaceTime",
    "日历": "Calendar",
    "通讯录": "Contacts",
    "提醒事项": "Reminders",
    "备忘录": "Notes",
    "音乐": "Music",
    "视频": "TV",
    "播客": "Podcasts",
    "系统设置": "System Settings",
    "下载": "Downloads",
    "废纸篓": "Trash",
    "文件": "File",
    "编辑": "Edit",
    "显示": "View",
    "前往": "Go",
    "窗口": "Window",
    "帮助": "Help",
    "关于本机": "About This Mac",
    "关于访达": "About Finder",
    "设置...": "Settings...",
    "清倒废纸篓": "Empty Trash",
    "服务": "Services",
    "隐藏访达": "Hide Finder",
    "隐藏其他": "Hide Others",
    "全部显示": "Show All",
    "新建文件夹": "New Folder",
    "打开": "Open",
    "重命名": "Rename",
    "移到废纸篓": "Move to Trash",
    "显示简介": "Get Info",
    "使用群组": "Use Stacks",
    "排序方式": "Sort By",
    "整理": "Clean Up",
    "整理方式": "Clean Up By",
    "查看显示选项": "Show View Options",
    "刚刚": "Now",
    "好": "OK"
};

function translateElement(root) {
    if (!root) return;

    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT
    );

    const nodes = [];

    while (walker.nextNode()) {
        nodes.push(walker.currentNode);
    }

    nodes.forEach(node => {
        const original = node.nodeValue;
        const trimmed = original.trim();

        if (!trimmed) return;

        if (exactText[trimmed]) {
            node.nodeValue = original.replace(trimmed, exactText[trimmed]);
        }
    });
}

function translateExistingUI() {
    translateElement(document.body);
}

const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                translateElement(node);
            }

            if (node.nodeType === Node.TEXT_NODE) {
                const trimmed = node.nodeValue.trim();

                if (exactText[trimmed]) {
                    node.nodeValue = node.nodeValue.replace(
                        trimmed,
                        exactText[trimmed]
                    );
                }
            }
        });
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

window.addEventListener("load", () => {
    translateExistingUI();

    setTimeout(translateExistingUI, 300);
    setTimeout(translateExistingUI, 800);

});
