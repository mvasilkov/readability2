export const enum ContentVariety {
    normal = 0,
    hyperlink = 1,
    bad = 2,
}

export type Result = {
    node?: IContainerNode,
    sum: number,
}

export interface INode {
    parentNode: IContainerNode | null

    chars: number
    hyperchars: number
    tags: number
    score: number

    compute(): void
    compute(result: Result): void

    canReject(): boolean

    toString(): string
}

export interface IContainerNode extends INode {
    childNodes: INode[]
    tagName: string

    sum: number

    variety: number
    trash: boolean

    appendChild<NT extends INode>(node: NT): NT

    lastChild(): INode | null

    ofVariety(variety: ContentVariety.hyperlink | ContentVariety.bad): boolean

    containsText(): boolean
}

export interface IReader {
    root: IContainerNode
    title: ITitle

    onopentag(name: string): void
    onclosetag(name: string): void
    onattribute(name: string, value: string): void
    ontext(content: string): void
}

export interface ITitle {
    append(node: IContainerNode): void

    getTitle(): string
}
