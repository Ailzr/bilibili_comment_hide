// ==UserScript==
// @name         Bilibili 评论区隐藏
// @namespace    https://github.com/Ailzr/bilibili_comment_hide
// @version      0.1.0
// @description  用于隐藏b站的评论区
// @author       Ailzr
// @match        https://www.bilibili.com/video/*
// @icon         https://www.bilibili.com/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

//按钮背景颜色，可自行调节
const bgcolor = "rgb(34,35,43)";
//按钮字体颜色，可自行调节
const fontColor = "#fff";

//获取评论区
function getComment(){
    return document.querySelector("div.comment-container");
}

//  显示/隐藏评论区 函数
function displayOrNotComment(){
    //将其隐藏或显示
    if (comment.style.display != "none"){
        comment.style.display = "none";
    }
    else {
        comment.style.display = "block";
    }
}


//创建 显示/隐藏 评论区按钮
function createButtonDisplayComment(){
    //创建按钮
    let button = document.createElement("button");

    button.innerText = "评";

    //给按钮添加样式
    button.style.position = "fixed";
    button.style.bottom = "20px";
    button.style.right = "0px";
    button.style.padding = "10px 20px";
    button.style.backgroundColor = bgcolor;
    button.style.color = fontColor;
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";


    //给按钮添加监听事件
    button.addEventListener("click", displayOrNotComment);

    //将按钮添加到页面中
    document.body.appendChild(button);
}


function CloseCommentOfBilibili(){
    //获取评论区
    comment = getComment();

    //如果成功获取到评论区元素
    if (comment){
        clearInterval(intervalId);
        //默认将评论区隐藏
        displayOrNotComment();
        //创建 显示/隐藏 评论区按钮
        createButtonDisplayComment();
    }


}

//评论区变量
let comment;
// 每隔0.1秒执行一次tryToGetElement函数
let intervalId = setInterval(CloseCommentOfBilibili, 100);
