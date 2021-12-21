import { Repeat } from "models/model";
import { differenceInDays, differenceInWeeks, differenceInMonths, getWeekOfMonth, startOfMonth, getDay } from "date-fns"

export function nthDayOfWeek(date: Date) {
    const firstDay = getDay(startOfMonth(date));
    return getWeekOfMonth(date, { weekStartsOn: firstDay })
}

export function toRepeat(date: Date, repeat: Repeat): boolean {
    switch (repeat.type) {
        case "day":
            const days = differenceInDays(date, repeat.date)
            if (days % repeat.every === 0) {
                return true
            }
            break
        case "week":
            const weeks = differenceInWeeks(date, repeat.date)
            if (weeks % repeat.every === 0) {
                const dow = date.getDay() as (0 | 1 | 2 | 3 | 4 | 5 | 6);
                if (repeat.dayOfWeeks?.includes(dow)) {
                    return true
                }
            }
            break
        case "month":
            const months = differenceInMonths(date, repeat.date)
            if (months % repeat.every === 0) {
                if (repeat.monthType === "sameDay") {
                    if (date.getDate() === repeat.date.getDate()) {
                        return true
                    }
                }
                else if (repeat.monthType === "sameDow") {
                    if (date.getDay() === repeat.date.getDay() && nthDayOfWeek(date) === nthDayOfWeek(repeat.date)) {
                        return true
                    }
                }

            }
            break

    }
    return false

}