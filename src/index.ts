const { PRIMARY } = COLORS;

const { ATTR_THEME, ATTR_COURSE_SLOT_ID } = ATTRIBUTES;

const { CONFIG_DATA, LAST_NEW_THEME, CHOSEN_TIME_TYPE } = LOCAL_STORAGE_KEYS;

const {
    OVERLAY,
    TIMETABLE,
    INFO_TILE,
    TODAY_TEXT,
    COURSE_NAME,
    COURSE_LIST,
    NEW_END_TIME,
    EMPTY_COURSES,
    NEW_START_TIME,
    SETTINGS_CONFIG,
    COURSE_DURATION,
    COURSE_COLOR_INPUT,
    COURSE_COLOR_CONFIG
} = IDs;

const {
    TIME,
    MODAL,
    ACTIVE,
    COURSE,
    BUTTON,
    HIDDEN,
    PICKER,
    COURSE_DAY,
    COURSE_ROW,
    COURSE_ADD,
    CURSOR_MOVE,
    COURSE_DAYS,
    COURSE_TIME,
    COURSE_SLOT,
    COURSE_TITLE,
    DISPLAY_NONE,
    COURSE_THEME,
    DASHED_BORDER,
    COURSE_DELETE,
    COURSE_SLOT_DELETE
} = CLASSES;

const { HOUR_VALUE, MINUTE_VALUE, MERIDIAN_VALUE } = QUERIES;

const { year, month, hour12, minutes, monthDate, longDayOfWeek, longMonthName }: DateProps =
    getDateProps();

let addCourseClicked = false;
let dragSourceCourseSlotID: string;

function handleCourseSlotDragStart() {
    this.style.opacity = '0.4';
    dragSourceCourseSlotID = this.getAttribute(ATTR_COURSE_SLOT_ID);
    const courseSlots = document.querySelectorAll<HTMLDivElement>(`.${COURSE_SLOT}`);
    courseSlots.forEach(slot => addClass(slot, DASHED_BORDER));
}

function handleDragEnd() {
    this.style.opacity = '1';
    const courseSlots = document.querySelectorAll<HTMLDivElement>(`.${COURSE_SLOT}`);
    courseSlots.forEach(slot => removeClass(slot, DASHED_BORDER));
}

function handleDragOver(e: Event): boolean {
    e.preventDefault();
    return false;
}

function handleCourseSlotDrop(e: Event): false | void {
    const { ATTR_COURSE_SLOT_ID } = ATTRIBUTES;
    const { CONFIG_DATA } = LOCAL_STORAGE_KEYS;

    e.stopPropagation();

    const dragDestinationCourseSlotID: string = this.getAttribute(ATTR_COURSE_SLOT_ID);
    if (dragSourceCourseSlotID !== dragDestinationCourseSlotID) {
        const sourceCourseSlot: HTMLDivElement = document.querySelector(
            `[${ATTR_COURSE_SLOT_ID}="${dragSourceCourseSlotID}"]`
        )!;
        const destinationCourseSlot: HTMLDivElement = document.querySelector(
            `[${ATTR_COURSE_SLOT_ID}="${dragDestinationCourseSlotID}"]`
        )!;
        const configData: ConfigData = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');

        if (!configData.timetable) return showAlert({ msg: 'An error has occured' });

        let [sourceCourseSlotDayIndex, sourceCourseSlotIndex] = dragSourceCourseSlotID
            .split('-', 2)
            .map(Number);
        let [destinationCourseSlotDayIndex, destinationCourseSlotIndex] =
            dragDestinationCourseSlotID.split('-', 2).map(Number);

        const tempCourse: string =
            configData.timetable.tableRows[sourceCourseSlotDayIndex].courseUuids[
                sourceCourseSlotIndex
            ];
        const tempCourseSlot: HTMLDivElement = sourceCourseSlot;

        configData.timetable.tableRows[sourceCourseSlotDayIndex].courseUuids[
            sourceCourseSlotIndex
        ] =
            configData.timetable.tableRows[destinationCourseSlotDayIndex].courseUuids[
                destinationCourseSlotIndex
            ];
        sourceCourseSlot.style.background = destinationCourseSlot.style.background;
        sourceCourseSlot.style.gridColumnStart = destinationCourseSlot.style.gridColumnStart;

        configData.timetable.tableRows[destinationCourseSlotDayIndex].courseUuids[
            destinationCourseSlotIndex
        ] = tempCourse;
        destinationCourseSlot.style.background = tempCourseSlot.style.background;
        destinationCourseSlot.style.gridColumnStart = tempCourseSlot.style.gridColumnStart;

        localStorage.setItem(CONFIG_DATA, JSON.stringify(configData));

        // to update or reload timetable
        reloadLastTimetable();
        showAlert({ msg: 'Timetable updated' });
    }

    return false;
}

