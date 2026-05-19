# Website GDPR and Cookie Review

Review date: 18 May 2026

## Current website behaviour

- Public pages are static HTML, CSS, JavaScript, and image files.
- Fonts for `about-us.html`, `software.html`, and `privacy-policy.html` are served locally from `fonts/`.
- `index.html` and `Nianav OS - standalone.html` use bundled local font assets from the page manifest.
- The public website does not include analytics, advertising pixels, behavioural tracking, third-party embeds, third-party forms, or remote font requests.
- The public website does not set cookies and does not use `localStorage` or `sessionStorage`.
- The cookie/privacy notice does not store a consent or dismissal choice. It only hides itself in the current page view.
- Visitors can contact Niavicta by email link. Any data sent by email is processed outside the website itself.

## GDPR and cookie requirements checked

- Privacy information should clearly identify the organisation, purposes, personal data categories, legal basis, retention, recipients, transfers, rights, withdrawal of consent where applicable, and complaint rights.
- Cookies or similar technologies that are not strictly necessary require prior consent and clear purpose information before they are set.
- Consent must be freely given, specific, informed, and based on a clear positive action. Continuing to browse is not enough.
- Technical server request data such as an IP address may be necessary to deliver a website, but it should still be covered by the privacy notice.

## Implementation choices

- No non-essential cookies or browser storage were added.
- The privacy/cookie notice is informational because there is nothing optional to accept or reject on the current site.
- The privacy policy includes the website's no-tracking position, local font hosting, email contact processing, hosting-log caveat, and GDPR rights.

## Residual items for the site owner

- Confirm the exact legal entity name, registered address, and email provider before publishing as final legal text.
- Confirm the hosting provider's log retention period and any international transfer mechanism.
- If analytics, embedded videos, chat widgets, scheduling tools, forms, or marketing pixels are added later, update the privacy policy and add a real consent mechanism before those tools load.
