// ==UserScript==
// @name         CRM automation scripts
// @namespace    http://tampermonkey.net/
// @version      2025-11-13
// @description  try to take over the world!
// @author       Ihor
// @include      https://perevodi.keepincrm.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

const phrases = {
	hello:["Доброго дня! Це Бюро перекладів, мене звати Альона. Ми щойно з Вами спілкувалися з приводу перекладу. Надішліть будь ласка фото або скан документу, я Вас зорієнтую по вартості та терміну виконання перекладу.",
		"Доброго дня! Це Бюро перекладів, мене звати Оля. Ми щойно з Вами спілкувалися з приводу перекладу. Надішліть будь ласка фото або скан документу, я Вас зорієнтую по вартості та терміну виконання перекладу.",
		"Доброго дня! Це Бюро перекладів, мене звати Альона. Ми щойно з Вами спілкувалися з приводу перекладу. Надішліть будь ласка фото або скан документу, я Вас зорієнтую по вартості та терміну виконання перекладу.",
		"Доброго дня! Це Бюро перекладів, мене звати Анжеліка. Ми щойно з Вами спілкувалися з приводу перекладу. Надішліть будь ласка фото або скан документу, я Вас зорієнтую по вартості та терміну виконання перекладу."
	],
	pay: [`Сплатити можна за реквізитами:
Отримувач: ФОП Рибачук Оксана Володимирівна 
IBAN: UA363220010000026004330121542 
ІПН/ЄДРПОУ: 2667521140 
Акціонерне товариство: УНІВЕРСАЛ БАНК 
Призначення: послуги по перекладу
Як сплатите, надішліть, будь-ласка, квитанцію про оплату.`],
	take: ["Добрий день! Готовий переклад можна забрати в офісі у звичайному режимі: пн-пт (9.00-18.00), сб (9.00-15.00) без обіду за адресою: вул. Проспект Миру 49а, офіс 205."]
}


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

