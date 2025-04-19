/**
 * MCP SDK Compatibility Wrapper
 * This file provides compatibility between CommonJS and ESM modules
 */

const fallback = require('./fallback');

let mcpSdk = null;
let useFallback = false;

/**
 * Initialize the MCP SDK asynchronously
 * @returns {Promise<Object>} The MCP SDK
 */
async function initMcpSdk() {
  if (!mcpSdk) {
    try {
      // First try common SDK paths for CommonJS
      try {
        mcpSdk = require('@modelcontextprotocol/sdk');
        console.log('Successfully imported MCP SDK using direct require');
      } catch (directError) {
        console.error('Failed to import MCP SDK using direct require:', directError.message);
        try {
          // Try the CJS-specific path
          mcpSdk = require('@modelcontextprotocol/sdk/dist/cjs/index.js');
          console.log('Successfully imported MCP SDK using CommonJS path');
        } catch (cjsError) {
          console.error('Failed to import MCP SDK using CommonJS path:', cjsError.message);
          // Try with dynamic import
          try {
            mcpSdk = await import('@modelcontextprotocol/sdk');
            console.log('Successfully imported MCP SDK using ESM import');
          } catch (esmError) {
            console.error('Failed to import MCP SDK using ESM import:', esmError.message);
            // If all imports fail, use fallback
            useFallback = true;
            mcpSdk = createMockSdk();
            console.log('Using fallback MCP SDK implementation');
          }
        }
      }
    } catch (error) {
      console.error('Failed to import MCP SDK with all methods:', error.message);
      useFallback = true;
      mcpSdk = createMockSdk();
      console.log('Using fallback MCP SDK implementation after exception');
    }
  }
  return mcpSdk;
}

/**
 * Create a mock SDK implementation
 * @returns {Object} Mock SDK
 */
function createMockSdk() {
  return {
    defineTools: (tools) => tools,
    createExpressMcpMiddleware: fallback.createMcpMiddleware,
    z: {
      object: () => ({
        describe: () => ({}),
      }),
      string: () => ({
        describe: (desc) => ({ description: desc }),
      }),
      number: () => ({
        optional: () => ({
          describe: (desc) => ({ description: desc }),
        }),
      }),
      array: (type) => ({
        describe: (desc) => ({ description: desc }),
      }),
      any: () => ({}),
    },
  };
}

/**
 * Define MCP tools in a way compatible with both module systems
 * @param {Object} toolDefinitions The tool definitions
 * @returns {Object} The defined tools
 */
async function defineTools(toolDefinitions) {
  const sdk = await initMcpSdk();
  if (useFallback) {
    console.log('Using fallback defineTools implementation');
    // In fallback mode, we just need to return the tools with the handler property
    const processedTools = {};
    for (const [name, tool] of Object.entries(toolDefinitions)) {
      processedTools[name] = {
        ...tool,
        handler: tool.handler
      };
    }
    return processedTools;
  }
  return sdk.defineTools(toolDefinitions);
}

/**
 * Create Express MCP middleware in a way compatible with both module systems
 * @param {Object} options Middleware options
 * @returns {Function} Express middleware
 */
async function createExpressMcpMiddleware(options) {
  const sdk = await initMcpSdk();
  if (useFallback) {
    console.log('Using fallback MCP middleware implementation');
    return fallback.createMcpMiddleware(options);
  }
  return sdk.createExpressMcpMiddleware(options);
}

/**
 * Get the zod schema builder
 * @returns {Object} The zod schema builder
 */
async function getZod() {
  const sdk = await initMcpSdk();
  return sdk.z;
}

module.exports = {
  defineTools,
  createExpressMcpMiddleware,
  getZod,
  initMcpSdk
}; 