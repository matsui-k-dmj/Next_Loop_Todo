import { css } from "@emotion/react";
import { useAuth } from "contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
const styles = {
  container: css`
    display: flex;
    justify-content: space-between;
    align-items: center;

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

  notSelected: css`
    opacity: 0.7;
  `,

  loginButton: css`
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 8px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
    &:hover {
      background-color: #f8f8f8;
    }
  `,

  loginLogo: css`
    flex: 1 0 18px;
    display: flex;
    align-items: center;
  `,

  loginText: css`
    opacity: 0.8;
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
                  : styles.notSelected
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
                  : styles.notSelected
              }
            >
              Routines
            </a>
          </Link>
        </div>
        {currentUser.isAnonymous && (
          <button onClick={signInWithGoogle} css={styles.loginButton}>
            <div css={styles.loginLogo}>
              <img src="/g-logo.png" alt="glogo" width="18px" height="18px" />
            </div>

            <span css={styles.loginText}>ログイン</span>
          </button>
        )}
      </div>
    </>
  );
}
