import * as uuid from "uuid";

import { Class } from "@/types/class";
import { PointDetail, Student } from "@/types/student";
import IGigiService from "./IGigiService";

const GIGI_DATA = "GIGI_DATA" as const;

type DataNode = {
    class: Class;
    students: Student[];
}

class LsManager {
    async load() {
        try {
            JSON.parse(localStorage.getItem(GIGI_DATA) ?? "[]")
        }
    }
}

export default class LsGigiService implements IGigiService {
    createClass(cls: Omit<Class, "id">): Promise<Class> {
        
        
        const id = uuid.v4();

        const newClass = { id, ...cls }
    }

    updateClass(cls: Class): Promise<Class> {
        throw new Error("Method not implemented.");
    }

    deleteClass(classId: string): Promise<Class> {
        throw new Error("Method not implemented.");
    }

    getClassList(): Promise<Class[]> {
        throw new Error("Method not implemented.");
    }
    
    addStudentTo(classId: string, student: Omit<Student, "id">): Promise<Student> {
        throw new Error("Method not implemented.");
    }

    updateStudentTo(classId: string, student: Student): Promise<Student> {
        throw new Error("Method not implemented.");
    }

    deleteStudentFrom(classId: string, student: Student): Promise<Student> {
        throw new Error("Method not implemented.");
    }

    getStudentListOf(classId: string): Promise<Student[]> {
        throw new Error("Method not implemented.");
    }

    getPointDetailOf(studentId: string): Promise<PointDetail[]> {
        throw new Error("Method not implemented.");
    }
}