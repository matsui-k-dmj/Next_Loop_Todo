import { css } from "@emotion/react";

const styles = {
  container: css`
    display: flex;
    gap: 1rem;
  `,
};

type NavbarProps = {
  selectedFeature?: "todo" | "routines";
};

export default function Navbar({ selectedFeature }: NavbarProps) {
  selectedFeature;
  return (
    <>
      <div css={styles.container}>
        <div>Todo</div>
        <div>Routines</div>
      </div>
    </>
  );
}
