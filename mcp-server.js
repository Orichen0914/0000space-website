#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import puppeteer from 'puppeteer';

class BrowserMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'event-space-browser',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.browser = null;
    this.page = null;
    this.setupToolHandlers();
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1200, height: 800 }
      });
    }
    
    if (!this.page) {
      this.page = await this.browser.newPage();
    }
    
    return this.page;
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'navigate_to_page',
            description: 'Navigate to a webpage',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'URL to navigate to'
                }
              },
              required: ['url']
            }
          },
          {
            name: 'get_page_content',
            description: 'Get the HTML content of the current page',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'get_page_text',
            description: 'Get the visible text content of the current page',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'click_element',
            description: 'Click on an element by CSS selector',
            inputSchema: {
              type: 'object',
              properties: {
                selector: {
                  type: 'string',
                  description: 'CSS selector for the element to click'
                }
              },
              required: ['selector']
            }
          },
          {
            name: 'type_text',
            description: 'Type text into an input field',
            inputSchema: {
              type: 'object',
              properties: {
                selector: {
                  type: 'string',
                  description: 'CSS selector for the input field'
                },
                text: {
                  type: 'string',
                  description: 'Text to type'
                }
              },
              required: ['selector', 'text']
            }
          },
          {
            name: 'take_screenshot',
            description: 'Take a screenshot of the current page',
            inputSchema: {
              type: 'object',
              properties: {
                filename: {
                  type: 'string',
                  description: 'Filename for the screenshot (optional)',
                  default: 'screenshot.png'
                }
              }
            }
          },
          {
            name: 'serve_local_website',
            description: 'Serve the local website on localhost',
            inputSchema: {
              type: 'object',
              properties: {
                port: {
                  type: 'number',
                  description: 'Port to serve on (default: 3000)',
                  default: 3000
                }
              }
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'navigate_to_page':
            const page = await this.initBrowser();
            await page.goto(args.url);
            return {
              content: [
                {
                  type: 'text',
                  text: `Navigated to: ${args.url}`
                }
              ]
            };

          case 'get_page_content':
            if (!this.page) {
              throw new Error('No page loaded. Navigate to a page first.');
            }
            const html = await this.page.content();
            return {
              content: [
                {
                  type: 'text',
                  text: html
                }
              ]
            };

          case 'get_page_text':
            if (!this.page) {
              throw new Error('No page loaded. Navigate to a page first.');
            }
            const text = await this.page.evaluate(() => document.body.innerText);
            return {
              content: [
                {
                  type: 'text',
                  text: text
                }
              ]
            };

          case 'click_element':
            if (!this.page) {
              throw new Error('No page loaded. Navigate to a page first.');
            }
            await this.page.click(args.selector);
            return {
              content: [
                {
                  type: 'text',
                  text: `Clicked element: ${args.selector}`
                }
              ]
            };

          case 'type_text':
            if (!this.page) {
              throw new Error('No page loaded. Navigate to a page first.');
            }
            await this.page.type(args.selector, args.text);
            return {
              content: [
                {
                  type: 'text',
                  text: `Typed "${args.text}" into ${args.selector}`
                }
              ]
            };

          case 'take_screenshot':
            if (!this.page) {
              throw new Error('No page loaded. Navigate to a page first.');
            }
            const filename = args.filename || 'screenshot.png';
            await this.page.screenshot({ path: filename, fullPage: true });
            return {
              content: [
                {
                  type: 'text',
                  text: `Screenshot saved as: ${filename}`
                }
              ]
            };

          case 'serve_local_website':
            const port = args.port || 3000;
            await this.startLocalServer(port);
            return {
              content: [
                {
                  type: 'text',
                  text: `Local server started at http://localhost:${port}`
                }
              ]
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async startLocalServer(port = 3000) {
    const { default: express } = await import('express');
    const { default: cors } = await import('cors');
    
    const app = express();
    app.use(cors());
    app.use(express.static('.'));
    
    return new Promise((resolve) => {
      app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        resolve();
      });
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Event Space Browser MCP server running on stdio');
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

const server = new BrowserMCPServer();

process.on('SIGINT', async () => {
  await server.cleanup();
  process.exit(0);
});

server.run().catch(console.error);