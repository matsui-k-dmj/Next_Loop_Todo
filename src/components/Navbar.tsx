import { css } from "@emotion/react";
import { useAuth } from "contexts/AuthContext";
import Link from "next/link";

const styles = {
  container: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1% 1.5rem;
  `,

  links: css`
    display: flex;
    gap: 0.5rem;
  `,

  link: css`
    padding: 0.5rem;
    font-size: 1.1rem;
    font-weight: bold;
  `,

  selected: css`
    border-bottom: 1px solid #666;
  `,

  notSelected: css`
    opacity: 0.6;
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
              css={[
                styles.link,
                selectedFeature === "todo"
                  ? styles.selected
                  : styles.notSelected,
              ]}
              className="clickable"
            >
              Todo
            </a>
          </Link>
          <Link href="/routines">
            <a
              css={[
                styles.link,
                selectedFeature === "routines"
                  ? styles.selected
                  : styles.notSelected,
              ]}
              className="clickable"
            >
              Routines
            </a>
          </Link>
        </div>
        {currentUser.isAnonymous && (
          <button
            onClick={signInWithGoogle}
            css={[styles.loginButton]}
            className="clickable"
          >
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
