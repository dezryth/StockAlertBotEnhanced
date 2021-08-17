import { By, Builder } from "selenium-webdriver";
import "chromedriver";
import fs from "fs";

export default async function purchase(store, buyprice, url) {

  let EMAIL = "";
  let PASSWORD = "";

  // Amazon  
  if (store === 'amazon') {
    
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
    await driver.get(url);

    //Make sure price is less than a safeguard. TODO: Make this a setting.
    let price = await driver.findElement(By.xpath("//*[@id='price_inside_buybox']")).getText();
    price = parseFloat(price.replace("$", ""));

    if (price < buyprice) {
      //Find and click buy now button
      await driver.findElement(By.xpath("/html//input[@id='buy-now-button']")).click();

      //Enter email/password if prompted
      await driver.findElement(By.xpath("/html//input[@id='ap_email']")).sendKeys(EMAIL);
      await driver.findElement(By.xpath("//span[@id='continue']//input[@id='continue']")).click();
      await driver.findElement(By.xpath("/html//input[@id='ap_password']")).sendKeys(PASSWORD);
      await driver.findElement(By.xpath("/html//input[@id='signInSubmit']")).click();

      //Click place order button
      await driver.findElement(By.xpath("//input[@name='placeYourOrder1']")).click();

      //It is always a safe practice to quit the browser after execution
      //await driver.quit();
    }
  }

  // Other store...
}
