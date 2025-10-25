// Example of calling an endpoint in "Supabase Audio Upload API" API. Update with actual data.

const InternetModule = require('LensStudio:InternetModule');

// Create a request
const req = InternetModule.HttpRequest.create();
const host = "https://supabase-upload-proxy-ho3i-git-main-dt-0907s-projects.vercel.app/";
const endpoint = "<replace-with-your-endpoint-path>";
req.url = host + endpoint;

// Set method
req.method = InternetModule.HttpRequest.HttpRequestMethod.Get;

// Optional headers
req.headers = {
    // "Content-Type": "application/json"
};

// Optional body (only for POST, PUT, etc.)
req.body = "";

// Perform the request
InternetModule.performHttpRequest(req, (res) => {
    if (res.statusCode === 200) {
        print("✅ Success! Response body: " + res.body);
    } else if (res.statusCode === 400 && res.headers["x-camera-kit-error-type"]) {
        print("⚠️ Client error (" + res.headers["x-camera-kit-error-type"] + "): " + res.body);
    } else {
        print("❌ Error: Unexpected HTTP status code " + res.statusCode + ".");
    }
});
