export type DOW = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Routine = {
  routineId: string;
  name: string;
  sortValue: number;
  deleted: boolean;
  repeat: Repeat;
  subtaskes: Subtask[];
};

export type Subtask = {
  name: string;
  sortValue: number;
  done?: boolean;
};

export type Repeat = {
  type: "day" | "week" | "month";
  every: number;
  date: string;
  dayOfWeeks?: DOW[]; // 日曜が0
  monthType?: "sameDay" | "sameDow";
};

export type Task = {
  taskId: string;
  routineId: string;
  sortValue: number;
  done: boolean;
};

export type TaskList = {
  [routineId: string]: Task;
};

export type Todo = {
  [date: string]: {
    tasks: TaskList;
  };
};
