import Link from "next/link";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/router";
import { FaChevronLeft } from "react-icons/fa";
import { css } from "@emotion/react";
import { initialRoutines } from "models/psudo_data";

const styles = {
  backIcon: css`
    color: black;
    font-size: 1.5rem;
  `,

  name: css`
    margin-top: 1rem;
  `,
};

export default function RoutineDetail() {
  const router = useRouter();
  const { routineId } = router.query;
  const routine = initialRoutines.find((x) => x.routineId === routineId);
  if (routine == null) {
    return <div> Not Found </div>;
  }
  return (
    <>
      <Navbar selectedFeature="routines"></Navbar>
      <Link href="/routines">
        <a css={styles.backIcon}>
          <FaChevronLeft />
        </a>
      </Link>
      <p css={styles.name}>{routine.name}</p>
    </>
  );
}
