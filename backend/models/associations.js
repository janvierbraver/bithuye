// D:\E learning\server\models\associations.js
import { User } from './User.js';
import { Role } from './Role.js';
import { Course } from './courses.js';
import { Exam } from './Exam.js';
import { Question } from './Question.js';
import { Enrollment } from './Enrollment.js';
import { ExamAttempt } from './ExamAttempt.js'; // <--- NEW: Import ExamAttempt model

const defineAssociations = () => {
    // User and Role Associations
    User.belongsTo(Role, { foreignKey: 'roleId', as: 'Role' });
    Role.hasMany(User, { foreignKey: 'roleId', as: 'Users' });

    // Course and User (Instructor) Associations
    Course.belongsTo(User, { foreignKey: 'instructorId', as: 'Instructor' });
    User.hasMany(Course, { foreignKey: 'instructorId', as: 'Courses' });

    // Exam and Question Associations
    Exam.belongsTo(User, { foreignKey: 'instructorId', as: 'Instructor' });
    User.hasMany(Exam, { foreignKey: 'instructorId', as: 'Exams' });
    Question.belongsTo(Exam, { foreignKey: 'examId', as: 'Exam' });
    Exam.hasMany(Question, { foreignKey: 'examId', as: 'Questions' });

    // --- NEW: Exam and Course Association ---
    Exam.belongsTo(Course, { foreignKey: 'courseId', as: 'Course' });
    Course.hasMany(Exam, { foreignKey: 'courseId', as: 'Exams' });
    // --- END NEW ASSOCIATION ---

    // Enrollment Associations
    User.hasMany(Enrollment, { foreignKey: 'learnerId', as: 'Enrollments' });
    Enrollment.belongsTo(User, { foreignKey: 'learnerId', as: 'Learner' });
    Course.hasMany(Enrollment, { foreignKey: 'courseId', as: 'Enrollments' });
    Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'Course' });

    // --- NEW: ExamAttempt Associations ---
    // A User (Learner) can have many ExamAttempts
    User.hasMany(ExamAttempt, { foreignKey: 'learnerId', as: 'ExamAttempts' });
    // An ExamAttempt belongs to one User (Learner)
    ExamAttempt.belongsTo(User, { foreignKey: 'learnerId', as: 'Learner' });

    // An Exam can have many ExamAttempts
    Exam.hasMany(ExamAttempt, { foreignKey: 'examId', as: 'ExamAttempts' });
    // An ExamAttempt belongs to one Exam
    ExamAttempt.belongsTo(Exam, { foreignKey: 'examId', as: 'Exam' });
    // --- END NEW ASSOCIATIONS ---

    console.log('Sequelize associations defined.');
};

export { defineAssociations };