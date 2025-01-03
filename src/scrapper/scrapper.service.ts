/* eslint-disable prettier/prettier */
// this scrapper scrape  data using registration numbers  from usco website
import { Injectable } from '@nestjs/common';
import { PlaywrightCrawler, ProxyConfiguration } from 'crawlee';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import * as fs from 'fs';
import * as path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import * as csv from 'csv-parser';
import { log } from 'console';

@Injectable()
export class ScraperService {
  private filePath = path.join('', 'Visual-Material-data-new.csv');
  private csvWriter = createObjectCsvWriter({
    append: true,
    path: this.filePath,
    header: [
      { id: 'name', title: 'Name(s)' },  
      { id: 'email', title: 'Email' },
      { id: 'registrationNumber', title: 'Registration Number' },
      { id: 'title', title: 'Title' },
      { id: 'description', title: 'Description' },
      { id: 'copyrightClaimant', title: 'Copyright Claimant' },
      { id: 'dateOfCreation', title: 'Date Of Creation' },
      { id: 'rightsAndPermissions', title: 'Rights And Permission' },
    ],
  });
  
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
   
  async scrapeData(): Promise<void> {
    const proxyUrls = await this.fetchProxies();
    const proxyConfiguration = new ProxyConfiguration({
      proxyUrls,
    });
    console.log('Proxies: ', proxyUrls);

    const crawler = new PlaywrightCrawler({
      useSessionPool: true,
      proxyConfiguration,
      sessionPoolOptions: { maxPoolSize: 100 },
      persistCookiesPerSession: true,
      maxRequestRetries: 50,
      maxConcurrency: 50,
      minConcurrency: 1,
      navigationTimeoutSecs: 240,

      requestHandler: async function({ page, request, proxyInfo }) {
        console.log('Scraping:', request.url);
        console.log('Using proxy:', proxyInfo?.url || 'No proxy');

        try {
          await page.goto(request.url, { timeout: 480000 });
          await page.waitForLoadState('domcontentloaded');
        } catch (error) {
          console.error(`Failed to navigate to ${request.url}. Error: ${error.message}`);
          throw error;
        }

        const selectors = [
          { id: 'name', selector: 'th:has-text("Name") + td' },
          { id: 'rightsAndPermissions', selector: 'th:has-text("Rights and Permissions") + td' },
          { id: 'registrationNumber', selector: 'th:has-text("Registration Number") + td' },
          { id: 'title', selector: 'th:has-text("Title:") + td' },
          { id: 'description', selector: 'th:has-text("Description") + td' },
          { id: 'copyrightClaimant', selector: 'th:has-text("Copyright Claimant") + td' },
          { id: 'dateOfCreation', selector: 'th:has-text("Date of Creation") + td' },
        ];
         
         
        
        const data: any = {};
        for (const { id, selector } of selectors) {
          page.waitForLoadState();
          const element = await page.$(selector);
          data[id] = element ? (await page.evaluate((el: any) => el.textContent, element)).trim() : 'N/A';
        }

        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        const emailMatch = data.rightsAndPermissions.match(emailRegex);
        data.email = emailMatch ? emailMatch[0] : 'N/A';

        console.log(`
          Extracted Data:
          Name: ${data.name}
          Email: ${data.email}
          Registration Number: ${data.registrationNumber}
          Title: ${data.title}
          Description: ${data.description}
          Copyright Claimant: ${data.copyrightClaimant}
          Date Of Creation: ${data.dateOfCreation}
          Rights and Permissions: ${data.rightsAndPermissions}
        `);
  
        
        await this.csvWriter.writeRecords([data])
              .then(() => console.log('Data written successfully'))
              .catch((err) => console.error('Error writing data to CSV:', err));

      }.bind(this),

      failedRequestHandler: async ({ request, error }) => {
        console.error(`Request ${request.url} failed too many times. Error: ${error}`);
      },
    });
    const registrationNumbers=await (async () => {
      
      const registrationNumbers = [];
      try {
        await new Promise((resolve, reject) => {
          fs.createReadStream('C:/Users/Moon Computers/Desktop/web-scrapper/Visual Material-reg-g.csv')
            .pipe(csv())
            .on('data', (row) => {
              if (row['Registration_no']) {
                registrationNumbers.push(row['Registration_no']);
              }
            })
            .on('end', () => {
              console.log('CSV file successfully processed.');
              resolve(
                 registrationNumbers
              ); // Resolve the promise when done
            })
            .on('error', (err) => {
              console.error('Error reading the CSV file:', err);
              reject(err); // Reject the promise on error
            });
        });
    
        console.log('Registration Numbers:', registrationNumbers);
        // Now you can process the array of registration numbers here
    
      } catch (error) {
        console.error('Error during CSV parsing:', error);
      }
        return registrationNumbers
    })();
    const  urls=[]
for (let index = 0; index < registrationNumbers.length; index++) {
      urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=1&ti=1,1&Search%5FArg=${registrationNumbers[index]}&Search%5FCode=REGS&CNT=25&PID=my-dummy-pid123&SEQ=12345698741253&SID=1`)
     }

      console.log('Total links:', urls)
      await crawler.run(urls);  
  }

  async filterHealthyProxies() {
    console.log('Fetching proxies...');
    const proxies = await this.fetchProxies();
    const healthyProxies: string[] = [];

    console.log('Filtering healthy proxies...');
    for (const proxyUrl of proxies) {
      const isHealthy = await this.isProxyHealthy(proxyUrl);
      if (isHealthy) {
        healthyProxies.push(proxyUrl);
      }
    }

    console.log('Healthy proxies:', healthyProxies);
    return healthyProxies;
  }

  async isProxyHealthy(proxyUrl: string): Promise<boolean> {
    try {
      const proxyAgent = new HttpsProxyAgent(proxyUrl);
      const testResponse = await axios.get('https://www.google.com', {
        httpAgent: proxyAgent,
        httpsAgent: proxyAgent,
        timeout: 5000,
      });
      return testResponse.status === 200;
    } catch (error) {
      console.error(`Proxy failed: ${proxyUrl} - Error: ${error.message}`);
      await this.saveUrlToCSV(proxyUrl, 'failedUrls');
      return false;
    }
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
