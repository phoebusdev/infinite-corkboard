import { headers } from 'next/headers';

/**
 * Get client IP address from headers
 * Handles various proxy/load balancer headers
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();

  // Try various headers in order of preference
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can be a comma-separated list, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headersList.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = headersList.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to a generic identifier
  return 'unknown';
}
