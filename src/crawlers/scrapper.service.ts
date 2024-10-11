/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PlaywrightCrawler, ProxyConfiguration } from 'crawlee';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import * as fs from 'fs';
import * as path from 'path';
import { createObjectCsvWriter } from 'csv-writer';

@Injectable()
export class ScraperService {
  private filePath = path.join('', 'sound-recording-a.csv');
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
    //await this.csvWriter.writeRecords([]); // Initialize CSV file
    

    const crawler = new PlaywrightCrawler({
      useSessionPool: true,
      sessionPoolOptions: { maxPoolSize: 100 },
      //proxyConfiguration,
      persistCookiesPerSession: true,
      maxRequestRetries: 50,
      maxConcurrency: 10,
      minConcurrency: 1,
      navigationTimeoutSecs: 120,

       requestHandler: async function({ page, request, proxyInfo }) {
        console.log('Scraping:', request.url);
        console.log('Using proxy:', proxyInfo?.url || 'No proxy');

        try {
          await page.goto(request.url, { timeout: 6000000 });
        } catch (error) {
          console.error(`Failed to navigate to ${request.url}. Error: ${error.message}`);
          throw error;
        }

        await page.waitForSelector('div[class~="min-h-\\[80vh\\]"]');
        const hrefs = await page.$$eval('div[class~="min-h-\\[80vh\\]"] a', (links) => {
          const uniqueHrefs = new Set(); 
          links.forEach((link) => {
            const anchor = link as HTMLAnchorElement;
            if (anchor.href) {
              uniqueHrefs.add(anchor.href);
            }
          });
          return Array.from(uniqueHrefs);
        });

         const registrationNumbers = hrefs.map((url: string) => {
          const match = url.match(/-(\w+)\?/);
          return match ? match[1] : null;
        });
        console.log('Registration numbers: ', registrationNumbers);

        const links = registrationNumbers.map((arg) => `https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=1&ti=1,1&Search_Arg=${arg}&Search_Code=REGS&CNT=25&PID=dummy_pid&SEQ=12345678912345&SID=1`);
         for (let index = 0; index < links.length; index++) {
          try {
            await page.goto(links[index], { timeout: 6000000 });
            await page.waitForLoadState('domcontentloaded');

            let selector = 'th:has-text("Name") + td';
            let element = await page.$(selector);
            const name = element ? (await page.evaluate((el: { textContent: any }) => el.textContent, element)).trim() : 'N/A';

            selector = 'th:has-text("Rights and Permissions") + td';
            element = await page.$(selector);
            const rightsAndPermissions = element ? (await page.evaluate((el: { textContent: any }) => el.textContent, element)).trim() : 'N/A';
            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
            const emailMatch = rightsAndPermissions.match(emailRegex);
            const email = emailMatch ? emailMatch[0] : 'N/A';

            selector = 'th:has-text("Registration Number") + td';
            element = await page.$(selector);
            const registrationNumber = element ? (await page.evaluate((el: { textContent: any }) => el.textContent, element)).trim() : 'N/A';

            selector = 'th:has-text("Title:") + td';
            element = await page.$(selector);
            const title = element ? (await page.evaluate((el: { textContent: any }) => el.textContent, element)).trim() : 'N/A';

            selector = 'th:has-text("Description") + td';
            element = await page.$(selector);
            const description = element ? (await page.evaluate((el: { textContent: any }) => el.textContent, element)).trim() : 'N/A';

            selector = 'th:has-text("Copyright Claimant") + td';
            element = await page.$(selector);
            const copyrightClaimant = element ? (await page.evaluate((el: { textContent: any }) => el.textContent, element)).trim() : 'N/A';

            selector = 'th:has-text("Date of Creation") + td';
            element = await page.$(selector);
            const dateOfCreation = element ? (await page.evaluate((el: { textContent: any }) => el.textContent, element)).trim() : 'N/A';

            // Write extracted data to CSV
            console.log(`
                Extracted Data:
                Name: ${name}
                Email: ${email}
                Registration Number: ${registrationNumber}
                Title: ${title}
                Description: ${description}
                Copyright Claimant: ${copyrightClaimant}
                Date Of Creation: ${dateOfCreation}
                Rights and Permissions: ${rightsAndPermissions}
              `);
             await this.csvWriter.writeRecords([
              {
                name,
                email,
                registrationNumber,
                title,
                description,
                copyrightClaimant,
                dateOfCreation,
                rightsAndPermissions,
              },
            ]);

            // Log extracted data to the console
          
          } catch (error) {
            console.error(`Failed to navigate to ${links[index]}. Error: ${error.message}`);
          }
        }
      }.bind(this),
      async failedRequestHandler({ request, error }) {
        console.error(`Request ${request.url} failed too many times. Error: ${error}`);
      },
    });
    const urls=[]
    for (let index = 1; index <= 10; index++) {
    urls.push(`https://www.copyrightable.com/search/category/sound-recording-registration/page-a-${index}`);
    
    }
    console.log('total links:',urls.length);
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
