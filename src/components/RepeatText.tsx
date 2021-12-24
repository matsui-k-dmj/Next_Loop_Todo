import { Repeat } from "models/model";
import { sort } from "lib/utils";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { nthDayOfWeek } from "lib/repeat";

const dowTexts = "日月火水木金土";

export default function RepeatText({ repeat }: { repeat: Repeat }) {
  const getText = () => {
    switch (repeat.type) {
      case "day":
        if (repeat.every == 1) {
          return "毎日";
        } else {
          return `${repeat.every}日毎`;
        }
      case "week":
        if (repeat.dayOfWeeks == null) break;
        const text = sort(repeat.dayOfWeeks, (x) => x)
          .map((i) => dowTexts[i])
          .join(" ");
        if (repeat.every == 1) {
          return `毎週 ${text}`;
        } else {
          return `${repeat.every}週毎 ${text}`;
        }
      case "month":
        let everyText = "";
        if (repeat.every === 1) {
          everyText = "毎月";
        } else {
          everyText = `${repeat.every}カ月毎`;
        }

        const date = new Date(repeat.date);

        if (repeat.monthType === "sameDay") {
          return `${everyText} ${format(date, "d日", {
            locale: ja,
          })}`;
        } else if (repeat.monthType === "sameDow") {
          return `${everyText} ${format(date, `第${nthDayOfWeek(date)} E曜日`, {
            locale: ja,
          })}`;
        }
    }
  };
  return <>{getText()}</>;
}
