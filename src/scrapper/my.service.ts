/* eslint-disable prettier/prettier */
// this scrapper fetch registration numbers from the copyrightable.com  

import { Injectable } from '@nestjs/common';
import { PlaywrightCrawler, ProxyConfiguration } from 'crawlee';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import * as fs from 'fs';
import * as path from 'path';
import { createObjectCsvWriter } from 'csv-writer';

@Injectable()
export class MyService {
 
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

  async fetch_registration(category:string, alpha:string, start:any, end:any ): Promise<object> {
    const fileName = category+'-reg-'+alpha+'.csv'
    const filePath = path.join('', fileName);
    const csvWriter = createObjectCsvWriter({
      append: true,
      path: filePath,
      header: [{ id: 'Registration_no', title: 'Registration_no' }],
    });
    console.log('fetching regs   for: ', alpha);
    const proxyUrls = await this.fetchProxies();
    const proxyConfiguration = new ProxyConfiguration({ proxyUrls });
    console.log('Proxies: ', proxyUrls);

    const crawler = new PlaywrightCrawler({
      useSessionPool: true,
      sessionPoolOptions: { maxPoolSize: 100 },
      // proxyConfiguration,    // uncomment for using proxies
      persistCookiesPerSession: true,
      maxRequestRetries: 50,
      maxConcurrency: 50,
      minConcurrency: 1,
      navigationTimeoutSecs: 120,
      requestHandler: async ({ page, request, proxyInfo }) => {
        console.log('Scraping:', request.url);
        console.log('Using proxy:', proxyInfo?.url || 'No proxy');

        try {

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

          // Write extracted data to CSV
          await csvWriter.writeRecords(
            registrationNumbers.map((number) => ({
              Registration_no: number,
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
    let url=''
    const formattedCategory = category.toLowerCase().replace(/\s+/g, '-') + '-registration';
    start=Number(start)
    end=Number(end)
   

    for (let index = start; index <= end; index++) {
        if(formattedCategory==='dramatic-work-and-music-and-choreography-registration')
             url = `https://www.copyrightable.com/search/category/dramatic-work-and-music-and-choreography/page-${alpha}-${index}`;
           
        else 
              url = `https://www.copyrightable.com/search/category/${formattedCategory}/page-${alpha}-${index}`;
        urls.push(url);
    }

    console.log('Total links:', urls.length);
    await crawler.run(urls);
    return{'message': 'success'}
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
