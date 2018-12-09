/* This file is part of the Readability2 project.
 * https://github.com/mvasilkov/readability2
 * Copyright (c) 2018 Mark Vasilkov (https://github.com/mvasilkov)
 * License: MIT */
import { ContentVariety, IContainerNode, INode, Result } from './types'
import { Text } from './Text'
import { block } from './grouping'
import { badMultiplier, rejectScore } from './tuning'

export class Node implements IContainerNode {
    parentNode: Node | null = null
    childNodes: INode[] = []
    readonly tagName: string

    chars!: number
    hyperchars!: number
    tags!: number
    score!: number
    sum!: number

    variety: number = ContentVariety.normal
    burninate: boolean = false

    constructor(tagName: string) {
        this.tagName = tagName
    }

    appendChild<NT extends INode>(node: NT): NT {
        if (node.parentNode !== null)
            throw Error('appendChild: Attempted reparenting')
        node.parentNode = this
        this.childNodes.push(node)
        return node
    }

    lastChild(): INode | null {
        if (this.childNodes.length == 0)
            return null
        return this.childNodes[this.childNodes.length - 1]
    }

    compute(result: Result = { sum: Infinity }, without?: Node): void {
        this.chars = this.hyperchars = this.sum = 0
        this.tags = 1

        this.childNodes.forEach(n => {
            if (without === n)
                return

            n.compute(result)
            this.chars += n.chars
            this.hyperchars += n.hyperchars
            this.tags += n.tags
            this.sum += n.score
        })

        this.score = this.chars / this.tags * Math.log2((this.chars + 1) / (this.hyperchars + 1))

        if (this.ofVariety(ContentVariety.bad))
            this.score *= badMultiplier

        if (this.sum > result.sum)
            result.node = this, result.sum = this.sum
    }

    ofVariety(variety: ContentVariety.hyperlink | ContentVariety.bad): boolean {
        return (this.variety & variety) != 0
    }

    canReject(): boolean {
        return (this.score < rejectScore || this.tags > this.score + 1) &&
            this.lowersParentScore()
    }

    lowersParentScore(): boolean {
        if (this.parentNode === null)
            return false

        const savedScore = this.parentNode.score
        this.parentNode.compute(undefined, this)
        const result = savedScore < this.parentNode.score
        this.parentNode.score = savedScore
        return result
    }

    containsText(): boolean {
        let chars = 0
        this.childNodes.forEach(n => {
            if (n instanceof Text)
                chars += n.chars
        })
        return chars > this.chars * 0.5
    }

    toString() {
        if (this.burninate)
            return block.has(this.tagName) ? '\n\n' : ''

        const parts = this.childNodes.map(n => n.toString())
        if (block.has(this.tagName)) {
            parts.unshift('\n\n')
            parts.push('\n\n')
        }
        return parts.join('')
    }
}
