/*eslint-disable prettier/prettier*/ //  using proxies
import { Injectable } from '@nestjs/common';
import { CheerioCrawler } from '@crawlee/cheerio';
import { ProxyConfiguration } from '@crawlee/core'; // Import Proxy Configuration
import * as fs from 'fs';
import * as path from 'path';
import * as csvWriter from 'csv-write-stream';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

@Injectable()
export class CrawlersService {
  private proxyUrls = [
    "http://103.86.135.34:5678",
    "http://60.205.132.71:80"
  ];

  private currentProxyIndex = 0;

  private getNextProxy(): string {
    const proxy = this.proxyUrls[this.currentProxyIndex];
    this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxyUrls.length;
    return proxy;
  }

  async scrapeData(): Promise<void> {
    // CSV Writer Setup
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

    // Initialize a CheerioCrawler instance with concurrency set to 2
    const proxyConfiguration = new ProxyConfiguration({
      proxyUrls: this.proxyUrls,
    });
    //  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Bypasses SSL certificate validation (for testing only)

    const crawler = new CheerioCrawler({
      proxyConfiguration,
      maxRequestRetries: 1,
      requestHandlerTimeoutSecs: 120,
      maxConcurrency: 2,
      preNavigationHooks: [
        async ({ request, session, proxyInfo, log }) => {
          request.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          };
        },
      ],

      async requestHandler({ request, $, log, proxyInfo }) {
        console.log(proxyInfo);
        const proxyUrl = this.getNextProxy();
        log.info(`Using Proxy: ${proxyUrl}`);
        console.log('Scraping: ', request.url);

        // Extract the required data
        const name = $('th:contains("Name")').next('td').text().trim() || 'N/A';
        const rightsAndPermissionsHtml = $('th:contains("Rights and Permissions")').next('td').html();
        let email = 'N/A';

        const rightsAndPermissions = $('th:contains("Rights and Permissions")').next('td').text().trim() || 'N/A';

        const emailMatch = rightsAndPermissionsHtml.match(/data-cfemail="([^"]+)"/);
        if (emailMatch && emailMatch[1]) {
          email = this.decodeEmail(emailMatch[1]);
        } else {
          const plainEmailMatch = rightsAndPermissionsHtml.match(/<a[^>]+>(.*?)<\/a>/);
          if (plainEmailMatch) {
            email = plainEmailMatch[1].replace(/&#xa0;/g, '').trim();
          }
        }

        const registrationNumber = $('th:contains("Registration Number")').next('td').text().trim() || 'N/A';
        const title = $('th').filter(function () {
          return $(this).text().trim() === 'Title:';
        }).next('td').text().trim() || 'N/A';
        const description = $('th:contains("Description")').next('td').text().trim() || 'N/A';
        const copyrightClaimant = $('th:contains("Copyright Claimant")').next('td').text().trim() || 'N/A';
        const dateOfCreation = $('th:contains("Date of Creation")').next('td').text().trim() || 'N/A';
        const photographs = $('th:contains("Photographs")').next('td').text().trim() || 'N/A';

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

        // Write the data to the CSV file
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

    const urls = [
      'https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=1&ti=1,1&Search%5FArg=Group%20registration%20for%20a%20group%20of%20unpublished%20images&Search%5FCode=FT%2A&CNT=25&PID=pfqjTOgf8I4fGF7GRMUndkhi5bJG8Ib&SEQ=20240927072717&SID=1'
     ];

    // Run the crawler
    await crawler.run(urls);

    // Close the CSV writer once scraping is complete
    writer.end(() => {
      console.log(`Scraping completed and data saved to ${filePath}`);
    });
  }

  private decodeEmail(encoded: string): string {
    const r = parseInt(encoded.substr(0, 2), 16);
    return encoded.substr(2).replace(/[0-9a-f]{2}/g, (c) => String.fromCharCode(parseInt(c, 16) ^ r));
  }

  // Method to test proxies
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

  // Method to check all proxies
  async checkProxies(): Promise<{ proxyUrl: string; time: number }[]> {
    const results: { proxyUrl: string; time: number }[] = [];

    for (const proxyUrl of this.proxyUrls) {
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