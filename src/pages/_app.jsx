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

const styles = {
  container: css`
    max-width: 1500px;
    margin: 0 auto;
    padding: 0 4%;
  `,
};

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Loop Todo</title>
      </Head>
      <AuthProvider>
        <DndProvider backend={MultiBackend} options={HTML5toTouch}>
          <div css={styles.container}>
            <Component {...pageProps} />
          </div>
        </DndProvider>
      </AuthProvider>
    </>
  );
}

export default MyApp;
