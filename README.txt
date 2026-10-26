SERVICEMAN ELECTRICAL APP - STARTER PROJECT

Files:
- index.html: app page and forms
- style.css: mobile-friendly styling
- app.js: booking, electrician registration, local demo dashboard and CSV export
- firebase-config.js: Firebase configuration placeholder
- manifest.json: basic installable-web-app metadata

IMPORTANT SETUP:
1. Keep all five files in the same folder.
2. Open firebase-config.js and replace placeholder values with the exact values from your Firebase web app configuration. Do not replace the entire object with the ES module import code from Firebase's newer setup guide; this starter uses the Firebase COMPAT SDK.
3. Host the files using a web server/hosting service (for example Firebase Hosting). Opening index.html directly from a file manager may block Firebase features.
4. In Firebase Console, create Firestore Database and configure secure Firestore Rules before accepting real customer information.
5. This starter currently saves records locally and attempts to send them to Firestore if Firebase is configured. The dashboard is local-only and is NOT a secure admin panel. Do not use it to expose all customer bookings publicly.
6. Authentication, verified admin access, real online payment, push notifications and location tracking are not yet implemented. Add those before production use.
7. Never share customer personal details publicly. Use qualified personnel and proper safety authorization for electrical/HT work.
