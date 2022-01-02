import Navbar from "components/Navbar";
import Todo from "components/Todo";
import { useFirebase } from "contexts/FirebaseContext";
import { format, subDays } from "date-fns";
import parse from "date-fns/parse";
import { Routine } from "models/model";

export default function Home() {
  const today = new Date();

  const { todayTaskArray, yesterdayTaskArray, dateString, routineArray } =
    useFirebase();

  let routinesObj: { [routineId: string]: Routine } = {};
  for (const routine of routineArray) {
    routinesObj = { ...routinesObj, [routine.routineId]: routine };
  }

  return (
    <>
      <Navbar selectedFeature="todo"></Navbar>

      <div style={{ marginBottom: "1rem" }}>
        <Todo
          dateString={dateString}
          taskArray={todayTaskArray}
          routinesObj={routinesObj}
        ></Todo>
      </div>
      {yesterdayTaskArray.length !== 0 && (
        <Todo
          dateString={format(
            subDays(parse(dateString, "yyyy-MM-dd", new Date()), 1),
            "yyyy-MM-dd"
          )}
          taskArray={yesterdayTaskArray}
          routinesObj={routinesObj}
        ></Todo>
      )}
    </>
  );
}
