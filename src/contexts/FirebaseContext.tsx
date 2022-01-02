import {
  addDays,
  differenceInMilliseconds,
  format,
  parse,
  startOfDay,
  subDays,
} from "date-fns";
import { Routine, Task } from "models/model";
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import { useAuth } from "./AuthContext";

import { db } from "lib/firebaseConfig";

import {
  ref as fbRef,
  set as fbSet,
  get as fbGet,
  onChildAdded,
  onChildChanged,
  push as fbPush,
  onValue,
  query,
  orderByChild,
  limitToFirst,
  DataSnapshot,
} from "firebase/database";
import { sort } from "lib/utils";
import { toRepeat } from "lib/repeat";

interface Values {
  routineArray: Routine[];
  minTaskSortValue: number;
  todayTaskArray: Task[];
  yesterdayTaskArray: Task[];
  dateString: string;
}

const FirebaseContext = createContext({} as Values);

export function useFirebase() {
  return useContext(FirebaseContext);
}

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [routineArray, setRoutineArray] = useState<Routine[]>([]);
  const [minTaskSortValue, setMinTaskSortValue] = useState<number>(0);
  const [todayTaskArray, setTodayTaskArray] = useState<Task[]>([]);
  const [yesterdayTaskArray, setYesterdayTaskArray] = useState<Task[]>([]);

  const [dateString, setDateString] = useState(
    format(new Date(), "yyyy-MM-dd")
  );

  const { currentUser } = useAuth();

  useEffect(() => {
    function updateRoutine(data: DataSnapshot) {
      setRoutineArray((routineArray) => {
        return sort(
          routineArray
            .filter((routine) => routine.routineId !== data.key)
            .concat(data.val()),
          (x) => x.sortValue
        );
      });
    }

    function updateToday(data: DataSnapshot) {
      setTodayTaskArray((_taskArray) =>
        sortTasks(
          _taskArray
            .filter((task) => task.routineId !== data.val().routineId)
            .concat(data.val())
        )
      );
    }

    function updateYesterday(data: DataSnapshot) {
      setYesterdayTaskArray((_taskArray) =>
        sortTasks(
          _taskArray
            .filter((task) => task.routineId !== data.val().routineId)
            .concat(data.val())
        )
      );
    }

    // 日付が変わるときにdateStringを更新する
    const timeoutId = setTimeout(() => {
      setDateString(format(new Date(), "yyyy-MM-dd"));
    }, differenceInMilliseconds(startOfDay(addDays(new Date(), 1)), new Date()));

    const routinesRef = fbRef(db, `users/${currentUser.uid}/routines`);
    const todayTaskRef = fbRef(
      db,
      `users/${currentUser.uid}/todo/${dateString}`
    );

    const yesterdayTaskRef = fbRef(
      db,
      `users/${currentUser.uid}/todo/${format(
        subDays(parse(dateString, "yyyy-MM-dd", new Date()), 1),
        "yyyy-MM-dd"
      )}`
    );

    const unsubArray = [
      onChildAdded(routinesRef, updateRoutine),
      onChildChanged(routinesRef, updateRoutine),
      onValue(
        query(todayTaskRef, orderByChild("sortValue"), limitToFirst(1)),
        (data) => {
          if (!data.exists()) return;
          Object.values(data.val()).forEach((x) => {
            const task = x as Task;
            setMinTaskSortValue(task.sortValue);
          });
        }
      ),
      onChildAdded(todayTaskRef, updateToday),
      onChildChanged(todayTaskRef, updateToday),
      onChildAdded(yesterdayTaskRef, updateYesterday),
      onChildChanged(yesterdayTaskRef, updateYesterday),
    ];

    // 新しい日のTODOの初期化処理
    fbGet(todayTaskRef).then((todoData) => {
      // すでにRoutinesからupdateで作られてるtaskをもう一度作らないために必要
      let createdRoutineIds: string[] = [];
      if (todoData.val()) {
        createdRoutineIds = Object.values(todoData.val()).map((task) => {
          const _task = task as Task;
          return _task.routineId;
        });
      }

      fbGet(routinesRef).then((routineData) => {
        // その日に繰り返す必要があって、まだ作られてないタスクを作る
        Object.values(routineData.val())
          .filter((routine) => {
            const _routine = routine as Routine;
            return (
              toRepeat(
                parse(dateString, "yyyy-MM-dd", new Date()),
                _routine.repeat
              ) && !createdRoutineIds.includes(_routine.routineId)
            );
          })
          .forEach((routine) => {
            const _routine = routine as Routine;

            const newRef = fbPush(todayTaskRef);

            fbSet(newRef, {
              taskId: newRef.key,
              routineId: _routine.routineId,
              done: false,
              sortValue: _routine.sortValue,
            });
          });
      });
    });

    return () => {
      clearTimeout(timeoutId);
      unsubArray.forEach((unsub) => unsub());
    };
  }, [currentUser, dateString]);

  /** sortValueでソートしてから, チェックされてないものを上にする */
  function sortTasks(taskArray: Task[]) {
    let sorted = sort(taskArray, (x) => x.sortValue);
    const uncheckedRoutines = sorted.filter((x) => !x.done);
    const checkedRoutines = sorted.filter((x) => x.done);
    sorted = uncheckedRoutines.concat(checkedRoutines);
    return sorted;
  }

  return (
    <FirebaseContext.Provider
      value={{
        dateString,
        routineArray,
        minTaskSortValue,
        todayTaskArray,
        yesterdayTaskArray,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}
