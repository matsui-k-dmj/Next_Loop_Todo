import Navbar from "components/Navbar";

import RepeatText from "components/RepeatText";

import { css } from "@emotion/react";
import { useState, useRef, useEffect } from "react";
import { Routine, Task } from "models/model";

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
  push as fbPush,
  update as fbUpdate,
  remove,
} from "firebase/database";

import RoutineDetail from "components/RoutineDetail";
import { format } from "date-fns";
import { VscGripper } from "react-icons/vsc";
import { useFirebase } from "contexts/FirebaseContext";
import { useRouter } from "next/router";

const styles = {
  list: css`
    margin-top: 1rem;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    max-height: 70vh;
    overflow: auto;
  `,
  item: css`
    background-color: white;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #ddd;
    padding-right: 0.8rem;

    &:hover {
      background-color: #f8f8f8;
    }
  `,

  selectedItem: css`
    background-color: #f1f2fc;
    &:hover {
      background-color: #f1f2fc;
    }
  `,

  addButton: css`
    display: inline-block;
    color: black;
    background-color: #fff;
    text-decoration: none;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 5px;
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

  routineDetail: css`
    flex: 0 0 23rem;
    margin-left: 0.5rem;
    padding-left: 1rem;
    padding-right: 1rem;
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
  isSelected: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
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

  const [dragCollected, connectDrag, connectPreview] = useDrag({
    type: DnDType.routine,
    item() {
      return { draggedId: props.i };
    },
    collect(monitor: DragSourceMonitor) {
      return { isDragging: monitor.isDragging() };
    },
  });

  connectDrop(connectPreview(ref));

  let isOverStyle = css``;
  if (dropCollected.isOver && ref.current != null && cursorY != null) {
    if (isCursorUpperHalf(ref.current.getBoundingClientRect(), cursorY)) {
      isOverStyle = styles.isOverTop;
    } else {
      isOverStyle = styles.isOverBottom;
    }
  }

  return (
    <button
      ref={ref}
      className="clickable"
      data-testid="routineItem"
      css={[
        styles.item,
        dragCollected.isDragging && styles.dragged,
        dropCollected.isOver && isOverStyle,
        props.isSelected && styles.selectedItem,
      ]}
      onClick={() => {
        props.selectItem(props.routine.routineId);
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div ref={connectDrag} css={styles.grip}>
          <VscGripper></VscGripper>
        </div>
        <div style={{ padding: "0.5rem" }}>{props.routine.name}</div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          flex: "1 0 auto",
        }}
      >
        <RepeatText repeat={props.routine.repeat}></RepeatText>
      </div>
    </button>
  );
}

export default function Routines() {
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>();

  const { currentUser } = useAuth();
  const { routineArray, minTaskSortValue } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (selectedRoutineId == null) {
      if (typeof router.query.routineId === "string") {
        setSelectedRoutineId(router.query.routineId);
        setShowDetail(true);
      }
    }
  }, []);

  function fbSetRoutine(newRoutine: Routine) {
    if (currentUser == null) return;
    fbSet(
      fbRef(db, `users/${currentUser.uid}/routines/${newRoutine.routineId}`),
      newRoutine
    );
  }

  function createNewRoutine() {
    console.log("createNewRoutine");
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

    const updates: any = {};
    updates[`users/${currentUser.uid}/routines/${initialRoutine.routineId}`] =
      initialRoutine;

    // new task for today
    const todayPath = format(new Date(), "yyyy-MM-dd");
    const newRef = fbPush(
      fbRef(db, `users/${currentUser.uid}/todo/${todayPath}`)
    );
    const task: Task = {
      taskId: newRef.key as string,
      routineId: initialRoutine.routineId,
      done: false,
      sortValue: minTaskSortValue
        ? minTaskSortValue - 1000000
        : initialRoutine.sortValue,
    };
    updates[`users/${currentUser.uid}/todo/${todayPath}/${newRef.key}`] = task;
    fbUpdate(fbRef(db), updates);
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
    fbSetRoutine(movedRoutine);
  }

  function selectItem(routineId: string) {
    setSelectedRoutineId(routineId);
    setShowDetail(true);
  }

  function removeRoutine(routineId: string) {
    remove(fbRef(db, `users/${currentUser.uid}/routines/${routineId}`));
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
            fbSetRoutine(newRoutine);
          }}
          closeDetail={() => {
            setShowDetail(false);
          }}
          removeRoutine={removeRoutine}
        ></RoutineDetail>
      </div>
    );
  }

  return (
    <>
      <Navbar selectedFeature="routines"></Navbar>
      <div style={{ display: "flex" }}>
        {(!showDetail || document.documentElement.clientWidth > 600) && (
          <div style={{ flex: "1 1 auto" }}>
            <button
              css={styles.addButton}
              onClick={createNewRoutine}
              className="clickable"
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <AiOutlinePlus style={{ marginRight: "0.2rem" }} />
                <span>ルーティンを追加</span>
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
                    isSelected={x.routineId === selectedRoutineId && showDetail}
                  ></RoutineItem>
                );
              })}
            </div>
          </div>
        )}

        {renderRoutineDetail()}
      </div>
    </>
  );
}
