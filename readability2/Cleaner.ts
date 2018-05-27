import { INode } from './INode'
import { Node } from './Node'

export class Cleaner {
    readonly root: INode

    constructor(node: INode) {
        if (node instanceof Node) {
            Cleaner.filter(node)
            Cleaner.peel(node)
        }
        this.root = node
    }

    static filter(node: Node) {
        const reject: number[] = []
        node.childNodes.forEach((n, i) => {
            if (n.constructor == Node && n.canReject())
                reject.unshift(i)
        })
        reject.forEach(i => {
            node.childNodes.splice(i, 1)
        })
    }

    static peel(node: Node) {
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
