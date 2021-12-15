import { css } from "@emotion/react";
import Navbar from "../components/Navbar";

const anotherClass = css`
  background-color: #c69;
`;

export default function Home() {
  return (
    <>
      <Navbar></Navbar>
      <div css={anotherClass}>Zero runtime CSS in JS</div>
    </>
  );
}
