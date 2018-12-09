/** Puppeteer 操作类 */
import * as puppeteer from 'puppeteer';

import { MOBILE_USERAGENT } from '../crawler/types';

import defaultCrawlerOption, { CrawlerOption } from '../crawler/CrawlerOption';

/** 初始化 Puppeteer */
export async function initPuppeteer() {
  let browser;

  if (process.env.NODE_ENV === 'development') {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox']
    });
  } else {
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
      args: [
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--headless',
        '--no-sandbox',
        '--remote-debugging-port=9222'
      ]
    });
  }

  return browser;
}

/** 初始化页面 */
export async function initPage(
  browser: puppeteer.Browser,
  options: Partial<CrawlerOption> = defaultCrawlerOption
) {
  const page = await browser.newPage();

  // 屏蔽所有弹窗
  page.on('dialog', dialog => {
    dialog.dismiss();
  });

  page.evaluateOnNewDocument('customElements.forcePolyfill = true');
  page.evaluateOnNewDocument('ShadyDOM = {force: true}');
  page.evaluateOnNewDocument('ShadyCSS = {shimcssproperties: true}');

  if (options.isMobile) {
    page.setUserAgent(MOBILE_USERAGENT);
  }

  // 设置页面关闭的超时时间
  setTimeout(() => {
    if (!page.isClosed()) {
      page.close();
    }
  }, options.pageTimeout);

  return page;
}