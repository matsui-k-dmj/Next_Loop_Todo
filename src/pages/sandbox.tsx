import { GetStaticProps } from "next";
import Navbar from "../components/Navbar";

export default function Sandbox() {
  return (
    <>
      <h1>Navbar</h1>
      <Navbar></Navbar>
      <Navbar selectedFeature="todo"></Navbar>
      <Navbar selectedFeature="routines"></Navbar>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  if (process.env.NODE_ENV === "production") {
    return { notFound: true };
  }
  return { props: {} };
};
