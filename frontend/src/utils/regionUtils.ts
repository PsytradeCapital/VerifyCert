import React from 'react';
/**
 * Region utilities for handling country codes and regional preferences
 */

export interface RegionInfo {
  code: string;
  name: string;
  phonePrefix: string;
  preferredAuthMethod: 'email' | 'phone';
  timezone: string;
  currency: string;

export const REGIONS: Record<string, RegionInfo> = {
  US: {
    code: 'US',
    name: 'United States',
    phonePrefix: '+1',
    preferredAuthMethod: 'email',
    timezone: 'America/New_York',
    currency: 'USD'
  },
  UK: {
    code: 'UK',
    name: 'United Kingdom',
    phonePrefix: '+44',
    preferredAuthMethod: 'email',
    timezone: 'Europe/London',
    currency: 'GBP'
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    phonePrefix: '+1',
    preferredAuthMethod: 'email',
    timezone: 'America/Toronto',
    currency: 'CAD'
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    phonePrefix: '+61',
    preferredAuthMethod: 'email',
    timezone: 'Australia/Sydney',
    currency: 'AUD'
  },
  IN: {
    code: 'IN',
    name: 'India',
    phonePrefix: '+91',
    preferredAuthMethod: 'phone',
    timezone: 'Asia/Kolkata',
    currency: 'INR'
  },
  NG: {
    code: 'NG',
    name: 'Nigeria',
    phonePrefix: '+234',
    preferredAuthMethod: 'phone',
    timezone: 'Africa/Lagos',
    currency: 'NGN'
  },
  KE: {
    code: 'KE',
    name: 'Kenya',
    phonePrefix: '+254',
    preferredAuthMethod: 'phone',
    timezone: 'Africa/Nairobi',
    currency: 'KES'
  },
  ZA: {
    code: 'ZA',
    name: 'South Africa',
    phonePrefix: '+27',
    preferredAuthMethod: 'phone',
    timezone: 'Africa/Johannesburg',
    currency: 'ZAR'
};

/**
 * Get region information by code
 */
export function getRegionInfo(regionCode: string): RegionInfo | null {
  return REGIONS[regionCode.toUpperCase()] || null;

/**
 * Get all available regions
 */
export function getAllRegions(): RegionInfo[] {
  return Object.values(REGIONS);

/**
 * Get region options for select dropdown
 */
export function getRegionOptions(): Array<{ value: string; label: string }> {
  return Object.values(REGIONS).map(region => ({
    value: region.code,
    label: region.name
  }));

/**
 * Detect region from phone number
 */
export function detectRegionFromPhone(phoneNumber: string): string | null {
  if (!phoneNumber.startsWith('+')) {
    return null;

  // Simple detection based on phone prefix
  for (const region of Object.values(REGIONS)) {
    if (phoneNumber.startsWith(region.phonePrefix)) {
      return region.code;

  return null;

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phoneNumber: string, regionCode?: string): string {
  if (!phoneNumber) return '';

  // If region is provided, try to format accordingly
  if (regionCode) {
    const region = getRegionInfo(regionCode);
    if (region && phoneNumber.startsWith(region.phonePrefix)) {
      // Basic formatting - can be enhanced with a proper phone formatting library
      const number = phoneNumber.substring(region.phonePrefix.length);
      return `${region.phonePrefix} ${number}`;

  return phoneNumber;

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Basic validation - starts with + and has 7-15 digits
  const phoneRegex = /^\+[1-9]\d{6,14}$/;
  return phoneRegex.test(phoneNumber);

/**
 * Get preferred authentication method for region
 */
export function getPreferredAuthMethod(regionCode: string): 'email' | 'phone' {
  const region = getRegionInfo(regionCode);
  return region?.preferredAuthMethod || 'email';

/**
 * Get timezone for region
 */
export function getRegionTimezone(regionCode: string): string {
  const region = getRegionInfo(regionCode);
  return region?.timezone || 'UTC';

/**
 * Format date/time for region
 */
export function formatDateForRegion(date: Date, regionCode: string): string {
  const timezone = getRegionTimezone(regionCode);
  
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    // Fallback to UTC if timezone is not supported
    return date.toISOString();

/**
 * Get currency symbol for region
 */
export function getCurrencySymbol(regionCode: string): string {
  const region = getRegionInfo(regionCode);
  
  const currencySymbols: Record<string, string> = {
    USD: '$',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
    INR: '₹',
    NGN: '₦',
    KES: 'KSh',
    ZAR: 'R'
  };

  return currencySymbols[region?.currency || 'USD'] || '$';
}}}}}}}}}}}}}}}}}}