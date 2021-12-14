import Head from "next/head";
import { styled } from "linaria/react";
import { css } from "linaria";

const Box = styled.div`
  margin-top: 40px;
  margin-left: 40px;
  height: 200px;
  width: 200px;
  background-color: #6c9;
`;

const anotherClass = css`
  color: black;
`;

export default function Home() {
  return (
    <>
      <Box className={anotherClass}>Zero runtime CSS in JS</Box>
    </>
  );
}
