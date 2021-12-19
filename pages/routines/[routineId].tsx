import Link from "next/link";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/router";
import { FaChevronLeft } from "react-icons/fa";
import { css } from "@emotion/react";
import { initialRoutines } from "models/psudo_data";
import { ChangeEvent, useState } from "react";
import cloneDeep from "lodash/cloneDeep";
import RepeatText from "components/RepeatText";
import { format, getDay } from "date-fns";
import { Repeat } from "models/model";

const styles = {
  backIcon: css`
    color: black;
    font-size: 1.5rem;
  `,

  name: css`
    font-size: 1.5rem;
    border: 0px;
    border-radius: 5px;
    width: 100%;
    padding: 0.5rem;

    &:focus,
    &:hover {
      outline: 2px solid #ddd;
    }
  `,

  repeatContainer: css`
    margin-left: 0.5rem;
  `,

  repeatSummary: css`
    margin-top: 0.5rem;
  `,

  repeatContents: css`
    margin: 1rem;
  `,

  every: css`
    width: 3.5rem;
    text-align: center;
  `,

  typeSelect: css`
    margin: 0 0.5rem;
  `,

  dateContainer: css`
    margin: 1rem 0;
  `,

  dowContainer: css`
    display: flex;
    gap: 0.5rem;
  `,
  dowItem: css`
    padding: 0.3rem 0.5rem;
    border: 2px solid #ddd;
    border-radius: 5px;
    &:hover {
      background-color: #f8f8f8;
    }
  `,
  dowItemSelected: css`
    background-color: #ddd;
    &:hover {
      background-color: #ccc;
    }
  `,
};

function SelectDayOfWeeks(props: {
  dayOfWeeks: (0 | 1 | 2 | 3 | 4 | 5 | 6)[];
  onDowChange: (i: 0 | 1 | 2 | 3 | 4 | 5 | 6) => void;
}) {
  const dowLabels = "日月火水木金土";
  return (
    <div css={styles.dowContainer}>
      {dowLabels.split("").map((label, i) => {
        return (
          <div
            css={[
              styles.dowItem,
              props.dayOfWeeks.includes(i as 0 | 1 | 2 | 3 | 4 | 5 | 6) &&
                styles.dowItemSelected,
            ]}
            key={label}
            onClick={() => props.onDowChange(i as 0 | 1 | 2 | 3 | 4 | 5 | 6)}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}

export default function RoutineDetail() {
  const router = useRouter();
  const { routineId } = router.query;
  const [routine, setRoutine] = useState(
    cloneDeep(initialRoutines.find((x) => x.routineId === routineId))
  );

  function onNameChage(event: ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    if (routine == null) return;
    const newRoutine = { ...routine, name: event.target.value };
    setRoutine(newRoutine);
  }

  function onEveryChage(event: ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    if (routine == null) return;
    const newRoutine = {
      ...routine,
      repeat: { ...routine.repeat, every: parseInt(event.target.value) },
    };
    setRoutine(newRoutine);
  }

  function onTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    event.preventDefault();
    if (routine == null) return;
    if (event.target.value === "week" && !routine.repeat.dayOfWeeks) {
      routine.repeat.dayOfWeeks = [getDay(routine.repeat.date)];
    } else if (event.target.value === "month" && !routine.repeat.monthType) {
      routine.repeat.monthType = "sameDay";
    }
    const newRoutine = {
      ...routine,
      repeat: {
        ...routine.repeat,
        type: event.target.value as "day" | "week" | "month",
      },
    };
    setRoutine(newRoutine);
  }

  function onDateChange(event: ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    if (routine == null) return;
    const newRoutine = {
      ...routine,
      repeat: {
        ...routine.repeat,
        date: new Date(event.target.value),
      },
    };
    setRoutine(newRoutine);
  }

  function onDowChange(i: 0 | 1 | 2 | 3 | 4 | 5 | 6) {
    if (routine == null) return;
    const newRoutine = cloneDeep(routine);
    if (newRoutine.repeat.dayOfWeeks == null) {
      newRoutine.repeat.dayOfWeeks = [i];
    } else {
      if (newRoutine.repeat.dayOfWeeks.includes(i)) {
        newRoutine.repeat.dayOfWeeks = newRoutine.repeat.dayOfWeeks.filter(
          (x) => x !== i
        );
      } else {
        newRoutine.repeat.dayOfWeeks.push(i);
      }
    }
    setRoutine(newRoutine);
  }

  if (routine == null) {
    return <div> Not Found </div>;
  }
  return (
    <>
      <Navbar selectedFeature="routines"></Navbar>
      <Link href="/routines">
        <a css={styles.backIcon}>
          <FaChevronLeft />
        </a>
      </Link>
      <div>
        <input
          type="input"
          value={routine.name}
          read-only
          css={styles.name}
          onChange={onNameChage}
        />
        <details css={styles.repeatContainer}>
          <summary css={styles.repeatSummary}>
            繰り返し: <RepeatText repeat={routine.repeat} />
          </summary>
          <div css={styles.repeatContents}>
            <input
              type="number"
              step="1"
              value={routine.repeat.every}
              css={styles.every}
              read-only
              onChange={onEveryChage}
            />
            <select
              value={routine.repeat.type}
              onChange={onTypeChange}
              css={styles.typeSelect}
            >
              <option value="day">日</option>
              <option value="week">週</option>
              <option value="month">月</option>
            </select>
            毎 <br />
            <div css={styles.dateContainer}>
              開始日:
              <input
                type="date"
                value={format(routine.repeat.date, "yyyy-MM-dd")}
                onChange={onDateChange}
                style={{ marginLeft: "0.5rem" }}
              />
            </div>
            {routine.repeat.type === "week" &&
              routine.repeat.dayOfWeeks != null && (
                <SelectDayOfWeeks
                  dayOfWeeks={routine.repeat.dayOfWeeks}
                  onDowChange={onDowChange}
                ></SelectDayOfWeeks>
              )}
            {routine.repeat.type === "month" && <div>months</div>}
          </div>
        </details>
      </div>
    </>
  );
}
