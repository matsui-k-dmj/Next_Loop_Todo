import { BiArrowToRight } from "react-icons/bi";
import { MdOutlineArchive } from "react-icons/md";
import { css } from "@emotion/react";
import { ChangeEvent, useEffect, useRef } from "react";
import cloneDeep from "lodash/cloneDeep";
import RepeatText from "components/RepeatText";
import { addDays, format, getDay, parse } from "date-fns";
import { DOW, Repeat, Routine } from "models/model";

const styles = {
  backIcon: css`
    color: black;
    opacity: 0.6;
    font-size: 1.8rem;
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  `,

  name: css`
    font-size: 1.2rem;
    border: 0px;
    border-radius: 5px;
    width: 100%;
    padding: 0.5rem;
    resize: none;

    &:focus,
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
    margin-top: 1.2rem;
  `,

  every: css`
    width: 3.5rem;
    text-align: center;
    height: 2rem;
  `,

  typeSelect: css`
    margin: 0 0.5rem;
    height: 2rem;
  `,

  dateContainer: css`
    margin-top: 1rem;
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  `,
  dateButtonsContainer: css`
    margin-top: 1rem;
    display: flex;
    gap: 1rem;
  `,
  dateButton: css`
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 0.3rem 0.5rem;
    &:hover {
      background-color: #f8f8f8;
    }
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
  deleteButton: css`
    background-color: #fff;
    border: 1px solid #ddd;
    padding: 0.5rem;
    margin-top: 2rem;
    border-radius: 5px;
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
            className="clickable"
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
        <label htmlFor="sameDay" className="clickable">
          <input
            id="sameDay"
            type="radio"
            name="monthType"
            value="sameDay"
            checked={props.repeat.monthType === "sameDay"}
            onChange={props.onMonthTypeChange}
            className="clickable"
          />
          <div css={styles.monthTypeText}>
            <RepeatText repeat={sameDayRepeat}></RepeatText>
          </div>
        </label>
      </div>

      <div style={{ marginTop: "0.5rem" }}>
        <label htmlFor="sameDow" className="clickable">
          <input
            id="sameDow"
            type="radio"
            name="monthType"
            value="sameDow"
            checked={props.repeat.monthType === "sameDow"}
            onChange={props.onMonthTypeChange}
            className="clickable"
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
  removeRoutine,
}: {
  routine: Routine;
  setRoutine: (x: Routine) => void;
  closeDetail: () => void;
  removeRoutine: (routineId: string) => void;
}) {
  const nameInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // タイトルのtextareaのサイズを調整
    autoGrowTextarea(nameInputRef.current);
  });

  useEffect(() => {
    // routineのnameが無いときにname input にfocusする
    if (nameInputRef.current != null && routine.name === "") {
      nameInputRef.current.focus();
    }
  });

  useEffect(() => {
    // ブラウザバックしたときにurlが戻るのを防いで、detailだけ閉じる
    if (!window.history.state.preventBack) {
      window.history.pushState({ preventBack: true }, "");
    }
    window.addEventListener("popstate", closeDetail);
    return () => {
      window.removeEventListener("popstate", closeDetail);
      if (window.history.state.preventBack) {
        window.history.back();
      }
    };
  }, []);

  function onChage(
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLSelectElement>
      | ChangeEvent<HTMLTextAreaElement>
  ) {
    if (routine == null) return;
    const newRoutine = cloneDeep(routine);
    const value = event.target.value;
    switch (event.target.name) {
      case "name":
        newRoutine.name = value;
        break;
      case "every":
        newRoutine.repeat.every = value === "" ? 0 : parseInt(value);
        break;
      case "date":
        newRoutine.repeat.date = value;
        break;
      case "monthType":
        newRoutine.repeat.monthType = value as "sameDay" | "sameDow";
    }
    setRoutine(newRoutine);
  }

  function changeDate(days: number) {
    if (routine == null) return;
    const newRoutine = cloneDeep(routine);
    newRoutine.repeat.date = format(addDays(new Date(), days), "yyyy-MM-dd");
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

  function autoGrowTextarea(element: HTMLTextAreaElement | null) {
    if (element == null) return;

    element.style.height = "auto";
    element.style.height = element.scrollHeight + "px";
  }

  if (routine == null) {
    return <div> Not Found </div>;
  }

  return (
    <>
      <a css={styles.backIcon} onClick={closeDetail}>
        <BiArrowToRight className="clickable" />
        <MdOutlineArchive
          className="clickable"
          onClick={() => {
            removeRoutine(routine.routineId);
            closeDetail();
          }}
        />
      </a>
      <div>
        <textarea
          name="name"
          value={routine.name}
          css={styles.name}
          onChange={onChage}
          ref={nameInputRef}
          placeholder="ルーティン名を入力"
          rows={1}
          onInput={() => {
            autoGrowTextarea(nameInputRef.current);
          }}
        />
        <div>
          <div css={styles.repeatContents}>
            <input
              type="number"
              step="1"
              value={routine.repeat.every === 0 ? "" : routine.repeat.every}
              css={styles.every}
              onChange={onChage}
              name="every"
            />
            <select
              value={routine.repeat.type}
              onChange={onTypeChange}
              css={styles.typeSelect}
              name="type"
              className="clickable"
            >
              <option value="day">日</option>
              <option value="week">週</option>
              <option value="month">月</option>
            </select>
            毎 <br />
            <div css={styles.dateContainer}>
              <div>開始日:</div>
              <div>
                <input
                  type="date"
                  name="date"
                  value={routine.repeat.date}
                  onChange={onChage}
                  className="clickable"
                />
                <div css={styles.dateButtonsContainer}>
                  <button
                    css={styles.dateButton}
                    className="clickable"
                    onClick={() => {
                      changeDate(-1);
                    }}
                  >
                    昨日
                  </button>
                  <button
                    css={styles.dateButton}
                    className="clickable"
                    onClick={() => {
                      changeDate(0);
                    }}
                  >
                    今日
                  </button>
                  <button
                    css={styles.dateButton}
                    className="clickable"
                    onClick={() => {
                      changeDate(1);
                    }}
                  >
                    明日
                  </button>
                </div>
              </div>
            </div>
            {routine.repeat.type === "week" && (
              <div css={styles.repeatContentDetails}>
                <SelectDayOfWeeks
                  dayOfWeeks={routine.repeat.dayOfWeeks ?? []}
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
        </div>
      </div>
    </>
  );
}
