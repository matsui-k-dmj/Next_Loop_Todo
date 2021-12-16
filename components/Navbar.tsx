import { css } from "@emotion/react";
import { cx } from "@emotion/css";
import Link from "next/link";
const styles = {
  container: css`
    display: flex;
    gap: 1rem;
    padding: 1rem;
  `,

  selected: css`
    border-bottom: 1px solid #666;
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
        <Link href="/">
          <a
            css={
              selectedFeature === "todo" ? styles.selected : styles.not_selected
            }
          >
            Todo
          </a>
        </Link>
        <Link href="/routines">
          <a
            css={
              selectedFeature === "routines"
                ? styles.selected
                : styles.not_selected
            }
          >
            Routines
          </a>
        </Link>
      </div>
    </>
  );
}
