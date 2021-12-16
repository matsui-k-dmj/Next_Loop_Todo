import Link from "next/link";
import Navbar from "../components/Navbar";

export default function Routines() {
  return (
    <>
      <Navbar selectedFeature="routines"></Navbar>
      <Link href="routines/new">
        <a>タスクを追加</a>
      </Link>
    </>
  );
}