function emptyTable(selector: string) {
    const tableBody = document.querySelector<HTMLTableSectionElement>(selector);
    while (tableBody?.lastChild) tableBody.removeChild(tableBody.lastChild);
}

function initStorageListener() {
    window.addEventListener('storage', () => window.location.reload());
}

function restoreConfigData() {
    // this function restores the default configuration data if they are not in the localStorage
    const configDataExists: string | null = localStorage.getItem(LOCAL_STORAGE_KEYS.CONFIG_DATA);

    if (!configDataExists) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.CONFIG_DATA, JSON.stringify(configData));
    }
}

function initTimetableHeader() {
    const daysOfWeek: DayLongName[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const courseDays: HTMLDivElement = document.createElement('div');
    addClass(courseDays, COURSE_DAYS);

    daysOfWeek.forEach(dayOfWeek => {
        const courseDay: HTMLDivElement = document.createElement('div');
        addClass(courseDay, COURSE_DAY);
        if (longDayOfWeek === dayOfWeek) addClass(courseDay, ACTIVE);
        courseDay.innerHTML = dayOfWeek.substring(0, 3);
        courseDays.appendChild(courseDay);
    });

    const timetable = document.getElementById(TIMETABLE)!;
    timetable.append(courseDays);
}

/**
 *
 * @param courseDurationSpacing in minutes
 */
function initTimeframe(
    courseDurationSpacing: number,
    startTime: TimeDetails,
    endTime: TimeDetails
) {
    let courseDurationSpacingMs: number = courseDurationSpacing * 60 * 1000;
    let monthDetails: string = `${year}-${month.toString().padStart(2, '0')}-${monthDate
        .toString()
        .padStart(2, '0')}`;
    let timeStart: number = getDateProps(
        `${monthDetails}T${startTime.hour.toString().padStart(2, '0')}:${
            startTime.minute?.toString().padStart(2, '0') ?? '00'
        }`
    ).millisecondsFromInception;
    let timeEnd: number = getDateProps(
        `${monthDetails}T${endTime.hour.toString().padStart(2, '0')}:${
            endTime.minute?.toString().padStart(2, '0') ?? '00'
        }`
    ).millisecondsFromInception;

    const timetable = document.getElementById(TIMETABLE)!;
    timetable.innerHTML = '';
    initTimetableHeader();

    while (timeStart + courseDurationSpacingMs <= timeEnd) {
        const courses: HTMLDivElement = document.createElement('div');
        addClass(courses, COURSE_ROW);

        const courseTime: HTMLDivElement = document.createElement('div');
        addClass(courseTime, COURSE_TIME);
        courseTime.innerHTML = `${getDateProps(timeStart)
            .hour24.toString()
            .padStart(2, '0')}:${getDateProps(timeStart).minutes.toString().padStart(2, '0')}`;

        timeStart += courseDurationSpacingMs;

        courseTime.innerHTML = `${courseTime.innerHTML} - ${getDateProps(timeStart)
            .hour24.toString()
            .padStart(2, '0')}:${getDateProps(timeStart).minutes.toString().padStart(2, '0')}`;
        courses.appendChild(courseTime);

        timetable.appendChild(courses);
    }
}

function initTimetable() {
    const { courseDurationSpacing, endTime, startTime, timetable }: ConfigData = JSON.parse(
        localStorage.getItem(CONFIG_DATA) ?? '{}'
    );
    if (timetable) {
        initTimeframe(courseDurationSpacing, startTime, endTime);
    }
}

function reloadLastTimetable() {
    const { timetable, courses }: ConfigData = JSON.parse(
        localStorage.getItem(CONFIG_DATA) ?? '{}'
    );

    if (!timetable) return;

    const { courseDurationSpacing, startTime, endTime } = timetable;
    initTimeframe(courseDurationSpacing, startTime, endTime);

    const courseRows = document.getElementsByClassName(
        COURSE_ROW
    ) as HTMLCollectionOf<HTMLDivElement>;
    timetable.tableRows.forEach(({ courseUuids }: TableRow, i: number) => {
        courseUuids.forEach((courseUuid, j: number) => {
            const courseRow: HTMLDivElement | null = courseRows.item(j);

            if (courseRow) {
                const targetedCourse: Course | undefined = courses.find(
                    ({ uuid }) => uuid === courseUuid
                );

                const course: HTMLDivElement = document.createElement('div');

                course.draggable = true;
                addClass(course, COURSE_SLOT, CURSOR_MOVE);
                course.setAttribute(ATTR_COURSE_SLOT_ID, `${i}-${j}`);
                course.addEventListener('dragend', handleDragEnd);
                course.addEventListener('dragover', handleDragOver);
                course.addEventListener('drop', handleCourseSlotDrop);
                course.addEventListener('dragstart', handleCourseSlotDragStart);
                course.style.gridColumnStart = `${i + 2}`;
                course.style.background = targetedCourse?.theme ?? 'transparent';
                course.innerHTML = targetedCourse?.title ?? '';

                if (targetedCourse?.title) {
                    const deleteButton: HTMLButtonElement = document.createElement('button');
                    deleteButton.onclick = () => deleteCourseSlot(i, j);
                    addClass(deleteButton, COURSE_SLOT_DELETE);
                    course.appendChild(deleteButton);
                }

                courseRow.appendChild(course);
            }
        });
    });
}

function initInfoTile() {
    const todayText = document.getElementById(TODAY_TEXT) as HTMLParagraphElement;
    todayText.innerHTML = `${longMonthName} ${monthDate}, ${year}`;
}

function deleteCourse(courseUuid: string) {
    const configData: ConfigData = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
    const courseIndexToBeDeleted: number = configData.courses?.findIndex(
        ({ uuid }) => uuid === courseUuid
    );

    if (courseIndexToBeDeleted < 0) return showAlert({ msg: 'This course does not exist' });

    const courseToBeDeleted: Course = configData.courses[courseIndexToBeDeleted];
    const deleteConfirmed: boolean = confirm(
        `Are you sure you want to delete ${courseToBeDeleted.title}`
    );

    if (deleteConfirmed) {
        courseToBeDeleted.isDeleted = true;
        localStorage.setItem(CONFIG_DATA, JSON.stringify(configData));
        showAlert({ msg: 'Course deleted' });
        reloadCourses();
    }
}

function addCourse() {
    const configData: ConfigData = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');

    const courseDiv = document.querySelector(`.${COURSE}:last-child`) as HTMLDivElement;

    const newCourseThemeDiv = courseDiv.querySelector(`.${COURSE_THEME}`) as HTMLButtonElement;
    const newCourseTheme: string = newCourseThemeDiv.getAttribute(ATTR_THEME)!;

    const newCourseTitleInput = courseDiv.querySelector(`.${COURSE_TITLE}`) as HTMLInputElement;
    const newCourseTitle: string = newCourseTitleInput.value;

    if (!newCourseTitle) {
        newCourseTitleInput.focus();
        return showAlert({ msg: 'Please enter a course code' });
    }

    const newUuid: string = uuid();

    const newCourse: Course = { theme: newCourseTheme, title: newCourseTitle, uuid: newUuid };

    configData.courses.push(newCourse);

    localStorage.setItem(CONFIG_DATA, JSON.stringify(configData));
    showAlert({ msg: 'Course added' });
    initNewLastTheme();
    reloadCourses();
}

function reloadCourses() {
    const { courses }: ConfigData = JSON.parse(
        localStorage.getItem(CONFIG_DATA) ?? '{ courses: [] }'
    );
    const coursesToShow: Course[] = courses.filter(({ isDeleted }: Course) => !isDeleted);
    const coursesLength: number = coursesToShow.length;
    const stopLength = coursesLength === 0 ? (addCourseClicked ? 0 : -1) : coursesLength;

    emptyTable(`#${COURSE_LIST}`);
    const emptyCoursesDiv = document.getElementById(EMPTY_COURSES)!;
    if (coursesToShow.length > 0 || addCourseClicked) addClass(emptyCoursesDiv, DISPLAY_NONE);
    else removeClass(emptyCoursesDiv, DISPLAY_NONE);

    const courseList = document.getElementById(COURSE_LIST)!;
    const lastCourseTheme: string | null = localStorage.getItem(LAST_NEW_THEME);

    for (let i = 0; i <= stopLength; i++) {
        const { theme, title, uuid }: Course = coursesToShow[i] ?? {
            uuid: '',
            title: '',
            theme: getRndColor({ format: 'HEX' })
        };
        const courseColor: string = uuid || !lastCourseTheme ? theme : lastCourseTheme;
        const handleColorChange = () => {
            const courseName = document.getElementById(COURSE_NAME) as HTMLParagraphElement;
            courseName.innerText = title;

            const colorPicker = document.getElementById(COURSE_COLOR_INPUT) as HTMLInputElement;
            colorPicker.value = courseColor;
            colorPicker.onchange = (e: Event) => {
                let configData: ConfigData = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
                const targetCourseIndex: number = configData.courses.findIndex(
                    course => course.uuid === uuid
                );

                const target = e.target as HTMLInputElement;
                const newTheme: string = target.value;
                const courseAdded: boolean = targetCourseIndex > -1;
                if (courseAdded) {
                    configData.courses[targetCourseIndex].theme = newTheme;
                    localStorage.setItem(CONFIG_DATA, JSON.stringify(configData));
                    reloadLastTimetable();
                } else {
                    localStorage.setItem(LAST_NEW_THEME, newTheme);
                }
                reloadCourses();
                closeAllModals();
            };
            openModal(COURSE_COLOR_CONFIG);
        };

        const courseDiv: HTMLDivElement = document.createElement('div');
        addClass(courseDiv, COURSE);

        const courseTheme: HTMLButtonElement = document.createElement('button');
        addClass(courseTheme, COURSE_THEME);
        courseTheme.style.background = courseColor;
        courseTheme.onclick = handleColorChange;
        courseTheme.setAttribute(ATTR_THEME, courseColor);

        const courseTitle: HTMLInputElement = document.createElement('input');
        addClass(courseTitle, COURSE_TITLE);
        courseTitle.placeholder = 'Enter a course';
        courseTitle.value = title;
        if (uuid) {
            courseTitle.onblur = (e: FocusEvent) => {
                let configData: ConfigData = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
                const targetCourseIndex: number = configData.courses.findIndex(
                    course => course.uuid === uuid
                );
                const target = e.target as HTMLInputElement;
                const newTitle: string = target.value;
                courseTitle.style.borderBottomColor = 'transparent';

                if (newTitle !== title) {
                    configData.courses[targetCourseIndex].title = newTitle;
                    localStorage.setItem(CONFIG_DATA, JSON.stringify(configData));
                    reloadCourses();
                    reloadLastTimetable();
                }
            };
        } else {
            courseTitle.onkeydown = (e: KeyboardEvent) => {
                const name: string = e.key;
                if (name === 'Enter') addCourse();
            };
        }

        courseTitle.onfocus = () => {
            courseTitle.style.borderBottomColor = courseColor;
        };

        const courseAction1: HTMLButtonElement = document.createElement('button');
        const courseActionClassName1: string = uuid ? COURSE_DELETE : COURSE_ADD;
        addClass(courseAction1, courseActionClassName1);
        courseAction1.onclick = uuid ? () => deleteCourse(uuid) : () => addCourse();
        courseAction1.innerHTML = uuid
            ? `<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 5H18M9 5V5C10.5769 3.16026 13.4231 3.16026 15 5V5M9 20H15C16.1046 20 17 19.1046 17 18V9C17 8.44772 16.5523 8 16 8H8C7.44772 8 7 8.44772 7 9V18C7 19.1046 7.89543 20 9 20Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
            : `<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12H18M12 6V18" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;

        courseDiv.append(courseTheme, courseTitle, courseAction1);

        courseList.appendChild(courseDiv);

        if (!uuid && !lastCourseTheme) {
            localStorage.setItem(LAST_NEW_THEME, courseColor);
        }
    }
}

function initNewLastTheme() {
    const newColor: string = getRndColor({ format: 'HEX' });
    localStorage.setItem(LAST_NEW_THEME, newColor);
}

function closeAllModals() {
    const overlay = document.getElementById(OVERLAY) as HTMLDivElement;
    addClass(overlay, HIDDEN);

    const picker = document.querySelector(`.${PICKER}`) as HTMLDivElement;
    if (!picker.classList.contains(HIDDEN)) addClass(picker, HIDDEN);

    const modals = document.getElementsByClassName(MODAL) as HTMLCollectionOf<HTMLDivElement>;
    for (let i = 0; i < modals.length; i++) {
        addClass(modals.item(i), HIDDEN);
    }
}

function openModal(modalID: string) {
    const overlay = document.getElementById(OVERLAY) as HTMLDivElement;
    removeClass(overlay, HIDDEN);

    const modal = document.getElementById(modalID) as HTMLDivElement;
    removeClass(modal, HIDDEN);
}

function setCourseClicked() {
    addCourseClicked = true;
    reloadCourses();
}

function reloadSettings() {
    const { startTime, endTime, courseDurationSpacing }: ConfigData = JSON.parse(
        localStorage.getItem(CONFIG_DATA) ?? '{}'
    );
    const newStartTimeInput = document.getElementById(NEW_START_TIME) as HTMLInputElement;
    const newEndTimeInput = document.getElementById(NEW_END_TIME) as HTMLInputElement;
    const newCourseDurationInput = document.getElementById(COURSE_DURATION) as HTMLInputElement;

    const newStartTime = `${startTime.hour.toString().padStart(2, '0')}:${
        startTime.minute?.toString().padStart(2, '0') ?? '00'
    }`;
    const newEndTime = `${endTime.hour.toString().padStart(2, '0')}:${
        endTime.minute?.toString().padStart(2, '0') ?? '00'
    }`;

    newStartTimeInput.value = newStartTime;
    newEndTimeInput.value = newEndTime;
    newCourseDurationInput.value = courseDurationSpacing.toString();
}

function saveConfig() {
    const newCourseDurationInput = document.getElementById(COURSE_DURATION) as HTMLInputElement;
    const newCourseDuration: string = newCourseDurationInput.value;

    const configData: ConfigData = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
    configData.courseDurationSpacing = Number(newCourseDuration);

    localStorage.setItem(CONFIG_DATA, JSON.stringify(configData));
    reloadSettings();
    closeAllModals();
    showAlert({ msg: 'Configuration saved' });
}

function openTimePicker(chosenTimeType: 'start' | 'end') {
    const picker = document.querySelector(`.${PICKER}`) as HTMLDivElement;
    removeClass(picker, HIDDEN);

    const { startTime, endTime }: ConfigData = JSON.parse(
        localStorage.getItem(CONFIG_DATA) ?? '{}'
    );

    const hourValue = document.querySelector(HOUR_VALUE) as HTMLSpanElement;
    const minuteValue = document.querySelector(MINUTE_VALUE) as HTMLSpanElement;
    const meridianValue = document.querySelector(MERIDIAN_VALUE) as HTMLSpanElement;

    if (chosenTimeType === 'start') {
        hourValue.innerText = `${startTime.hour > 12 ? startTime.hour - 12 : startTime.hour}`;
        minuteValue.innerText = startTime.minute?.toString().padStart(2, '0') ?? '00';
        meridianValue.innerText = ` ${startTime.hour >= 12 ? 'PM' : 'AM'}`;
    } else {
        hourValue.innerText = `${endTime.hour > 12 ? endTime.hour - 12 : endTime.hour}`;
        minuteValue.innerText = endTime.minute?.toString().padStart(2, '0') ?? '00';
        meridianValue.innerText = ` ${endTime.hour >= 12 ? 'PM' : 'AM'}`;
    }

    localStorage.setItem(CHOSEN_TIME_TYPE, chosenTimeType);
}

function closeTimePicker() {
    const chosenTimeDiv = document.querySelector(`.${TIME}`) as HTMLDivElement;

    if (chosenTimeDiv.innerText.includes('_')) {
        return showAlert({ msg: 'Please select time', zIndex: '10002' });
    }

    const [chosenTime, meridian] = chosenTimeDiv.innerText.split(' ');
    const [hour, minute] = chosenTime.split(':');

    const chosenTimeType = localStorage.getItem(CHOSEN_TIME_TYPE)!;
    let configData: ConfigData = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');

    if (chosenTimeType === 'start') {
        configData.startTime.minute = Number(minute);
        configData.startTime.hour = meridian === 'AM' ? Number(hour) : (Number(hour) + 12) % 24;
    } else {
        configData.endTime.minute = Number(minute);
        configData.endTime.hour = meridian === 'AM' ? Number(hour) : (Number(hour) + 12) % 24;
    }

    localStorage.setItem(CONFIG_DATA, JSON.stringify(configData));

    reloadSettings();
    const picker = document.querySelector(`.${PICKER}`) as HTMLDivElement;
    addClass(picker, HIDDEN);
}

function pool<T>(array: T[], poolLength: number, blanksAllowed?: boolean): (T | null)[] {
    const newPool: any[] = [];

    for (let i = 0; i < poolLength; i++) {
        let newElement: any = randomSelect([
            randomSelect(array),
            blanksAllowed ? null : randomSelect(array)
        ]);
        newPool.push(newElement);
    }

    return newPool;
}

function emptyTimetable() {
    const timetableContainer = document.getElementById(TIMETABLE)!;

    timetableContainer.innerHTML = `
    <div class="course-days"></div>
    <p id="empty-timetable">
        <svg
            width="65px"
            height="65px"
            fill="var(--theme-1)"
            viewBox="0 0 1920 1920"
            xmlns="http://www.w3.org/2000/svg">
            <path
                fill-rule="evenodd"
                d="M1800 1320v420c0 33-27 60-60 60h-420v-480h480Zm-600 0v480H720v-480h480Zm-600 0v480H180c-33 0-60-27-60-60v-420h480Zm1200-600v480h-480V720h480Zm-600 0v480H720V720h480Zm-600 0v480H120V720h480Zm1140-600c33 0 60 27 60 60v420h-480V120h420Zm-540 0v480H720V120h480Zm-600 0v480H120V180c0-33 27-60 60-60h420ZM1740 0H180C80.76 0 0 80.76 0 180v1560c0 99.24 80.76 180 180 180h1560c99.24 0 180-80.76 180-180V180c0-99.24-80.76-180-180-180Z" />
        </svg>
        <span>No timetable added yet</span>
    </p>`;
}

function deleteTimetable() {
    const configData: ConfigData = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
    configData.timetable = null;

    localStorage.setItem(CONFIG_DATA, JSON.stringify(configData));
    emptyTimetable();
}

function generateTimetable() {
    const { courses, courseDurationSpacing, endTime, startTime }: ConfigData = JSON.parse(
        localStorage.getItem(CONFIG_DATA) ?? '{}'
    );
    const coursesToShow: Course[] = courses.filter(({ isDeleted }) => !isDeleted);

    if (coursesToShow.length === 0) {
        return showAlert({ msg: 'Please add courses' });
    }

    let courseDurationSpacingMs: number = courseDurationSpacing * 60 * 1000;
    let monthDetails: string = `${year}-${month.toString().padStart(2, '0')}-${monthDate
        .toString()
        .padStart(2, '0')}`;
    let timeEnd: number = getDateProps(
        `${monthDetails}T${endTime.hour.toString().padStart(2, '0')}:${
            endTime.minute?.toString().padStart(2, '0') ?? '00'
        }`
    ).millisecondsFromInception;

    let tableRows: TableRow[] = [];
    const daysOfWeek: DayLongName[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    daysOfWeek.forEach((dayOfWeek: DayLongName) => {
        let tableRow: TableRow = { courseUuids: [], dayOfWeek };
        const newPool: (string | null)[] = pool<string>(
            coursesToShow.map(({ uuid }) => uuid),
            coursesToShow.length * 10,
            true
        );

        let timeStart: number = getDateProps(
            `${monthDetails}T${startTime.hour.toString().padStart(2, '0')}:${
                startTime.minute?.toString().padStart(2, '0') ?? '00'
            }`
        ).millisecondsFromInception;
        while (timeStart + courseDurationSpacingMs <= timeEnd) {
            const randomElement: string | null = randomSelect(newPool);
            tableRow.courseUuids.push(randomElement ?? '');
            timeStart += courseDurationSpacingMs;
        }

        tableRows.push(tableRow);
    });

    const newUuid: string = uuid();
    const newTimetable: Timetable = {
        endTime,
        startTime,
        tableRows,
        uuid: newUuid,
        courseDurationSpacing
    };
    const configData: ConfigData = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
    configData.timetable = newTimetable;
    localStorage.setItem(CONFIG_DATA, JSON.stringify(configData));
    reloadLastTimetable();
}

function downloadTimetable() {
    const timetable = document.getElementById(TIMETABLE);
    if (timetable) {
        // @ts-ignore
        html2pdf(timetable);
    }
}

function deleteCourseSlot(dayIndex: number, courseID: number) {
    const configData: ConfigData = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
    if (configData.timetable?.tableRows) {
        configData.timetable.tableRows[dayIndex].courseUuids[courseID] = '';
        localStorage.setItem(CONFIG_DATA, JSON.stringify(configData));
        reloadLastTimetable();
        showAlert({ msg: 'Timetable updated' });
    }
}

window.onload = () => {
    initInfoTile();
    initNewLastTheme();
    restoreConfigData();
    initTimetable();
    reloadCourses();
    reloadSettings();
    reloadLastTimetable();
    initStorageListener();
};
