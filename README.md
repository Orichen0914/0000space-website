# Event Space Website with MCP Browser Integration

This project combines a static event space website with MCP (Model Context Protocol) browser automation capabilities.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Claude Desktop
Copy the MCP server configuration to your Claude Desktop config:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "event-space-browser": {
      "command": "node",
      "args": ["/Users/aliceyy/Desktop/0000Web_Project/mcp-server.js"],
      "env": {}
    }
  }
}
```

### 3. Start the MCP Server
```bash
npm run mcp
```

## Available MCP Tools

- `navigate_to_page` - Navigate to any webpage
- `get_page_content` - Get HTML content of current page
- `get_page_text` - Get visible text content
- `click_element` - Click elements by CSS selector
- `type_text` - Type text into input fields
- `take_screenshot` - Capture page screenshots
- `serve_local_website` - Serve the local website on localhost

## Usage Examples

1. **Serve local website:**
   - Use `serve_local_website` tool with port 3000
   - Navigate to http://localhost:3000

2. **Test website functionality:**
   - Use `navigate_to_page` to go to your local site
   - Use `click_element` to test navigation
   - Use `take_screenshot` to capture results

3. **Analyze website content:**
   - Use `get_page_content` for HTML analysis
   - Use `get_page_text` for content review

## Files Structure

- `index.html` - Main homepage
- `private-event.html` - Private events page
- `script.js` - JavaScript functionality
- `styles.css` - CSS styling
- `mcp-server.js` - MCP browser automation server
- `package.json` - Node.js project configuration