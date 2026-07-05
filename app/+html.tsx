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
              body { overscroll-behavior: none; }
              img, canvas { image-rendering: pixelated; }
              * { box-sizing: border-box; }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                // updateViaCache 'none' forces the browser to re-fetch the SW
                // script on every navigation, so new deploys roll out without
                // users needing a hard refresh.
                navigator.serviceWorker
                  .register('/thaiapp/service-worker.js', { updateViaCache: 'none' })
                  .catch(function () {});
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
