import { IContainerNode, ITitle } from './types'
import { CString } from './CString'
import { normalizeSpace } from './functions'

export class Title implements ITitle {
    private readonly document: {
        title: string,
        headings: string[],
    }

    constructor() {
        this.document = {
            title: '',
            headings: [],
        }
    }

    append(node: IContainerNode) {
        if (node.tagName == 'title') {
            this.document.title = Title.normalizeTitle(node.toString())
            return
        }
        const heading = Title.normalizeSpace(node.toString())
        if (heading)
            this.document.headings.push(heading)
    }

    getTitle(): string {
        const { headings, title } = this.document

        if (headings.length == 0)
            return title
        if (headings.length == 1)
            return headings[0]

        if (title) {
            const ctitle = new CString(title)
            const headings2 = headings
            .filter(a => a.length <= title.length && ctitle.includes(a))
            .sort((a, b) => b.length - a.length)

            if (headings2.length)
                return headings2[0]
        }

        return headings[0]
    }

    static normalizeSpace(a: string): string {
        return normalizeSpace(a).replace(/\n{1,2}/gu, ' ')
    }

    static normalizeTitle(a: string): string {
        a = a.split('::', 1)[0]
        return Title.normalizeSpace('\n\n' + a + '\n\n')
    }
}
