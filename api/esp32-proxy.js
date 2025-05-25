// Vercel Edge Function for ESP32 proxy
// Place this file in /api/esp32-proxy.js

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // Enable CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const deviceIp = searchParams.get('deviceIp') || '192.168.4.1';
    
    // Get request body if it's a POST
    let body = null;
    if (request.method === 'POST') {
      body = await request.text();
    }

    // Map actions to ESP32 endpoints
    let esp32Endpoint = '';
    switch (action) {
      case 'configure':
        esp32Endpoint = '/set_wifi';
        break;
      case 'status':
        esp32Endpoint = '/connection_status';
        break;
      case 'token':
        esp32Endpoint = '/set_token';
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }), 
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }

    // Forward request to ESP32
    const esp32Url = `http://${deviceIp}${esp32Endpoint}`;
    
    console.log(`Proxying request to ESP32: ${esp32Url}`);
    
    const esp32Response = await fetch(esp32Url, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
      // Short timeout since ESP32 is on local network
      signal: AbortSignal.timeout(5000),
    });

    const responseText = await esp32Response.text();
    
    // Return the ESP32 response
    return new Response(responseText, {
      status: esp32Response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('ESP32 proxy error:', error);
    
    // Check if it's a network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new Response(
        JSON.stringify({ 
          error: 'Cannot reach ESP32. Ensure you are on the same network as the ESP32 device.',
          details: error.message 
        }), 
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'ESP32 communication failed', 
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}