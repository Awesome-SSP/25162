/**
 * URL Shortener Microservice Backend
 * A complete HTTP service for creating and managing shortened URLs
 */

const express = require('express');
const cors = require('cors');
const { logger } = require('../services/logger.js');

const app = express();
const PORT = process.env.PORT || 3001;

// In-memory data store for URLs and statistics
const urlStore = new Map();

// Predefined list of cities/countries for mock geographical data
const mockLocations = [
    'New York, USA', 'London, UK', 'Tokyo, Japan', 'Paris, France', 
    'Sydney, Australia', 'Mumbai, India', 'Berlin, Germany', 'Toronto, Canada',
    'São Paulo, Brazil', 'Cairo, Egypt', 'Moscow, Russia', 'Seoul, South Korea'
];

// Middleware setup
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'], // Frontend origins
    credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    logger.info("middleware", `${req.method} ${req.url} - Request received`);
    next();
});

/**
 * Generates a unique 6-character alphanumeric shortcode
 * @returns {string} A unique shortcode
 */
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

/**
 * Validates URL format
 * @param {string} url - The URL to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validates shortcode format (alphanumeric, 3-10 characters)
 * @param {string} shortcode - The shortcode to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidShortcode(shortcode) {
    return /^[a-zA-Z0-9]{3,10}$/.test(shortcode);
}

/**
 * POST /shorturls - Create a new shortened URL
 */
app.post('/shorturls', (req, res) => {
    logger.info("handler", "POST /shorturls - Creating new short URL");
    
    try {
        const { url, validity, shortcode } = req.body;
        
        // Validate required fields
        if (!url || typeof url !== 'string') {
            logger.error("handler", "Validation failed - URL is required");
            return res.status(400).json({ 
                error: 'URL is required and must be a string' 
            });
        }
        
        // Validate URL format
        if (!isValidUrl(url)) {
            logger.error("handler", "Validation failed - Invalid URL format");
            return res.status(400).json({ 
                error: 'Invalid URL format' 
            });
        }
        
        // Set default validity to 30 minutes if not provided
        const validityMinutes = validity && typeof validity === 'number' ? validity : 30;
        
        if (validityMinutes <= 0) {
            logger.error("handler", "Validation failed - Validity must be positive");
            return res.status(400).json({ 
                error: 'Validity must be a positive number' 
            });
        }
        
        let finalShortcode;
        
        // Handle custom shortcode
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
            // Generate new shortcode
            finalShortcode = generateShortcode();
        }
        
        // Calculate expiry timestamp
        const createdAt = new Date();
        const expiry = new Date(createdAt.getTime() + (validityMinutes * 60 * 1000));
        
        // Store URL data
        const urlData = {
            longUrl: url,
            shortcode: finalShortcode,
            createdAt: createdAt.toISOString(),
            expiry: expiry.toISOString(),
            clicks: []
        };
        
        urlStore.set(finalShortcode, urlData);
        
        logger.info("handler", `Short URL created successfully: ${finalShortcode}`);
        
        // Return response
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

/**
 * GET /:shortcode - Redirect to original URL and log click
 */
app.get('/:shortcode', (req, res) => {
    const { shortcode } = req.params;
    
    logger.info("handler", `GET /${shortcode} - Redirecting to original URL`);
    
    try {
        // Look up shortcode
        const urlData = urlStore.get(shortcode);
        
        if (!urlData) {
            logger.error("handler", `Shortcode not found: ${shortcode}`);
            return res.status(404).json({ error: 'Short URL not found' });
        }
        
        // Check if expired
        const now = new Date();
        const expiry = new Date(urlData.expiry);
        
        if (now > expiry) {
            logger.warn("handler", `Expired short URL accessed: ${shortcode}`);
            return res.status(410).json({ error: 'Short URL has expired' });
        }
        
        // Log click
        const clickData = {
            timestamp: now.toISOString(),
            source: req.headers.referer || 'direct',
            location: mockLocations[Math.floor(Math.random() * mockLocations.length)]
        };
        
        urlData.clicks.push(clickData);
        urlStore.set(shortcode, urlData);
        
        logger.info("handler", `Click logged for ${shortcode}, redirecting to ${urlData.longUrl}`);
        
        // Redirect to original URL
        res.redirect(302, urlData.longUrl);
        
    } catch (error) {
        logger.error("handler", `Error processing redirect: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /shorturls/:shortcode - Get statistics for a specific short URL
 */
app.get('/shorturls/:shortcode', (req, res) => {
    const { shortcode } = req.params;
    
    logger.info("handler", `GET /shorturls/${shortcode} - Getting URL statistics`);
    
    try {
        // Look up shortcode
        const urlData = urlStore.get(shortcode);
        
        if (!urlData) {
            logger.error("handler", `Shortcode not found for stats: ${shortcode}`);
            return res.status(404).json({ error: 'Short URL not found' });
        }
        
        // Return statistics
        const response = {
            shortLink: `http://localhost:${PORT}/${shortcode}`,
            longUrl: urlData.longUrl,
            createdAt: urlData.createdAt,
            expiry: urlData.expiry,
            totalClicks: urlData.clicks.length,
            clicks: urlData.clicks
        };
        
        logger.info("handler", `Statistics retrieved for ${shortcode}: ${urlData.clicks.length} clicks`);
        res.status(200).json(response);
        
    } catch (error) {
        logger.error("handler", `Error retrieving statistics: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /shorturls - Get all shortened URLs
 */
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

// Health check endpoint
app.get('/health', (req, res) => {
    logger.info("handler", "Health check requested");
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        totalUrls: urlStore.size
    });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
    logger.warn("handler", `404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((error, req, res, next) => {
    logger.error("handler", `Unhandled error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    logger.info("service", `URL Shortener Microservice started on port ${PORT}`);
    logger.info("service", `Frontend should be accessible at C:\\Users\\GAURAV\\Desktop\\test\\Frontend Test Submission`);
    logger.info("service", `In-memory store initialized - ready to accept requests`);
});

module.exports = app;