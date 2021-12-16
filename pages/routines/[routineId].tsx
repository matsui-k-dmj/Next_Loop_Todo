import Link from "next/link";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/router";

export default function RoutineDetail() {
  const router = useRouter();
  const { routineId } = router.query;
  return (
    <>
      <Navbar selectedFeature="routines"></Navbar>
      <div>routineId: {routineId}</div>
    </>
  );
}
