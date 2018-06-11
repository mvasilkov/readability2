/* This file is part of the Readability2 project.
 * https://github.com/mvasilkov/readability2
 * Copyright (c) 2018 Mark Vasilkov (https://github.com/mvasilkov)
 * License: MIT */
import { ContentVariety, IContainerNode, INode } from './types'

export class Text implements INode {
    parentNode: IContainerNode | null = null
    textContent: string

    chars!: number
    hyperchars!: number
    readonly tags!: number
    readonly score!: number

    constructor(textContent: string) {
        this.textContent = textContent
    }

    compute() {
        this.chars = this.textContent.replace(/\s/gu, '').length
        this.hyperchars = +this.parentNode!.ofVariety(ContentVariety.hyperlink) * this.chars
    }

    canReject() {
        return this.chars == 0
    }

    toString() {
        return this.textContent
    }
}

Object.defineProperties(Text.prototype, {
    tags: { value: 0 },
    score: { value: 0 },
})
