"use strict";
let currentTimetable;
const { PRIMARY } = COLORS;
const { ATTR_THEME } = ATTRIBUTES;
const { CONFIG_DATA, LAST_NEW_THEME, CHOSEN_TIME, CHOSEN_TIME_TYPE } = LOCAL_STORAGE_KEYS;
const { OVERLAY, TIMETABLE, INFO_TILE, TODAY_TEXT, COURSE_LIST, NEW_END_TIME, EMPTY_COURSES, NEW_START_TIME, SETTINGS_CONFIG, COURSE_DURATION } = IDs;
const { TIME, MODAL, ACTIVE, COURSE, BUTTON, HIDDEN, PICKER, COURSE_DAY, COURSE_ROW, COURSE_ADD, COURSE_DAYS, COURSE_TIME, COURSE_SLOT, COURSE_TITLE, DISPLAY_NONE, COURSE_THEME, COURSE_DELETE } = CLASSES;
const { year, month, hour12, minutes, monthDate, longDayOfWeek, longMonthName } = getDateProps();
let addCourseClicked = false;
function loadConfigData() { }
function emptyTable(selector) {
    const tableBody = document.querySelector(selector);
    while (tableBody?.lastChild)
        tableBody.removeChild(tableBody.lastChild);
}
function initStorageListener() {
    window.addEventListener('storage', () => window.location.reload());
}
function restoreConfigData() {
    const configDataExists = localStorage.getItem(LOCAL_STORAGE_KEYS.CONFIG_DATA);
    if (!configDataExists) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.CONFIG_DATA, JSON.stringify(configData));
    }
}
function initTimetableHeader() {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const courseDays = document.createElement('div');
    addClass(courseDays, COURSE_DAYS);
    daysOfWeek.forEach(dayOfWeek => {
        const courseDay = document.createElement('div');
        addClass(courseDay, COURSE_DAY);
        if (longDayOfWeek === dayOfWeek)
            addClass(courseDay, ACTIVE);
        courseDay.innerHTML = dayOfWeek.substring(0, 3);
        courseDays.appendChild(courseDay);
    });
    const timetable = document.getElementById(TIMETABLE);
    timetable.append(courseDays);
}
function initTimeframe(courseDurationSpacing, startTime, endTime) {
    let courseDurationSpacingMs = courseDurationSpacing * 60 * 1000;
    let monthDetails = `${year}-${month.toString().padStart(2, '0')}-${monthDate
        .toString()
        .padStart(2, '0')}`;
    let timeStart = getDateProps(`${monthDetails}T${startTime.hour.toString().padStart(2, '0')}:${startTime.minute?.toString().padStart(2, '0') ?? '00'}`).millisecondsFromInception;
    let timeEnd = getDateProps(`${monthDetails}T${endTime.hour.toString().padStart(2, '0')}:${endTime.minute?.toString().padStart(2, '0') ?? '00'}`).millisecondsFromInception;
    const timetable = document.getElementById(TIMETABLE);
    timetable.innerHTML = '';
    initTimetableHeader();
    while (timeStart + courseDurationSpacingMs <= timeEnd) {
        const courses = document.createElement('div');
        addClass(courses, COURSE_ROW);
        const courseTime = document.createElement('div');
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
    const { courseDurationSpacing, endTime, startTime } = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
    initTimetableHeader();
    initTimeframe(courseDurationSpacing, startTime, endTime);
}
function reloadLastTimetable() {
    const { timetables, courses } = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{ timetables: [] }');
    const lastSavedTimetable = timetables.pop();
    if (!lastSavedTimetable)
        return;
    const { courseDurationSpacing, startTime, endTime } = lastSavedTimetable;
    initTimeframe(courseDurationSpacing, startTime, endTime);
    lastSavedTimetable.tableRows.forEach(({ courseUuids }, i) => {
        courseUuids.forEach((courseUuid, j) => {
            const courseRows = document.getElementsByClassName(COURSE_ROW);
            const courseRow = courseRows.item(j);
            if (courseRow) {
                const targetedCourse = courses.find(({ uuid }) => uuid === courseUuid);
                const course = document.createElement('div');
                addClass(course, COURSE_SLOT);
                course.style.gridColumnStart = `${i + 2}`;
                course.style.background = targetedCourse?.theme ?? 'transparent';
                course.innerHTML = targetedCourse?.title ?? '';
                courseRow.appendChild(course);
            }
        });
    });
}
function initInfoTile() {
    const todayText = document.getElementById(TODAY_TEXT);
    todayText.innerHTML = `${longMonthName} ${monthDate}, ${year}`;
}
function deleteCourse(courseUuid) {
    const configData = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
    const courseIndexToBeDeleted = configData.courses?.findIndex(({ uuid }) => uuid === courseUuid);
    if (courseIndexToBeDeleted < 0)
        return showAlert({ msg: 'This course does not exist' });
    const courseToBeDeleted = configData.courses[courseIndexToBeDeleted];
    const deleteConfirmed = confirm(`Are you sure you want to delete ${courseToBeDeleted.title}`);
    if (deleteConfirmed) {
        courseToBeDeleted.isDeleted = true;
        localStorage.setItem(CONFIG_DATA, JSON.stringify(configData));
        showAlert({ msg: 'Course deleted' });
        reloadCourses();
    }
}
function addCourse() {
    const configData = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
    const courseDiv = document.querySelector(`.${COURSE}:last-child`);
    const newCourseThemeDiv = courseDiv.querySelector(`.${COURSE_THEME}`);
    const newCourseTheme = newCourseThemeDiv.getAttribute(ATTR_THEME);
    const newCourseTitleInput = courseDiv.querySelector(`.${COURSE_TITLE}`);
    const newCourseTitle = newCourseTitleInput.value;
    if (!newCourseTitle) {
        newCourseTitleInput.focus();
        return showAlert({ msg: 'Please enter a course code' });
    }
    const newUuid = uuid();
    const newCourse = { theme: newCourseTheme, title: newCourseTitle, uuid: newUuid };
    configData.courses.push(newCourse);
    localStorage.setItem(CONFIG_DATA, JSON.stringify(configData));
    showAlert({ msg: 'Course added' });
    initNewLastTheme();
    reloadCourses();
}
function reloadCourses() {
    const { courses } = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{ courses: [] }');
    const coursesToShow = courses.filter(({ isDeleted }) => !isDeleted);
    emptyTable(`#${COURSE_LIST}`);
    const emptyCoursesDiv = document.getElementById(EMPTY_COURSES);
    if (coursesToShow.length > 0 || addCourseClicked)
        addClass(emptyCoursesDiv, DISPLAY_NONE);
    else
        removeClass(emptyCoursesDiv, DISPLAY_NONE);
    const courseList = document.getElementById(COURSE_LIST);
    const lastCourseTheme = localStorage.getItem(LAST_NEW_THEME);
    const coursesLength = coursesToShow.length;
    const stopLength = coursesLength === 0 ? (addCourseClicked ? 0 : -1) : coursesLength;
    for (let i = 0; i <= stopLength; i++) {
        const { theme, title, uuid } = coursesToShow[i] ?? {
            uuid: '',
            title: '',
            theme: getRndColor()
        };
        const courseColor = uuid || !lastCourseTheme ? theme : lastCourseTheme;
        const courseDiv = document.createElement('div');
        addClass(courseDiv, COURSE);
        const courseTheme = document.createElement('button');
        addClass(courseTheme, COURSE_THEME);
        courseTheme.style.background = courseColor;
        courseTheme.setAttribute(ATTR_THEME, courseColor);
        const courseTitle = document.createElement('input');
        addClass(courseTitle, COURSE_TITLE);
        courseTitle.placeholder = 'Enter a course';
        courseTitle.value = title;
        if (uuid) {
            courseTitle.addEventListener('blur', e => {
                const target = e.target;
                const newTitle = target.value;
                if (newTitle !== title) {
                    const configData = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
                    configData.courses[i].title = newTitle;
                    localStorage.setItem(CONFIG_DATA, JSON.stringify(configData));
                    reloadCourses();
                    reloadLastTimetable();
                }
            });
        }
        else {
            courseTitle.addEventListener('keydown', (e) => {
                const name = e.key;
                if (name === 'Enter')
                    addCourse();
            }, false);
        }
        courseTitle.onfocus = () => {
            courseTitle.style.borderBottomColor = courseColor;
        };
        courseTitle.onblur = () => {
            courseTitle.style.borderBottomColor = 'transparent';
        };
        const courseAction1 = document.createElement('button');
        const courseActionClassName1 = uuid ? COURSE_DELETE : COURSE_ADD;
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
    const newColor = getRndColor();
    localStorage.setItem(LAST_NEW_THEME, newColor);
}
function closeAllModals() {
    const overlay = document.getElementById(OVERLAY);
    addClass(overlay, HIDDEN);
    const modals = document.getElementsByClassName(MODAL);
    for (let i = 0; i < modals.length; i++) {
        addClass(modals.item(i), HIDDEN);
    }
}
function openModal(modalID) {
    const overlay = document.getElementById(OVERLAY);
    removeClass(overlay, HIDDEN);
    const modal = document.getElementById(modalID);
    removeClass(modal, HIDDEN);
}
function setCourseClicked() {
    addCourseClicked = true;
    reloadCourses();
}
function reloadSettings() {
    const { startTime, endTime, courseDurationSpacing } = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
    const newStartTimeInput = document.getElementById(NEW_START_TIME);
    const newEndTimeInput = document.getElementById(NEW_END_TIME);
    const newCourseDurationInput = document.getElementById(COURSE_DURATION);
    const newStartTime = `${startTime.hour.toString().padStart(2, '0')}:${startTime.minute?.toString().padStart(2, '0') ?? '00'}`;
    const newEndTime = `${endTime.hour.toString().padStart(2, '0')}:${endTime.minute?.toString().padStart(2, '0') ?? '00'}`;
    newStartTimeInput.value = newStartTime;
    newEndTimeInput.value = newEndTime;
    newCourseDurationInput.value = courseDurationSpacing.toString();
}
function saveConfig() {
    const newCourseDurationInput = document.getElementById(COURSE_DURATION);
    const newCourseDuration = newCourseDurationInput.value;
    const configData = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
    configData.courseDurationSpacing = Number(newCourseDuration);
    localStorage.setItem(CONFIG_DATA, JSON.stringify(configData));
    reloadSettings();
    closeAllModals();
    showAlert({ msg: 'Configuration saved' });
}
function openTimePicker(chosenTimeType) {
    const picker = document.querySelector(`.${PICKER}`);
    removeClass(picker, HIDDEN);
    localStorage.removeItem(CHOSEN_TIME);
    localStorage.setItem(CHOSEN_TIME_TYPE, chosenTimeType);
}
function closeTimePicker() {
    const chosenTimeDiv = document.querySelector(`.${TIME}`);
    if (chosenTimeDiv.innerText.includes('_')) {
        return showAlert({ msg: 'Please select time', zIndex: '10002' });
    }
    const [chosenTime, meridian] = chosenTimeDiv.innerText.split(' ');
    const [hour, minute] = chosenTime.split(':');
    const chosenTimeType = localStorage.getItem(CHOSEN_TIME_TYPE);
    let configData = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
    if (chosenTimeType === 'start') {
        configData.startTime.minute = Number(minute);
        configData.startTime.hour = meridian === 'AM' ? Number(hour) : (Number(hour) + 12) % 24;
    }
    else {
        configData.endTime.minute = Number(minute);
        configData.endTime.hour = meridian === 'AM' ? Number(hour) : (Number(hour) + 12) % 24;
    }
    localStorage.setItem(CONFIG_DATA, JSON.stringify(configData));
    reloadSettings();
    const picker = document.querySelector(`.${PICKER}`);
    addClass(picker, HIDDEN);
}
const die = () => { };
function pool(array, poolLength, blanksAllowed) {
    const newPool = [];
    for (let i = 0; i < poolLength; i++) {
        let newElement = randomSelect([
            randomSelect(array),
            blanksAllowed ? null : randomSelect(array)
        ]);
        newPool.push(newElement);
    }
    return newPool;
}
function generateTimetable() {
    const { courses, courseDurationSpacing, endTime, startTime, timetables } = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
    let courseDurationSpacingMs = courseDurationSpacing * 60 * 1000;
    let monthDetails = `${year}-${month.toString().padStart(2, '0')}-${monthDate
        .toString()
        .padStart(2, '0')}`;
    let timeStart = getDateProps(`${monthDetails}T${startTime.hour.toString().padStart(2, '0')}:${startTime.minute?.toString().padStart(2, '0') ?? '00'}`).millisecondsFromInception;
    let timeEnd = getDateProps(`${monthDetails}T${endTime.hour.toString().padStart(2, '0')}:${endTime.minute?.toString().padStart(2, '0') ?? '00'}`).millisecondsFromInception;
    let tableRows = [];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    daysOfWeek.forEach((dayOfWeek) => {
        let tableRow = { courseUuids: [], dayOfWeek };
        const newPool = pool(courses.map(({ uuid }) => uuid), 20, true);
        while (timeStart + courseDurationSpacingMs <= timeEnd) {
            const randomElement = randomSelect(newPool);
            tableRow.courseUuids.push(randomElement ?? '');
        }
        tableRows.push(tableRow);
    });
    const newUuid = uuid();
    const newTimetable = {
        endTime,
        startTime,
        tableRows,
        uuid: newUuid,
        courseDurationSpacing
    };
    currentTimetable = newTimetable;
    console.log(newTimetable);
    const configData = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
    configData.timetables.push(newTimetable);
    localStorage.setItem(CONFIG_DATA, JSON.stringify(configData));
    reloadLastTimetable();
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
