import { toRepeat } from "lib/repeat"
import { Repeat } from "models/model"
import { addDays } from "date-fns";

const startDate = new Date("2021,12,31") // 金曜日

describe('toRepeat', () => {
    it('毎日', () => {
        const repeat: Repeat = {
            type: "day",
            every: 1,
            date: startDate
        }
        expect(toRepeat(startDate, repeat)).toBeTruthy(); // 当日
        expect(toRepeat(addDays(startDate, 1), repeat)).toBeTruthy(); // 次の日
    });

    it('2日ごと', () => {
        const repeat: Repeat = {
            type: "day",
            every: 2,
            date: startDate
        }
        expect(toRepeat(startDate, repeat)).toBeTruthy(); // 当日
        expect(toRepeat(addDays(startDate, 1), repeat)).toBeFalsy(); // 次の日
        expect(toRepeat(addDays(startDate, 2), repeat)).toBeTruthy(); // 二日後
    });

    it('平日', () => {
        const repeat: Repeat = {
            type: "week",
            every: 1,
            date: startDate,
            dayOfWeeks: [1, 2, 3, 4, 5]
        }
        expect(toRepeat(startDate, repeat)).toBeTruthy(); // 当日
        expect(toRepeat(addDays(startDate, 1), repeat)).toBeFalsy(); // 次の日 土曜日なのでfalse
        expect(toRepeat(new Date("2022,1,3"), repeat)).toBeTruthy(); // 月曜日
    })

    it('2週毎 土曜日', () => {
        const repeat: Repeat = {
            type: "week",
            every: 2,
            date: startDate,
            dayOfWeeks: [6]
        }
        expect(toRepeat(startDate, repeat)).toBeFalsy(); // 当日は金曜なので false
        expect(toRepeat(addDays(startDate, 1), repeat)).toBeTruthy(); // 次の日 土曜日なのでtrue
        expect(toRepeat(new Date("2022,1,8"), repeat)).toBeFalsy(); // 次の土曜日
        expect(toRepeat(new Date("2022,1,15"), repeat)).toBeTruthy(); // 次の次のの土曜日
    })

    it('毎月', () => {
        const repeat: Repeat = {
            type: "month",
            every: 1,
            date: startDate,
        }
        expect(toRepeat(startDate, repeat)).toBeTruthy() // 当日
        expect(toRepeat(addDays(startDate, 1), repeat)).toBeFalsy(); // 次の日
        expect(toRepeat(new Date("2022,1,31"), repeat)).toBeTruthy(); // 次の月
    })
});