async function makePatchRequest(url, body){
    try {
        const xsrf = (await window.cookieStore.get('XSRF-TOKEN')).value;
        const response = await fetch(url, {
            method: "PATCH",
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
	const price1 = +kasa.querySelector('.wallet-totals').innerText.trim().replace(',', '.').replaceAll(' ','').replace('₴', '');
	const price2 = +vidcladeni.querySelector('.wallet-totals').innerText.trim().replace(',', '.').replaceAll(' ','').replace('₴', '');
	block.querySelector('.wallet-totals>p').innerHTML = price1 + price2;
}

//On pause
function setText(value){
	const user = document.querySelector('.user-profile-name').innerText;
	let userid = 0;
	switch(user){
		case 'Альона 203':
			userid = 0;
			break;
		case 'Оля':
			userid = 1;
			break;
		case 'Альона 205':
			userid = 2;
			break;
		case 'Анжеліка':
			userid = 3;
			break;
	}
	let text = phrases[value][userid];
	if(!text){
		text = phrases[value][0];
	}
	document.querySelector('#tinymce').innerHTML = `<p>${text}</p>`;
	document.querySelector('#tinymce').dispatchEvent(new KeyboardEvent('keydown'))
}

var checkSupply = 10; 
var changeSupplyOrderInProgress = false;

function checkSupplyOrder(){
	const href = document.location.href;
	const pageId = /supply_order\/(\d+)/.exec(href)?.[1];
	if(pageId){
		const oldItems = document.querySelector('p[on-updated="$ctrl.update(\'supply_items_306\', false)"]').innerText;
		const total = +document.querySelector('span[editable-label="\'Total\'"]').innerText.replaceAll(' ', '').replace(',','.');
		let storedTotal = 0;
		try{
			storedTotal = JSON.parse(oldItems).reduce((sum, item) => sum + (item.amount * item.cost), 0);
		}catch(e){}
		let shouldSend = true;
		if(Math.abs(storedTotal - total) < 0.1){
			if(checkSupply > 0){
				checkSupply--;
				shouldSend = false;
			}else{
				checkSupply = 20;
			}
		}
		if(shouldSend){
			applySupplyAmountChange(pageId);
			return;
		}
	}
}

async function applySupplyAmountChange(pageId){
	if(changeSupplyOrderInProgress){
		return;
	}
	changeSupplyOrderInProgress = true;
	let supplyOrder = await makeGetRequest(`https://perevodi.keepincrm.com/supply_orders/${pageId}.json`);
	const totalByItems = supplyOrder.supply_items.reduce((prev, val)=>prev+(val.cost_amount*val.amount), 0);
	if(Math.abs(totalByItems - supplyOrder.total_amount) > 1){
		const totalItems = supplyOrder.supply_items.reduce((prev, val)=>prev+val.amount, 0);
		const valueOfOne = supplyOrder.total_amount / totalItems;
		for(const item of supplyOrder.supply_items){
			const newItem = await makePatchRequest(`https://perevodi.keepincrm.com/supply_orders/${supplyOrder.id}/supply_items/${item.id}.json`, {
				id: item.id, 
				supply_order_id: supplyOrder.id, 
				cost_amount: valueOfOne, 
				cost_currency: "UAH", 
				cost: valueOfOne
			});
		}
	}
	supplyOrder = await makeGetRequest(`https://perevodi.keepincrm.com/supply_orders/${pageId}.json`);
	const newItems = supplyOrder.supply_items.map(el=>{return {
		id:el.id, 
		amount: el.amount,
		cost: el.cost_amount
	}});
	const newItemsS = JSON.stringify(newItems);
	const oldItems = document.querySelector('p[on-updated="$ctrl.update(\'supply_items_306\', false)"]').innerText;
	if(oldItems!= newItemsS){
		await makePatchRequest(`https://perevodi.keepincrm.com/supply_orders/${pageId}.json`, 
			{"custom_fields":{...supplyOrder.custom_fields,"supply_items_306":newItemsS}});
		const agreements = await makeGetRequest(`https://perevodi.keepincrm.com/api/v1/agreements.json?number=10&page=1&q[with_supply_order]=${pageId}`); 
		const jobs = [];
		for(const agreement of agreements){
			if(agreement?.id){
				const newJobs = await makeGetRequest(`https://perevodi.keepincrm.com/api/v1/jobs.json?agreement_id=${agreement.id}`);
				jobs.push(...newJobs);
			}
		}
		for(const item of supplyOrder.supply_items){
			const job = jobs.find((job)=> job?.supply_item?.id == item.id);
			if(job){
				const updatedJob = await makePutRequest(`https://perevodi.keepincrm.com/api/v1/jobs/${job.id}.json`, {
					id: job.id,
					cost_amount: item.cost_amount,
					cost_currency: "UAH",
					cost: item.cost_amount
				});
			}
		}
	}
	changeSupplyOrderInProgress = false;
}

// Deprecated
async function checkSupplyItem(){
	let shouldReapply = false;
	const dataRows = document.querySelectorAll('jobs-list[jobs="$ctrl.agreement.jobs"] tbody tr');
	for(const row of dataRows){
		const href = row.querySelector('a[ng-show="row.supply_item"]')?.getAttribute('href');
		const data = row.querySelector('td[ng-repeat="field in $ctrl.jobCustomFields"]')?.innerText;
		if(href && href != ''){
			const elId = /supply_order\/(\d+)/.exec(href)?.[1];
			if(data && data != ''){
				let dataObj = '';
				try{
					dataObj = JSON.parse(data);
				}catch(e){}
				if(!dataObj){
					shouldReapply = true;
					break;
				}
				if(!(dataObj?.supply_order_id == elId)){
					shouldReapply = true;
					break;
				}
			}
		}
	}
	if(shouldReapply){
		const pageId = /agreements\/(\d+)/.exec(document.location.href)?.[1];
		if(!pageId) return;
		const jobs = await makeGetRequest(`https://perevodi.keepincrm.com/api/v1/jobs.json?agreement_id=${pageId}`);
		for(const job of jobs){
			if(job.supply_item){
				await makePutRequest(`https://perevodi.keepincrm.com/api/v1/jobs/${job.id}.json`, {
					id:job.id,
					custom_fields:{
						...job.custom_fields,
						supply_item_id_308: JSON.stringify(job.supply_item)
				}});
			}
		}
	}
}

async function calculateByRate(e){
	const href = document.location.href;
	const pageId = /supply_order\/(\d+)/.exec(href)?.[1];
	if(pageId){
		const supplyOrder = await makeGetRequest(`https://perevodi.keepincrm.com/supply_orders/${pageId}.json`);
		const rate = supplyOrder?.custom_fields?.tarif_za_1800_simvoliv_310;
		const symbols = supplyOrder?.custom_fields?.kilkist_simvoliv_311;
		if(rate && symbols){
			const newCost = Math.round(rate * symbols / 1800);
			const newSupply = await makePatchRequest(`https://perevodi.keepincrm.com/supply_orders/${pageId}.json`,
				{
					currency: "UAH", 
					total_kopiykas: newCost * 100
				}
			);
			await applySupplyAmountChange(pageId);
		}
	}
}

function checkButtonAdded(){
	const button = document.querySelector("#calculate");
	if(!button){
		const div = document.querySelector(".field-kilkist_simvoliv_311 .resource-fields-list-body");
		if(div){
			const block = document.createElement('div');
			block.innerHTML = ` <button id="calculate" class="sys-btn interaction-btn">Розрахувати ціну</button>`;
			div.appendChild(block);
			block.addEventListener('click', calculateByRate)
		}
	}
}

async function applyPaymentToSupplier(e){
	const href = document.location.href;
	const pageId = /supply_order\/(\d+)/.exec(href)?.[1];
	e.target.innerHTML = 'В процесі...';
	if(pageId){
		const supplyOrder = await makeGetRequest(`https://perevodi.keepincrm.com/supply_orders/${pageId}.json`);
		const supplierId = supplyOrder.supplier.id;
		const supplier = await makeGetRequest(`https://perevodi.keepincrm.com/suppliers/${supplierId}.json`);
		const orders = [];
		let page = 1;
		while(page*100 <= supplier.supply_orders_count + 100){
			const currentOrders = await makeGetRequest(`https://perevodi.keepincrm.com/supply_orders.json?date_field=ordered_at&number=100&page=${page}&q%5Bsupplier_id_eq%5D=${supplierId}`);
			orders.push(...currentOrders);
			page++;
			if(currentOrders.length == 100){
				const lastOrder = currentOrders[currentOrders.length - 1];
				if(lastOrder.custom_fields?.oplachieno_313 == true){
					break;
				}
			}else{
				break;
			}
		}
		const totalDebt = Math.floor(supplier.supplied_credit_amount);
		let inDebtOrders = 0;
		let debtAmountCounted = 0;
		while(inDebtOrders < supplier.supply_orders_count){
			const order = orders[inDebtOrders];
			if(order.total_amount > 0 && totalDebt <= debtAmountCounted){
				break;
			}
			if(order.custom_fields?.oplachieno_313 != true){
				debtAmountCounted += order.total_amount;
			}
			inDebtOrders++;
		}
		let lastPaid = orders.length - 1;
		while(lastPaid > 0){
			const order = orders[lastPaid];
			if(order.custom_fields?.oplachieno_313 == true){
				lastPaid--;
			}else{
				lastPaid++;
				break;
			}
		}
		const toGetPaid = orders.slice(inDebtOrders, lastPaid);
		console.log(toGetPaid);
		for(const order of toGetPaid){
			await makePatchRequest(`https://perevodi.keepincrm.com/supply_orders/${order.id}.json`, {
				"custom_fields":{
					...order.custom_fields,
					"oplachieno_313":true
				}
			});
		}
	}
	e.target.innerHTML = 'Розрахувати оплати постачальника';
}

function checkButton2Added(){
	const button = document.querySelector("#apply_payment");
	if(!button){
		const summaryText = document.querySelector('.supplyOrder-page md-card[ng-if="$root.user.permissions.show_payments_block"]');
		if(summaryText){
			const block = document.createElement('div');
			block.innerHTML = ` <button id="apply_payment" class="sys-btn interaction-btn">Розрахувати оплати постачальника</button>`;
			summaryText.appendChild(block);
			block.addEventListener('click', applyPaymentToSupplier)
		}
	}
}


was_price_type_checked = false;
//Unused
function checkLeadPrice() {
	const href = document.location.href;
	const pageId = /clients\/(\d+)/.exec(href)?.[1];
	if(pageId){
		const isLead = document.querySelector('a[ng-show="$ctrl.client.lead"]');
		if(isLead.getAttribute('ui-sref') == 'app.clients') return;
		if (!was_price_type_checked) {
			was_price_type_checked = true;
			applyPriceType(pageId);
		}
	}else{
		was_price_type_checked = false;
	}
}

async function applyPriceType(pageId){
	const lead = await makeGetRequest(`https://perevodi.keepincrm.com/api/v1/clients/${pageId}.json`);
	if(lead){
		const setPrice = false;
		switch(lead.source.name){
			case '':
			case '':
			case '':
			case '':
			setPrice = true;
			break;
		}
		if(setPrice){
			await makePatchRequest(`https://perevodi.keepincrm.com/api/v1/clients/${pageId}.json`, {
				price_type_id: 9130
			});
		}
	}
}


(function(){
	'use strict'
	//setInterval(checkAgreementNum, 300);
	setInterval(checkDeliveryPrice, 300);
	setInterval(checkPaymentSource, 300);
	setInterval(checkPaymentTotal, 4000);
	setInterval(checkButtonAdded, 2000);
	setInterval(checkButton2Added, 2000);
	setInterval(checkSupplyOrder, 1000);
	//setInterval(checkSupplyItem, 1000);
	//setInterval(sendCred, 90*1000);
})();

