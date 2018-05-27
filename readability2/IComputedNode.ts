export interface IComputedNode {
    parentNode: IComputedNode | null
    childNodes: IComputedNode[]

    chars: number
    hyperchars: number
    tags: number
    score: number

    compute(): void

    canReject(): boolean

    lowersParentScore(): boolean
}
