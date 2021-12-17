import Navbar from "components/Navbar";
import { format } from "date-fns";
import ja from "date-fns/locale/ja";
export default function Home() {
  return (
    <>
      <Navbar selectedFeature="todo"></Navbar>
      <div>
        <h2>{format(new Date(), "M/d E", { locale: ja })}</h2>
      </div>
    </>
  );
}
