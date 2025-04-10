// ==UserScript==
// @name         CRM automation scripts
// @namespace    http://tampermonkey.net/
// @version      2025-04-10
// @description  try to take over the world!
// @author       Ihor
// @include      https://perevodi.keepincrm.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

var was_agreement_code_applied = false;

function checkAgreementNum() {
	const sidebar = document.querySelector('.sidebar--is-opened')
	if (sidebar?.getAttribute('badge') == 'agreement') {
		const field = document.querySelector('#field_title');
		if (field?.value == '') {
			if (!was_agreement_code_applied) {
				was_agreement_code_applied = true;
				applyAgreementCode();
			}
		} 
	} else {
		was_agreement_code_applied = false
	}

}

async function makeGetRequest(url){
    try {
        const xsrf = (await window.cookieStore.get('XSRF-TOKEN')).value;
        const response = await fetch(url, {
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
        const response = await fetch(url, {
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
    const request = await makeGetRequest('https://perevodi.keepincrm.com/api/v1/agreements/22280074.json');
    const number = request.comment;
    const field = document.querySelector('#field_title');
    field.value = number + '';
    const inputEvent = new Event('input', { bubbles: true });
    field.dispatchEvent(inputEvent);
    const payload = {
        comment: +number + 1 + '',
    };
    const putRequest = await makePutRequest('https://perevodi.keepincrm.com/api/v1/agreements/22280074.json', payload)
}

var was_payment_sourse_applied = false;

function checkPaymentSource(){
  const sidebar = document.querySelector('.sidebar--is-opened')
  if(sidebar?.getAttribute('badge') == 'payment'){
	const field = document.querySelector('textarea[ng-model="$ctrl.payment.comment"]');
	if(field?.value != ''){
		if(!was_payment_sourse_applied){
			was_payment_sourse_applied = true;
			applyPaymentSource();
		}
	}
  }else{
    was_payment_sourse_applied = false
  }

}

async function applyPaymentSource(){
    const comment = document.querySelector('textarea[ng-model="$ctrl.payment.comment"]').value;
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
	await new Promise(t=>setTimeout(t,200));
    document.querySelector('md-select[name="purse_id"]').click();
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
		const all_values = document.querySelectorAll('md-option[value="93506"]');
        document.all_values[all_values.length - 1].click();
    }
}

var was_delivery_price_set = false;

function checkDeliveryPrice(){
	const sidebar = document.querySelector('.sidebar--is-opened')
	if(sidebar?.getAttribute('badge') == 'nova_poshta'){
		const field = document.querySelector('input[name="cost"]');
		if(field.value != '200' && !was_delivery_price_set){
			console.log('Changing price')
			was_delivery_price_set = true;
			field.value = 200;
		}
  	}else{
		was_delivery_price_set = false
	}
}

function generalSidebarCheck(){
	const sidebar = document.querySelector('.sidebar--is-opened');
}

function getWalletBlock(title){
	const wallets = document.querySelectorAll('.wallet-item');
	for(const wallet of wallets){
		if(wallet.innerText.includes(title)){
			return wallet;
		}	
	}
	return null;
}

function checkPaymentTotal(){
	const vidcladeni = getWalletBlock('Готівка відкладена');
	if(!vidcladeni){
		return;
	}
	const kasa = getWalletBlock('Готівка у касі');
	let block = getWalletBlock('Готівка загалом');
	if(!block){
		block = document.createElement('div');
		block.innerHTML = vidcladeni.innerHTML;
		block.classList.add('wallet-item');
		block.querySelector('.wallet-title').innerHTML = 'Готівка загалом';
		vidcladeni.after(block);
	}	
	const price1 = +kasa.querySelector('.positive-amount').innerHTML.trim().replace(',', '.').replaceAll(' ','').replace('₴', '');
	const price2 = +vidcladeni.querySelector('.positive-amount').innerHTML.trim().replace(',', '.').replaceAll(' ','').replace('₴', '');
	block.querySelector('.positive-amount').innerHTML = price1 + price2;
}


(function(){
	'use strict'
	//setInterval(checkAgreementNum, 300);
	setInterval(checkDeliveryPrice, 300);
	setInterval(checkPaymentSource, 300);
	setInterval(checkPaymentTotal, 4000);
})();

