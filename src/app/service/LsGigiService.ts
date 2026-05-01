import * as uuid from "uuid";

import { Class } from "@/types/class";
import { PointDetail, Student } from "@/types/student";
import IGigiService from "./IGigiService";

const GIGI_DATA = "GIGI_DATA" as const;

type ClassMate = {
    class: Class;
    students: Record<string, Student>;
}

class LsManager {
    async load() {
        try {
            const data = localStorage.getItem(GIGI_DATA) ?? "[]";

            return JSON.parse(data) as ClassMate[];
        }
        catch {
            return [];
        }
    }

    async save(classMates: ClassMate[]) {
        const data = JSON.stringify(classMates);

        localStorage.setItem(GIGI_DATA, data);
    }
}

export default class LsGigiService implements IGigiService {
    private lsMgr = new LsManager();

    async createClass(cls: Omit<Class, "id">): Promise<Class> {
        const id = uuid.v4();

        const classMates = await this.lsMgr.load();
        const newClass: Class = { id, ...cls };

        await this.lsMgr.save([
            ...classMates,
            {
                class: newClass,
                students: { },
            }
        ]);

        return newClass;
    }

    async updateClass(cls: Class): Promise<Class> {
        const classMates = await this.lsMgr.load();
        const targetClass = classMates.find((item) => item.class.id === cls.id);

        if (!targetClass) throw Error("No such class");

        targetClass.class = cls;

        await this.lsMgr.save(classMates);

        return cls;
    }

    async deleteClass(classId: string): Promise<Class> {
        const classMates = await this.lsMgr.load();

        const newClassMates = classMates.filter(item => item.class.id !== classId);
        const deleted = classMates.find(item => item.class.id === classId);

        await this.lsMgr.save(newClassMates);

        if (!deleted) throw new Error("No such class");

        return deleted.class;
    }

    async getClassList(): Promise<Class[]> {
        const classMates = await this.lsMgr.load();

        return classMates.map((cm) => cm.class);
    }

    async addStudentTo(classId: string, student: Omit<Student, "id">): Promise<Student> {
        const classMates = await this.lsMgr.load();
        const id = uuid.v4();
        const newStudent: Student = {
            id,
            ...student,
        }

        const targetCm = classMates.find(cm => cm.class.id === classId);

        if (!targetCm) throw new Error("No such class");
        
        targetCm.students = {
            ...targetCm.students,
            [id]: newStudent,
        };

        this.lsMgr.save(classMates);

        return newStudent;
    }

    async updateStudentTo(classId: string, student: Student): Promise<Student> {
        const classMates = await this.lsMgr.load();
        const id = student.id;
        const targetCm = classMates.find(cm => cm.class.id === classId);

        if (!targetCm) throw new Error("No such class");

        targetCm.students = {
            ...targetCm.students,
            [id]: student,
        };

        this.lsMgr.save(classMates);

        return student;
    }

    async deleteStudentFrom(classId: string, studentId: string): Promise<Student> {
        const classMates = await this.lsMgr.load();
        const id = studentId
        const targetCm = classMates.find(cm => cm.class.id === classId);

        if (!targetCm) throw new Error("No such class");

        const deleted = JSON.parse(JSON.stringify(targetCm.students[id]))

        delete targetCm.students[id];

        this.lsMgr.save(classMates);

        return deleted;
    }

    async getStudentListOf(classId: string): Promise<Student[]> {
        const classMates = await this.lsMgr.load();
        const targetCm = classMates.find(cm => cm.class.id === classId);

        if (!targetCm) throw new Error("No such class");

        return Object.values(targetCm.students);
    }

    getPointDetailOf(studentId: string): Promise<PointDetail[]> {
        throw new Error("Method not implemented.");
    }
}