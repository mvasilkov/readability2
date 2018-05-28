export interface IComputedNode {
    parentNode: IComputedNode | null
    childNodes: IComputedNode[]
    tagName: string

    chars: number
    hyperchars: number
    tags: number
    score: number
    sum: number

    compute(): void

    canReject(): boolean

    lowersParentScore(): boolean

    containsText(): boolean
}
