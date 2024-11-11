// /* eslint-disable prettier/prettier */

// import { Injectable } from '@nestjs/common';
// import { PlaywrightCrawler, ProxyConfiguration } from 'crawlee';
// import axios from 'axios';
// import { HttpsProxyAgent } from 'https-proxy-agent';
// import * as fs from 'fs';
// import * as path from 'path';
// import { createObjectCsvWriter } from 'csv-writer';

// @Injectable()
// export class CopyrightService {
 

//   async fetchProxies() {
//     const githubUrl = 'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt';
//     try {
//       const response = await axios.get(githubUrl);
//       const ipArray = response.data.split('\n').filter((proxy: string) => proxy.trim() !== '');
//       return ipArray.map((ip: any) => `http://${ip}`);
//     } catch (error) {
//       console.error(`Failed to fetch proxy list: ${error.message}`);
//       return [];
//     }
//   }

//   async fetch_links_data(): Promise<object> {
     
//     // const filePath = path.join('', fileName);
//     const filePath='links.csv'
//     const csvWriter = createObjectCsvWriter({
//       append: true,
//       path: filePath,
//       header: [{ id: 'Data_links', title: 'Data_links' }],
//     });
//      const proxyUrls = await this.fetchProxies();
//     const proxyConfiguration = new ProxyConfiguration({ proxyUrls });
//     console.log('Proxies: ', proxyUrls);

//     const crawler = new PlaywrightCrawler({
//       useSessionPool: true,
//       sessionPoolOptions: { maxPoolSize: 100 },
//       // proxyConfiguration,
//       persistCookiesPerSession: true,
//       maxRequestRetries: 50,
//       maxConcurrency: 50,
//       minConcurrency: 1,
//       navigationTimeoutSecs: 120,
//       requestHandler: async ({ page, request, proxyInfo }) => {
//         console.log('Scraping:', request.url);
//         console.log('Using proxy:', proxyInfo?.url || 'No proxy');

//         try {

           
//           // await page.goto(request.url, { waitUntil: 'load' });

//           await page.goto(request.url, { waitUntil: 'domcontentloaded' });

           

//   // Use the CSS selector to scrape the content
//   let content = await page.$eval(
//     'body > main > div:nth-child(2) > div > div.flex.gap-8.mt-9.flex-col-reverse.md\\:flex-row',
//     el => el.innerText
//   );

//   // Remove the "Application Details" section from content
//   //content = content.replace(/Application Details[\s\S]*?(?=Copyright Details)/, '').trim();

//   // Define labels to extract and initialize an object to hold the structured data
//   const labels = [
//     'Copyright Claimant',
//     'Registration Number',
//     'Registration Date',
//     'Year of Creation',
//     'Record Status',
//     'Physical Description',
//     'Personal Authors',
//     'Corporate Authors',
//     'Rights Note',
//     'Application Title Statement',
//     'Author Statement',
//     'Authorship'
//   ];
  
//   // Initialize an object to store each label's corresponding value
//   const scrapedData = {};
// //Regular expression to match an email pattern after the last comma




//   // Iterate over each label to extract and format corresponding values from the content
//   labels.forEach(label => {
//     const regex = new RegExp(`${label}:?\\s*([\\s\\S]*?)(?=\\n\\s*${labels.join('|')}|$)`, 'i');
//     const match = content.match(regex);
//     if (match) {
//       scrapedData[label] = match[1].trim();
      
//     }
//   });

//   // Log the formatted scraped data
//   // console.log('object forms: ',scrapedData)

//   const shortValues = {};
//   Object.entries(scrapedData).forEach(([key, value]) => {
//     shortValues[key] = value.split('\n')[0].trim();
//   });
  
//   // Display the extracted values
//   // console.log('Extracted Values:', shortValues);

//   Object.entries(shortValues).forEach(([key, value]) => {
//     console.log(`${key}: ${value}`);
//     if (key === 'Registration Number') {
//       // Extract the text until the first comma
//       const valueUntilComma = value.split(',')[0].trim();
    
