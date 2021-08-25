import open from "open";
import sendAlertToEmail from "./email.js";
import sendDesktopAlert from "./desktop.js";
import sendAlertToWebhooks from "./webhook.js";
import sendAlertToSMSViaAWS from "./sms-aws.js";
import sendAlertToSMSViaEmail from "./sms-email.js";
import sendAlertToSMSViaTwilio from "./sms-twilio.js";
import sendAlertToPushover from "./pushover.js";
import {
  DESKTOP,
  EMAIL,
  environment_config,
  OPEN_URL,
  SMS_METHOD,
  WEBHOOK_URLS,
} from "../../main.js";

export default function sendAlerts(item, purchaseAttempt) {

  let label = item.name ? item.name : item.title;

  if (purchaseAttempt == undefined) {
    if (DESKTOP) sendDesktopAlert(item.url, label, item.image, item.store);
    if (EMAIL) sendAlertToEmail(environment_config.email, item.url, label, item.image, item.store);
    if (OPEN_URL) {
      open(url);
    }
    if (SMS_METHOD == "Amazon Web Services")
      sendAlertToSMSViaAWS(environment_config.sms_aws, item.url, label, item.store);
    if (SMS_METHOD == "Email")
      sendAlertToSMSViaEmail(environment_config.sms_email, item.url, label, item.image, item.store);
    if (SMS_METHOD == "Twilio")
      sendAlertToSMSViaTwilio(environment_config.sms_twilio, item.url, label, item.store);
    if (WEBHOOK_URLS.length > 0)
      sendAlertToWebhooks(WEBHOOK_URLS, item.url, label, item.image, item.store);
    if (SMS_METHOD == "Pushover")
      sendAlertToPushover(environment_config.pushover, item.url, label, item.store, purchaseAttempt);
  }
  else {
    // Send Purchase Attempted Push Notification
    if (SMS_METHOD == "Pushover")
      sendAlertToPushover(environment_config.pushover, item.url, label, item.store, purchaseAttempt);
  }
}
