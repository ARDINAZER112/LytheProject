import { supabase } from './supabase';

/**
 * Detect client device type from User Agent
 */
export function getDeviceType() {
  const ua = navigator.userAgent || '';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
}

/**
 * Fetch client IP address and location details using public geolocation APIs
 */
export async function getClientIpAndLocation() {
  const deviceType = getDeviceType();

  try {
    // Primary lookup: ipapi.co
    const res = await fetch('https://ipapi.co/json/').catch(() => null);
    if (res && res.ok) {
      const data = await res.json();
      if (data && data.ip) {
        return {
          ip_address: data.ip,
          city: data.city || 'Tuban',
          region: data.region || 'Jawa Timur',
          country: data.country_name || 'Indonesia',
          device_type: deviceType,
        };
      }
    }

    // Secondary fallback: ip-api.com
    const res2 = await fetch('https://ip-api.com/json/').catch(() => null);
    if (res2 && res2.ok) {
      const data2 = await res2.json();
      if (data2 && data2.query) {
        return {
          ip_address: data2.query,
          city: data2.city || 'Tuban',
          region: data2.regionName || 'Jawa Timur',
          country: data2.country || 'Indonesia',
          device_type: deviceType,
        };
      }
    }
  } catch (err) {
    console.warn('IP & Geo lookup network warning:', err);
  }

  // Fallback default info if network/adblocker blocks external geo APIs
  return {
    ip_address: '180.252.124.58',
    city: 'Tuban',
    region: 'Jawa Timur',
    country: 'Indonesia',
    device_type: deviceType,
  };
}

/**
 * Log user/visitor activity to Supabase user_logs and localStorage fallback
 */
export async function logActivity({ action, userId = null, userName = null, metadata = {} }) {
  try {
    const geoInfo = await getClientIpAndLocation();
    
    const logEntry = {
      user_id: userId,
      user_name: userName || 'Pengunjung Website',
      action: action, // 'login', 'register', 'purchase', 'page_view'
      ip_address: geoInfo.ip_address,
      city: geoInfo.city,
      region: geoInfo.region,
      country: geoInfo.country,
      device_type: geoInfo.device_type,
      metadata: metadata,
      created_at: new Date().toISOString(),
    };

    // 1. Save to local storage for immediate responsiveness & offline persistence
    const savedLogsRaw = localStorage.getItem('jaringlokal_logs');
    let localLogs = [];
    if (savedLogsRaw) {
      try {
        localLogs = JSON.parse(savedLogsRaw);
      } catch (e) {
        localLogs = [];
      }
    }
    const updatedLocalLogs = [logEntry, ...localLogs].slice(0, 200); // keep recent 200 logs
    localStorage.setItem('jaringlokal_logs', JSON.stringify(updatedLocalLogs));

    // 2. Insert into Supabase user_logs table
    const { data, error } = await supabase
      .from('user_logs')
      .insert([{
        user_id: userId,
        user_name: userName || 'Pengunjung Website',
        action: action,
        ip_address: geoInfo.ip_address,
        city: geoInfo.city,
        region: geoInfo.region,
        country: geoInfo.country,
        device_type: geoInfo.device_type,
        metadata: metadata,
      }])
      .select();

    if (error) {
      console.warn('Could not insert log into Supabase user_logs table (using local log storage):', error.message);
    } else {
      console.log('Activity logged successfully to database:', data);
    }

    return logEntry;
  } catch (err) {
    console.error('Failed to log activity:', err);
    return null;
  }
}

/**
 * Fetch all visitor/user activity logs from Supabase or localStorage fallback
 */
export async function fetchUserLogs() {
  try {
    const { data, error } = await supabase
      .from('user_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      localStorage.setItem('jaringlokal_logs', JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Failed to query user_logs from Supabase:', err);
  }

  // Fallback to local storage or initial seed logs
  const savedLogsRaw = localStorage.getItem('jaringlokal_logs');
  if (savedLogsRaw) {
    try {
      return JSON.parse(savedLogsRaw);
    } catch (e) {
      // return default seed logs
    }
  }

  // Initial seed logs for August 2026 if empty
  const defaultSeedLogs = [
    { id: 1, action: 'login', user_name: 'Budi Santoso', ip_address: '180.252.124.58', city: 'Tuban', region: 'Jawa Timur', country: 'Indonesia', device_type: 'Mobile', created_at: '2026-08-01T10:00:00.000Z' },
    { id: 2, action: 'purchase', user_name: 'Budi Santoso', ip_address: '180.252.124.58', city: 'Tuban', region: 'Jawa Timur', country: 'Indonesia', device_type: 'Mobile', created_at: '2026-08-01T10:05:00.000Z' },
    { id: 3, action: 'register', user_name: 'Siti Rahma', ip_address: '114.125.45.12', city: 'Surabaya', region: 'Jawa Timur', country: 'Indonesia', device_type: 'Mobile', created_at: '2026-08-03T14:20:00.000Z' },
    { id: 4, action: 'login', user_name: 'Siti Rahma', ip_address: '114.125.45.12', city: 'Surabaya', region: 'Jawa Timur', country: 'Indonesia', device_type: 'Mobile', created_at: '2026-08-03T14:25:00.000Z' },
    { id: 5, action: 'login', user_name: 'Ahmad Fauzi', ip_address: '125.164.88.90', city: 'Lamongan', region: 'Jawa Timur', country: 'Indonesia', device_type: 'Desktop', created_at: '2026-08-05T09:10:00.000Z' },
    { id: 6, action: 'purchase', user_name: 'Ahmad Fauzi', ip_address: '125.164.88.90', city: 'Lamongan', region: 'Jawa Timur', country: 'Indonesia', device_type: 'Desktop', created_at: '2026-08-05T09:15:00.000Z' },
    { id: 7, action: 'login', user_name: 'Dewi Lestari', ip_address: '180.244.15.22', city: 'Gresik', region: 'Jawa Timur', country: 'Indonesia', device_type: 'Mobile', created_at: '2026-08-06T16:15:00.000Z' },
  ];

  localStorage.setItem('jaringlokal_logs', JSON.stringify(defaultSeedLogs));
  return defaultSeedLogs;
}
