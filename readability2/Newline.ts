import { IContainerNode, INode } from './types'

export class Newline implements INode {
    parentNode: IContainerNode | null = null

    readonly chars!: number
    readonly hyperchars!: number
    readonly tags!: number
    readonly score!: number

    private constructor() {
    }

    static readonly instance = new Newline

    compute() {
    }

    canReject() {
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
