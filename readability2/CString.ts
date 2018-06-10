export class CString {
    private readonly value: string

    constructor(a: string) {
        this.value = CString.normalize(a)
    }

    includes(a: string): boolean {
        return this.value.includes(CString.normalize(a))
    }

    static normalize(a: string): string {
        return a.toLowerCase()
    }
}
