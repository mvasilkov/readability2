/* This file is part of the Readability2 project.
 * https://github.com/mvasilkov/readability2
 * Copyright (c) 2018 Mark Vasilkov (https://github.com/mvasilkov)
 * License: MIT */
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
