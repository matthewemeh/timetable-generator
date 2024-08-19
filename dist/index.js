"use strict";
const { PRIMARY } = COLORS;
const { ATTR_THEME, ATTR_COURSE_SLOT_ID } = ATTRIBUTES;
const { CONFIG_DATA, LAST_NEW_THEME, CHOSEN_TIME_TYPE } = LOCAL_STORAGE_KEYS;
const { OVERLAY, TIMETABLE, INFO_TILE, TODAY_TEXT, COURSE_NAME, COURSE_LIST, NEW_END_TIME, EMPTY_COURSES, NEW_START_TIME, SETTINGS_CONFIG, COURSE_DURATION, COURSE_COLOR_INPUT, COURSE_COLOR_CONFIG } = IDs;
const { TIME, MODAL, ACTIVE, COURSE, BUTTON, HIDDEN, PICKER, COURSE_DAY, COURSE_ROW, COURSE_ADD, CURSOR_MOVE, COURSE_DAYS, COURSE_TIME, COURSE_SLOT, COURSE_TITLE, DISPLAY_NONE, COURSE_THEME, DASHED_BORDER, COURSE_DELETE, COURSE_SLOT_DELETE } = CLASSES;
const { HOUR_VALUE, MINUTE_VALUE, MERIDIAN_VALUE } = QUERIES;
const { year, month, hour12, minutes, monthDate, longDayOfWeek, longMonthName } = getDateProps();
let addCourseClicked = false;
let dragSourceCourseSlotID;
function handleCourseSlotDragStart() {
    this.style.opacity = '0.4';
    dragSourceCourseSlotID = this.getAttribute(ATTR_COURSE_SLOT_ID);
    const courseSlots = document.querySelectorAll(`.${COURSE_SLOT}`);
    courseSlots.forEach(slot => addClass(slot, DASHED_BORDER));
}
function handleDragEnd() {
    this.style.opacity = '1';
    const courseSlots = document.querySelectorAll(`.${COURSE_SLOT}`);
    courseSlots.forEach(slot => removeClass(slot, DASHED_BORDER));
}
function handleDragOver(e) {
    e.preventDefault();
    return false;
}
function handleCourseSlotDrop(e) {
    const { ATTR_COURSE_SLOT_ID } = ATTRIBUTES;
    const { CONFIG_DATA } = LOCAL_STORAGE_KEYS;
    e.stopPropagation();
    const dragDestinationCourseSlotID = this.getAttribute(ATTR_COURSE_SLOT_ID);
    if (dragSourceCourseSlotID !== dragDestinationCourseSlotID) {
        const sourceCourseSlot = document.querySelector(`[${ATTR_COURSE_SLOT_ID}="${dragSourceCourseSlotID}"]`);
        const destinationCourseSlot = document.querySelector(`[${ATTR_COURSE_SLOT_ID}="${dragDestinationCourseSlotID}"]`);
        const configData = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
        if (!configData.timetable)
            return showAlert({ msg: 'An error has occured' });
        let [sourceCourseSlotDayIndex, sourceCourseSlotIndex] = dragSourceCourseSlotID
            .split('-', 2)
            .map(Number);
        let [destinationCourseSlotDayIndex, destinationCourseSlotIndex] = dragDestinationCourseSlotID.split('-', 2).map(Number);
        const tempCourse = configData.timetable.tableRows[sourceCourseSlotDayIndex].courseUuids[sourceCourseSlotIndex];
        const tempCourseSlot = sourceCourseSlot;
        configData.timetable.tableRows[sourceCourseSlotDayIndex].courseUuids[sourceCourseSlotIndex] =
            configData.timetable.tableRows[destinationCourseSlotDayIndex].courseUuids[destinationCourseSlotIndex];
        sourceCourseSlot.style.background = destinationCourseSlot.style.background;
        sourceCourseSlot.style.gridColumnStart = destinationCourseSlot.style.gridColumnStart;
        configData.timetable.tableRows[destinationCourseSlotDayIndex].courseUuids[destinationCourseSlotIndex] = tempCourse;
        destinationCourseSlot.style.background = tempCourseSlot.style.background;
        destinationCourseSlot.style.gridColumnStart = tempCourseSlot.style.gridColumnStart;
        localStorage.setItem(CONFIG_DATA, JSON.stringify(configData));
        reloadLastTimetable();
        showAlert({ msg: 'Timetable updated' });
    }
    return false;
}
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
    const { courseDurationSpacing, endTime, startTime, timetable } = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
    if (timetable) {
        initTimeframe(courseDurationSpacing, startTime, endTime);
    }
}
function reloadLastTimetable() {
    const { timetable, courses } = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
    if (!timetable)
        return;
    const { courseDurationSpacing, startTime, endTime } = timetable;
    initTimeframe(courseDurationSpacing, startTime, endTime);
    const courseRows = document.getElementsByClassName(COURSE_ROW);
    timetable.tableRows.forEach(({ courseUuids }, i) => {
        courseUuids.forEach((courseUuid, j) => {
            const courseRow = courseRows.item(j);
            if (courseRow) {
                const targetedCourse = courses.find(({ uuid }) => uuid === courseUuid);
                const course = document.createElement('div');
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
                    const deleteButton = document.createElement('button');
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
    const coursesLength = coursesToShow.length;
    const stopLength = coursesLength === 0 ? (addCourseClicked ? 0 : -1) : coursesLength;
    emptyTable(`#${COURSE_LIST}`);
    const emptyCoursesDiv = document.getElementById(EMPTY_COURSES);
    if (coursesToShow.length > 0 || addCourseClicked)
        addClass(emptyCoursesDiv, DISPLAY_NONE);
    else
        removeClass(emptyCoursesDiv, DISPLAY_NONE);
    const courseList = document.getElementById(COURSE_LIST);
    const lastCourseTheme = localStorage.getItem(LAST_NEW_THEME);
    for (let i = 0; i <= stopLength; i++) {
        const { theme, title, uuid } = coursesToShow[i] ?? {
            uuid: '',
            title: '',
            theme: getRndColor({ format: 'HEX' })
        };
        const courseColor = uuid || !lastCourseTheme ? theme : lastCourseTheme;
        const handleColorChange = () => {
            const courseName = document.getElementById(COURSE_NAME);
            courseName.innerText = title;
            const colorPicker = document.getElementById(COURSE_COLOR_INPUT);
            colorPicker.value = courseColor;
            colorPicker.onchange = (e) => {
                let configData = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
                const targetCourseIndex = configData.courses.findIndex(course => course.uuid === uuid);
                const target = e.target;
                const newTheme = target.value;
                const courseAdded = targetCourseIndex > -1;
                if (courseAdded) {
                    configData.courses[targetCourseIndex].theme = newTheme;
                    localStorage.setItem(CONFIG_DATA, JSON.stringify(configData));
                    reloadLastTimetable();
                }
                else {
                    localStorage.setItem(LAST_NEW_THEME, newTheme);
                }
                reloadCourses();
                closeAllModals();
            };
            openModal(COURSE_COLOR_CONFIG);
        };
        const courseDiv = document.createElement('div');
        addClass(courseDiv, COURSE);
        const courseTheme = document.createElement('button');
        addClass(courseTheme, COURSE_THEME);
        courseTheme.style.background = courseColor;
        courseTheme.onclick = handleColorChange;
        courseTheme.setAttribute(ATTR_THEME, courseColor);
        const courseTitle = document.createElement('input');
        addClass(courseTitle, COURSE_TITLE);
        courseTitle.placeholder = 'Enter a course';
        courseTitle.value = title;
        if (uuid) {
            courseTitle.onblur = (e) => {
                let configData = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
                const targetCourseIndex = configData.courses.findIndex(course => course.uuid === uuid);
                const target = e.target;
                const newTitle = target.value;
                courseTitle.style.borderBottomColor = 'transparent';
                if (newTitle !== title) {
                    configData.courses[targetCourseIndex].title = newTitle;
                    localStorage.setItem(CONFIG_DATA, JSON.stringify(configData));
                    reloadCourses();
                    reloadLastTimetable();
                }
            };
        }
        else {
            courseTitle.onkeydown = (e) => {
                const name = e.key;
                if (name === 'Enter')
                    addCourse();
            };
        }
        courseTitle.onfocus = () => {
            courseTitle.style.borderBottomColor = courseColor;
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
    const newColor = getRndColor({ format: 'HEX' });
    localStorage.setItem(LAST_NEW_THEME, newColor);
}
function closeAllModals() {
    const overlay = document.getElementById(OVERLAY);
    addClass(overlay, HIDDEN);
    const picker = document.querySelector(`.${PICKER}`);
    if (!picker.classList.contains(HIDDEN))
        addClass(picker, HIDDEN);
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
    const { startTime, endTime } = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
    const hourValue = document.querySelector(HOUR_VALUE);
    const minuteValue = document.querySelector(MINUTE_VALUE);
    const meridianValue = document.querySelector(MERIDIAN_VALUE);
    if (chosenTimeType === 'start') {
        hourValue.innerText = `${startTime.hour > 12 ? startTime.hour - 12 : startTime.hour}`;
        minuteValue.innerText = startTime.minute?.toString().padStart(2, '0') ?? '00';
        meridianValue.innerText = ` ${startTime.hour >= 12 ? 'PM' : 'AM'}`;
    }
    else {
        hourValue.innerText = `${endTime.hour > 12 ? endTime.hour - 12 : endTime.hour}`;
        minuteValue.innerText = endTime.minute?.toString().padStart(2, '0') ?? '00';
        meridianValue.innerText = ` ${endTime.hour >= 12 ? 'PM' : 'AM'}`;
    }
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
function emptyTimetable() {
    const timetableContainer = document.getElementById(TIMETABLE);
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
    const configData = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
    configData.timetable = null;
    localStorage.setItem(CONFIG_DATA, JSON.stringify(configData));
    emptyTimetable();
}
function generateTimetable() {
    const { courses, courseDurationSpacing, endTime, startTime } = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
    const coursesToShow = courses.filter(({ isDeleted }) => !isDeleted);
    if (coursesToShow.length === 0) {
        return showAlert({ msg: 'Please add courses' });
    }
    let courseDurationSpacingMs = courseDurationSpacing * 60 * 1000;
    let monthDetails = `${year}-${month.toString().padStart(2, '0')}-${monthDate
        .toString()
        .padStart(2, '0')}`;
    let timeEnd = getDateProps(`${monthDetails}T${endTime.hour.toString().padStart(2, '0')}:${endTime.minute?.toString().padStart(2, '0') ?? '00'}`).millisecondsFromInception;
    let tableRows = [];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    daysOfWeek.forEach((dayOfWeek) => {
        let tableRow = { courseUuids: [], dayOfWeek };
        const newPool = pool(coursesToShow.map(({ uuid }) => uuid), coursesToShow.length * 10, true);
        let timeStart = getDateProps(`${monthDetails}T${startTime.hour.toString().padStart(2, '0')}:${startTime.minute?.toString().padStart(2, '0') ?? '00'}`).millisecondsFromInception;
        while (timeStart + courseDurationSpacingMs <= timeEnd) {
            const randomElement = randomSelect(newPool);
            tableRow.courseUuids.push(randomElement ?? '');
            timeStart += courseDurationSpacingMs;
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
    const configData = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
    configData.timetable = newTimetable;
    localStorage.setItem(CONFIG_DATA, JSON.stringify(configData));
    reloadLastTimetable();
}
function downloadTimetable() {
    const timetable = document.getElementById(TIMETABLE);
    if (timetable) {
        html2pdf(timetable);
    }
}
function deleteCourseSlot(dayIndex, courseID) {
    const configData = JSON.parse(localStorage.getItem(CONFIG_DATA) ?? '{}');
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
