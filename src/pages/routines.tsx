import Navbar from "components/Navbar";

import RepeatText from "components/RepeatText";

import { css } from "@emotion/react";
import { useState, useRef, useEffect } from "react";
import { Routine } from "models/model";

import {
  DragSourceMonitor,
  DropTargetMonitor,
  useDrag,
  useDrop,
  XYCoord,
} from "react-dnd";
import { DnDType } from "lib/constants";

import { AiOutlinePlus } from "react-icons/ai";
import { useAuth } from "contexts/AuthContext";
import { db } from "lib/firebaseConfig";

import {
  ref as fbRef,
  set as fbSet,
  onChildAdded,
  onChildChanged,
  push as fbPush,
} from "firebase/database";

import { sort } from "lib/utils";
import RoutineDetail from "components/RoutineDetail";
import { format } from "date-fns";

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
    background-color: #f8f8f8;
    text-decoration: none;
    padding: 0.3rem;
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

  routineDetail: css`
    flex: 0 0 22rem;
    margin-left: 0.5rem;
    padding-left: 1rem;
    border-left: 2px solid #ddd;
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
  length: number;
  moveItem: (sourceId: number, targetId: number) => void;
  selectItem: (routineId: string) => void;
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
      <a
        css={[
          styles.item,
          dragCollected.isDragging && styles.dragged,
          dropCollected.isOver && isOverStyle,
        ]}
        onClick={() => {
          props.selectItem(props.routine.routineId);
        }}
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
    </div>
  );
}

export default function Routines() {
  const [routineArray, setRoutineArray] = useState<Routine[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>();

  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser == null) return;
    const routinesRef = fbRef(db, `users/${currentUser.uid}/routines`);
    const unsubOnChildAdded = onChildAdded(routinesRef, (data) => {
      setRoutineArray((routineArray) =>
        sort(routineArray.concat(data.val()), (x) => x.sortValue)
      );
    });
    const unsubOnChildChanged = onChildChanged(routinesRef, (data) => {
      console.log({ onChildChanged: data, key: data.key, value: data.val() });
      setRoutineArray((routineArray) => {
        return sort(
          routineArray
            .filter((routine) => routine.routineId !== data.key)
            .concat(data.val()),
          (x) => x.sortValue
        );
      });
    });

    return () => {
      unsubOnChildAdded();
      unsubOnChildChanged();
      setRoutineArray([]);
    };
  }, [currentUser]);

  function fbSetNewRoutine(newRoutine: Routine) {
    if (currentUser == null) return;
    fbSet(
      fbRef(db, `users/${currentUser.uid}/routines/${newRoutine.routineId}`),
      newRoutine
    );
  }

  function createNewRoutine() {
    if (currentUser == null) return;
    const newRoutineRef = fbPush(
      fbRef(db, `users/${currentUser.uid}/routines`)
    );
    const initialRoutine: Routine = {
      routineId: newRoutineRef.key as string,
      name: "",
      sortValue: routineArray[0].sortValue - 100000,
      deleted: false,
      subtaskes: [],
      repeat: {
        type: "day",
        every: 1,
        date: format(new Date(), "yyyy-MM-dd"),
      },
    };

    setSelectedRoutineId(initialRoutine.routineId);
    setShowDetail(true);
    fbSetNewRoutine(initialRoutine);
  }

  function moveItem(sourceItemId: number, targetBorderId: number) {
    if (sourceItemId === targetBorderId || sourceItemId + 1 === targetBorderId)
      return;

    // 並べ変え
    const _routineArray = routineArray.concat();
    const movedRoutine = _routineArray[sourceItemId];

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
    movedRoutine.sortValue = sortValue;

    _routineArray.splice(sourceItemId, 1); // source を 削除
    if (targetBorderId > sourceItemId) {
      targetBorderId -= 1;
    }
    _routineArray.splice(targetBorderId, 0, movedRoutine);
    setRoutineArray(_routineArray);
    fbSetNewRoutine(movedRoutine);
  }

  function selectItem(routineId: string) {
    setSelectedRoutineId(routineId);
    setShowDetail(true);
  }

  function renderRoutineDetail() {
    if (!showDetail) return;

    const routine = routineArray.find((x) => x.routineId === selectedRoutineId);
    if (routine == null) return;

    return (
      <div css={styles.routineDetail}>
        <RoutineDetail
          routine={routine}
          setRoutine={(newRoutine) => {
            setRoutineArray((routineArray) => {
              return sort(
                routineArray
                  .filter(
                    (routine) => routine.routineId !== newRoutine.routineId
                  )
                  .concat(newRoutine),
                (x) => x.sortValue
              );
            });
            fbSetNewRoutine(newRoutine);
          }}
          closeDetail={() => {
            setShowDetail(false);
          }}
        ></RoutineDetail>
      </div>
    );
  }

  return (
    <>
      <Navbar selectedFeature="routines"></Navbar>
      <div style={{ display: "flex" }}>
        <div style={{ flex: "1 1 auto" }}>
          <button css={styles.addButton} onClick={createNewRoutine}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <AiOutlinePlus style={{ marginRight: "0.2rem" }} />
              <span>タスクを追加</span>
            </div>
          </button>
          <div css={styles.list}>
            {routineArray.map((x, i) => {
              return (
                <RoutineItem
                  key={x.routineId}
                  routine={x}
                  i={i}
                  length={routineArray.length}
                  moveItem={moveItem}
                  selectItem={selectItem}
                ></RoutineItem>
              );
            })}
          </div>
        </div>
        {renderRoutineDetail()}
      </div>
    </>
  );
}
