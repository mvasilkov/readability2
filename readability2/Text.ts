import { INode } from './INode'
import { ContentVariety, Node } from './Node'

export class Text implements INode {
    parentNode: Node | null = null
    textContent: string

    chars: number | undefined
    hyperchars: number | undefined
    readonly tags = 0
    readonly score = 0

    constructor(textContent: string) {
        this.textContent = textContent
    }

    compute() {
        this.chars = this.textContent.replace(/\s/gu, '').length
        this.hyperchars = +this.parentNode!.ofVariety(ContentVariety.hyperlink) * this.chars
    }

    toString() {
        return this.textContent
    }
}
