const express = require('express');
const cors = require('cors');
const { logger } = require('../services/logger.js');

const app = express();
const PORT = process.env.PORT || 3001;

const urlStore = new Map();

const mockLocations = [
    'New York, USA', 'London, UK', 'Tokyo, Japan', 'Paris, France', 
    'Sydney, Australia', 'Mumbai, India', 'Berlin, Germany', 'Toronto, Canada',
    'São Paulo, Brazil', 'Cairo, Egypt', 'Moscow, Russia', 'Seoul, South Korea'
];

app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
    logger.info("middleware", `${req.method} ${req.url} - Request received`);
    next();
});

function generateShortcode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortcode;
    
    do {
        shortcode = '';
        for (let i = 0; i < 6; i++) {
            shortcode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    } while (urlStore.has(shortcode));
    
    return shortcode;
}

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function isValidShortcode(shortcode) {
    return /^[a-zA-Z0-9]{3,10}$/.test(shortcode);
}

// Create a new short URL
app.post('/shorturls', (req, res) => {
    logger.info("handler", "POST /shorturls - Creating new short URL");
    
    try {
        const { url, validity, shortcode } = req.body;
        
        if (!url || typeof url !== 'string') {
            logger.error("handler", "Validation failed - URL is required");
            return res.status(400).json({ 
                error: 'URL is required and must be a string' 
            });
        }
        
        if (!isValidUrl(url)) {
            logger.error("handler", "Validation failed - Invalid URL format");
            return res.status(400).json({ 
                error: 'Invalid URL format' 
            });
        }
        
        const validityMinutes = validity && typeof validity === 'number' ? validity : 30;
        
        if (validityMinutes <= 0) {
            logger.error("handler", "Validation failed - Validity must be positive");
            return res.status(400).json({ 
                error: 'Validity must be a positive number' 
            });
        }
        
        let finalShortcode;
        
        if (shortcode) {
            if (!isValidShortcode(shortcode)) {
                logger.error("handler", "Validation failed - Invalid shortcode format");
                return res.status(400).json({ 
                    error: 'Shortcode must be alphanumeric and 3-10 characters long' 
                });
            }
            
            if (urlStore.has(shortcode)) {
                logger.error("handler", "Conflict - Shortcode already exists");
                return res.status(409).json({ 
                    error: 'Shortcode already exists' 
                });
            }
            
            finalShortcode = shortcode;
        } else {
            finalShortcode = generateShortcode();
        }
        
        const createdAt = new Date();
        const expiry = new Date(createdAt.getTime() + (validityMinutes * 60 * 1000));
        
        const urlData = {
            longUrl: url,
            shortcode: finalShortcode,
            createdAt: createdAt.toISOString(),
            expiry: expiry.toISOString(),
            clicks: []
        };
        
        urlStore.set(finalShortcode, urlData);
        
        logger.info("handler", `Short URL created successfully: ${finalShortcode}`);
        
        const shortLink = `http://localhost:${PORT}/${finalShortcode}`;
        res.status(201).json({
            shortLink,
            expiry: expiry.toISOString()
        });
        
    } catch (error) {
        logger.error("handler", `Error creating short URL: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/health', (req, res) => {
    logger.info("handler", "Health check requested");
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        totalUrls: urlStore.size
    });
});

// Get all shortened URLs
app.get('/shorturls', (req, res) => {
    logger.info("handler", "GET /shorturls - Getting all short URLs");
    
    try {
        const allUrls = Array.from(urlStore.values()).map(urlData => ({
            shortLink: `http://localhost:${PORT}/${urlData.shortcode}`,
            longUrl: urlData.longUrl,
            shortcode: urlData.shortcode,
            createdAt: urlData.createdAt,
            expiry: urlData.expiry,
            totalClicks: urlData.clicks.length,
            isExpired: new Date() > new Date(urlData.expiry)
        }));
        
        logger.info("handler", `Retrieved ${allUrls.length} short URLs`);
        res.status(200).json(allUrls);
        
    } catch (error) {
        logger.error("handler", `Error retrieving all URLs: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get stats for a specific short URL
app.get('/shorturls/:shortcode', (req, res) => {
    const { shortcode } = req.params;
    
    logger.info("handler", `GET /shorturls/${shortcode} - Getting URL statistics`);
    
    try {
        const urlData = urlStore.get(shortcode);
        
        if (!urlData) {
            logger.error("handler", `Statistics not found for shortcode: ${shortcode}`);
            return res.status(404).json({ error: 'Short URL not found' });
        }
        
        const now = new Date();
        const expiry = new Date(urlData.expiry);
        const isExpired = now > expiry;
        
        const response = {
            shortcode: urlData.shortcode,
            longUrl: urlData.longUrl,
            shortLink: `http://localhost:${PORT}/${urlData.shortcode}`,
            createdAt: urlData.createdAt,
            expiry: urlData.expiry,
            isExpired,
            totalClicks: urlData.clicks.length,
            clicks: urlData.clicks.map(click => ({
                timestamp: click.timestamp,
                source: click.source,
                location: click.location
            }))
        };
        
        logger.info("handler", `Statistics retrieved for ${shortcode} - ${urlData.clicks.length} clicks`);
        res.status(200).json(response);
        
    } catch (error) {
        logger.error("handler", `Error retrieving statistics for ${shortcode}: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Redirect short URL to original URL
app.get('/:shortcode', (req, res) => {
    const { shortcode } = req.params;
    
    logger.info("handler", `GET /${shortcode} - Redirecting to original URL`);
    
    try {
        const urlData = urlStore.get(shortcode);
        
        if (!urlData) {
            logger.error("handler", `Shortcode not found: ${shortcode}`);
            return res.status(404).json({ error: 'Short URL not found' });
        }
        
        const now = new Date();
        const expiry = new Date(urlData.expiry);
        
        if (now > expiry) {
            logger.warn("handler", `Expired short URL accessed: ${shortcode}`);
            return res.status(410).json({ error: 'Short URL has expired' });
        }
        
        const clickData = {
            timestamp: now.toISOString(),
            source: req.headers.referer || 'direct',
            location: mockLocations[Math.floor(Math.random() * mockLocations.length)]
        };
        
        urlData.clicks.push(clickData);
        urlStore.set(shortcode, urlData);
        
        logger.info("handler", `Click logged for ${shortcode}, redirecting to ${urlData.longUrl}`);
        
        res.redirect(302, urlData.longUrl);
        
    } catch (error) {
        logger.error("handler", `Error processing redirect: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
    logger.warn("handler", `404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Route not found' });
});

app.use((error, req, res, next) => {
    logger.error("handler", `Unhandled error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    logger.info("service", `URL Shortener Microservice started on port ${PORT}`);
    logger.info("service", `Frontend should be accessible at C:\\Users\\GAURAV\\Desktop\\test\\Frontend Test Submission`);
    logger.info("service", `In-memory store initialized - ready to accept requests`);
});

module.exports = app;