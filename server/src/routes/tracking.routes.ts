import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { env } from '../config/env.js';
import { fireEvent } from '../services/webhook.service.js';
import * as sse from '../services/sse.service.js';

const router = Router();

// 1x1 transparent GIF pixel
const TRANSPARENT_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

/**
 * Parse and verify a tracking ID.
 * Format: base64url(campaignContactId:stepId:hmac)
 */
function parseTrackingId(trackingId: string): { campaignContactId: string; stepId: string } | null {
  try {
    const decoded = Buffer.from(trackingId, 'base64url').toString('utf8');
    const [campaignContactId, stepId, hmac] = decoded.split(':');

    if (!campaignContactId || !stepId || !hmac) return null;

    // Verify HMAC
    const payload = `${campaignContactId}:${stepId}`;
    const expectedHmac = crypto
      .createHmac('sha256', env.TRACKING_SECRET)
      .update(payload)
      .digest('hex')
      .slice(0, 16);

    if (hmac !== expectedHmac) return null;

    return { campaignContactId, stepId };
  } catch {
    return null;
  }
}

/**
 * GET /api/track/open/:trackingId
 * Records an email open event and returns a 1x1 transparent pixel.
 */
router.get('/open/:trackingId', async (req: Request, res: Response) => {
  // Always return the pixel immediately, even if tracking fails
  res.set({
    'Content-Type': 'image/gif',
    'Content-Length': String(TRANSPARENT_PIXEL.length),
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    Pragma: 'no-cache',
    Expires: '0',
  });

  const parsed = parseTrackingId(req.params.trackingId);
  if (!parsed) {
    return res.end(TRANSPARENT_PIXEL);
  }

  const { campaignContactId, stepId } = parsed;

  try {
    // Get campaign contact info
    const { data: cc } = await supabaseAdmin
      .from('campaign_contacts')
      .select('campaign_id, contact_id, campaigns(user_id, smtp_account_id)')
      .eq('id', campaignContactId)
      .single();

    if (!cc) {
      return res.end(TRANSPARENT_PIXEL);
    }

    // Check if we already recorded an open for this step (deduplicate)
    const { count } = await supabaseAdmin
      .from('campaign_activities')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_contact_id', campaignContactId)
      .eq('step_id', stepId)
      .eq('activity_type', 'opened');

    if (!count || count === 0) {
      // Record the open activity
      await supabaseAdmin
        .from('campaign_activities')
        .insert({
          campaign_id: cc.campaign_id,
          campaign_contact_id: campaignContactId,
          contact_id: cc.contact_id,
          step_id: stepId,
          activity_type: 'opened',
          metadata: {
            ip: req.ip,
            user_agent: req.headers['user-agent'],
          },
        });

      // Update SSE health for the SMTP account
      if ((cc as any).campaigns?.smtp_account_id) {
        sse.recordOpen((cc as any).campaigns.smtp_account_id).catch(() => {});
      }

      // Fire webhook event
      if ((cc as any).campaigns?.user_id) {
        fireEvent((cc as any).campaigns.user_id, 'email.opened', {
          campaign_id: cc.campaign_id,
          contact_id: cc.contact_id,
          step_id: stepId,
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.error('Tracking open error:', err);
  }

  return res.end(TRANSPARENT_PIXEL);
});

/**
 * GET /api/track/click/:trackingId?url=<base64url-encoded-url>
 * Records a click event and redirects to the original URL.
 */
router.get('/click/:trackingId', async (req: Request, res: Response) => {
  const parsed = parseTrackingId(req.params.trackingId);
  const encodedUrl = req.query.url as string;

  if (!encodedUrl) {
    return res.status(400).send('Missing URL');
  }

  // Decode the original URL
  let originalUrl: string;
  try {
    originalUrl = Buffer.from(encodedUrl, 'base64url').toString('utf8');
  } catch {
    return res.status(400).send('Invalid URL');
  }

  // Validate URL to prevent open redirect
  try {
    const parsed_url = new URL(originalUrl);
    if (!['http:', 'https:'].includes(parsed_url.protocol)) {
      return res.status(400).send('Invalid URL protocol');
    }
  } catch {
    return res.status(400).send('Invalid URL format');
  }

  if (!parsed) {
    return res.redirect(302, originalUrl);
  }

  const { campaignContactId, stepId } = parsed;

  try {
    // Get campaign contact info
    const { data: cc } = await supabaseAdmin
      .from('campaign_contacts')
      .select('campaign_id, contact_id, campaigns(user_id)')
      .eq('id', campaignContactId)
      .single();

    if (cc) {
      // Record the click activity
      await supabaseAdmin
        .from('campaign_activities')
        .insert({
          campaign_id: cc.campaign_id,
          campaign_contact_id: campaignContactId,
          contact_id: cc.contact_id,
          step_id: stepId,
          activity_type: 'clicked',
          metadata: {
            url: originalUrl,
            ip: req.ip,
            user_agent: req.headers['user-agent'],
          },
        });

      // Fire webhook event
      if ((cc as any).campaigns?.user_id) {
        fireEvent((cc as any).campaigns.user_id, 'email.clicked', {
          campaign_id: cc.campaign_id,
          contact_id: cc.contact_id,
          step_id: stepId,
          url: originalUrl,
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.error('Tracking click error:', err);
  }

  return res.redirect(302, originalUrl);
});

export { router as trackingRoutes };
