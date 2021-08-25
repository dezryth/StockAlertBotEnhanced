import { Pushover } from "pushover-js"

export default async function sendAlertToPushover(pushover, url, title, store, purchaseAttempt) {
  var pushover = new Pushover(pushover.user, pushover.token);  

  if (purchaseAttempt == undefined)
  {
    pushover
    .setUrl(url)
    .setHtml()
    .send("SABE Stock Alert", "Stock was found for " + title + " at "  + store.charAt(0).toUpperCase() + store.slice(1) + "!");
    return;
  }

  if (purchaseAttempt)
  {
    pushover
    .setSound('cashregister')
    .setUrl(url)
    .setHtml()
    .send("SABE Purchase Attempt Success", "Purchase attempt made on " + title + " from "  + store.charAt(0).toUpperCase() + store.slice(1) + " was successful!");    
  }
  else 
  {
    pushover
    .setSound('cashregister')
    .setUrl(url)
    .setHtml()
    .send("SABE Purchase Attempt Unsuccessful", "Purchase attempt made on " + title + " from "  + store.charAt(0).toUpperCase() + store.slice(1) + " was unsuccessful due to price or sellout."); 
  }
}