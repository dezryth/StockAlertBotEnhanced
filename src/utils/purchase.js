import { By, until, Builder } from "selenium-webdriver";
import chalk from "chalk";
import { toConsole } from "./log.js";
import "chromedriver";
import fs from "fs";

export default async function purchase(item) {

  let EMAIL = "";
  let PASSWORD = "";
  let CCV = "";

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

    //Make sure price is less than a safeguard.
    let price = await driver.findElement(By.xpath("//*[@id='price_inside_buybox']")).getText();
    price = parseFloat(price.replace("$", ""));

    if (price < item.buyprice && !item.purchased) {
      //Update purchased property of item
      item.updatePurchased();

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

    }
    else {
      toConsole("alert", chalk.red.bold("The price for the item, $" + price + " is higher than your max buy price of $" + item.buyprice + "."));
      await driver.quit();
    }

  }

  // Other store...

  // Newegg
  if (item.store === 'newegg') {

    // Get credentials
    fs.readFile("config/credentials", 'utf8', (err, jsonString) => {
      if (err) {
        console.log(`Error: ${err}`);
        return;
      } else {
        const credentials = JSON.parse(jsonString);
        EMAIL = credentials.newegg.USERNAME;
        PASSWORD = credentials.newegg.PASSWORD;
        CCV = credentials.newegg.CCV;
      }
    })

    //Wait for browser to build and launch properly
    let driver = await new Builder().forBrowser("chrome").build();

    //Fetch url from the browser with our code.
    await driver.get(item.url);

    //Make sure price is less than a safeguard.
    let price = await driver.findElement(By.xpath("//li[contains(@class, 'price-current')]//strong")).getText();
    price = parseFloat(price.replace("$", ""));

    if (price < item.buyprice && !item.purchased) {
      //Update purchased property of item
      item.updatePurchased();

      //Find and click add to cart button
      await driver.findElement(By.xpath("//div[@id='ProductBuy']//*[contains(@class, 'btn-primary')]")).click();

      //Click "No, Thanks" button
      await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'No, thanks')]")), 5000).click();

      //Click "View Cart & Checkout" button
      await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'View Cart & Checkout')]"))).click();
      
      //Click "Secure Checkout" button
      await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Secure Checkout')]"))).click();

      //Enter Username/Password
      await driver.wait(until.elementLocated(By.xpath("//input[@id='labeled-input-signEmail']"))).sendKeys(EMAIL);
      await driver.findElement(By.xpath("//button[@id='signInSubmit']")).click();
      await driver.wait(until.elementLocated(By.xpath("//input[@id='labeled-input-password']"))).sendKeys(PASSWORD);
      await driver.findElement(By.xpath("//button[@id='signInSubmit']")).click();

      //Confirm Delivery
      await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Continue to delivery')]")), 5000).click();
      //Enter CCV Code
      await driver.findElement(By.xpath("//input[contains(@class, 'form-text mask-cvv-4')]")).sendKeys(CCV);

      //Click "Place Order" button
      await driver.wait(until.elementLocated(By.xpath("//button[@id='btnCreditCard']"))).click();
    }
    else {
      toConsole("alert", chalk.red.bold("The price for the item, $" + price + " is higher than your max buy price of $" + item.buyprice + "."));
      await driver.quit();
    }
  }

}