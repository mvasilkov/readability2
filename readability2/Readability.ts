import { IReader } from './IReader'
import { Reader } from './Reader'
import { INode } from './INode'

export class Readability {
    readonly reader: IReader

    readonly onopentag: (name: string) => void
    readonly onclosetag: (name: string) => void
    readonly onattribute: (name: string, value: string) => void
    readonly ontext: (content: string) => void

    constructor() {
        const r = this.reader = new Reader

        this.onopentag = r.onopentag.bind(r)
        this.onclosetag = r.onclosetag.bind(r)
        this.onattribute = r.onattribute.bind(r)
        this.ontext = r.ontext.bind(r)
    }

    compute() {
        const { root } = this.reader
        const needle: { node: INode, sum: number } = { node: root, sum: 0 }
        root.compute(needle)
        return needle
    }
}
