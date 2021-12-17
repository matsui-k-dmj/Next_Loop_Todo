import { css } from "@emotion/react";
import Navbar from "components/Navbar";
import { format } from "date-fns";
import ja from "date-fns/locale/ja";
import { Rountine } from "models/model";

import { initialRoutines } from "models/psudo_data";
import cloneDeep from "lodash/cloneDeep";
import { useRef, useState } from "react";

import {
  DragSourceMonitor,
  DropTargetMonitor,
  useDrag,
  useDrop,
  XYCoord,
} from "react-dnd";
import { DnDType } from "lib/constants";
import { sort } from "lib/utils";

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
  routine: Rountine;
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
  const [routineArray, setRoutineArray] = useState(() =>
    cloneDeep(initialRoutines)
  );

  /** sortValueでソートしてから, チェックされてないものを上にする */
  function sortRoutines(routineArray: Rountine[]) {
    let sorted = sort(routineArray, (x) => x.sortValue);
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
    const _routineArray = routineArray.concat();
    const itemMoved = _routineArray[sourceItemId];

    // sortValueの更新
    let sortValue = 0;
    if (targetBorderId === 0) {
      // 先頭なら マイナス 10万
      sortValue = _routineArray[0].sortValue - 100000;
    } else if (targetBorderId === _routineArray.filter((x) => !x.done).length) {
      // チェックされてる物のうち最後なら　プラス 10万
      sortValue = _routineArray[targetBorderId - 1].sortValue + 100000;
    } else {
      // 一個前と一個後ろの中点
      sortValue = Math.round(
        (_routineArray[targetBorderId - 1].sortValue +
          _routineArray[targetBorderId].sortValue) /
          2
      );
    }
    itemMoved.sortValue = sortValue;
    setRoutineArray(sortRoutines(_routineArray));
  }

  /** チェックボックスをクリックしたらdoneをtoggleする */
  function onChecked(i: number) {
    let _routineArray = routineArray.concat();
    const itemChaged = _routineArray[i];

    itemChaged.done = !itemChaged.done;
    _routineArray.splice(i, 1, itemChaged);
    setRoutineArray(sortRoutines(_routineArray));
  }

  return (
    <>
      <Navbar selectedFeature="todo"></Navbar>
      <div>
        <h2>{format(new Date(), "M/d E", { locale: ja })}</h2>
        <div css={styles.list}>
          {routineArray.map((x, i) => {
            return (
              <RoutineItem
                key={x.routineId}
                routine={x}
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
