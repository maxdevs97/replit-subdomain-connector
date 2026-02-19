const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const DO_API_TOKEN = process.env.DO_API_TOKEN;
const DOMAIN = 'sher.dev';

// Validate subdomain format (alphanumeric and hyphens only)
function isValidSubdomain(subdomain) {
  return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(subdomain);
}

// Validate IP address format
function isValidIP(ip) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
}

// Check subdomain availability
app.post('/api/check-availability', async (req, res) => {
  const { subdomain } = req.body;

  if (!subdomain) {
    return res.status(400).json({ error: 'Subdomain is required' });
  }

  if (!isValidSubdomain(subdomain)) {
    return res.status(400).json({ 
      error: 'Invalid subdomain format. Use only lowercase letters, numbers, and hyphens.' 
    });
  }

  try {
    const response = await axios.get(
      `https://api.digitalocean.com/v2/domains/${DOMAIN}/records`,
      {
        headers: {
          'Authorization': `Bearer ${DO_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const records = response.data.domain_records || [];
    const subdomainExists = records.some(record => 
      record.name === subdomain && (record.type === 'A' || record.type === 'TXT')
    );

    res.json({ 
      available: !subdomainExists,
      subdomain: `${subdomain}.${DOMAIN}`
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ 
        error: `Domain ${DOMAIN} not found in DigitalOcean. Please add the domain first.` 
      });
    }
    console.error('Error checking availability:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to check subdomain availability. Please try again.' 
    });
  }
});

// Create DNS records
app.post('/api/create-records', async (req, res) => {
  const { subdomain, txtValue, aValue } = req.body;

  // Validation
  if (!subdomain || !txtValue || !aValue) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!isValidSubdomain(subdomain)) {
    return res.status(400).json({ 
      error: 'Invalid subdomain format' 
    });
  }

  if (!isValidIP(aValue)) {
    return res.status(400).json({ 
      error: 'Invalid IP address format' 
    });
  }

  try {
    // Create TXT record
    const txtRecord = await axios.post(
      `https://api.digitalocean.com/v2/domains/${DOMAIN}/records`,
      {
        type: 'TXT',
        name: subdomain,
        data: txtValue,
        ttl: 3600
      },
      {
        headers: {
          'Authorization': `Bearer ${DO_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Create A record
    const aRecord = await axios.post(
      `https://api.digitalocean.com/v2/domains/${DOMAIN}/records`,
      {
        type: 'A',
        name: subdomain,
        data: aValue,
        ttl: 3600
      },
      {
        headers: {
          'Authorization': `Bearer ${DO_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ 
      success: true,
      subdomain: `${subdomain}.${DOMAIN}`,
      url: `https://${subdomain}.${DOMAIN}`,
      records: {
        txt: txtRecord.data.domain_record,
        a: aRecord.data.domain_record
      }
    });
  } catch (error) {
    console.error('Error creating records:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ 
        error: `Domain ${DOMAIN} not found in DigitalOcean.` 
      });
    }
    
    if (error.response?.status === 422) {
      return res.status(422).json({ 
        error: 'Record already exists or invalid data provided.' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to create DNS records. Please try again.' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
