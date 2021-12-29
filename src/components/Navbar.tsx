import { css } from "@emotion/react";
import { useAuth } from "contexts/AuthContext";
import Link from "next/link";
const styles = {
  container: css`
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
  `,

  links: css`
    display: flex;
    gap: 1rem;
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
  const { currentUser, signInWithGoogle } = useAuth();
  return (
    <>
      <div css={styles.container}>
        <div css={styles.links}>
          <Link href="/">
            <a
              css={
                selectedFeature === "todo"
                  ? styles.selected
                  : styles.not_selected
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
        {currentUser.isAnonymous && (
          <button onClick={signInWithGoogle}>Google で ログイン</button>
        )}
      </div>
    </>
  );
}
