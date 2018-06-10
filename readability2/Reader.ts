import { ContentVariety, IContainerNode, IReader, ITitle } from './types'
import { Node } from './Node'
import { Text } from './Text'
import { Newline } from './Newline'
import { Title } from './Title'
import { parseInlineStyles } from './functions'
import { heading, junk } from './grouping'
import { regexp } from './tuning'

export class Reader implements IReader {
    readonly root: IContainerNode
    readonly title: ITitle
    private _cur: IContainerNode

    constructor() {
        this._cur = this.root = new Node('---')
        this.title = new Title
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

        const end = this._cur

        this._cur = this._cur.parentNode

        if (end.trash || junk.has(name)) {
            this._cur.childNodes.pop()
            return
        }

        if (heading.has(name)) {
            this.title.append(end)
            return
        }

        switch (name) {
            case 'br':
                this._cur.childNodes.splice(-1, 1, Newline.instance)
        }
    }

    onattribute(name: string, value: string) {
        name = name.toLowerCase()

        if (name.startsWith('data-modal-')) {
            this._cur.variety |= ContentVariety.bad
            return
        }

        switch (name) {
            case 'href':
                if (this._cur.tagName == 'a')
                    this._cur.variety |= ContentVariety.hyperlink
                break

            case 'id':
                if (regexp.comment.test(value))
                    this._cur.variety |= ContentVariety.bad
                break

            case 'module':
                if (this._cur.tagName == 'air') // vc.ru
                    this._cur.trash = true
                break

            case 'style':
                const style = parseInlineStyles(value)
                if (style.display == 'none')
                    this._cur.variety |= ContentVariety.bad
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
