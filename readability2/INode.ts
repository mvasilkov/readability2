export interface INode {
    parentNode: INode | null

    chars: number | undefined
    hyperchars: number | undefined
    tags: number | undefined
    score: number | undefined

    compute(): void
    compute(needle: { node: INode, sum: number }): void

    canReject(): boolean

    toString(): string
}
