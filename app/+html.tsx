import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

// Wraps every web page. Sets a dark background everywhere (including the
// safe-area / status-bar regions) and disables overscroll bounce so there
// are no white bars around the app.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0d0d1a" />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root { background-color: #0d0d1a; }
              body { overscroll-behavior: none; }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
