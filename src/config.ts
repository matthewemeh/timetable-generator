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
    COURSE_DAYS: 'course-days',
    COURSE_SLOT: 'course-slot',
    COURSE_TIME: 'course-time',
    DISPLAY_NONE: 'display-none',
    COURSE_TITLE: 'course-title',
    COURSE_THEME: 'course-theme',
    COURSE_DELETE: 'course-delete'
};

const IDs = {
    OVERLAY: 'overlay',
    INFO_TILE: 'info-tile',
    TIMETABLE: 'timetable',
    TODAY_TEXT: 'today-text',
    COURSE_LIST: 'course-list',
    NEW_END_TIME: 'new-end-time',
    EMPTY_COURSES: 'empty-courses',
    NEW_START_TIME: 'new-start-time',
    SETTINGS_CONFIG: 'settings-config',
    COURSE_DURATION: 'course-duration'
};

const COLORS = {
    PRIMARY: 'var(--theme-1)'
};

const ATTRIBUTES = {
    ATTR_THEME: 'data-theme'
};

const LOCAL_STORAGE_KEYS = {
    CONFIG_DATA: 'configData',
    CHOSEN_TIME: 'chosenTime',
    LAST_NEW_THEME: 'lastNewColor',
    CHOSEN_TIME_TYPE: 'chosenTimeType'
};

const configData: ConfigData = {
    courses: [
        {
            theme: '#c00',
            title: 'CHG 121',
            uuid: 'tqc89wz6enlvh8emvwgm4xjtum8negrc'
        },
        {
            theme: '#00f',
            title: 'GEG 128',
            uuid: '1vzfk58o3ihbzhjhvjvw8rk6v9n2rdfh'
        },
        {
            theme: '#0f0',
            title: 'MAT 212',
            uuid: 'zdfgvcklpojycsbafj2m5wpco3bgbnrr'
        }
    ],
    endTime: { hour: 16 },
    startTime: { hour: 8 },
    courseDurationSpacing: 60 /* in minutes */,
    timetables: [
        {
            endTime: { hour: 9 },
            startTime: { hour: 0 },
            courseDurationSpacing: 60,
            uuid: 'd2ynx4lykgfmgrql4cw6cmkndbwv7zg8',
            tableRows: [
                {
                    dayOfWeek: 'Monday',
                    courseUuids: [
                        '',
                        'tqc89wz6enlvh8emvwgm4xjtum8negrc',
                        '1vzfk58o3ihbzhjhvjvw8rk6v9n2rdfh',
                        '',
                        'zdfgvcklpojycsbafj2m5wpco3bgbnrr',
                        '',
                        '',
                        '1vzfk58o3ihbzhjhvjvw8rk6v9n2rdfh'
                    ]
                },
                {
                    dayOfWeek: 'Tuesday',
                    courseUuids: [
                        'tqc89wz6enlvh8emvwgm4xjtum8negrc',
                        '1vzfk58o3ihbzhjhvjvw8rk6v9n2rdfh',
                        '',
                        '',
                        'zdfgvcklpojycsbafj2m5wpco3bgbnrr',
                        '',
                        '',
                        '1vzfk58o3ihbzhjhvjvw8rk6v9n2rdfh',
                        '1vzfk58o3ihbzhjhvjvw8rk6v9n2rdfh'
                    ]
                },
                {
                    dayOfWeek: 'Wednesday',
                    courseUuids: [
                        'tqc89wz6enlvh8emvwgm4xjtum8negrc',
                        '1vzfk58o3ihbzhjhvjvw8rk6v9n2rdfh',
                        '',
                        'zdfgvcklpojycsbafj2m5wpco3bgbnrr',
                        ''
                    ]
                },
                {
                    dayOfWeek: 'Thursday',
                    courseUuids: [
                        '',
                        '',
                        'tqc89wz6enlvh8emvwgm4xjtum8negrc',
                        '1vzfk58o3ihbzhjhvjvw8rk6v9n2rdfh',
                        'zdfgvcklpojycsbafj2m5wpco3bgbnrr'
                    ]
                },
                {
                    dayOfWeek: 'Friday',
                    courseUuids: [
                        'tqc89wz6enlvh8emvwgm4xjtum8negrc',
                        '1vzfk58o3ihbzhjhvjvw8rk6v9n2rdfh',
                        'zdfgvcklpojycsbafj2m5wpco3bgbnrr',
                        '',
                        '',
                        '1vzfk58o3ihbzhjhvjvw8rk6v9n2rdfh'
                    ]
                }
            ]
        }
    ]
};
