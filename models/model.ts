export type DataOfAUser = {
    routines: Rountine[],
    todos: DailyTodo[],
    logs: Log[]
}

export type Rountine = {
    routineId: string,
    name: string,
    sortValue: number,
    deleted: boolean,
    repeat: Repeat,
    subtaskes: Subtask[]
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
    dayOfWeeks?: (0 | 1 | 2 | 3 | 4 | 5 | 6)[], // 日曜が0
}

export type DailyTodo = {
    date: Date,
    tasks: Task[]
}

export type Task = {
    routineId: string,
    name: string,
    sortValue: number,
    done: boolean,
    subtasks: Subtask[]
}

export type Log = {
    routineId: string,
    year_month: {
        [key: string]: number[] // 2022_4: [1, 5, 31]
    }
}