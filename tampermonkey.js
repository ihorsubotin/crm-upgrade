// ==UserScript==
// @name         CRM automation scripts
// @namespace    http://tampermonkey.net/
// @version      2025-03-21
// @description  try to take over the world!
// @author       Ihor
// @include      https://perevodi.keepincrm.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

const script = document.createElement('script');
script.src = "https://raw.githubusercontent.com/ihorsubotin/crm-upgrade/refs/heads/main/script.js";
document.head.appendChild(script);