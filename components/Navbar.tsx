import { css } from "@emotion/react";

const styles = {
  container: css`
    display: flex;
    background-color: #6c9;
  `,
};

type NavbarProps = {
  selectedFeature?: "todo" | "routines";
};

export default function Navbar({ selectedFeature = undefined }: NavbarProps) {
  selectedFeature;
  return (
    <>
      <div css={styles.container}>
        <div>Todo</div>
        <div>Routines</div>
        <div>Log</div>
      </div>
    </>
  );
}
