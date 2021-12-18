import Link from "next/link";
import Navbar from "components/Navbar";

import { initialRoutines } from "models/psudo_data";
import RepeatText from "components/RepeatText";

import { css } from "@emotion/react";
import { useState, useRef } from "react";
import { Rountine } from "models/model";

import {
  DragSourceMonitor,
  DropTargetMonitor,
  useDrag,
  useDrop,
  XYCoord,
} from "react-dnd";
import { DnDType } from "lib/constants";
import cloneDeep from "lodash/cloneDeep";

import { AiOutlinePlus } from "react-icons/ai";

const styles = {
  list: css`
    margin-top: 1rem;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
  `,
  item: css`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;

    &:hover {
      background-color: #f8f8f8;
    }
  `,

  addButton: css`
    display: inline-block;
    color: black;
    text-decoration: none;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 5px;
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
  length: number;
  moveItem: (sourceId: number, targetId: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [cursorY, setcursorY] = useState<XYCoord | null>();

  const [dropCollected, connectDrop] = useDrop({
    accept: DnDType.routine,
    collect(monitor: DropTargetMonitor) {
      return {
        isOver: monitor.isOver(),
      };
    },
    hover(item: any, monitor: DropTargetMonitor) {
      setcursorY(monitor.getClientOffset());
    },
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
    collect(monitor: DragSourceMonitor) {
      return { isDragging: monitor.isDragging() };
    },
  });
  connectDrop(connectDrag(ref));

  let isOverStyle = css``;
  if (dropCollected.isOver && ref.current != null && cursorY != null) {
    if (isCursorUpperHalf(ref.current.getBoundingClientRect(), cursorY)) {
      isOverStyle = styles.isOverTop;
    } else {
      isOverStyle = styles.isOverBottom;
    }
  }

  return (
    <div ref={ref}>
      <Link href={`routines/${props.routine.routineId}`}>
        <a
          css={[
            styles.item,
            dragCollected.isDragging && styles.dragged,
            dropCollected.isOver && isOverStyle,
          ]}
        >
          <div>{props.routine.name} </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              flex: "1 0 auto",
            }}
          >
            <RepeatText repeat={props.routine.repeat}></RepeatText>
          </div>
        </a>
      </Link>
    </div>
  );
}

export default function Routines() {
  const [routineArray, setRoutineArray] = useState(() =>
    cloneDeep(initialRoutines)
  );
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
    } else if (targetBorderId === _routineArray.length) {
      // 最後なら　プラス 10万
      sortValue = _routineArray[_routineArray.length - 1].sortValue + 100000;
    } else {
      // 一個前と一個後ろの中点
      sortValue = Math.round(
        (_routineArray[targetBorderId - 1].sortValue +
          _routineArray[targetBorderId].sortValue) /
          2
      );
    }
    itemMoved.sortValue = sortValue;

    _routineArray.splice(sourceItemId, 1); // source を 削除
    if (targetBorderId > sourceItemId) {
      targetBorderId -= 1;
    }
    _routineArray.splice(targetBorderId, 0, itemMoved);
    setRoutineArray(_routineArray);
  }
  return (
    <>
      <Navbar selectedFeature="routines"></Navbar>
      <Link href="routines/new">
        <a css={styles.addButton}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <AiOutlinePlus style={{ marginRight: "0.2rem" }} />
            <span>タスクを追加</span>
          </div>
        </a>
      </Link>
      <div css={styles.list}>
        {routineArray.map((x, i) => {
          return (
            <RoutineItem
              key={x.routineId}
              routine={x}
              i={i}
              length={routineArray.length}
              moveItem={moveItem}
            ></RoutineItem>
          );
        })}
      </div>
    </>
  );
}
