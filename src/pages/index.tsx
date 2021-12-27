import { css } from "@emotion/react";
import Navbar from "components/Navbar";
import { format } from "date-fns";
import ja from "date-fns/locale/ja";
import { Routine, Task } from "models/model";
import { useEffect, useRef, useState } from "react";

import {
  DragSourceMonitor,
  DropTargetMonitor,
  useDrag,
  useDrop,
  XYCoord,
} from "react-dnd";
import { DnDType } from "lib/constants";
import { sort } from "lib/utils";
import { toRepeat } from "lib/repeat";

import { useAuth } from "contexts/AuthContext";
import { db } from "lib/firebaseConfig";

import {
  ref as fbRef,
  set as fbSet,
  onChildAdded,
  onChildChanged,
} from "firebase/database";

const styles = {
  list: css`
    margin-top: 1rem;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
  `,
  item: css`
    padding: 0.5rem 1rem;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;

    &:hover {
      background-color: #f8f8f8;
    }
  `,

  dragged: css`
    opacity: 0.5;
  `,
  isOverTop: css`
    border-top: 1px solid #111;
  `,
  isOverBottom: css`
    border-bottom: 1px solid #111;
  `,

  checkedItem: css`
    opacity: 0.7;
    text-decoration: line-through;
  `,
};

function isCursorUpperHalf(
  boundingRect: DOMRect,
  cursorCoord: XYCoord
): boolean {
  const middle = boundingRect.top + boundingRect.height / 2;
  return cursorCoord.y < middle;
}

function RoutineItem(props: {
  routine: Routine;
  i: number;
  moveItem: (sourceId: number, targetId: number) => void;
  onCheckboxClick: (i: number) => void;
}) {
  // dropとdragに紐づける。getBoundingClientRect にも使う。
  const ref = useRef<HTMLDivElement>(null);

  // monitor.getClientOffset() で取った カーソルの座標
  const [cursorCoord, setcursorY] = useState<XYCoord | null>();

  const [dropCollected, connectDrop] = useDrop({
    accept: DnDType.routine,
    collect(monitor: DropTargetMonitor) {
      return {
        isOver: monitor.isOver() && monitor.canDrop(),
      };
    },
    /**
     * collect は isOverが変化したフレームだけしか呼ばれないが、hoverはhover中常に呼ばれる.
     * それでstateが変更されると全体が実行される。
     */
    hover(item: any, monitor: DropTargetMonitor) {
      setcursorY(monitor.getClientOffset());
    },
    // チェックされてないものだけドラッグできる
    canDrop() {
      return !props.routine.done;
    },
    // カーソルがアイテムの中点のどっちにあるかを判定してtarget borderを決める
    drop(item: { draggedId: number }, monitor: DropTargetMonitor) {
      const cursorOffset = monitor.getClientOffset();
      let borderId = item.draggedId + 1;
      if (ref.current != null && cursorOffset != null) {
        if (
          isCursorUpperHalf(ref.current.getBoundingClientRect(), cursorOffset)
        ) {
          borderId = props.i;
        } else {
          borderId = props.i + 1;
        }
      }
      props.moveItem(item.draggedId, borderId);
    },
  });

  const [dragCollected, connectDrag] = useDrag({
    type: DnDType.routine,
    item() {
      return { draggedId: props.i };
    },
    // チェックされてないものだけ動かせる
    canDrag() {
      return !props.routine.done;
    },
    collect(monitor: DragSourceMonitor) {
      return { isDragging: monitor.isDragging() };
    },
  });
  connectDrop(connectDrag(ref));

  // カーソルがアイテムの中点のどっちにあるかを判定してtarget borderを決める
  let isOverStyle = css``;
  if (dropCollected.isOver && ref.current != null && cursorCoord != null) {
    if (isCursorUpperHalf(ref.current.getBoundingClientRect(), cursorCoord)) {
      isOverStyle = styles.isOverTop;
    } else {
      isOverStyle = styles.isOverBottom;
    }
  }

  return (
    <div
      ref={ref}
      css={[
        styles.item,
        dragCollected.isDragging && styles.dragged,
        dropCollected.isOver && isOverStyle,
        !!props.routine.done && styles.checkedItem,
      ]}
    >
      <input
        type="checkbox"
        id={props.routine.routineId}
        checked={!!props.routine.done}
        onClick={() => {
          props.onCheckboxClick(props.i);
        }}
        readOnly
      />
      <label htmlFor={props.routine.routineId} style={{ paddingLeft: "1rem" }}>
        {props.routine.name}
      </label>
    </div>
  );
}

