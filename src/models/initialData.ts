import { Routine } from "./model";
import { format, subDays } from "date-fns";
const date = format(new Date(), "yyyy-MM-dd");

export const initialRoutines = {
  breakfast: {
    routineId: "breakfast",
    name: "朝食",
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
  kintore2: {
    routineId: "kintore2",
    name: "筋トレ2",
    sortValue: 200000,
    deleted: false,
    subtaskes: [],
    repeat: {
      type: "day",
      every: 2,
      date: format(subDays(new Date(date), 1), "yyyy-MM-dd"),
    },
  },
  shukkin: {
    routineId: "shukkin",
    name: "出勤だあああああああああああああああああああああああ",
    sortValue: 300000,
    deleted: false,
    subtaskes: [],
    repeat: {
      type: "week",
      every: 1,
      date: date,
      dayOfWeeks: [1, 2, 3, 4, 5],
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
      every: 2,
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
      type: "month",
      every: 1,
      date: date,
      monthType: "sameDay",
    },
  },
  hanseikai: {
    routineId: "hanseikai",
    name: "反省会",
    sortValue: 600000,
    deleted: false,
    subtaskes: [],
    repeat: {
      type: "month",
      every: 1,
      date: date,
      monthType: "sameDow",
    },
  },
};
