
// 配列をkeyで昇順ソートする
export function sort<T>(array: T[], key: (obj: T) => number | Date, reversed = false): T[] {
    return array.sort((a, b) => {
        const a_key = key(a);
        const b_key = key(b);
        if (a_key < b_key) {
            return reversed ? 1 : -1;
        } else if (a > b) {
            return reversed ? -1 : 1;
        } else {
            return 0;
        }
    });
}