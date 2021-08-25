import chalk from "chalk";
import { toConsole } from "./utils/log.js";
import getMs from "./utils/interval-value.js";
import sendAlerts from "./utils/notification/alerts.js";
import purchase from "./utils/purchase.js";
import { INTERVAL, PURCHASE_AVAILABLE, STORE_INTERVALS, SUPPORTED_PROXY_DOMAINS, TIME_BETWEEN_CHECKS } from "./main.js";
import fs from "fs";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default class Store {
	constructor(name, storeFunction) {
		this.name = name;
		this.items = [];
		this.bad_proxies = new Set();
		this.supports_proxies = SUPPORTED_PROXY_DOMAINS.includes(name);
		(this.store_function = storeFunction),
			(this.interval = getMs(STORE_INTERVALS[name] ? STORE_INTERVALS[name] : INTERVAL));
		this.delay = getMs(TIME_BETWEEN_CHECKS);
	}

	/*
		Adds an Item to the array
	*/
	addItem(item) {
		this.items.push(item);
	}

	/*
		Starts checking status of items
	*/
	startMonitor() {
		if (this.items.length == 0) {
			toConsole("error", "Cannot start montior: no items added!");
			return;
		}

		toConsole("setup", "Starting monitor for: " + chalk.cyan.bold(this.name.toUpperCase()));
		this.monitorItems();
	}

	/*
		Recursively checks all items 
	*/
	async monitorItems() {
		const length = this.items.length;
		for (const [index, item] of this.items.entries()) {
			if (item.info.title)
				toConsole(
					"check",
					"Checking " +
					chalk.magenta.bold(item.name ? item.name : item.info.title  + " at " + item.store) +
					" at " +
					chalk.cyan.bold(this.name.toUpperCase())
				);
      else if (item.name)
      {
        toConsole("check", "Checking : " + chalk.magenta(item.name));
      }
			else toConsole("check", "Checking url: " + chalk.magenta(item.url));

			// Get Item Page
			const response = await item.getPage(this.name, this.supports_proxies, this.bad_proxies);
			if (response.status == "retry") {
				this.bad_proxies = response.bad_proxies;
			} else if (response.status == "error") {
				if (index != length - 1) await sleep(this.delay);
				continue;
			}

			// Extract item information from the page
			if (!(await item.extractInformation(this.name, this.store_function))) {
				if (index != length - 1) await sleep(this.delay);
				continue;
			} else {
				// Send notifications about the item
				if (item.info.inventory && item.notificationSent) {
					toConsole(
						"info",
						chalk.magenta.bold(item.info.title) +
						" is still in stock at " +
						chalk.cyan.bold(this.name.toUpperCase())
					);
				}
				if (item.shouldSendNotification && !item.notificationSent) {
					sendAlerts(item);
					toConsole(
						"stock",
						chalk.magenta.bold(item.info.title) +
						" is in stock at " +
						chalk.cyan.bold(this.name.toUpperCase()) +
						"!!"
					);

          // Purchase Available with automation if setting is activated and StopPurchases file does not exist					
          if ((item.store === 'amazon' || item.store === 'newegg') && PURCHASE_AVAILABLE) {
            if (!item.purchaseAttempted)
            {
              var success = await purchase(item);
              sendAlerts(item, success);
            }
            else
            {
              toConsole("alert", chalk.red.bold("A purchase attempt for this item has already been performed in this run."));
            }						
          }          

					item.notificationSent = true;
				}
				
			}

			if (index != length - 1) await sleep(this.delay);
		}

		toConsole(
			"info",
			"Waiting " +
			chalk.yellow.bold(
				STORE_INTERVALS[this.name]
					? STORE_INTERVALS[this.name].value + " " + STORE_INTERVALS[this.name].unit
					: INTERVAL.value + " " + INTERVAL.unit
			) +
			" to check " +
			chalk.cyan.bold(this.name.toUpperCase()) +
			" again"
		);

		setTimeout(this.monitorItems.bind(this), this.interval);
	}
}
