// pages/_app.js
import React from "react";
import Head from "next/head";
import "../styles/reset.css";
import "../styles/global.css";

import { css } from "@emotion/react";
import { AuthProvider } from "contexts/AuthContext";
import { DndProvider } from "react-dnd";
import { MultiBackend } from "react-dnd-multi-backend";
import { HTML5toTouch } from "rdndmb-html5-to-touch";

import { FirebaseProvider } from "contexts/FirebaseContext";

const styles = {
  container: css`
    max-width: 1500px;
    min-height: 100vh;
    margin: 0 auto;
    padding: 0 4%;
  `,
  footer: css`
    max-width: 1500px;

    margin: 1rem auto 0.5rem;
    padding: 0 4%;
  `,
  credit: css`
    text-decoration: none;
    color: black;
    opacity: 0.5;
    font-size: 0.8rem;
  `,
};

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Loop Todo</title>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#00aba9" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <AuthProvider>
        <FirebaseProvider>
          <DndProvider backend={MultiBackend} options={HTML5toTouch}>
            <div css={styles.container}>
              <Component {...pageProps} />
            </div>
            <footer css={styles.footer}>
              <a
                css={styles.credit}
                href="https://www.flaticon.com/free-icons/process"
                title="process icons"
              >
                Process icons created by Freepik - Flaticon
              </a>
            </footer>
          </DndProvider>
        </FirebaseProvider>
      </AuthProvider>
    </>
  );
}

export default MyApp;
