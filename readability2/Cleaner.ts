import { INode } from './INode'
import { Node } from './Node'

export class Cleaner {
    readonly root: INode

    constructor(node: INode) {
        if (node instanceof Node) {
            this.peel(node)
        }
        this.root = node
    }

    peel(node: Node) {
        let n: INode
        let i = node.childNodes.length
        while (i && (n = node.childNodes[--i]) && n.canPeel()) {
            node.childNodes.pop()
            n.parentNode = null
        }
        while ((n = node.childNodes[0]) && n.canPeel()) {
            node.childNodes.shift()
            n.parentNode = null
        }
    }
}
