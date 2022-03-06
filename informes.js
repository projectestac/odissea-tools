#!/usr/bin/env node

import chalk from 'chalk';
import fs from 'fs';
import { parseCookieString } from './utils.js';

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const puppeteer = require('puppeteer');

const { log } = console;
const { name, version, description } = require('./package.json');
const { domain, cookie, userAgent } = require('./session.json');
const settings = require('./informes.json');

log(`
${chalk.blue.bold(`${name} v${version}`)}
${chalk.green.italic(description)}
${chalk.blue("Generació d'informes d'activitat en format PDF")}

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
      log(`${chalk.green.bold('PDF INFO:')} Processant el curs ${code}`);
      // Construeix l'URL de l'informe
      const urlCurs = `${protocol}://${host}/${path}?course=${id}${Object.keys(params).reduce((str, key) => `${str}&${key}=${params[key]}`, '')}`;
      // Carrega la pàgina
      await page.goto(urlCurs, {
        waitUntil: 'load',
      });
      // Afegeix un retard addicional per donar temps a l'animació javascript
      await page.waitForTimeout(delay);
      // Elimina el peu de pàgina de l'informe (logos i nom de la persona que ha iniciat la sessió)
      await page.$eval('#page-footer', (footer => {
        if (footer)
          footer.parentElement.removeChild(footer);
      }));
      // Genera el PDF
      await page.pdf({
        path: `${output}/${code}.pdf`,
        format: 'A4',
      });
    }
    log(`${chalk.green.bold('PDF INFO:')} S'han generat els informes de ${courses.length} cursos al directori: ${chalk.bold.italic(output)}`);
  }
  await browser.close();
  log(chalk.green.bold('FET!'));
}

main();
