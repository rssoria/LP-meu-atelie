# Meta Conversions API Setup

This project sends checkout events from the landing page to a secure backend endpoint:

- Frontend endpoint: `/api/meta-conversions`
- Backend file: `api/meta-conversions.js`

## 1) Add environment variables in Vercel

Set these variables in your project settings:

- `META_PIXEL_ID` = `1624328116361376`
- `META_ACCESS_TOKEN` = your Meta Conversions API access token
- `META_TEST_EVENT_CODE` = optional (for Events Manager Test Events)

## 2) Deploy

Push to GitHub and deploy in Vercel.

## 3) Validate in Meta Events Manager

- Open Test Events.
- If using `META_TEST_EVENT_CODE`, trigger a checkout click.
- Confirm event `InitiateCheckout` appears.

## Notes

- Browser Pixel and CAPI use the same `event_id` for deduplication.
- Never expose `META_ACCESS_TOKEN` in frontend code.
- This endpoint is intentionally minimal for LP usage.
