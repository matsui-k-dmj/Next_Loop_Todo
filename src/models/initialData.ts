import { Routine } from "./model";
import { format, subDays } from "date-fns";
const date = format(new Date(), "yyyy-MM-dd");

export const initialRoutines = {
  nikki: {
    routineId: "nikki",
    name: "日記",
    sortValue: 0,
    deleted: false,
    subtaskes: [],
    repeat: {
      type: "day",
      every: 1,
      date: date,
    },
  },
  kintore: {
    routineId: "kintore",
    name: "筋トレ",
    sortValue: 100000,
    deleted: false,
    subtaskes: [],
    repeat: {
      type: "day",
      every: 2,
      date: date,
    },
  },
  post: {
    routineId: "post",
    name: "ポスト確認",
    sortValue: 200000,
    deleted: false,
    subtaskes: [],
    repeat: {
      type: "day",
      every: 3,
      date: date,
    },
  },
  gomisute: {
    routineId: "gomisute",
    name: "ゴミ捨て確認",
    sortValue: 300000,
    deleted: false,
    subtaskes: [],
    repeat: {
      type: "week",
      every: 1,
      date: date,
      dayOfWeeks: [0, 1, 2, 3, 4],
    },
  },
  souji: {
    routineId: "souji",
    name: "掃除",
    sortValue: 400000,
    deleted: false,
    subtaskes: [],
    repeat: {
      type: "week",
      every: 1,
      date: date,
      dayOfWeeks: [6],
    },
  },
  hurikaeri: {
    routineId: "hurikaeri",
    name: "振り返り",
    sortValue: 500000,
    deleted: false,
    subtaskes: [],
    repeat: {
      type: "week",
      every: 1,
      date: date,
      dayOfWeeks: [5],
    },
  },
};
