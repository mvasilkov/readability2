/* This file is part of the Readability2 project.
 * https://github.com/mvasilkov/readability2
 * Copyright (c) 2018 Mark Vasilkov (https://github.com/mvasilkov)
 * License: MIT */
import { IContainerNode, INode } from './types'
import { Node } from './Node'
import { block } from './grouping'
import { rootMultiplier } from './tuning'

export class Cleaner {
    readonly root: IContainerNode

    constructor(node: IContainerNode) {
        this.root = Cleaner.findRoot(node)
        this.root.containsText() || Cleaner.filter(this.root)
        Cleaner.strip(this.root)
    }

    static findRoot(node: IContainerNode): IContainerNode {
        const a = node.childNodes.filter((n): n is Node =>
            n instanceof Node && n.score > node.sum * rootMultiplier && block.has(n.tagName))
        return a.length == 1 ? a[0] : node
    }

    static filter(node: IContainerNode) {
        const reject: number[] = []
        node.childNodes.forEach((n, i) => {
            if (n instanceof Node && n.canReject()) {
                reject.unshift(i)
                n.parentNode = null
            }
        })
        reject.forEach(i => {
            node.childNodes.splice(i, 1)
        })
    }

    static strip(node: IContainerNode) {
        let n: INode
        let i = node.childNodes.length
        while (i && (n = node.childNodes[--i]) && !(n instanceof Node) && n.canReject()) {
            node.childNodes.pop()
            n.parentNode = null
        }
        while ((n = node.childNodes[0]) && !(n instanceof Node) && n.canReject()) {
            node.childNodes.shift()
            n.parentNode = null
        }
    }
}
