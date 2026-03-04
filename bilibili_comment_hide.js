// ==UserScript==
// @name         Bilibili 评论区隐藏
// @namespace    https://github.com/Ailzr/bilibili_comment_hide
// @version      0.2.0
// @description  隐藏评论区与推荐列表，支持智能亮度感知的自定义颜色。点击油猴图标菜单进行设置。
// @author       Ailzr
// @license      MIT
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/list/*
// @match        https://www.bilibili.com/bangumi/play/*
// @match        https://t.bilibili.com/*
// @match        https://www.bilibili.com/opus/*
// @match        https://space.bilibili.com/*
// @match        https://www.bilibili.com/v/topic/detail/*
// @match        https://www.bilibili.com/cheese/play/*
// @match        https://www.bilibili.com/festival/*
// @match        https://www.bilibili.com/blackboard/*
// @match        https://www.bilibili.com/blackroom/ban/*
// @match        https://www.bilibili.com/read/*
// @match        https://manga.bilibili.com/detail/*
// @icon         https://www.bilibili.com/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const config = {
        hideBtn: GM_getValue('hideBtn', false),
        hideRecommend: GM_getValue('hideRecommend', false),
        autoColor: GM_getValue('autoColor', true),
        bgColor: GM_getValue('bgColor', '#22232b')
    };

    GM_addStyle(`
        #bili-focus-panel {
            position: fixed; top: 20%; left: 50%; transform: translateX(-50%); width: 220px;
            background: #fff; border: 1px solid #ddd; border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15); z-index: 1000000; padding: 18px;
            font-family: sans-serif; display: none;
        }
        #bili-focus-panel header { font-weight: bold; margin-bottom: 15px; cursor: move; border-bottom: 1px solid #eee; padding-bottom: 8px; font-size: 14px; user-select: none; }
        .bili-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-size: 13px; color: #444; }
        .bili-switch { position: relative; width: 36px; height: 20px; cursor: pointer; }
        .bili-switch input { opacity: 0; width: 0; height: 0; }
        .bili-slider { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: #ccc; transition: .3s; border-radius: 20px; }
        .bili-slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background: white; transition: .3s; border-radius: 50%; }
        input:checked + .bili-slider { background: #00aeec; }
        input:checked + .bili-slider:before { transform: translateX(16px); }
        #bili-color-picker { width: 40px; height: 24px; border: 1px solid #ddd; cursor: pointer; padding: 0; background: none; border-radius: 4px; }
        #close-bili-panel { width: 100%; border: none; background: #00aeec; color: white; padding: 8px; border-radius: 6px; cursor: pointer; margin-top: 5px; font-size: 12px; }
    `);

    // --- 核心：对比度计算算法 ---
    // 输入十六进制颜色，返回应该使用的字体颜色（黑色或白色）
    function getContrastYIQ(hexcolor){
        hexcolor = hexcolor.replace("#", "");
        const r = parseInt(hexcolor.substr(0,2),16);
        const g = parseInt(hexcolor.substr(2,2),16);
        const b = parseInt(hexcolor.substr(4,2),16);
        // 标准亮度权重公式
        const yiq = ((r*299)+(g*587)+(b*114))/1000;
        return (yiq >= 128) ? 'black' : 'white';
    }

    function getFinalColor() {
        if (config.autoColor) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? "#2d2d2d" : "#ffffff";
        }
        return config.bgColor;
    }

    function applyVisibility() {
        const comment = document.querySelector("#commentapp, #comment, .comment-container");
        const recList = document.querySelector(".recommend-list-v1, .recommend-list-container, #reco_list");
        let btn = document.getElementById("toggle-comment-btn");

        if (config.hideBtn) {
            if (btn) btn.style.display = "none";
        } else {
            if (!btn) btn = createToggleButton();
            const bgColor = getFinalColor();
            btn.style.display = "block";
            btn.style.backgroundColor = bgColor;
            // 核心修复：根据背景亮度实时计算字体颜色
            btn.style.color = getContrastYIQ(bgColor);
        }

        if (recList) recList.style.display = config.hideRecommend ? "none" : "block";
    }

    function createToggleButton() {
        const btn = document.createElement("button");
        btn.id = "toggle-comment-btn";
        btn.innerText = "评";
        Object.assign(btn.style, {
            position: "fixed", bottom: "20px", right: "0px", padding: "10px 18px",
            border: "none", borderRadius: "5px 0 0 5px", cursor: "pointer", zIndex: "99999",
            transition: "all 0.3s", boxShadow: "-2px 0 8px rgba(0,0,0,0.1)"
        });
        btn.onclick = () => {
            const c = document.querySelector("#commentapp, #comment, .comment-container");
            if (c) c.style.display = (c.style.display === "none") ? "block" : "none";
        };
        document.body.appendChild(btn);
        return btn;
    }

    function createPanel() {
        if (document.getElementById('bili-focus-panel')) return;
        const panel = document.createElement('div');
        panel.id = 'bili-focus-panel';
        panel.innerHTML = `
            <header>隐藏选项设置 (可拖拽)</header>
            <div class="bili-item"><label>隐藏评论按钮</label><label class="bili-switch"><input type="checkbox" id="set-hideBtn"><span class="bili-slider"></span></label></div>
            <div class="bili-item"><label>隐藏推荐列表</label><label class="bili-switch"><input type="checkbox" id="set-hideRec"><span class="bili-slider"></span></label></div>
            <div class="bili-item"><label>跟随系统主题</label><label class="bili-switch"><input type="checkbox" id="set-autoColor"><span class="bili-slider"></span></label></div>
            <div class="bili-item"><label>按钮自定义颜色</label><input type="color" id="bili-color-picker"></div>
            <button id="close-bili-panel">保存并关闭</button>
        `;
        document.body.appendChild(panel);

        document.getElementById('set-hideBtn').checked = config.hideBtn;
        document.getElementById('set-hideRec').checked = config.hideRecommend;
        document.getElementById('set-autoColor').checked = config.autoColor;
        document.getElementById('bili-color-picker').value = config.bgColor;

        document.getElementById('set-hideBtn').onchange = (e) => { config.hideBtn = e.target.checked; GM_setValue('hideBtn', config.hideBtn); applyVisibility(); };
        document.getElementById('set-hideRec').onchange = (e) => { config.hideRecommend = e.target.checked; GM_setValue('hideRecommend', config.hideRecommend); applyVisibility(); };
        document.getElementById('set-autoColor').onchange = (e) => { config.autoColor = e.target.checked; GM_setValue('autoColor', config.autoColor); applyVisibility(); };
        document.getElementById('bili-color-picker').oninput = (e) => {
            config.bgColor = e.target.value;
            config.autoColor = false;
            document.getElementById('set-autoColor').checked = false;
            GM_setValue('bgColor', config.bgColor);
            GM_setValue('autoColor', false);
            applyVisibility();
        };
        document.getElementById('close-bili-panel').onclick = () => { panel.style.display = 'none'; };

        const header = panel.querySelector('header');
        header.onmousedown = (e) => {
            let shiftX = e.clientX - panel.getBoundingClientRect().left;
            let shiftY = e.clientY - panel.getBoundingClientRect().top;
            function moveAt(pageX, pageY) {
                panel.style.left = pageX - shiftX + panel.offsetWidth / 2 + 'px';
                panel.style.top = pageY - shiftY + 'px';
            }
            document.onmousemove = (ev) => moveAt(ev.pageX, ev.pageY);
            document.onmouseup = () => { document.onmousemove = null; document.onmouseup = null; };
        };
    }

    GM_registerMenuCommand("⚙️ 开启设置面板", () => {
        const p = document.getElementById('bili-focus-panel') || createPanel() || document.getElementById('bili-focus-panel');
        if (p) p.style.display = 'block';
    });

    const checkTimer = setInterval(() => {
        const comment = document.querySelector("#commentapp, #comment, .comment-container");
        if (comment) {
            comment.style.display = "none";
            createPanel();
            applyVisibility();
            clearInterval(checkTimer);
        }
    }, 300);

    new MutationObserver(() => applyVisibility()).observe(document.body, { childList: true, subtree: true });
    window.matchMedia('(prefers-color-scheme: dark)').onchange = applyVisibility;

})();