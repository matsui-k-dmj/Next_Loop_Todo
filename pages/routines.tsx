import Link from "next/link";
import Navbar from "components/Navbar";

import { routines } from "models/psudo_data";
import RepeatText from "components/RepeatText";

import { css } from "@emotion/react";
const styles = {
  item: css`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #ddd;
  `,

  firstItem: css`
    border-top: 1px solid #ddd;
  `,
};
export default function Routines() {
  return (
    <>
      <Navbar selectedFeature="routines"></Navbar>
      <Link href="routines/new">
        <a>タスクを追加</a>
      </Link>
      {routines.map((x, i) => {
        return (
          <Link href={`routines/${x.routineId}`} key={x.routineId}>
            <a css={[styles.item, i === 0 && styles.firstItem]}>
              <div>{x.name} </div>
              <div>
                <RepeatText repeat={x.repeat}></RepeatText>
              </div>
            </a>
          </Link>
        );
      })}
    </>
  );
}
