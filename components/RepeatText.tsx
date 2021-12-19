import { Repeat } from "models/model";
import { sort } from "lib/utils";
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
          return `毎週　${text}`;
        } else {
          return `${repeat.every}週毎　${text}`;
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
