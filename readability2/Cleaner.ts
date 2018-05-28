import { INode } from './INode'
import { IComputedNode } from './IComputedNode'
import { Node } from './Node'
import { block } from './grouping'
import { rootMultiplier } from './tuning'

export class Cleaner {
    readonly root: INode

    constructor(node: INode) {
        if (node instanceof Node) {
            const root = Cleaner.findRoot(node as any)

            if (!root.containsText()) {
                Cleaner.filter(root)
                Cleaner.peel(root)
            }

            this.root = root
        }
        else this.root = node
    }

    static findRoot(node: IComputedNode): IComputedNode {
        const a = node.childNodes.filter(n =>
            n instanceof Node && n.score > node.sum * rootMultiplier && block.has(n.tagName))
        return a.length == 1 ? a[0] : node
    }

    static filter(node: IComputedNode) {
        const reject: number[] = []
        node.childNodes.forEach((n, i) => {
            if (n.constructor == Node && n.canReject())
                reject.unshift(i)
        })
        reject.forEach(i => {
            node.childNodes.splice(i, 1)
        })
    }

    static peel(node: IComputedNode) {
        let n: INode
        let i = node.childNodes.length
        while (i && (n = node.childNodes[--i]) && n.canReject()) {
            node.childNodes.pop()
            n.parentNode = null
        }
        while ((n = node.childNodes[0]) && n.canReject()) {
            node.childNodes.shift()
            n.parentNode = null
        }
    }
}
