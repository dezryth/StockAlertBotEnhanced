import { toFile } from "./utils/log.js";
import { fetchPage } from "./utils/fetch.js";

export default class Item {
	constructor(url) {
		this.name = url.name;
		this.url = url.url;
		this.buyprice = url.buyprice;
		this.store = undefined;		
		this.purchaseAttempted = false;
		this.notificationSent = false;
		this.shouldSendNotification = true;		
		this.html = undefined;
		this.info = {
			title: undefined,
			inventory: undefined,
			image: undefined,
		};
	}

	/*
		Fetches the item page and assigns the html to this.html
		Returns a promise of true if successful, false otherwise
	*/
	async getPage(store, use_proxies, badProxies) {
		const response = await fetchPage(this.url, store, use_proxies, badProxies);
		this.store = store;
		switch (response.status) {
			case "ok":
				this.html = response.html;
				return {
					status: "ok",
				};

			case "retry":
				this.html = response.html;
				return {
					status: "retry",
					bad_proxies: response.badProxies,
				};

			case "error":
				this.html = response.html;
				toFile(store, response.error, this);
				return {
					status: "error",
				};
		}
	}

	/*
		Extract item information based on the passed callback function and assigns it to this.info
		Returns true if successful, false otherwise
	*/
	async extractInformation(store, storeFunction) {
		const info = await storeFunction(this.html);
		if (info.title && info.image && typeof info.inventory == "boolean") {
			// Change notification status to false once item goes out of stock (TODO: Currently, not reliable enough to not just constantly fail and send notifications)
			// if (this.notificationSent && !info.inventory) this.notificationSent = false;

			this.shouldSendNotification = !this.info.inventory && info.inventory; // Check change in item stock
			this.info = info;
			return true;
		} else if (info.error) {
			toFile(store, info.error, this);
			return false;
		} else {
			toFile(store, "Unable to get information", Object.assign(this, info));
			return false;
		}
	}

	/*
		Set item as purchased so it is not purchased multiple times
		TODO: Update to support purchasing up to a set amount.
	*/
	updatePurchaseAttempted() {
		this.purchaseAttempted = true;
	}
}
