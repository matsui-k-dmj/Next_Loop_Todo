import { BiArrowToRight } from "react-icons/bi";
import { css } from "@emotion/react";
import { ChangeEvent } from "react";
import cloneDeep from "lodash/cloneDeep";
import RepeatText from "components/RepeatText";
import { getDay, parse } from "date-fns";
import { DOW, Repeat, Routine } from "models/model";

const styles = {
  backIcon: css`
    color: black;
    opacity: 0.6;
    font-size: 1.5rem;
    display: flex;
    justify-content: right;
    margin-bottom: 1rem;
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
    margin-top: 0.5rem;
    border-radius: 5px;

    &:hover {
      outline: 2px solid #ddd;
    }
  `,

  repeatSummary: css`
    padding: 0.5rem;
  `,

  repeatContents: css`
    padding: 1rem;
  `,

  repeatContentDetails: css`
    margin-top: 1rem;
  `,

  every: css`
    width: 3.5rem;
    text-align: center;
  `,

  typeSelect: css`
    margin: 0 0.5rem;
  `,

  dateContainer: css`
    margin-top: 1rem;
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

  monthTypeText: css`
    display: inline-block;
    margin-left: 0.3rem;
  `,
};

function SelectDayOfWeeks(props: {
  dayOfWeeks: DOW[];
  onDowChange: (i: DOW) => void;
}) {
  const dowLabels = "日月火水木金土";
  return (
    <div css={styles.dowContainer}>
      {dowLabels.split("").map((label, i) => {
        return (
          <div
            css={[
              styles.dowItem,
              props.dayOfWeeks.includes(i as DOW) && styles.dowItemSelected,
            ]}
            key={label}
            onClick={() => props.onDowChange(i as DOW)}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}

function RadioMonthType(props: {
  repeat: Repeat;
  onMonthTypeChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const sameDayRepeat = { ...props.repeat };
  sameDayRepeat.monthType = "sameDay";
  const sameDowRepeat = { ...props.repeat };
  sameDowRepeat.monthType = "sameDow";
  return (
    <>
      <div>
        <label htmlFor="sameDay">
          <input
            id="sameDay"
            type="radio"
            name="monthType"
            value="sameDay"
            checked={props.repeat.monthType === "sameDay"}
            onChange={props.onMonthTypeChange}
          />
          <div css={styles.monthTypeText}>
            <RepeatText repeat={sameDayRepeat}></RepeatText>
          </div>
        </label>
      </div>

      <div style={{ marginTop: "0.5rem" }}>
        <label htmlFor="sameDow">
          <input
            id="sameDow"
            type="radio"
            name="monthType"
            value="sameDow"
            checked={props.repeat.monthType === "sameDow"}
            onChange={props.onMonthTypeChange}
          />
          <div css={styles.monthTypeText}>
            <RepeatText repeat={sameDowRepeat}></RepeatText>
          </div>
        </label>
      </div>
    </>
  );
}

export default function RoutineDetail({
  routine,
  setRoutine,
  closeDetail,
}: {
  routine: Routine;
  setRoutine: (x: Routine) => void;
  closeDetail: () => void;
}) {
  function onChage(
    event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
  ) {
    if (routine == null) return;
    const newRoutine = cloneDeep(routine);
    const value = event.target.value;
    switch (event.target.name) {
      case "name":
        newRoutine.name = value;
        break;
      case "every":
        newRoutine.repeat.every = parseInt(value);
        break;
      case "date":
        newRoutine.repeat.date = value;
        break;
      case "monthType":
        newRoutine.repeat.monthType = value as "sameDay" | "sameDow";
    }
    setRoutine(newRoutine);
  }

  function onTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    event.preventDefault();
    if (routine == null) return;
    const newRoutine = cloneDeep(routine);

    if (event.target.value === "week" && !routine.repeat.dayOfWeeks) {
      newRoutine.repeat.dayOfWeeks = [
        getDay(parse(routine.repeat.date, "yyyy-MM-dd", new Date())),
      ];
    } else if (event.target.value === "month" && !routine.repeat.monthType) {
      newRoutine.repeat.monthType = "sameDay";
    }
    newRoutine.repeat.type = event.target.value as "day" | "week" | "month";
    setRoutine(newRoutine);
  }

  function onDowChange(i: DOW) {
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
      <a css={styles.backIcon} onClick={closeDetail}>
        <BiArrowToRight />
      </a>
      <div>
        <input
          type="input"
          name="name"
          value={routine.name}
          css={styles.name}
          onChange={onChage}
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
              onChange={onChage}
              name="every"
            />
            <select
              value={routine.repeat.type}
              onChange={onTypeChange}
              css={styles.typeSelect}
              name="type"
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
                name="date"
                value={routine.repeat.date}
                onChange={onChage}
                style={{ marginLeft: "0.5rem" }}
              />
            </div>
            {routine.repeat.type === "week" &&
              routine.repeat.dayOfWeeks != null && (
                <div css={styles.repeatContentDetails}>
                  <SelectDayOfWeeks
                    dayOfWeeks={routine.repeat.dayOfWeeks}
                    onDowChange={onDowChange}
                  ></SelectDayOfWeeks>
                </div>
              )}
            {routine.repeat.type === "month" && (
              <div css={styles.repeatContentDetails}>
                <RadioMonthType
                  repeat={routine.repeat}
                  onMonthTypeChange={onChage}
                ></RadioMonthType>
              </div>
            )}
          </div>
        </details>
      </div>
    </>
  );
}
