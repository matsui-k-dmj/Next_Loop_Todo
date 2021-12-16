import { css } from "@emotion/react";
import { cx } from "@emotion/css";
const styles = {
  container: css`
    display: flex;
    gap: 1rem;
    padding: 1rem;
  `,

  not_selected: css`
    opacity: 0.7;
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
        <div css={selectedFeature !== "todo" && styles.not_selected}>Todo</div>
        <div css={selectedFeature !== "routines" && styles.not_selected}>
          Routines
        </div>
      </div>
    </>
  );
}
