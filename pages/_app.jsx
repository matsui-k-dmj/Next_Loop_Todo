// pages/_app.js
import React from "react";
import Head from "next/head";
import "../styles/reset.css";
import { css } from "@emotion/react";
const styles = {
  container: css`
    max-width: 800px;
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
      <div css={styles.container}>
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default MyApp;
