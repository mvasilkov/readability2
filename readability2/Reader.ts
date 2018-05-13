import { IReader } from './IReader'
import { ContentVariety, Node } from './Node'
import { Text } from './Text'
import { Newline } from './Newline'
import { junk } from './grouping'

export class Reader implements IReader {
    readonly root: Node
    private _cur: Node

    constructor() {
        this._cur = this.root = new Node('---')
    }

    onopentag(name: string) {
        name = name.toLowerCase()

        this._cur = this._cur.appendChild(new Node(name))
        this._cur.variety = this._cur.parentNode!.variety
    }

    onclosetag(name: string) {
        name = name.toLowerCase()

        if (this._cur.tagName != name || this._cur.parentNode == null)
            throw Error('onclosetag: Not balanced')

        this._cur = this._cur.parentNode

        if (junk.has(name)) {
            this._cur.childNodes.pop()
            return
        }

        switch (name) {
            case 'br':
                this._cur.childNodes.splice(-1, 1, Newline.instance)
        }
    }

    onattribute(name: string, value: string) {
        name = name.toLowerCase()

        switch (name) {
            case 'href':
                if (this._cur.tagName == 'a')
                    this._cur.variety |= ContentVariety.hyperlink
        }
    }

    ontext(content: string) {
        const last = this._cur.lastChild()
        if (last instanceof Text) {
            last.textContent += content
            return
        }
        this._cur.appendChild(new Text(content))
    }
}
