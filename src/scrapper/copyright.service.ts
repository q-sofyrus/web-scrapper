/* eslint-disable prettier/prettier */
// this scrapper scrapes links under the view button from copyrightable.com, for a keyword 
// to extract data from the same website
import { Injectable } from '@nestjs/common';
import { PlaywrightCrawler, ProxyConfiguration } from 'crawlee';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import * as fs from 'fs';
import * as path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import * as csv from 'csv-parser';

@Injectable()
export class CopyrightService {
  async fetchProxies() {
    const githubUrl = 'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt';
    try {
      const response = await axios.get(githubUrl);
      const ipArray = response.data.split('\n').filter((proxy: string) => proxy.trim() !== '');
      return ipArray.map((ip: any) => `http://${ip}`);
    } catch (error) {
      console.error(`Failed to fetch proxy list: ${error.message}`);
      return [];
    }
  }

  async fetch_links():Promise<any>{
     
    // const filePath = path.join('', fileName);
    const filePath='Links-19-11-2024.csv'
    const csvWriter = createObjectCsvWriter({
      append: true,
      path: filePath,
      header: [{ id: 'Data_links', title: 'Data_links' }],
    });
     const proxyUrls = await this.fetchProxies();
    const proxyConfiguration = new ProxyConfiguration({ proxyUrls });
    console.log('Proxies: ', proxyUrls);

    const crawler = new PlaywrightCrawler({
      useSessionPool: true,
      sessionPoolOptions: { maxPoolSize: 100 },
      // proxyConfiguration,
      persistCookiesPerSession: true,
      maxRequestRetries: 50,
      maxConcurrency: 50,
      minConcurrency: 1,
      navigationTimeoutSecs: 120,
      requestHandler: async ({ page, request, proxyInfo }) => {
        console.log('Scraping:', request.url);
        console.log('Using proxy:', proxyInfo?.url || 'No proxy');

        try {

           
          // await page.goto(request.url, { waitUntil: 'load' });

          await page.goto(request.url, { waitUntil: 'domcontentloaded' });

// Wait for the specific button elements to be present
          await page.waitForSelector('a > button:has-text("View")');

  // Select the <a> element using a general selector and get the href attribute
  const hrefValues = await page.$$eval(
    'a > button:has-text("View")', // Select all <button> elements containing the text 'View'
    (buttons: HTMLButtonElement[]) => { // Explicitly declare the type of the buttons parameter
      return buttons.map(button => {
        // For each button, get its parent <a> and extract the href
        const parentAnchor = button.closest('a');
        return parentAnchor ? parentAnchor.getAttribute('href') : null; // Handle the case where parentAnchor may be null
      }).filter(href => href !== null); // Filter out any null values
    }
  );
    
   
          console.log('Href Values: ', hrefValues);

        //   Write extracted data to CSV
          await csvWriter.writeRecords(
            hrefValues.map((link) => ({
              Data_links: 'https://www.copyrightable.com'+link,
            }))
          );

        } catch (error) {
          console.error(`Failed to navigate to ${request.url}. Error: ${error.message}`);
        }
      },
      failedRequestHandler: async ({ request, error }) => {
        console.error(`Request ${request.url} failed too many times. Error: ${error}`);
      },
    });
  
    const urls = [];
const keywords=[]
fs.createReadStream('keywords.csv')
.pipe(csv())
.on('data', (row: any) => {
    // Assuming the CSV has only one column for keywords
    const keyword= row['keyword']; // Get the keyword
    keywords.push(keyword);
})
.on('end', () => {
    console.log('CSV file successfully processed.');
    console.log("keywords:",keywords)
keywords.forEach(keyword => {
  // URL encode the keyword (replace spaces with +)
  const encodedKeyword = keyword.replace(/ /g, '+');
  
  for (let page = 31; page <= 50; page++) {
      // Construct the URL
      const url = `https://www.copyrightable.com/search/registrations?q=${encodedKeyword}&type_of_record=%5B%22visual_material_registration%22%5D&page=${page}`;
      console.log(url);
      urls.push(url)
  }
});
     
    console.log('Total links:', urls.length);
   
});

// Generate URLs for each keyword and page from 1 to 100
await crawler.run(urls);

return{'message': 'success'}

  }

 
 

  async saveUrlToCSV(csvData: string, fileName: string): Promise<void> {
    const filePath = path.resolve(__dirname, `${fileName}.csv`);
    fs.appendFile(filePath, csvData + '\n', (err) => {
      if (err) {
        console.error('Error writing to file', err);
      } else {
        console.log(`CSV file has been updated successfully as "${fileName}.csv"`);
      }
    });
  }
}
