/**
 * MCP Fallback Implementation
 * This module provides a simple implementation of the MCP middleware
 * to be used when the SDK fails to load
 */

/**
 * Creates a simple MCP middleware
 * @param {Object} options Options for the middleware
 * @param {Object} options.tools Tools to expose
 * @param {Function} options.onError Error handler
 * @returns {Function} Express middleware function
 */
function createMcpMiddleware(options) {
  const { tools = {}, onError = (err) => ({ error: err.message }) } = options;
  
  return async (req, res, next) => {
    try {
      // Check if this is an MCP request
      if (req.method !== 'POST') {
        return next();
      }
      
      const { tool, parameters } = req.body;
      
      if (!tool) {
        return res.status(400).json({ error: 'Missing tool name in request' });
      }
      
      // Check if the requested tool exists
      if (!tools[tool]) {
        return res.status(404).json({ error: `Tool '${tool}' not found` });
      }
      
      // Get the tool handler
      const handler = tools[tool].handler;
      
      if (!handler || typeof handler !== 'function') {
        return res.status(500).json({ error: `No handler found for tool '${tool}'` });
      }
      
      console.log(`Executing tool '${tool}' with parameters:`, parameters);
      
      // Execute the tool
      const result = await handler(parameters);
      
      // Return the result
      return res.json(result);
    } catch (error) {
      console.error('Error in MCP middleware:', error);
      const errorResult = onError(error);
      return res.status(500).json(errorResult);
    }
  };
}

module.exports = {
  createMcpMiddleware
}; 