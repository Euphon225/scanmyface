import fetch from 'node-fetch';

export default async ({ req, res, log, error }) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.json({}, 200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
  }

  // Ensure the request method is POST
  if (req.method !== 'POST') {
    return res.json({ error: 'Method not allowed. Use POST.' }, 405, {
      'Access-Control-Allow-Origin': '*'
    });
  }

  // Load environment variables
  const endpoint = process.env.AZURE_FACE_ENDPOINT;
  const key = process.env.AZURE_FACE_KEY;

  if (!endpoint || !key) {
    error('Missing Azure credentials in environment variables.');
    return res.json({ error: 'Server configuration error' }, 500, {
      'Access-Control-Allow-Origin': '*'
    });
  }

  try {
    let base64Image = '';

    // Handle different Appwrite body formats safely
    if (typeof req.body === 'string') {
      try {
        const parsedBody = JSON.parse(req.body);
        base64Image = parsedBody.image || req.body;
      } catch (e) {
        // If it's not valid JSON, assume the body itself is the base64 string
        base64Image = req.body;
      }
    } else if (typeof req.body === 'object' && req.body !== null) {
      base64Image = req.body.image || req.bodyRaw || '';
    }

    if (!base64Image) {
      return res.json({ error: 'No image data provided in the request body.' }, 400, {
        'Access-Control-Allow-Origin': '*'
      });
    }

    // Strip out the data URL prefix if it exists (e.g., "data:image/jpeg;base64,")
    if (base64Image.includes('base64,')) {
      base64Image = base64Image.split('base64,')[1];
    }

    // Convert base64 string to a Buffer
    const imageBuffer = Buffer.from(base64Image, 'base64');

    // Compile the requested attributes
    const returnFaceAttributes = [
      'headPose',
      'blur',
      'exposure',
      'glasses',
      'mask',
      'occlusion'
    ].join(',');

    // Construct the full Azure Face API URL
    const url = `${endpoint}/face/v1.0/detect?detectionModel=detection_03&returnFaceAttributes=${returnFaceAttributes}`;

    // Send the request to Azure Face API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/octet-stream'
      },
      body: imageBuffer
    });

    // Parse the JSON response
    const data = await response.json();

    if (!response.ok) {
      error(`Azure Face API Error: ${response.status} - ${JSON.stringify(data)}`);
      return res.json(data, response.status, {
        'Access-Control-Allow-Origin': '*'
      });
    }

    log('Successfully retrieved data from Azure Face API.');
    
    // Return the raw Azure response as JSON
    return res.json(data, 200, {
      'Access-Control-Allow-Origin': '*'
    });

  } catch (err) {
    error(`Function Execution Error: ${err.message}`);
    return res.json({ error: 'Internal server error while processing the request.' }, 500, {
      'Access-Control-Allow-Origin': '*'
    });
  }
};
