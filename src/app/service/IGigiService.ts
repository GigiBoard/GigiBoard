import { Class } from "@/types/class";
import { PointDetail, Student } from "@/types/student";

export default interface IGigiService {
    createClass(cls: Omit<Class, "id">): Promise<Class>;
    updateClass(cls: Class): Promise<Class>;
    deleteClass(classId: string): Promise<Class>;
    getClassList(): Promise<Class[]>;
    
    addStudentTo(classId: string, student: Student): Promise<Student>;
    updateStudentTo(classId: string, student: Student): Promise<Student>;
    deleteStudentFrom(classId: string, studentId: string): Promise<Student>;
    getStudentListOf(classId: string): Promise<Student[]>;

    getPointDetailOf(studentId: string): Promise<PointDetail[]>;
}