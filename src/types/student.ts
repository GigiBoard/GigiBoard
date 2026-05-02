import { Entity } from "./entity";

export type PointDetail = {
    point: number;
    reason?: string;
    date: Date;
}

export type Student = Entity & {
    point: number;
}
