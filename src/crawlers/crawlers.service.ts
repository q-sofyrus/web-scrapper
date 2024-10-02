/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PlaywrightCrawler, ProxyConfiguration } from 'crawlee';
import * as fs from 'fs';
import * as path from 'path';
import * as csvWriter from 'csv-write-stream';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
@Injectable()
export class CrawlersService {
  private currentProxyIndex = 0;

  async scrapeData(): Promise<void> {
    const writer = csvWriter({
      headers: [
        'Name(s)',
        'Email',
        'Registration Number',
        'Title',
        'Description',
        'Copyright Claimant',
        'Date Of Creation',
        'Rights And Permission',
        'Photographs',
      ],
    });

    const filePath = path.join(__dirname, 'data.csv');
    const writeStream = fs.createWriteStream(filePath);
    writer.pipe(writeStream);
 
    const crawler = new PlaywrightCrawler({
      useSessionPool: true,
      sessionPoolOptions: { maxPoolSize: 100 },
      persistCookiesPerSession: true,

      async requestHandler({ page, request, log }) {
        console.log('Scraping:', request.url);
        await page.goto(request.url, { timeout: 120000 }); // Timeout after 10 seconds

        const name = (await page.textContent('th:has-text("Name") + td'))?.trim() || 'N/A';
        const element = await page.$('th:has-text("Rights and Permissions") + td');
        const rightsAndPermissions = element ? (await element.textContent())?.trim() || 'N/A' : 'N/A';

        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        const emailMatch = rightsAndPermissions.match(emailRegex);
        const email = emailMatch ? emailMatch[0] : 'N/A';

        const registrationNumber = (await page.textContent('th:has-text("Registration Number") + td'))?.trim() || 'N/A';
        const title = (await page.textContent('th:has-text("Title:") + td'))?.trim() || 'N/A';
        const description = (await page.textContent('th:has-text("Description") + td'))?.trim() || 'N/A';
        const copyrightClaimant = (await page.textContent('th:has-text("Copyright Claimant") + td'))?.trim() || 'N/A';
        const dateOfCreation = (await page.textContent('th:has-text("Date of Creation") + td'))?.trim() || 'N/A';
        console.log("before photo exists...");

        const photographs = await page.evaluate(() => {
          console.log("0before photo exists...");
          
          const thElement = Array.from(document.querySelectorAll('th')).find(th => th.textContent.trim() === 'Photographs:');
          console.log("1before photo exists...");
          if (!thElement) return 'N/A';
         
          const photographsList = [];
          console.log("2photo exists...");
          let currentRow = thElement.parentElement.nextElementSibling;
          
          while (currentRow) {
            const tdElement = currentRow.querySelector('td[dir="ltr"]');
            
            // Scan both the direct td element and any nested elements for the term 'photographs'
            if (tdElement && (tdElement.textContent.includes('photographs') || tdElement.innerHTML.includes('photographs'))) {
              photographsList.push(tdElement.textContent.trim());
            } 
        
            currentRow = currentRow.nextElementSibling;
          }
        
          return photographsList.length > 0 ? photographsList.join(', ') : 'N/A';
        });
        

        log.info(`Extracted Data:
          Name(s): ${name}
          Email: ${email}
          Registration Number: ${registrationNumber}
          Title: ${title}
          Description: ${description}
          Copyright Claimant: ${copyrightClaimant}
          Date Of Creation: ${dateOfCreation}
          Rights And Permission: ${rightsAndPermissions}
          Photographs: ${photographs}
        `);

        writer.write({
          'Name(s)': name,
          'Email': email,
          'Registration Number': registrationNumber,
          'Title': title,
          'Description': description,
          'Copyright Claimant': copyrightClaimant,
          'Date Of Creation': dateOfCreation,
          'Rights And Permission': rightsAndPermissions,
          'Photographs': photographs,
        });
      },

      async failedRequestHandler({ request, error }) {
        console.error(`Request ${request.url} failed too many times. Error: ${error}`);
      },
    });

    const urls = [];
    // for (let v1 = 1; v1 <= 50; v1++) {
    //     urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&Search%5FArg=Group%20registration%20for%20a%20group%20of%20unpublished%20images&Search%5FCode=FT%2A&CNT=100&PID=dummypid&SEQ=1234567891234&SID=1`);
    // }

    await crawler.run(['https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=2&ti=1,1&Search%5FArg=Group%20registration%20for%20a%20group%20of%20unpublished%20images&Search%5FCode=FT%2A&CNT=100&PID=dummypid&SEQ=1234567891234&SID=1']);

    writer.end(() => {
      console.log(`Scraping completed and data saved to ${filePath}`);
    });
  }

  private decodeEmail(encoded: string): string {
    const r = parseInt(encoded.substring(0, 2), 16);
    return encoded.substring(2).replace(/[0-9a-f]{2}/g, (c) => String.fromCharCode(parseInt(c, 16) ^ r));
  }

  async testProxy(proxyUrl: string): Promise<{ proxyUrl: string; time: number } | null> {
    const startTime = Date.now();

    try {
      const agent = new HttpsProxyAgent(proxyUrl);
      const response = await axios.get('https://httpbin.org/ip', { httpAgent: agent });
      const elapsedTime = Date.now() - startTime;

      console.log(`Proxy ${proxyUrl} responded in ${elapsedTime}ms. IP:`, response.data.origin);
      return { proxyUrl, time: elapsedTime };
    } catch (error) {
      console.log(`Proxy ${proxyUrl} failed:`, error.message);
      return null;
    }
  }

  async checkProxies(): Promise<{ proxyUrl: string; time: number }[]> {
    const results: { proxyUrl: string; time: number }[] = [];
    const proxyUrls = [
      'http://64.227.134.208:80',
      'http://103.156.75.41:8181',
      'http://212.83.138.172:22138',
      'http://217.112.80.252:80',
    ];

    for (const proxyUrl of proxyUrls) {
      const result = await this.testProxy(proxyUrl);
      if (result !== null) {
        results.push(result);
      }
    }

    const sortedResults = results.sort((a, b) => a.time - b.time);
    console.log('Fastest Proxies:', sortedResults);

    return sortedResults;
  }
}
