interface Course {
    uuid: string;
    title: string;
    theme: string;
    isDeleted?: boolean;
}

interface TableRow {
    courseUuids: string[];
    dayOfWeek: DayLongName;
}

interface Timetable {
    uuid: string;
    tableRows: TableRow[];
    courseDurationSpacing: number;
    endTime: { hour: number; minute?: number };
    startTime: { hour: number; minute?: number };
}

interface TimeDetails {
    hour: number;
    minute?: number;
}

interface ConfigData {
    courses: Course[];
    timetables: Timetable[];
    courseDurationSpacing: number;
    endTime: { hour: number; minute?: number };
    startTime: { hour: number; minute?: number };
}

interface DayDetail {
    name: DayLongName;
    shortName: DayShortName;
}

interface MonthDetail {
    name: MonthLongName;
    shortName: MonthShortName;
}
