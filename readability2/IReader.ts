import { INode } from './INode'

export interface IReader {
    root: INode

    onopentag(name: string): void
    onclosetag(name: string): void
    onattribute(name: string, value: string): void
    ontext(content: string): void
}
