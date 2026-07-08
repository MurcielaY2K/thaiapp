import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="th">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#f0eee7" />
        <title>ภาษาไทย — Learn Thai</title>
        <meta name="description" content="Learn Thai with 2,600+ words, reading and writing practice, quizzes and a global leaderboard. Free to play, right in your browser." />
        {/* Open Graph / social sharing */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="ภาษาไทย — Learn Thai" />
        <meta property="og:title" content="ภาษาไทย — Learn Thai" />
        <meta property="og:description" content="Learn Thai with 2,600+ words, reading and writing practice, quizzes and a global leaderboard. Free to play, right in your browser." />
        <meta property="og:url" content="https://murcielay2k.github.io/thaiapp/" />
        <meta property="og:image" content="https://murcielay2k.github.io/thaiapp/og.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ภาษาไทย — Learn Thai" />
        <meta name="twitter:description" content="Learn Thai with 2,600+ words, reading and writing practice, quizzes and a global leaderboard." />
        <meta name="twitter:image" content="https://murcielay2k.github.io/thaiapp/og.png" />
        <link rel="apple-touch-icon" href="/thaiapp/apple-touch-icon.png" />
        {/* Sanuk Spirit Realm — Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&family=Silkscreen:wght@400;700&family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root {
                background-color: #f0eee7;
                font-family: 'Sarabun', system-ui, sans-serif;
              }
              /* viewport-fit=cover lets the page extend under the iPhone
                 status bar / home indicator; pad the app back out of them. */
              #root {
                padding-top: env(safe-area-inset-top);
                padding-bottom: env(safe-area-inset-bottom);
              }
              body { overscroll-behavior: none; }
              img, canvas { image-rendering: pixelated; }
              * { box-sizing: border-box; }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // On-device error reporter: if the app's JS crashes on load, show
              // the real error in a red banner so it can be screenshotted.
              (function () {
                function banner(msg) {
                  try {
                    var d = document.getElementById('err-banner');
                    if (!d) {
                      d = document.createElement('div');
                      d.id = 'err-banner';
                      d.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#c0392b;color:#fff;font:12px/1.5 monospace;padding:8px 12px;white-space:pre-wrap;word-break:break-all;max-height:45vh;overflow:auto';
                      document.body ? document.body.appendChild(d) : document.addEventListener('DOMContentLoaded', function(){ document.body.appendChild(d); });
                    }
                    d.textContent += msg + '\\n';
                  } catch (e) {}
                }
                window.addEventListener('error', function (e) {
                  banner('[error] ' + (e.message || '') + ' @ ' + (e.filename || '').split('/').pop() + ':' + e.lineno);
                });
                window.addEventListener('unhandledrejection', function (e) {
                  var r = e.reason || {};
                  banner('[promise] ' + (r.message || String(r)).slice(0, 300));
                });
              })();
              (function () {
                if (!('serviceWorker' in navigator)) return;
                var OUR_SW = '/thaiapp/service-worker.js';
                // Silently unregister any leftover service worker that isn't
                // ours (e.g. an old root-scope one from a previous deploy), then
                // register the current one. We deliberately do NOT force a
                // page reload here — the correct worker takes over on the next
                // natural navigation. (An earlier version reloaded on every
                // launch, which was jarring on the iOS home-screen app.)
                navigator.serviceWorker.getRegistrations().then(function (rs) {
                  rs.forEach(function (r) {
                    var u = ((r.active || r.waiting || r.installing) || {}).scriptURL || '';
                    if (u && u.indexOf(OUR_SW) === -1) r.unregister();
                  });
                }).catch(function () {});
                // updateViaCache 'none' re-fetches the SW script on every
                // navigation, so new deploys roll out without a hard refresh.
                navigator.serviceWorker
                  .register(OUR_SW, { updateViaCache: 'none' })
                  .catch(function () {});
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
