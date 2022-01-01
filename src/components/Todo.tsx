import { css } from "@emotion/react";
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
  get as fbGet,
  push as fbPush,
} from "firebase/database";
import { VscGripper } from "react-icons/vsc";

const styles = {
  list: css`
    margin-top: 0.2rem;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
  `,
  item: css`
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem 0.5rem 0.1rem;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;

    &:hover {
      background-color: #f8f8f8;
    }
  `,

  grip: css`
    display: flex;
    place-items: center;
    padding: 0 0.3rem;
    margin: 0 0.2rem;
    border-radius: 1rem;
    &:hover {
      background-color: #eee;
    }
    opacity: 0.5;
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
  done: boolean;
  i: number;
  dateString: string;
  moveItem: (sourceId: number, targetId: number) => void;
  onCheckboxClick: (i: number) => void;
}) {
  // dropとdragに紐づける。getBoundingClientRect にも使う。
  const ref = useRef<HTMLDivElement>(null);

  // monitor.getClientOffset() で取った カーソルの座標
  const [cursorCoord, setcursorY] = useState<XYCoord | null>();

  const [dropCollected, connectDrop] = useDrop({
    accept: DnDType.routine + props.dateString,
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
      return !props.done;
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

  const [dragCollected, connectDrag, connectPreview] = useDrag({
    type: DnDType.routine + props.dateString,
    item() {
      return { draggedId: props.i };
    },
    // チェックされてないものだけ動かせる
    canDrag() {
      return !props.done;
    },
    collect(monitor: DragSourceMonitor) {
      return { isDragging: monitor.isDragging() };
    },
  });
  connectDrop(connectPreview(ref));

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
        !!props.done && styles.checkedItem,
      ]}
    >
      <div ref={connectDrag} css={styles.grip}>
        <VscGripper></VscGripper>
      </div>{" "}
      <input
        type="checkbox"
        id={props.routine.routineId + props.dateString}
        checked={!!props.done}
        onClick={() => {
          props.onCheckboxClick(props.i);
        }}
        readOnly
      />
      <label
        htmlFor={props.routine.routineId + props.dateString}
        style={{ paddingLeft: "0.5rem" }}
      >
        {props.routine.name}
      </label>
    </div>
  );
}

export default function Todo({ date }: { date: Date }) {
  const dateString = format(date, "yyyy-MM-dd");
  const { currentUser } = useAuth();
  const [taskArray, setTaskArray] = useState<Task[]>([]);
  const [routinesObj, setRoutinesObj] = useState<{
    [routineId: string]: Routine;
  }>({});

  useEffect(() => {
    const todayRef = fbRef(db, `users/${currentUser.uid}/todo/${dateString}`);
    const routinesRef = fbRef(db, `users/${currentUser.uid}/routines`);

    // 新しい日のTODOの初期化処理
    fbGet(todayRef).then((todoData) => {
      // すでにRoutinesからupdateで作られてるtaskをもう一度作らないために必要
      let createdRoutineIds: string[] = [];
      if (todoData.val()) {
        createdRoutineIds = Object.values(todoData.val()).map((task) => {
          const _task = task as Task;
          return _task.routineId;
        });
      } else {
        createdRoutineIds = [];
      }

      fbGet(routinesRef).then((routineData) => {
        Object.values(routineData.val())
          .filter((routine) => {
            const _routine = routine as Routine;
            return (
              toRepeat(date, _routine.repeat) &&
              !createdRoutineIds.includes(_routine.routineId)
            );
          })
          .forEach((routine) => {
            const _routine = routine as Routine;

            const newRef = fbPush(
              fbRef(db, `users/${currentUser.uid}/todo/${dateString}`)
            );

            fbSet(newRef, {
              taskId: newRef.key,
              routineId: _routine.routineId,
              done: false,
              sortValue: _routine.sortValue,
            });
          });
      });
    });

    const unsubOnChildAdded2 = onChildAdded(todayRef, (data) => {
      setTaskArray((_taskArray) =>
        sortTasks(
          _taskArray
            .filter((task) => task.routineId !== data.val().routineId)
            .concat(data.val())
        )
      );
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
  }, [currentUser, dateString, date]);

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
    fbSet(
      fbRef(
        db,
        `users/${currentUser.uid}/todo/${dateString}/${itemMoved.taskId}`
      ),
      itemMoved
    );
  }

  /** チェックボックスをクリックしたらdoneをtoggleする */
  function onChecked(i: number) {
    let _taskArray = taskArray.concat();
    const itemChaged = _taskArray[i];

    itemChaged.done = !itemChaged.done;
    _taskArray.splice(i, 1, itemChaged);
    fbSet(
      fbRef(
        db,
        `users/${currentUser.uid}/todo/${dateString}/${itemChaged.taskId}`
      ),
      itemChaged
    );
  }

  return (
    <>
      <div>
        <h2>{format(date, "M/d E", { locale: ja })}</h2>
        <div css={styles.list}>
          {taskArray.map((task, i) => {
            const routine = routinesObj[task.routineId];
            if (routine == null) return null;
            if (!toRepeat(date, routine.repeat)) return null;

            return (
              <RoutineItem
                key={task.routineId}
                routine={routine}
                done={task.done}
                i={i}
                dateString={dateString}
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
