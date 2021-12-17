import Link from "next/link";
import Navbar from "components/Navbar";

import { routines as initialRoutine } from "models/psudo_data";
import RepeatText from "components/RepeatText";

import { css } from "@emotion/react";
import { useState, useRef } from "react";
import { Rountine } from "models/model";

import {
  DragSourceMonitor,
  DropTargetMonitor,
  useDrag,
  useDrop,
} from "react-dnd";
import { DnDType } from "lib/constants";

const styles = {
  item: css`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #ddd;

    &:hover {
      background-color: #f8f8f8;
    }
  `,

  firstItem: css`
    border-top: 1px solid #ddd;
  `,

  dragged: css`
    opacity: 0.5;
  `,

  isOver: css`
    border-bottom: 1px solid #111;
  `,
};

function RoutineItem(props: {
  routine: Rountine;
  i: number;
  moveItem: (sourceId: number, targetId: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [dropCollected, connectDrop] = useDrop({
    accept: DnDType.routine,
    collect(monitor: DropTargetMonitor) {
      return { isOver: monitor.isOver() };
    },
    drop(item: { draggedId: number }) {
      props.moveItem(item.draggedId, props.i + 1);
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
  return (
    <div ref={ref}>
      <Link href={`routines/${props.routine.routineId}`}>
        <a
          css={[
            styles.item,
            props.i === 0 && styles.firstItem,
            dragCollected.isDragging && styles.dragged,
            dropCollected.isOver && styles.isOver,
          ]}
        >
          <div>{props.routine.name} </div>
          <div>
            <RepeatText repeat={props.routine.repeat}></RepeatText>
          </div>
        </a>
      </Link>
    </div>
  );
}

export default function Routines() {
  const [routineArray, setRoutineArray] = useState(initialRoutine);
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
        <a>タスクを追加</a>
      </Link>
      {routineArray.map((x, i) => {
        return (
          <RoutineItem
            key={x.routineId}
            routine={x}
            i={i}
            moveItem={moveItem}
          ></RoutineItem>
        );
      })}
    </>
  );
}
