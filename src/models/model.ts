export type DataOfAUser = {
    routines: Rountine[],
    todos: DailyTodo[],
    logs: Log[]
}

export type DOW = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type Rountine = {
    routineId: string,
    name: string,
    sortValue: number,
    deleted: boolean,
    repeat: Repeat,
    subtaskes: Subtask[]
    done?: boolean,
}

export type Subtask = {
    name: string,
    sortValue: number,
    done?: boolean
}

export type Repeat = {
    type: "day" | "week" | "month",
    every: number,
    date: Date,
    dayOfWeeks?: DOW[], // 日曜が0
    monthType?: "sameDay" | "sameDow"
}

export type DailyTodo = {
    date: Date,
    tasks: Rountine[]
}

export type Log = {
    routineId: string,
    year_month: {
        [key: string]: number[] // 2022_4: [1, 5, 31]
    }
}