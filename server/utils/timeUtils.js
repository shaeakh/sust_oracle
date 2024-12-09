const moment = require('moment-timezone');

// Default timezone for the application
const DEFAULT_TIMEZONE = 'Asia/Dhaka';

/**
 * Convert local time to UTC
 * @param {string} dateTimeString - Local datetime string
 * @returns {string} UTC datetime string
 */
const localToUTC = (dateTimeString) => {
    return moment.tz(dateTimeString, DEFAULT_TIMEZONE).utc().format();
};

/**
 * Convert UTC to local time
 * @param {string} utcString - UTC datetime string
 * @returns {string} Local datetime string
 */
const UTCToLocal = (utcString) => {
    return moment.utc(utcString).tz(DEFAULT_TIMEZONE).format();
};

/**
 * Format datetime for display
 * @param {string} dateTimeString - Datetime string
 * @param {string} format - Desired format (optional)
 * @returns {string} Formatted datetime string
 */
const formatDateTime = (dateTimeString, format = 'YYYY-MM-DD HH:mm:ss') => {
    return moment.utc(dateTimeString).tz(DEFAULT_TIMEZONE).format(format);
};

/**
 * Get current time in local timezone
 * @returns {string} Current local time
 */
const getCurrentLocalTime = () => {
    return moment().tz(DEFAULT_TIMEZONE).format();
};

module.exports = {
    localToUTC,
    UTCToLocal,
    formatDateTime,
    getCurrentLocalTime,
    DEFAULT_TIMEZONE
};
