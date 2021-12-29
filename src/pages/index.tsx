import { css } from "@emotion/react";

import Navbar from "components/Navbar";
import Todo from "components/Todo";
import { subDays } from "date-fns";
const styles = {
  marginBottom: css`
    margin-bottom: 1rem;
  `,
};
export default function Home() {
  const today = new Date();
  return (
    <>
      <Navbar selectedFeature="todo"></Navbar>

      <div css={styles.marginBottom}>
        <Todo date={today}></Todo>
      </div>
      <div css={styles.marginBottom}>
        <Todo date={subDays(today, 1)}></Todo>
      </div>
      <Todo date={subDays(today, 2)}></Todo>
    </>
  );
}
