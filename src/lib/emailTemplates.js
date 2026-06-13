const STUDIO_NAME = 'Axis Living';
const YOUR_NAME = 'Kas';
const CONTACT_EMAIL = 'hello@axisliving.co.zm';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://axisliving.co.zm';

const COLORS = {
  bg: '#F2EBE3',
  white: '#FFFFFF',
  primary: '#2F402C',
  tan: '#C6B9AA',
  muted: '#6B7280',
  border: '#E5E7EB',
  text: '#1C1C1C',
};

const INTERIOR_IMAGES = [
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=340&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&h=340&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=340&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=340&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600&h=340&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&h=340&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=340&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=340&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=600&h=340&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=600&h=340&fit=crop&auto=format&q=80',
];

export function randomImage() {
  return INTERIOR_IMAGES[Math.floor(Math.random() * INTERIOR_IMAGES.length)];
}

export function btn(label, url) {
  return `<div style="text-align:center;margin-top:32px;">
    <a href="${url}" style="display:inline-block;background:${COLORS.primary};color:#fff;padding:16px 40px;border-radius:99px;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${label}</a>
  </div>`;
}

function detailRow(label, value) {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid ${COLORS.border};">
      <span style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:2px;color:${COLORS.tan};font-weight:700;margin-bottom:4px;">${label}</span>
      <span style="font-size:15px;color:${COLORS.primary};font-weight:500;">${value}</span>
    </td>
  </tr>`;
}

export function wrap({ image, heading, body, content = '', note = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.bg};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg};padding:48px 20px 64px;">
    <tr>
      <td align="center">

        <!-- Logo -->
        <div style="margin-bottom:32px;text-align:center;">
          <div style="display:inline-block;background:#2F402C;padding:14px 28px;border-radius:12px;">
            <img src="${SITE_URL}/axis-living.png" alt="${STUDIO_NAME}" width="130" style="height:auto;display:block;" />
          </div>
        </div>

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${COLORS.white};border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(47,64,44,0.08);">

          <!-- Hero image -->
          <tr>
            <td style="padding:20px 20px 0;">
              <img src="${image}" alt="Axis Living Interior" width="520" style="width:100%;height:300px;object-fit:cover;border-radius:10px;display:block;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:44px 52px 52px;text-align:center;">
              <h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:normal;color:${COLORS.text};line-height:1.35;">${heading}</h1>
              <p style="margin:0;font-size:15px;line-height:1.75;color:${COLORS.muted};">${body}</p>
              ${content}
            </td>
          </tr>

          ${note ? `
          <!-- Note -->
          <tr>
            <td style="padding:0 52px 40px;text-align:center;">
              <p style="margin:0;font-size:13px;color:${COLORS.tan};line-height:1.6;">${note}</p>
            </td>
          </tr>` : ''}

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid ${COLORS.border};padding:24px 52px;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;color:#9CA3AF;letter-spacing:1px;">© ${new Date().getFullYear()} ${STUDIO_NAME} · Lusaka, Zambia</p>
              <p style="margin:0;font-size:11px;"><a href="mailto:${CONTACT_EMAIL}" style="color:${COLORS.tan};text-decoration:none;">${CONTACT_EMAIL}</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Replaces {{name}}, {{date}}, {{time}}, {{cancel_link}} etc.
function interpolate(str, vars) {
  if (!str) return str ?? '';
  return String(str).replace(/\{\{(\w+)\}\}/g, (_, key) => (key in vars ? vars[key] : `{{${key}}}`));
}

export const emailTemplates = {

  lookbookDelivery: (name, tpl = {}) => {
    const vars = { name };
    const subject = interpolate(tpl.subject || 'Your Behind the Design Lookbook ✦', vars);
    const heading = interpolate(tpl.heading || 'Your lookbook is here.', vars);
    const body    = interpolate(tpl.body    || `Thank you for downloading Behind the Design, {{name}}. Inside: material palettes from recent projects, spatial planning principles we return to again and again, and thoughts on what makes a room feel genuinely finished.`, vars);
    const note    = interpolate(tpl.note    ?? 'Next week: the mistakes we made on one of our most ambitious projects, and what we learned from them.', vars);
    return {
      subject,
      html: wrap({
        image: randomImage(),
        heading,
        body,
        content: `
          ${btn('Download Your Lookbook', `${SITE_URL}/axis-living-lookbook.pdf`)}
          <p style="margin:32px 0 0;font-style:italic;font-family:Georgia,serif;font-size:16px;color:${COLORS.primary};">${YOUR_NAME}</p>
        `,
        note,
      }),
    };
  },

  bookingConfirmation: (name, date, time, meetingLink, cancellationUrl = null, tpl = {}) => {
    const cancelLinkHtml = cancellationUrl
      ? `<a href="${cancellationUrl}" style="color:${COLORS.tan};">cancel your booking</a>`
      : '';
    const vars = { name, date, time, cancel_link: cancelLinkHtml };

    const subject = interpolate(tpl.subject || `You're booked. See you {{date}} ✦`, vars);
    const heading = interpolate(tpl.heading || 'Your consultation is confirmed.', vars);
    const body    = interpolate(tpl.body    || `Looking forward to hearing about your space, {{name}}. Before our call, two things to help you come prepared.`, vars);

    const defaultNote = cancellationUrl
      ? 'Need to cancel? {{cancel_link}} at least 24 hours before your appointment. To reschedule, reply to this email.'
      : 'Need to reschedule? Reply to this email at least 24 hours in advance.';
    const note = interpolate(tpl.note !== undefined ? tpl.note : defaultNote, vars);

    return {
      subject,
      html: wrap({
        image: randomImage(),
        heading,
        body,
        content: `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;background:${COLORS.bg};border-radius:10px;padding:28px;text-align:left;">
            <tbody>
              ${detailRow('Date', date)}
              ${detailRow('Time', `${time} (CAT)`)}
              ${detailRow('Format', 'Video call')}
            </tbody>
          </table>
          ${btn('Join Meeting', meetingLink)}
          <div style="margin-top:44px;padding-top:36px;border-top:1px solid ${COLORS.border};">
            <p style="font-size:10px;text-transform:uppercase;letter-spacing:3px;color:${COLORS.tan};font-weight:700;margin:0 0 28px;">Before our call</p>
            <div style="margin-bottom:28px;">
              <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${COLORS.primary};margin:0 0 8px;">01 / The Moodbook</p>
              <p style="font-size:14px;color:${COLORS.muted};line-height:1.7;margin:0 0 14px;">Style references and reflection prompts to help you arrive with a clear design direction. The more prepared you are, the more we get done.</p>
              <a href="${SITE_URL}/axis-living-moodbook.pdf" style="font-size:12px;font-weight:700;color:${COLORS.primary};text-decoration:underline;letter-spacing:1px;">Download the Moodbook</a>
            </div>
            <div>
              <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${COLORS.primary};margin:0 0 8px;">02 / Behind the Design</p>
              <p style="font-size:14px;color:${COLORS.muted};line-height:1.7;margin:0 0 14px;">Our lookbook: material palettes, past projects, and how we think about space.</p>
              <a href="${SITE_URL}/axis-living-lookbook.pdf" style="font-size:12px;font-weight:700;color:${COLORS.primary};text-decoration:underline;letter-spacing:1px;">Download the Lookbook</a>
            </div>
          </div>
          <p style="margin:36px 0 0;font-style:italic;font-family:Georgia,serif;font-size:16px;color:${COLORS.primary};">${YOUR_NAME}</p>
        `,
        note,
      }),
    };
  },

  bookingCancelled: (name, date, time, tpl = {}) => {
    const vars = { name, date, time };
    const subject = interpolate(tpl.subject || 'Your booking has been cancelled ✦', vars);
    const heading = interpolate(tpl.heading || 'Booking cancelled.', vars);
    const body    = interpolate(tpl.body    || `We've received your cancellation, {{name}}. Your consultation slot on {{date}} at {{time}} (CAT) has been released.`, vars);
    const note    = interpolate(tpl.note    ?? `If this was a mistake, you're welcome to book again at ${SITE_URL}/booking.`, vars);
    return {
      subject,
      html: wrap({
        image: randomImage(),
        heading,
        body,
        content: `
          ${btn('Book a New Time', `${SITE_URL}/booking`)}
          <p style="margin:32px 0 0;font-style:italic;font-family:Georgia,serif;font-size:16px;color:${COLORS.primary};">${YOUR_NAME}</p>
        `,
        note,
      }),
    };
  },

  portalWelcome: (name, email, password, portalUrl) => ({
    subject: 'Your client portal is ready ✦',
    html: wrap({
      image: randomImage(),
      heading: `Welcome to your portal, ${name}.`,
      body: 'Your dedicated project space is live. Track progress, view documents, browse your moodboard, and message us directly.',
      content: `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;background:${COLORS.bg};border-radius:10px;padding:28px;text-align:left;">
          <tbody>
            ${detailRow('Portal URL', portalUrl)}
            ${detailRow('Email', email)}
            ${detailRow('Password', password)}
          </tbody>
        </table>
        ${btn('Go to My Portal', portalUrl)}
        <p style="margin:32px 0 0;font-style:italic;font-family:Georgia,serif;font-size:16px;color:${COLORS.primary};">${YOUR_NAME}</p>
      `,
      note: 'Keep this email safe. It contains your login details.',
    }),
  }),

  newPortalMessage: (clientName, messagePreview, portalUrl) => ({
    subject: 'New message from your designer ✦',
    html: wrap({
      image: randomImage(),
      heading: 'You have a new message.',
      body: `<em style="font-family:Georgia,serif;color:${COLORS.text};">"${messagePreview}"</em>`,
      content: `
        ${btn('View Full Message', portalUrl)}
        <p style="margin:32px 0 0;font-style:italic;font-family:Georgia,serif;font-size:16px;color:${COLORS.primary};">${YOUR_NAME}, ${STUDIO_NAME}</p>
      `,
    }),
  }),

};
