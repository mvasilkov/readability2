import { INode } from './INode'
import { Node } from './Node'

export class Newline implements INode {
    parentNode: Node | null = null

    readonly chars: number | undefined
    readonly hyperchars: number | undefined
    readonly tags: number | undefined
    readonly score: number | undefined

    private constructor() {
    }

    static readonly instance = new Newline

    compute() {
    }

    canPeel() {
        return true
    }

    toString() {
        return '\n'
    }
}

Object.defineProperties(Newline.prototype, {
    chars: { value: 0 },
    hyperchars: { value: 0 },
    tags: { value: 0 },
    score: { value: 0 },
})
