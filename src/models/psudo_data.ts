import { Routine } from "./model"
import { sort } from "lib/utils"
import { getDay, subDays } from "date-fns"

const date = new Date()

// 毎日
const breakfast: Routine = {
    routineId: "c209b04f-1109-45ad-9999-092780cde2a4",
    name: "朝食",
    sortValue: 0,
    deleted: false,
    subtaskes: [],
    repeat: {
        type: "day",
        every: 1,
        date: date
    }
}

// 2日ごと
const kintore: Routine = {
    routineId: "e931e101-1e9e-434f-993f-0a7b037d2ac1",
    name: "筋トレ",
    sortValue: 100000,
    deleted: false,
    subtaskes: [],
    repeat: {
        type: "day",
        every: 2,
        date: date
    }
}

// 2日ごと
const kintore2: Routine = {
    routineId: "e931e101-1e9e-434f-993f-0a7b037d2ac2",
    name: "筋トレ2",
    sortValue: 100000,
    deleted: false,
    subtaskes: [],
    repeat: {
        type: "day",
        every: 2,
        date: subDays(date, 1)
    }
}

// 平日
const shukkin: Routine = {
    routineId: "049852f9-9a70-463a-834d-1bfdb23c7fb4",
    name: "出勤だあああああああああああああああああああああああ",
    sortValue: 200000,
    deleted: false,
    subtaskes: [],
    repeat: {
        type: "week",
        every: 1,
        date: date,
        dayOfWeeks: [1, 2, 3, 4, 5]
    }
}

// 2週毎
const souji: Routine = {
    routineId: "665eeeed-0ef4-4e7a-99b5-b2908bf1683f",
    name: "掃除",
    sortValue: 300000,
    deleted: false,
    subtaskes: [],
    repeat: {
        type: "week",
        every: 2,
        date: date,
        dayOfWeeks: [getDay(date)]
    }
}

// 毎月同じ日
const hurikaeri: Routine = {
    routineId: "4cf1c49f-3d03-4cd6-ba34-54d5d11ad85a",
    name: "振り返り",
    sortValue: 400000,
    deleted: false,
    subtaskes: [],
    repeat: {
        type: "month",
        every: 1,
        date: date,
        monthType: "sameDay"
    }
}

// 毎月同じ曜日
const hanseikai: Routine = {
    routineId: "hanseikai",
    name: "反省会",
    sortValue: 400000,
    deleted: false,
    subtaskes: [],
    repeat: {
        type: "month",
        every: 1,
        date: date,
        monthType: "sameDow"
    }
}


export const initialRoutines = sort([breakfast, kintore, kintore2, shukkin, souji, hurikaeri],
    x => x.sortValue)