//        shortValues['Registration Number']=valueUntilComma
//     }
//     if(key==='Rights Note')
//       {
        
//         const emailMatch = value.match(/[^,]*@[^,]*$/);
//         const email = emailMatch ? emailMatch[0].trim() : "N/A";
      
//         // Log the extracted email
//         shortValues.Email=email

//         // Remove the email from the value string
//         if (emailMatch) {
//           value= value.replace(emailMatch[0], '').trim();
//           // Remove any trailing comma and whitespace
//           value = value.replace(/,\s*$/, '');
//           shortValues['Rights Note']=value
//          }
//       }
//   });
//    // for (const [key, value] of Object.entries(scrapedData)) {
//   //   console.log(`${key}: ${value}`);
//   // }
  
//    console.log("final code:- ",shortValues )
//    const fs = require('fs');
   
//   // Optionally, prepare this data for CSV export
//   const headersOrder = [
//     'Copyright Claimant',
//     'Application Title Statement',
//     'Email',
//     'Registration Number',
//     'Registration Date',
//     'Year of Creation',
//     'Record Status',
//     'Physical Description',
//     'Personal Authors',
//     'Corporate Authors',
//     'Rights Note',
//     'Author Statement',
//     'Authorship'
//   ];

//   // Create CSV rows
//   const csvRows = [];
//   csvRows.push(headersOrder.join(',')); // Add shuffled headers
//   const values = headersOrder.map(header => shortValues[header] || ''); // Map values based on new header order
//   csvRows.push(values.join(',')); // Add values

//   // Write the CSV data to a file
//   const csvData = csvRows.join('\n');
//   fs.writeFileSync('scraped_data.csv', csvData);

//   console.log('CSV data written to scraped_data.csv');


//         } catch (error) {
//           console.error(`Failed to navigate to ${request.url}. Error: ${error.message}`);
//         }
//       },
//       failedRequestHandler: async ({ request, error }) => {
//         console.error(`Request ${request.url} failed too many times. Error: ${error}`);
//       },
//     });
  
//     const urls = [];
    
//     for(let i=1; i<=110; i++)
//       urls.push(`https://www.copyrightable.com/search/registrations?q=photograph&page=${i}`)
     
//     console.log('Total links:', urls.length);
//     await crawler.run(urls);
//     return{'message': 'success'}
//   }

//   async filterHealthyProxies() {
//     console.log('Fetching proxies...');
//     const proxies = await this.fetchProxies();
//     const healthyProxies: string[] = [];
//     console.log('Filtering healthy proxies...');

//     for (const proxyUrl of proxies) {
//       const isHealthy = await this.isProxyHealthy(proxyUrl);
//       if (isHealthy) {
//         healthyProxies.push(proxyUrl);
//       }
//     }

//     console.log('Healthy proxies:', healthyProxies);
//     return healthyProxies;
//   }

//   async isProxyHealthy(proxyUrl: string): Promise<boolean> {
//     try {
//       const proxyAgent = new HttpsProxyAgent(proxyUrl);
//       const testResponse = await axios.get('https://www.google.com', {
//         httpAgent: proxyAgent,
//         httpsAgent: proxyAgent,
//         timeout: 5000,
//       });
//       return testResponse.status === 200;
//     } catch (error) {
//       console.error(`Proxy failed: ${proxyUrl} - Error: ${error.message}`);
//       await this.saveUrlToCSV(proxyUrl, 'failedUrls');
//       return false;
//     }
//   }

//   async saveUrlToCSV(csvData: string, fileName: string): Promise<void> {
//     const filePath = path.resolve(__dirname, `${fileName}.csv`);
//     fs.appendFile(filePath, csvData + '\n', (err) => {
//       if (err) {
//         console.error('Error writing to file', err);
//       } else {
//         console.log(`CSV file has been updated successfully as "${fileName}.csv"`);
//       }
//     });
//   }
// }