export default function Home() {
  const today = new Date();
  const todayPath = format(today, "yyyy-MM-dd");
  const { currentUser } = useAuth();
  const [taskArray, setTaskArray] = useState<Task[]>([]);
  const [routinesObj, setRoutinesObj] = useState<{
    [routineId: string]: Routine;
  }>({});

  // routines の watch
  useEffect(() => {
    if (currentUser == null) return;

    const todayRef = fbRef(db, `users/${currentUser.uid}/todo/${todayPath}`);
    const unsubOnChildAdded2 = onChildAdded(todayRef, (data) => {
      setTaskArray((_taskArray) => {
        return sortTasks(_taskArray.concat(data.val()));
      });
    });

    const unsubOnChildChanged2 = onChildChanged(todayRef, (data) => {
      setTaskArray((_taskArray) =>
        sortTasks(
          _taskArray
            .filter((task) => task.routineId !== data.val().routineId)
            .concat(data.val())
        )
      );
    });

    const routinesRef = fbRef(db, `users/${currentUser.uid}/routines`);
    const unsubOnChildAdded = onChildAdded(routinesRef, (data) => {
      const routineId = data.key;
      if (routineId == null) return;

      setRoutinesObj((routinesObj) => {
        return { ...routinesObj, [routineId]: data.val() };
      });
    });

    const unsubOnChildChanged = onChildChanged(routinesRef, (data) => {
      const routineId = data.key;
      if (routineId == null) return;

      setRoutinesObj((routinesObj) => {
        return { ...routinesObj, [routineId]: data.val() };
      });
    });

    return () => {
      unsubOnChildAdded();
      unsubOnChildAdded2();

      unsubOnChildChanged();
      unsubOnChildChanged2();

      setRoutinesObj({});
    };
  }, [currentUser]);

  /** sortValueでソートしてから, チェックされてないものを上にする */
  function sortTasks(taskArray: Task[]) {
    let sorted = sort(taskArray, (x) => x.sortValue);
    const uncheckedRoutines = sorted.filter((x) => !x.done);
    const checkedRoutines = sorted.filter((x) => x.done);
    sorted = uncheckedRoutines.concat(checkedRoutines);
    return sorted;
  }

  /** アイテムの並べ変え。 */
  function moveItem(sourceItemId: number, targetBorderId: number) {
    if (sourceItemId === targetBorderId || sourceItemId + 1 === targetBorderId)
      return;

    // 並べ変え
    const _taskArray = taskArray.concat();
    const itemMoved = _taskArray[sourceItemId];

    // sortValueの更新
    let sortValue = 0;
    if (targetBorderId === 0) {
      // 先頭なら マイナス 10万
      sortValue = _taskArray[0].sortValue - 100000;
    } else if (targetBorderId === _taskArray.filter((x) => !x.done).length) {
      // チェックされてる物のうち最後なら　プラス 10万
      sortValue = _taskArray[targetBorderId - 1].sortValue + 100000;
    } else {
      // 一個前と一個後ろの中点
      sortValue = Math.round(
        (_taskArray[targetBorderId - 1].sortValue +
          _taskArray[targetBorderId].sortValue) /
          2
      );
    }
    itemMoved.sortValue = sortValue;
    // setTaskArray(sortTasks(_taskArray));
  }

  /** チェックボックスをクリックしたらdoneをtoggleする */
  function onChecked(i: number) {
    let _taskArray = taskArray.concat();
    const itemChaged = _taskArray[i];

    itemChaged.done = !itemChaged.done;
    _taskArray.splice(i, 1, itemChaged);
    // setTaskArray(sortTasks(_taskArray));
  }

  Object.values(routinesObj)
    .filter((routine) => toRepeat(today, routine.repeat))
    .forEach((routine) => {
      const task = taskArray.find(
        (task) => task.routineId === routine.routineId
      );
      if (task == null && currentUser != null) {
        fbSet(
          fbRef(
            db,
            `users/${currentUser.uid}/todo/${todayPath}/${routine.routineId}`
          ),
          {
            routineId: routine.routineId,
            done: false,
            sortValue: routine.sortValue,
          }
        );
      }
    });

  return (
    <>
      <Navbar selectedFeature="todo"></Navbar>
      <div>
        <h2>{format(today, "M/d E", { locale: ja })}</h2>
        <div css={styles.list}>
          {taskArray.map((x, i) => {
            const routine = routinesObj[x.routineId];
            if (routine == null) return null;

            if (!toRepeat(today, routine.repeat)) return null;

            return (
              <RoutineItem
                key={x.routineId}
                routine={routine}
                i={i}
                moveItem={moveItem}
                onCheckboxClick={onChecked}
              ></RoutineItem>
            );
          })}
        </div>
      </div>
    </>
  );
}
