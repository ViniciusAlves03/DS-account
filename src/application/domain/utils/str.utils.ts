export class StrUtils {
    public static stripHtml(str?: string): string | undefined {
        return str ? str.toString().replace(/<[^>]*>/igm, '') : str
    }

    public static hasSubValues(obj: any): boolean {
        if (obj === null || obj === undefined) return false
        for (const key of Object.keys(obj)) {
            if (obj[key] instanceof Object) {
                if (this.hasSubValues(obj[key])) return true
            } else {
                if (obj[key] && obj[key].length !== 0) return true
            }
        }
        return false
    }
}
