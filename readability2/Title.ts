import { IContainerNode, ITitle } from './types'
import { normalizeSpace } from './functions'

export class Title implements ITitle {
    private inputs: {
        title: string,
        headings: string[],
    }

    constructor() {
        this.inputs = {
            title: '',
            headings: [],
        }
    }

    append(node: IContainerNode) {
        if (node.tagName == 'title') {
            this.inputs.title = Title.normalizeTitle(node.toString())
            return
        }
        const heading = Title.normalizeSpace(node.toString())
        if (heading)
            this.inputs.headings.push(heading)
    }

    getTitle(): string {
        const { headings, title } = this.inputs

        if (headings.length == 0)
            return title
        if (headings.length == 1)
            return headings[0]

        if (title) {
            const headings2 = headings
                .filter(a => a.length <= title.length && title.includes(a))
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
        a = a.split('::', 1)[0].trim()
        return Title.normalizeSpace(a)
    }
}
