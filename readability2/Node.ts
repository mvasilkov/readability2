import { INode } from './INode'
import { IComputedNode } from './IComputedNode'
import { Text } from './Text'
import { block } from './grouping'
import { badMultiplier, rejectMultiplier, rejectCutoff } from './tuning'

export const enum ContentVariety {
    normal = 0,
    hyperlink = 1,
    bad = 2,
}

export class Node implements INode {
    parentNode: Node | null = null
    childNodes: INode[] = []
    readonly tagName: string

    chars: number | undefined
    hyperchars: number | undefined
    tags: number | undefined
    score: number | undefined
    sum: number | undefined

    variety: number = ContentVariety.normal
    trash: boolean = false // used by Reader

    constructor(tagName: string) {
        this.tagName = tagName
    }

    appendChild<N extends INode>(n: N): N {
        if (n.parentNode !== null)
            throw Error('appendChild: Attempted reparenting')
        n.parentNode = this
        this.childNodes.push(n)
        return n
    }

    lastChild(): INode | null {
        if (this.childNodes.length == 0)
            return null
        return this.childNodes[this.childNodes.length - 1]
    }

    compute(needle: { node: INode, sum: number } = { node: InfinityNode, sum: Infinity }) {
        this.chars = this.hyperchars = this.sum = 0
        this.tags = 1

        this.childNodes.forEach(n => {
            n.compute(needle)
            this.chars += n.chars as any
            this.hyperchars += n.hyperchars as any
            this.tags += n.tags as any
            this.sum += n.score as any
        })

        this.score = this.chars / this.tags * Math.log2((this.chars + 1) / (this.hyperchars + 1))

        if (this.ofVariety(ContentVariety.bad))
            this.score *= badMultiplier

        if (this.sum > needle.sum)
            needle.node = this, needle.sum = this.sum
    }

    ofVariety(variety: ContentVariety.hyperlink | ContentVariety.bad): boolean {
        return (this.variety & variety) != 0
    }

    canReject(this: IComputedNode) {
        return (this.score < rejectCutoff || this.tags > this.score * rejectMultiplier) &&
            this.lowersParentScore()
    }

    lowersParentScore(this: IComputedNode): boolean {
        if (this.parentNode == null)
            return false

        const parent = this.parentNode
        const score = parent.score
        const index = parent.childNodes.indexOf(this)

        parent.childNodes.splice(index, 1)
        parent.compute()
        parent.childNodes.splice(index, 0, this)

        const result = score < parent.score
        parent.score = score
        return result
    }

    containsText(this: IComputedNode): boolean {
        let chars = 0
        this.childNodes.forEach(n => {
            if (n instanceof Text)
                chars += n.chars
        })
        return chars > this.chars * 0.5
    }

    toString() {
        const parts = this.childNodes.map(n => n.toString())
        if (block.has(this.tagName)) {
            parts.unshift('\n\n')
            parts.push('\n\n')
        }
        return parts.join('')
    }
}

const InfinityNode = new Node('Infinity')
