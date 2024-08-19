const CLASSES = {
    TIME: 'time',
    BUTTON: 'btn',
    ALERT: 'alert',
    MODAL: 'modal',
    HIDDEN: 'hidden',
    ACTIVE: 'active',
    COURSE: 'course',
    PICKER: 'picker',
    COURSE_ADD: 'course-add',
    COURSE_ROW: 'course-row',
    COURSE_DAY: 'course-day',
    CURSOR_MOVE: 'cursor-move',
    COURSE_DAYS: 'course-days',
    COURSE_SLOT: 'course-slot',
    COURSE_TIME: 'course-time',
    DISPLAY_NONE: 'display-none',
    COURSE_TITLE: 'course-title',
    COURSE_THEME: 'course-theme',
    DASHED_BORDER: 'dashed-border',
    COURSE_DELETE: 'course-delete',
    COURSE_SLOT_DELETE: 'delete-course-slot-btn'
};

const IDs = {
    OVERLAY: 'overlay',
    INFO_TILE: 'info-tile',
    TIMETABLE: 'timetable',
    TODAY_TEXT: 'today-text',
    COURSE_NAME: 'course-name',
    COURSE_LIST: 'course-list',
    NEW_END_TIME: 'new-end-time',
    EMPTY_COURSES: 'empty-courses',
    NEW_START_TIME: 'new-start-time',
    COURSE_COLOR_INPUT: 'course-color',
    SETTINGS_CONFIG: 'settings-config',
    COURSE_DURATION: 'course-duration',
    COURSE_COLOR_CONFIG: 'course-color-config'
};

const QUERIES = {
    HOUR_VALUE: '.part.hour',
    MINUTE_VALUE: '.part.min',
    MERIDIAN_VALUE: '.part.am-pm'
};

const COLORS = {
    PRIMARY: 'var(--theme-1)'
};

const ATTRIBUTES = {
    ATTR_THEME: 'data-theme',
    ATTR_COURSE_SLOT_ID: 'course-slot-id'
};

const LOCAL_STORAGE_KEYS = {
    CONFIG_DATA: 'configData',
    LAST_NEW_THEME: 'lastNewColor',
    CHOSEN_TIME_TYPE: 'chosenTimeType'
};

const configData: ConfigData = {
    courses: [],
    endTime: { hour: 16 },
    startTime: { hour: 8 },
    courseDurationSpacing: 60 /* in minutes */,
    timetable: null
};
