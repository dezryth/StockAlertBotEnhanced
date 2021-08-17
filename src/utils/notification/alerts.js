import open from "open";
import sendAlertToEmail from "./email.js";
import sendDesktopAlert from "./desktop.js";
import sendAlertToWebhooks from "./webhook.js";
import sendAlertToSMSViaAWS from "./sms-aws.js";
import sendAlertToSMSViaEmail from "./sms-email.js";
import sendAlertToSMSViaTwilio from "./sms-twilio.js";
import {
	DESKTOP,
	EMAIL,
	environment_config,
	OPEN_URL,
	SMS_METHOD,
	WEBHOOK_URLS,
} from "../../main.js";

export default function sendAlerts(product_url, title, image, store) {
	if (DESKTOP) sendDesktopAlert(product_url, title, image, store);
	if (EMAIL) sendAlertToEmail(environment_config.email, product_url, title, image, store);
	if (OPEN_URL) {
		open(product_url);
	}
	if (SMS_METHOD == "Amazon Web Services")
		sendAlertToSMSViaAWS(environment_config.sms_aws, product_url, title, store);
	if (SMS_METHOD == "Email")
		sendAlertToSMSViaEmail(environment_config.sms_email, product_url, title, image, store);
	if (SMS_METHOD == "Twilio")
		sendAlertToSMSViaTwilio(environment_config.sms_twilio, product_url, title, store);
	if (WEBHOOK_URLS.length > 0)
		sendAlertToWebhooks(WEBHOOK_URLS, product_url, title, image, store);
}
