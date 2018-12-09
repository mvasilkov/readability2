/* This file is part of the Readability2 project.
 * https://github.com/mvasilkov/readability2
 * Copyright (c) 2018 Mark Vasilkov (https://github.com/mvasilkov)
 * License: MIT */
import { Heading, IContainerNode, ITitle } from './types'
import { CString } from './CString'
import { normalizeSpace } from './functions'

export class Title implements ITitle {
    private readonly document: {
        title: string,
        headings: Heading[],
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
            this.document.headings.push({ content: heading, node })
    }

    getTitle(): string {
        const { headings, title } = this.document

        if (headings.length == 0)
            return title
        if (headings.length == 1)
            return Title.selectHeading(headings[0])

        if (title) {
            const title2 = new CString(title)
            const headings2 = headings
            .filter(a => a.content.length <= title.length && title2.includes(a.content))
            .sort((a, b) => b.content.length - a.content.length)

            if (headings2.length)
                return Title.selectHeading(headings2[0])
        }

        return Title.selectHeading(headings[0])
    }

    static normalizeSpace(a: string): string {
        return normalizeSpace(a).replace(/\n{1,2}/gu, ' ')
    }

    static normalizeTitle(a: string): string {
        a = a.split('::', 1)[0]
        return Title.normalizeSpace('\n\n' + a + '\n\n')
    }

    static selectHeading(a: Heading): string {
        a.node.burninate = true
        return a.content
    }
}
