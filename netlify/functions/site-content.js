/* ============================================================
   ENCORE — site content endpoint
   ------------------------------------------------------------
   Lets the website read from Sanity WITHOUT the dataset being
   public and WITHOUT the browser ever seeing a password.

   How it works:
     browser  ->  this function (on Netlify)  ->  Sanity
                  ^ holds the read token, server-side only

   The dataset stays private. The token never leaves Netlify.
   This endpoint deliberately returns ONLY the announcement
   bar fields, so even though anyone can call it, there is
   nothing sensitive behind it.

   Requires a Netlify environment variable:
     SANITY_READ_TOKEN   (a Viewer / read-only token)
   ============================================================ */

const PROJECT = 'cakoldrm';
const DATASET = 'production';
const API_VERSION = 'v2023-05-03';

const QUERY =
  '*[_type=="siteSettings"][0]{announcementEnabled,announcementText,announcementLink}';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  // cache for a minute so we are not hammering Sanity on every pageview
  'Cache-Control': 'public, max-age=60, s-maxage=60',
  'Access-Control-Allow-Origin': '*',
};

exports.handler = async function () {
  const token = process.env.SANITY_READ_TOKEN;

  // No token configured yet -> respond politely; the site falls back
  // to whatever is already written into the page.
  if (!token) {
    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({ ok: false, reason: 'not-configured' }),
    };
  }

  const url =
    `https://${PROJECT}.api.sanity.io/${API_VERSION}` +
    `/data/query/${DATASET}?query=${encodeURIComponent(QUERY)}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return {
        statusCode: 200,
        headers: JSON_HEADERS,
        body: JSON.stringify({ ok: false, reason: 'sanity-' + res.status }),
      };
    }

    const data = await res.json();
    const s = (data && data.result) || {};

    // Return only what the front end needs. Nothing else leaves Sanity.
    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        ok: true,
        announcement: {
          enabled: s.announcementEnabled !== false,
          text: s.announcementText || '',
          link: s.announcementLink || '',
        },
      }),
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({ ok: false, reason: 'fetch-failed' }),
    };
  }
};
