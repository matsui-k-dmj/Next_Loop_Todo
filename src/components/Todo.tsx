import { css } from "@emotion/react";
import { format } from "date-fns";
import ja from "date-fns/locale/ja";
import { Routine, Task } from "models/model";
import { useRef, useState } from "react";

import {
  DragSourceMonitor,
  DropTargetMonitor,
  useDrag,
  useDrop,
  XYCoord,
} from "react-dnd";
import { DnDType } from "lib/constants";
import { toRepeat } from "lib/repeat";

import { useAuth } from "contexts/AuthContext";
import { db } from "lib/firebaseConfig";

import { ref as fbRef, set as fbSet } from "firebase/database";
import { VscGripper } from "react-icons/vsc";
import { FaCog } from "react-icons/fa";

import parse from "date-fns/parse";
import Link from "next/link";

const styles = {
  list: css`
    margin-top: 0.2rem;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
  `,
  item: css`
    display: flex;
    align-items: center;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;

    &:hover {
      background-color: #f8f8f8;
    }
  `,

  grip: css`
    display: flex;
    place-items: center;
    padding: 0.8rem;
    margin-right: 0.3rem;

    &:hover {
      background-color: #ddd;
    }
    opacity: 0.5;
    cursor: grab;
  `,

  dragged: css`
    opacity: 0.5;
  `,
  isOverTop: css`
    border-top: 1px solid var(--border-sorting);
  `,
  isOverBottom: css`
    border-bottom: 1px solid var(--border-sorting);
  `,

  checkedItem: css`
    opacity: 0.7;
    text-decoration: line-through;
  `,

  tempCheckedItem: css`
    opacity: 0.7;
    transition: opacity 0.1s ease;
  `,

  cog: css`
    align-self: stretch;
    color: inherit;
    text-decoration: none;
    display: flex;
    align-items: center;

    margin-left: auto;
    padding: 0 0.7rem;

    font-size: 1.2rem;
    opacity: 0.4;

    &:hover {
      background-color: #ddd;
    }
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
  const [tempChecked, setTempChecked] = useState(false);

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

  function onChick() {
    setTempChecked(true);
    setTimeout(() => {
      props.onCheckboxClick(props.i);
      setTempChecked(false);
    }, 100);
  }

  return (
    <div
      ref={ref}
      css={[
        styles.item,
        dragCollected.isDragging && styles.dragged,
        dropCollected.isOver && isOverStyle,
        !!props.done && styles.checkedItem,
        tempChecked && styles.tempCheckedItem,
      ]}
      onClick={onChick}
      className="clickable"
      data-testid="todoItem"
    >
      <div ref={connectDrag} css={styles.grip}>
        <VscGripper></VscGripper>
      </div>{" "}
      <input
        type="checkbox"
        checked={!!props.done}
        readOnly
        className="clickable"
        id={`${props.routine.routineId}-${props.dateString}`}
      />
      <label
        style={{ padding: "0.5rem" }}
        className="clickable"
        htmlFor={`${props.routine.routineId}-${props.dateString}`}
      >
        {props.routine.name}
      </label>
      <Link
        href={{
          pathname: "/routines",
          query: { routineId: props.routine.routineId },
        }}
        passHref
      >
        <a
          css={styles.cog}
          onClick={(event) => event.stopPropagation()}
          className="clickable"
        >
          <FaCog></FaCog>
        </a>
      </Link>
    </div>
  );
}

export default function Todo({
  dateString,
  taskArray,
  routinesObj,
}: {
  dateString: string;
  taskArray: Task[];
  routinesObj: { [routineId: string]: Routine };
}) {
  const { currentUser } = useAuth();

  const date = parse(dateString, "yyyy-MM-dd", new Date());

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
    console.log("checked");
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
