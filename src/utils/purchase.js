import { By, Builder } from "selenium-webdriver";
import chalk from "chalk";
import { toConsole } from "./log.js";
import "chromedriver";
import fs from "fs";

export default async function purchase(item) {

  let EMAIL = "";
  let PASSWORD = "";

  // Amazon  
  if (item.store === 'amazon') {
    
    // Get credentials
    fs.readFile("config/credentials", 'utf8', (err, jsonString) => {
      if (err) {
        console.log(`Error: ${err}`);
        return;
      } else {
        const credentials = JSON.parse(jsonString);
        EMAIL = credentials.amazon.USERNAME;
        PASSWORD = credentials.amazon.PASSWORD;
      }
    })

    //Wait for browser to build and launch properly
    let driver = await new Builder().forBrowser("chrome").build();

    //Fetch url from the browser with our code.
    await driver.get(item.url);

    //Make sure price is less than a safeguard. TODO: Make this a setting.
    let price = await driver.findElement(By.xpath("//*[@id='price_inside_buybox']")).getText();
    price = parseFloat(price.replace("$", ""));

    if (price < item.buyprice && !item.purchased) {
      //Find and click buy now button
      await driver.findElement(By.xpath("/html//input[@id='buy-now-button']")).click();

      //Enter email/password if prompted
      await driver.findElement(By.xpath("/html//input[@id='ap_email']")).sendKeys(EMAIL);
      await driver.findElement(By.xpath("//span[@id='continue']//input[@id='continue']")).click();
      await driver.findElement(By.xpath("/html//input[@id='ap_password']")).sendKeys(PASSWORD);
      await driver.findElement(By.xpath("/html//input[@id='signInSubmit']")).click();

      //Click place order button
      await driver.findElement(By.xpath("//input[@name='placeYourOrder1']")).click();
      toConsole("alert", chalk.green.bold("A purchase attempt was made on " + item.name + " at $" + price + "!!!"));

      //Update purchased property of item
      item.updatePurchased();
    }
    else
    {
      toConsole("alert", chalk.red.bold("The price for the item, $" + price + " is higher than your max buy price of $" + item.buyprice + "."));
      await driver.quit();
    }

  }

  // Other store...
}