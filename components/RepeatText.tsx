import { Repeat } from "models/model";
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
        const text = repeat.dayOfWeeks.map((i) => dowTexts[i]).join(" ");
        if (repeat.every == 1) {
          return text;
        } else {
          return `${repeat.every}週毎 ${text}`;
        }
      case "month":
        if (repeat.every == 1) {
          return "毎月";
        } else {
          return `${repeat.every}カ月毎`;
        }
    }
  };
  return <>{getText()}</>;
}
