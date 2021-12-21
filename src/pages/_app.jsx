// pages/_app.js
import React from "react";
import Head from "next/head";
import "../styles/reset.css";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
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
      <DndProvider backend={HTML5Backend}>
        <div css={styles.container}>
          <Component {...pageProps} />
        </div>
      </DndProvider>
    </>
  );
}

export default MyApp;
