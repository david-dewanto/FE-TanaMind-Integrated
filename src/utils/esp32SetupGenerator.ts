/**
 * Generate ESP32 setup HTML with embedded auth token
 */
export const generateESP32SetupHTML = (authToken: string | null): string => {
  const tokenValue = authToken || '';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TanaMind ESP32 Setup</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            width: 100%;
            padding: 30px;
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 30px;
            color: #0B9444;
        }
        
        .logo svg {
            width: 32px;
            height: 32px;
        }
        
        h1 {
            font-size: 24px;
            color: #333;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 30px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            color: #333;
            font-weight: 500;
        }
        
        input {
            width: 100%;
            padding: 10px 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        input:focus {
            outline: none;
            border-color: #0B9444;
        }
        
        input:disabled {
            background: #f0f0f0;
            color: #666;
            cursor: not-allowed;
        }
        
        button {
            width: 100%;
            padding: 12px;
            background: #0B9444;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        button:hover {
            background: #056526;
        }
        
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        
        .status {
            margin-top: 20px;
            padding: 15px;
            border-radius: 8px;
            display: none;
        }
        
        .status.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
            display: block;
        }
        
        .status.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
            display: block;
        }
        
        .status.info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
            display: block;
        }
        
        .loading {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #0B9444;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 10px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .instructions {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            color: #666;
        }
        
        .step {
            margin-bottom: 8px;
        }
        
        .step-number {
            display: inline-block;
            width: 24px;
            height: 24px;
            background: #0B9444;
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 24px;
            margin-right: 8px;
            font-size: 12px;
        }
        
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
        }
        
        .token-info {
            background: #e8f5e9;
            border: 1px solid #c8e6c9;
            color: #2e7d32;
            padding: 10px;
            border-radius: 6px;
            font-size: 12px;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                <path d="M9 12l2 2 4-4"/>
            </svg>
            <h1>TanaMind ESP32 Setup</h1>
        </div>
        
        <p class="subtitle">Configure your ESP32 device for TanaMind</p>
        
        <div class="warning">
            <strong>⚠️ Important:</strong> Make sure you are connected to the <strong>ESP32_AP_Config</strong> WiFi network before proceeding.
        </div>
        
        <div class="instructions">
            <div class="step">
                <span class="step-number">1</span>
                Connect to ESP32_AP_Config WiFi
            </div>
            <div class="step">
                <span class="step-number">2</span>
                Enter your home WiFi credentials below
            </div>
            <div class="step">
                <span class="step-number">3</span>
                Click Configure to send settings
            </div>
            <div class="step">
                <span class="step-number">4</span>
                Close this page and add plants in TanaMind
            </div>
        </div>
        
        <form id="configForm">
            <div class="form-group">
                <label for="ssid">WiFi Network Name (SSID)</label>
                <input type="text" id="ssid" name="ssid" required placeholder="Enter your WiFi name">
            </div>
            
            <div class="form-group">
                <label for="password">WiFi Password</label>
                <input type="password" id="password" name="password" required placeholder="Enter your WiFi password">
            </div>
            
            <div class="form-group">
                <label for="token">TanaMind Auth Token</label>
                <input type="text" id="token" name="token" value="${tokenValue}" readonly disabled>
                <div class="token-info">
                    ✓ Your authentication token has been automatically included
                </div>
            </div>
            
            <button type="submit" id="submitBtn">
                Configure ESP32
            </button>
        </form>
        
        <div id="status" class="status"></div>
    </div>
    
    <script>
        const ESP32_IP = '192.168.4.1';
        const form = document.getElementById('configForm');
        const statusDiv = document.getElementById('status');
        const submitBtn = document.getElementById('submitBtn');
        const authToken = '${tokenValue}';
        
        // Check if we're connected to ESP32
        async function checkConnection() {
            try {
                const response = await fetch(\`http://\${ESP32_IP}/\`, { 
                    method: 'HEAD',
                    mode: 'no-cors'
                });
                return true;
            } catch (error) {
                return false;
            }
        }
        
        // Send configuration to ESP32
        async function configureESP32(config) {
            const attempts = [];
            
            // Try different formats for WiFi config
            attempts.push(
                // JSON format
                fetch(\`http://\${ESP32_IP}/set_wifi\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ssid: config.ssid,
                        password: config.password
                    }),
                    mode: 'no-cors'
                }),
                
                // Form data
                (() => {
                    const formData = new FormData();
                    formData.append('ssid', config.ssid);
                    formData.append('password', config.password);
                    return fetch(\`http://\${ESP32_IP}/set_wifi\`, {
                        method: 'POST',
                        body: formData,
                        mode: 'no-cors'
                    });
                })(),
                
                // URL parameters
                fetch(\`http://\${ESP32_IP}/set_wifi?ssid=\${encodeURIComponent(config.ssid)}&password=\${encodeURIComponent(config.password)}\`, {
                    method: 'GET',
                    mode: 'no-cors'
                })
            );
            
            // Send token (always include it)
            if (authToken) {
                attempts.push(
                    // JSON format
                    fetch(\`http://\${ESP32_IP}/set_token\`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: authToken }),
                        mode: 'no-cors'
                    }),
                    
                    // Form data
                    (() => {
                        const formData = new FormData();
                        formData.append('token', authToken);
                        return fetch(\`http://\${ESP32_IP}/set_token\`, {
                            method: 'POST',
                            body: formData,
                            mode: 'no-cors'
                        });
                    })(),
                    
                    // URL parameter
                    fetch(\`http://\${ESP32_IP}/set_token?token=\${encodeURIComponent(authToken)}\`, {
                        method: 'GET',
                        mode: 'no-cors'
                    })
                );
            }
            
            await Promise.allSettled(attempts);
        }
        
        // Show status message
        function showStatus(message, type = 'info') {
            statusDiv.className = \`status \${type}\`;
            statusDiv.innerHTML = message;
        }
        
        // Handle form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const config = {
                ssid: document.getElementById('ssid').value,
                password: document.getElementById('password').value
            };
            
            // Validate inputs
            if (!config.ssid.trim()) {
                showStatus('❌ Please enter your WiFi network name', 'error');
                return;
            }
            
            if (!config.password.trim()) {
                showStatus('❌ Please enter your WiFi password', 'error');
                return;
            }
            
            // Disable button and show loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading"></span>Configuring...';
            
            try {
                // Check connection first
                showStatus('Checking ESP32 connection...', 'info');
                const connected = await checkConnection();
                
                if (!connected) {
                    showStatus('⚠️ Cannot reach ESP32. Make sure you are connected to ESP32_AP_Config WiFi network.', 'error');
                    return;
                }
                
                // Send configuration
                showStatus('Sending configuration to ESP32...', 'info');
                await configureESP32(config);
                
                // Add a small delay to ensure ESP32 processes the request
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Show success message with clear next steps
                showStatus(\`
                    ✅ <strong>Configuration sent successfully!</strong><br><br>
                    <strong>Important Next Steps:</strong><br>
                    1. <strong>Close this page</strong><br>
                    2. <strong>Reconnect to your regular WiFi</strong> (not ESP32_AP_Config)<br>
                    3. <strong>Return to TanaMind and add your plants</strong><br>
                    4. <strong>Place the ESP32 near your plants</strong><br><br>
                    <div style="background: #fff3cd; padding: 10px; border-radius: 6px; margin-top: 10px;">
                        <strong>📌 Note:</strong> The ESP32 is now connecting to "\${config.ssid}". 
                        The blue LED will stop blinking when connected. 
                        It may take 30-60 seconds to appear in your TanaMind dashboard.
                    </div>
                \`, 'success');
                
                // Disable form after success
                document.getElementById('ssid').disabled = true;
                document.getElementById('password').disabled = true;
                submitBtn.innerHTML = '✓ Configuration Complete';
                
            } catch (error) {
                showStatus(\`❌ Configuration failed: \${error.message}\`, 'error');
            } finally {
                if (!document.getElementById('ssid').disabled) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Configure ESP32';
                }
            }
        });
        
        // Check connection on load
        window.addEventListener('load', async () => {
            if (!authToken) {
                showStatus('⚠️ No authentication token found. Please download this file again from TanaMind.', 'error');
                submitBtn.disabled = true;
                return;
            }
            
            const connected = await checkConnection();
            if (!connected) {
                showStatus('⚠️ Not connected to ESP32. Please connect to ESP32_AP_Config WiFi network first.', 'error');
            } else {
                showStatus('✅ Connected to ESP32. Ready to configure!', 'info');
                setTimeout(() => {
                    statusDiv.style.display = 'none';
                }, 3000);
            }
        });
    </script>
</body>
</html>`;
};