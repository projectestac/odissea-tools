#!/usr/bin/env node

import chalk from 'chalk';
import fs from 'fs';
import { parseCookieString } from './utils.js';

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const puppeteer = require('puppeteer');

// Veure: https://help.apify.com/en/articles/1929322-handling-file-download-with-puppeteer

const { log } = console;
const { name, version, description } = require('./package.json');
const { domain, cookie, userAgent } = require('./session.json');
const settings = require('./llistats.json');

log(`
${chalk.blue.bold(`${name} v${version}`)}
${chalk.green.italic(description)}
${chalk.blue("Descàrrega d'indicadors d'activitat en format CSV")}

`);

const cookies = parseCookieString(cookie, domain);
log(chalk.green.bold('COOKIE INFO:'));
cookies.forEach(({ name, value }) => log(`- ${chalk.cyan(name)}: ${chalk.gray(value)}`));

async function main() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setUserAgent(userAgent);
  await page.setCookie(...cookies);
  if (settings) {
    const { protocol, host, path, output, params, delay, courses } = settings;
    // Crea el directori de sortida si no existeix
    log(`${chalk.green.bold('INFO:')} Preparant el directori ${output}`);
    if (!fs.existsSync(output) && !fs.mkdirSync(output, { recursive: true })) {
      log(`${chalk.red.bold('ERROR: ')} No s'ha pogut crear el directori ${output}`);
      return;
    }
    for (const { code, id } of courses) {
      log(`${chalk.green.bold('CSV INFO:')} Processant el curs ${code}`);
      // Prepara la descàrrega del fitxer
      // Veure: https://help.apify.com/en/articles/1929322-handling-file-download-with-puppeteer
      await page._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: `./${output}` })
      // Construeix l'URL de l'informe
      const urlCurs = `${protocol}://${host}/${path}?course=${id}${Object.keys(params).reduce((str, key) => `${str}&${key}=${params[key]}`, '')}`;

      // Prepara la resposta
      page.on('response', response => {
        // Comprova que la resposta correspongui a un fitxer
        if (!response._headers['content-disposition'].startsWith('attachment') || !response._headers['content-type'].startsWith('text/csv')) {
          log(`${chalk.red.bold('ERROR: ')}La resposta no és un fitxer CSV!`);
          return;
        }
        const fnMatch = response._headers['content-disposition'].match(/filename=(.*)$/);
        if (!fnMatch || fnMatch.length < 2) {
          log(`${chalk.red.bold('ERROR: ')}La resposta no conté el nom del fitxer CSV!`);
          return;
        }
        const fileName = fnMatch[1];
        const fullFileName = `./${output}/${fileName}`;
        const fileLength = parseInt(response._headers['content-length']);
        fs.watchFile(fullFileName, function (curr, prev) {
          if (parseInt(curr.size) === fileLength) {
            fs.renameSync(fullFileName, `./${output}/${code}.csv`);
          }
        });
      })

      // Carrega la pàgina
      await page.goto(urlCurs, {
        waitUntil: 'networkidle2',
      });
      
      // Afegeix un retard addicional
      await page.waitForTimeout(delay);

    }
    log(`${chalk.green.bold('PDF INFO:')} S'han generat els informes de ${courses.length} cursos al directori: ${chalk.bold.italic(output)}`);
  }
  await browser.close();
  log(chalk.green.bold('FET!'));
}

main();
