export interface INode {
    parentNode: INode | null

    chars: number | undefined
    hyperchars: number | undefined
    tags: number | undefined
    score: number | undefined

    compute: () => void

    toString: () => string
}
