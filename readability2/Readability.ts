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
        this.reader = new Reader

        this.onopentag = this.reader.onopentag.bind(this.reader)
        this.onclosetag = this.reader.onclosetag.bind(this.reader)
        this.onattribute = this.reader.onattribute.bind(this.reader)
        this.ontext = this.reader.ontext.bind(this.reader)
    }

    compute() {
        const { root } = this.reader
        const needle: { node: INode, sum: number } = { node: root, sum: 0 }
        root.compute(needle)
        return needle
    }
}
