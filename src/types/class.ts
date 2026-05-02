import { Entity } from "./entity";

export type Class = Entity & {
    year: number;
    semester: number;
    maxMerit: number;
    maxPenalty: number;
    is2Track?: boolean;
}
