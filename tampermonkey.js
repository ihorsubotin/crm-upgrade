// ==UserScript==
// @name         CRM automation scripts
// @namespace    http://tampermonkey.net/
// @version      2025-03-19
// @description  try to take over the world!
// @author       Ihor
// @include      https://perevodi.keepincrm.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// @version     0.1
// ==/UserScript==

var was_agreement_code_applied = false;

function checkAgreementNum(){
  const field = document.querySelector('#field_6036644');
  if(field?.value == ''){
    const sidebar = document.querySelector('.sidebar--is-opened')
      if(sidebar?.getAttribute('badge') == 'agreement'){
        if(!was_agreement_code_applied){
            applyAgreementCode();
            was_agreement_code_applied = true;
        }
      }
  }else{
    was_agreement_code_applied = false
  }
}

async function makeGetRequest(url){
    try {
        const xsrf = (await window.cookieStore.get('XSRF-TOKEN')).value;
        const response = await fetch('https://perevodi.keepincrm.com/api/v1/agreements/21943575.json', {
            headers: {'x-xsrf-token': xsrf}
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        return json;
    } catch (error) {
        console.error(error.message);
    }
}

async function makePutRequest(url, body){
    try {
        const xsrf = (await window.cookieStore.get('XSRF-TOKEN')).value;
        const response = await fetch('https://perevodi.keepincrm.com/api/v1/agreements/21943575.json', {
            method: "PUT",
            headers: {
                'x-xsrf-token': xsrf,
                'accept': 'application/json, text/plain, */*',
                'content-type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        return json;
    } catch (error) {
        console.error(error.message);
    }
}

async function applyAgreementCode(){
    console.log('Applying code');
    const request = await makeGetRequest('https://perevodi.keepincrm.com/api/v1/agreements/21943575.json');
    const number = request.custom_fields._271;
    const field = document.querySelector('#field_6036644');
    field.value = number + ' CRM';
    const inputEvent = new Event('input', { bubbles: true });
    field.dispatchEvent(inputEvent);
    const payload = {custom_fields:{
        _271: +number + 1 + '',
        minimalna_pieriedplata_291:"0.0"
    }};
    const putRequest = await makePutRequest('https://perevodi.keepincrm.com/api/v1/agreements/21943575.json', payload)
}

var was_payment_sourse_applied = false;

function checkPaymentSource(){
  const field = document.querySelector('#input_40');
  if(field?.value != ''){
    const sidebar = document.querySelector('.sidebar--is-opened')
      if(sidebar?.getAttribute('badge') == 'payment'){
        if(!was_payment_sourse_applied){
            applyPaymentSource();
            was_payment_sourse_applied = true;
        }
      }
  }else{
    was_payment_sourse_applied = false
  }
}

async function applyPaymentSource(){
    const comment = document.querySelector('#input_40').value;
    let target = null;
    for(const el of document.querySelectorAll('td')){
        if(el.innerText == comment){
            target = el;
            break;
        }
    }
    if(!target){
        return;
    }
    const account_name = target.nextElementSibling.nextElementSibling.innerText;
    if(!account_name){
        return;
    }
    document.querySelector('#select_32').click();
    await new Promise(t=>setTimeout(t,200));
    let option_target = null;
    for(const el of document.querySelectorAll('md-option')){
        if(el.innerText == account_name){
            option_target = el;
            break;
        }
    }
    if(option_target){
        option_target.click();
    }else{
        document.querySelector('#select_option_60').click()
    }
}

var was_delivery_price_set = false;

function checkDeliveryPrice(){
	const sidebar = document.querySelector('.sidebar--is-opened')
	if(sidebar?.getAttribute('badge') == 'nova_poshta'){
		const field = document.querySelector('input[name="cost"]');
		if(field.value != '400' && !was_delivery_price_set){
			console.log('Changing price')
			was_delivery_price_set = true;
			field.value = 400;
		}
  	}else{
		was_delivery_price_set = false
	}
}

function generalSidebarCheck(){
	const sidebar = document.querySelector('.sidebar--is-opened')

}

(function() {
    //'use strict';
    setInterval(checkAgreementNum, 300);
	setInterval(checkDeliveryPrice, 300);
    //setInterval(checkPaymentSource, 300);
    // Your code here...
})();