import { INode } from './INode'
import { ContentVariety, Node } from './Node'

export class Text implements INode {
    parentNode: Node | null = null
    textContent: string

    chars: number | undefined
    hyperchars: number | undefined
    readonly tags: number | undefined
    readonly score: number | undefined

    constructor(textContent: string) {
        this.textContent = textContent
    }

    compute() {
        this.chars = this.textContent.replace(/\s/gu, '').length
        this.hyperchars = +this.parentNode!.ofVariety(ContentVariety.hyperlink) * this.chars
    }

    canPeel() {
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
