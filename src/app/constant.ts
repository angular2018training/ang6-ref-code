import { Http } from '@angular/http';
import { Injectable } from '@angular/core';

export const VARIABLES = {
  USERNAME: 'username',
  ISLOGIN: 'isLogin',
  ROLE: 'role',
  PAGE_NOT_LOGIN: {
    LOGIN: 'login',
    CHANGE_PASSWORD: 'change_password',
    RESET_PASSWORD: 'reset_password',
  },
  OPERATOR: 'operator',
  CUSTOMER: 'customer',

  ACCOUNT_INFO: 'es-navi-layout',
  TOKEN: 'token',
  ACCESS_TOKEN: 'access_token',
  SECRET_KEY: 'es-navi-secret-key',
  PAGE_SAVE: 'page-save',
  API_KEY: 'AIzaSyDEEx-5uvRCDeZMPQmHoK394ycc1YXjNj0',

  MIN_PHONE_NUMBER: 9,
  MAX_PHONE_NUMBER: 14,
  INPUT_MAX_LENGTH: 100,
  INPUT_MAX_NAME: 100,
  INPUT_MAX_USER_NAME: 20,
  INPUT_MAX_EMAIL: 100,
  INPUT_MAX_PASSWORD: 20,
  ROW_PER_PAGE: [50, 100, 200, 500],
  DATA_CHANGED: 'data-changed'
}

// export const ERRORS = {
//   INVALID_TOKEN: 'invalid_token',
// }

export const PAGES = {
  COMMON: {
    LOGIN: '/login',
    CHANGE_PASSWORD: '/change-password',
    RESET_PASSWORD: '/reset-password',
  },
  OPERATOR: {
    HOME: '/home',
    DASH_BOARD: '/home/dashboard',
    CUSTOMER_MANAGEMENT: '/customer-management',
    CUSTOMER_LIST: '/customer-management/customer-list',
    CUSTOMER_DETAIL: '/customer-management/customer-list/customer-detail',
    CUSTOMER_CREATE: '/customer-management/customer-list/customer-create',
    OPERATOR_MANAGEMENT: '/operator-management',
    OPERATOR_LIST: '/operator-management/operator-list',
    OPERATOR_ADD: '/operator-management/operator-list/operator-add',
    OPERATOR_DETAIL: '/operator-management/operator-list/operator-detail',
    CHILLER_PLANT: '/chiller-plants',
    CHILLER_PLANT_DETAIL: '/chiller-plants/chiller-plant-detail',
    PLAN_MODEL: '/plant-model',
    MONITORING: '/monitoring',
    MONITORING_EXECUTION_HISTORY: '/monitoring/monitoring-execution-history',
    EXECUTION_SENDING_DETAIL: '/monitoring/monitoring-execution-history/execution-sending-detail',
    SYSTEM_CONFIGURATION: '/system-configuration',
    SMS_SERVICE: '/system-configuration/sms-service',
    EMAIL_SERVICE: '/system-configuration/email-service',
    SYSTEM_PARAMETER: '/system-configuration/system-parameter',
    WEATHER_SERVICE: '/system-configuration/weather-service',

    ANALYSIS_TOOL: '/analysis-tool',
    ENERGY_SAVING: '/analysis-tool/energy-saving',
    ENERGY_CONSUMPTION: '/analysis-tool/energy-consumption',
    EXECUTION_REPORT: '/analysis-tool/execution-report',
    CUSTOMER_REPORT: '/analysis-tool/customer-report'
  },
  CUSTOMER: {
    SMS_SETTING: '/sms-setting',
    NOTIFICATION_SETTING: '/notification-setting',
    REPORT: '/report',
    ENERGY_REPORT: '/report/energy-report',
    EXECUTION_REPORT: '/report/execution-report',
    NAVIGATION_HISTORY: '/navigation-history',
  }
}

export const TITLE_OBJ = {
  TITLE_OBJ: {
    '/home': 'HOME TITLE',
    '/home/dashboard': 'List Dashboard',
    '/customer-management/customer-list': 'Customer List',
    '/customer-management/customer-list/customer-detail': 'Customer Details',
    '/customer-management/customer-list/customer-create': 'Create Customer',

    '/operator-management/operator-list': 'Operator List',
    '/operator-management/operator-list/operator-add': 'Create Operator',
    '/operator-management/operator-list/operator-detail': 'Operator Detail',
    '/monitoring/monitoring-execution-history': 'Execution-Sending-History',
    '/monitoring/monitoring-execution-history/execution-sending-detail': 'Execution-Sending Details',

    '/system-configuration/sms-service': 'SMS Service',
    '/system-configuration/email-service': 'Email Service',
    '/system-configuration/system-parameter': 'System Parameter',
    '/system-configuration/weather-service': 'Weather Service',

    '/plant-model': 'Plant Model',
    '/analysis-tool/energy-saving': 'Energy Saving Report',
    '/analysis-tool/energy-consumption': 'Energy Consumption Report',
    '/analysis-tool/execution-report': 'Execution Report',
    '/analysis-tool/customer-report': 'Customer Report',

    //customer
    '/sms-setting': 'SMS Setting',
    '/notification-setting': 'Notification Setting',
    '/navigation-history': 'Navigation History',
    '/report': 'Report',
    '/report/energy-report': 'Energy Report',
    '/report/execution-report': 'Execution Report',
  },

  PARRENT_OBJ: {
    '/customer-management/customer-list': PAGES.OPERATOR.CUSTOMER_MANAGEMENT,
    '/customer-management/customer-list/customer-detail': PAGES.OPERATOR.CUSTOMER_MANAGEMENT,
    '/customer-management/customer-list/customer-create': PAGES.OPERATOR.CUSTOMER_MANAGEMENT,

    '/operator-management/operator-list': PAGES.OPERATOR.OPERATOR_MANAGEMENT,
    '/operator-management/operator-list/operator-detail': PAGES.OPERATOR.OPERATOR_MANAGEMENT,
    '/operator-management/operator-list/operator-add': PAGES.OPERATOR.OPERATOR_MANAGEMENT,

    '/monitoring/monitoring-execution-history': PAGES.OPERATOR.MONITORING,
    '/monitoring/monitoring-execution-history/execution-sending-detail': PAGES.OPERATOR.MONITORING,

    '/analysis-tool/energy-saving': PAGES.OPERATOR.ANALYSIS_TOOL,
    '/analysis-tool/energy-consumption': PAGES.OPERATOR.ANALYSIS_TOOL,
    '/analysis-tool/execution-report': PAGES.OPERATOR.ANALYSIS_TOOL,
    '/analysis-tool/customer-report': PAGES.OPERATOR.ANALYSIS_TOOL,

    '/system-configuration/sms-service': PAGES.OPERATOR.SYSTEM_CONFIGURATION,
    '/system-configuration/email-service': PAGES.OPERATOR.SYSTEM_CONFIGURATION,
    '/system-configuration/weather-service': PAGES.OPERATOR.WEATHER_SERVICE,
  }
}



export const APP_URL = {
  COMMON: [PAGES.COMMON.LOGIN, PAGES.COMMON.CHANGE_PASSWORD, PAGES.COMMON.RESET_PASSWORD],
  OPERATOR: [
    PAGES.OPERATOR.HOME,
    PAGES.OPERATOR.DASH_BOARD,
    PAGES.OPERATOR.CUSTOMER_MANAGEMENT,
    PAGES.OPERATOR.CUSTOMER_LIST,
    PAGES.OPERATOR.CUSTOMER_DETAIL,
    PAGES.OPERATOR.CUSTOMER_CREATE,

    PAGES.OPERATOR.OPERATOR_MANAGEMENT,
    PAGES.OPERATOR.OPERATOR_LIST,
    PAGES.OPERATOR.OPERATOR_ADD,
    PAGES.OPERATOR.OPERATOR_DETAIL,
    PAGES.OPERATOR.MONITORING,
    PAGES.OPERATOR.MONITORING_EXECUTION_HISTORY,
    PAGES.OPERATOR.EXECUTION_SENDING_DETAIL,
    PAGES.OPERATOR.SMS_SERVICE,
    PAGES.OPERATOR.EMAIL_SERVICE,
    PAGES.OPERATOR.SYSTEM_PARAMETER,
    PAGES.OPERATOR.SYSTEM_CONFIGURATION,
    PAGES.OPERATOR.WEATHER_SERVICE,

    PAGES.OPERATOR.ANALYSIS_TOOL,
    PAGES.OPERATOR.ENERGY_SAVING,
    PAGES.OPERATOR.ENERGY_CONSUMPTION,
    PAGES.OPERATOR.EXECUTION_REPORT,
    PAGES.OPERATOR.PLAN_MODEL,
    PAGES.OPERATOR.CUSTOMER_REPORT
  ],
  CUSTOMER: [
    PAGES.CUSTOMER.SMS_SETTING,
    PAGES.CUSTOMER.NOTIFICATION_SETTING,
    PAGES.CUSTOMER.NAVIGATION_HISTORY,
    PAGES.CUSTOMER.REPORT,
    PAGES.CUSTOMER.ENERGY_REPORT,
    PAGES.CUSTOMER.EXECUTION_REPORT,
  ]
}

export const MENUS_OF_ROLE = {
  MENU_FOR_OPERATOR: [
    {
      "id": "10",
      "label": "CUSTOMER MANAGEMENT",
      "type": "toggle",
      "pages": [
        {
          "id": "11",
          "label": "Customer List",
          "url": PAGES.OPERATOR.CUSTOMER_MANAGEMENT,
          "type": "page"
        }
      ]
    },
    {
      "id": "20",
      "label": "OPERATOR MANAGEMENT",
      "type": "toggle",
      "pages": [
        {
          "id": "21",
          "label": "Operator List",
          "url": PAGES.OPERATOR.OPERATOR_MANAGEMENT,
          "type": "page"
        }
      ]
    },
    {
      "id": "30",
      "label": "MONITORING",
      "type": "toggle",
      "pages": [
        {
          "id": "21",
          "label": "Monitoring Execution History",
          "url": PAGES.OPERATOR.MONITORING,
          "type": "page"
        }
      ]
    },
    {
      "id": "40",
      "label": "ANALYSIS TOOL",
      "type": "toggle",
      "pages": [
        {
          "id": "41",
          "label": "Energy Consumption",
          "url": PAGES.OPERATOR.ENERGY_CONSUMPTION,
          "type": "page"
        },
        {
          "id": "42",
          "label": "Energy Saving",
          "url": PAGES.OPERATOR.ENERGY_SAVING,
          "type": "page"
        },
        {
          "id": "43",
          "label": "Execution Report",
          "url": PAGES.OPERATOR.EXECUTION_REPORT,
          "type": "page"
        },
        {
          "id": "44",
          "label": "Customer Report",
          "url": PAGES.OPERATOR.CUSTOMER_REPORT,
          "type": "page"
        }
      ]
    },
    {
      "id": "50",
      "label": "SYSTEM CONFIGURATION",
      "type": "toggle",
      "pages": [
        {
          "id": "52",
          "label": "SMS Service",
          "url": PAGES.OPERATOR.SMS_SERVICE,
          "type": "page"
        },
        {
          "id": "53",
          "label": "Email Service",
          "url": PAGES.OPERATOR.EMAIL_SERVICE,
          "type": "page"
        },
        {
          "id": "54",
          "label": "System Parameter",
          "url": PAGES.OPERATOR.SYSTEM_PARAMETER,
          "type": "page"
        },
        {
          "id": "55",
          "label": "Weather Service",
          "url": PAGES.OPERATOR.WEATHER_SERVICE,
          "type": "page"
        },
      ]
    }
  ],

  MENU_FOR_CUSTOMER: [
    {
      "id": "90",
      "label": "NAVIGATION",
      "type": "toggle",
      "pages": [
        {
          "id": "91",
          "label": "Navigation History",
          "url": PAGES.CUSTOMER.NAVIGATION_HISTORY,
          "type": "page"
        }
      ]
    },

    {
      "id": "110",
      "label": "REPORT",
      "type": "toggle",
      "pages": [
        {
          "id": "111",
          "label": "Energy Report",
          "url": PAGES.CUSTOMER.ENERGY_REPORT,
          "type": "page"
        },
        {
          "id": "112",
          "label": "Execution Report",
          "url": PAGES.CUSTOMER.EXECUTION_REPORT,
          "type": "page"
        }
      ]
    },
    {
      "id": "100",
      "label": "NOTIFICATION SETTING",
      "type": "toggle",
      "pages": [
        {
          "id": "102",
          "label": "Notification Setting",
          "url": PAGES.CUSTOMER.NOTIFICATION_SETTING,
          "type": "page"
        }
      ]
    }
  ]
}

export class API_CONFIGURATION {
  public static SERVER = 'https://vutran1647/';
  // public static SERVER = window.location.origin+'/';
  public static PROJECT_NAME_API = 'esnavi/api/';
  public static SERVICE = 'management/';
  public static ANALYSIS = 'analysis/';
  public static RESOURCE_VERSION = 'v1/';

  public static SERVER_WITH_API_VERSION = API_CONFIGURATION.SERVER + API_CONFIGURATION.PROJECT_NAME_API + API_CONFIGURATION.SERVICE + API_CONFIGURATION.RESOURCE_VERSION;
  public static ANALYSIS_SERVICE_API_VERSION = API_CONFIGURATION.SERVER + API_CONFIGURATION.PROJECT_NAME_API + API_CONFIGURATION.ANALYSIS + API_CONFIGURATION.RESOURCE_VERSION;

  // analysis
  // public static ANALYSIS = 'analysis/';
  // public static ANALYSIS_WITH_API_VERSION = API_CONFIGURATION.SERVER + API_CONFIGURATION.PROJECT_NAME_API + API_CONFIGURATION.ANALYSIS + API_CONFIGURATION.RESOURCE_VERSION;

  public static API_URLS = {
    TIME_ZONE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'timezone/get',

    CHILLER_PLANT: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'chiller-plant',
    DEFAULT_TABLE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'default-table',
    CUSTOMER_LIST: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'customers',
    CREATE_CUSTOMER: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'customers',
    CHANGE_PASSWORD_CUSTOMER: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'customers/reset',
    COUNTRY_PROVICE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'country',
    DELETE_CUSTOMER: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'customers',
    CUSTOMER_DETAIL: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'customers',
    SEARCH_CUSTOMER: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'customers/search',

    OPERATOR: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'operators',
    OPERATOR_DETAIL: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'operators/display',
    OPERATOR_CREATE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'operators/create',
    OPERATOR_UPDATE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'operators/update',
    OPERATOR_RESET: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'operators/reset',
    OPERATOR_DELETE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'operators/delete',

    SCHEDULE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'schedules',
    SCHEDULE_UPDATE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'operators/update',

    LOGIN: API_CONFIGURATION.SERVER + 'esnavi/api/oauth/oauth/token',
    LOGOUT: API_CONFIGURATION.SERVER + API_CONFIGURATION.PROJECT_NAME_API + 'oauth/v1/users/revoke-token',
    CHANGE_PASSWORD: API_CONFIGURATION.SERVER + 'esnavi/api/oauth/v1/users/{userID}/change-password',
    FORGOT_PASSWORD: API_CONFIGURATION.SERVER + 'esnavi/api/oauth/v1/users/forgot-password',
    RESET_PASSWORD: API_CONFIGURATION.SERVER + 'esnavi/api/oauth/v1/users/reset-password',

    //Get partner by chiller plant ID
    LIST_PARTNER: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'connections/getprovider',
    //Get data connection by chiller plant ID & provider ID
    CONNECTION_DETAIL: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'connections/getconnection',
    //Update by chiller plant id & provider ID
    CONNECTION_UPDATE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'connections/save',
    //Test connection
    TEST_CONNECTION: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'connections/test',

    DATA_MAPPING: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'mapping/collector',

    //bms
    BMS_LIST: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'bms',
    BMS_UPLOAD: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'bms',
    BMS_UPDATE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'bms/update',
    BMS_DELETE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'bms',
    BMS_DETAIL: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'bms',

    WEATHER_DATA_GET: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'mapping/weather/get',
    WEATHER_DATA_SAVE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'mapping/weather/save',

    //base-line
    BASE_LINE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'baseline',
    BASE_LINE_UPDATE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'baseline',

    //weather-service
    WEATHER_SERVICE_GET: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'config/weather/get',
    WEATHER_SERVICE_UPDATE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'config/weather/save',
    WEATHER_SERVICE_TEST: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'config/weather/test',

    //unit price
    UNIT_PRICE_LIST: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'unitprice',
    UNIT_PRICE_CURRENCY: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'unitprice/currency',
    UNIT_PRICE_CREATE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'unitprice/create',
    UNIT_PRICE_UPDATE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'unitprice/update',
    UNIT_PRICE_DETAIL: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'unitprice',
    UNIT_PRICE_DELETE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'unitprice/delete',

    //Energy cunsumption
    ENERGY_CONSUMPTION: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'report',
    ENERGY_CONSUMPTION_SEARCH: API_CONFIGURATION.SERVER + API_CONFIGURATION.PROJECT_NAME_API + 'analysis/' + API_CONFIGURATION.RESOURCE_VERSION + 'report/consumption/view',
    EXECUTION_REPORT_ADMIN_SEARCH: API_CONFIGURATION.SERVER + API_CONFIGURATION.PROJECT_NAME_API + 'analysis/' + API_CONFIGURATION.RESOURCE_VERSION + 'report/execution/view',
    DOWNLOAD_ENERGY_CONSUMPTION_REPORT_HISTORY: API_CONFIGURATION.SERVER + API_CONFIGURATION.PROJECT_NAME_API + 'analysis/' + API_CONFIGURATION.RESOURCE_VERSION + 'report/consumption/export',
    
    // operator execution report
    DOWNLOAD_OPERATOR_EXECUTION_REPORT_HISTORY: API_CONFIGURATION.SERVER + API_CONFIGURATION.PROJECT_NAME_API + 'analysis/' + API_CONFIGURATION.RESOURCE_VERSION + 'report/execution/export',

    // Energy saving
    REPORT_CUSTOMER_LIST: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'report/getcustomer',
    REPORT_BUILDING_LIST: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'report/getbuilding',
    REPORT_CHILLER_PLANT: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'report/getchillerplant',
    ENERGY_SAVING_SHOW_REPORT: API_CONFIGURATION.ANALYSIS_SERVICE_API_VERSION + 'energy-saving/show',
    ENERGY_SAVING_EXPORT_REPORT: API_CONFIGURATION.ANALYSIS_SERVICE_API_VERSION + 'energy-saving/export',

    // Customer report
    CUSTOMER_REPORT_VIEW: API_CONFIGURATION.ANALYSIS_SERVICE_API_VERSION + 'customer-report',
    CUSTOMER_REPORT_DOWNLOAD_REPORT: API_CONFIGURATION.ANALYSIS_SERVICE_API_VERSION + 'customer-report/download',
    CUSTOMER_REPORT_DELETE_REVISED: API_CONFIGURATION.ANALYSIS_SERVICE_API_VERSION + 'customer-report/delete',
    CUSTOMER_REPORT_DOWNLOAD_REVISED: API_CONFIGURATION.ANALYSIS_SERVICE_API_VERSION + 'customer-report/download',
    CUSTOMER_REPORT_UPLOAD_REVISED: API_CONFIGURATION.ANALYSIS_SERVICE_API_VERSION + 'customer-report/upload',

    //es expectation
    ES_EXPECTATION_LIST: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'es-expectation',
    ES_EXPECTATION_UPDATE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'es-expectation',

    //execution history
    EXECUTION_HISTORY_LIST: API_CONFIGURATION.SERVER + API_CONFIGURATION.PROJECT_NAME_API + 'analysis/' + API_CONFIGURATION.RESOURCE_VERSION + 'execution-history/search',
    EXECUTION_HISTORY_DETAIL: API_CONFIGURATION.SERVER + API_CONFIGURATION.PROJECT_NAME_API + 'analysis/' + API_CONFIGURATION.RESOURCE_VERSION + 'execution-history',
    DOWNLOAD_EXECUTION_REPORT_HISTORY: API_CONFIGURATION.SERVER + API_CONFIGURATION.PROJECT_NAME_API + 'analysis/' + API_CONFIGURATION.RESOURCE_VERSION + 'execution-report-history/download',


    // report
    ENERGY_REPORT_SEARCH: API_CONFIGURATION.SERVER + API_CONFIGURATION.PROJECT_NAME_API + 'analysis/' + API_CONFIGURATION.RESOURCE_VERSION + 'energy-report-history/search',
    EXECUTION_REPORT_SEARCH: API_CONFIGURATION.SERVER + API_CONFIGURATION.PROJECT_NAME_API + 'analysis/' + API_CONFIGURATION.RESOURCE_VERSION + 'execution-report-history/search',
    DOWNLOAD_ENERGY_REPORT_HISTORY: API_CONFIGURATION.SERVER + API_CONFIGURATION.PROJECT_NAME_API + 'analysis/' + API_CONFIGURATION.RESOURCE_VERSION + 'energy-report-history/download',

    // navigation history
    NAVIGATION_HISTORY_SEARCH: API_CONFIGURATION.SERVER + API_CONFIGURATION.PROJECT_NAME_API + 'analysis/' + API_CONFIGURATION.RESOURCE_VERSION + 'navigation-history/search',
    NAVIGATION_HISTORY_CHILLER_PLANT_LIST: API_CONFIGURATION.SERVER + API_CONFIGURATION.PROJECT_NAME_API + 'analysis/' + API_CONFIGURATION.RESOURCE_VERSION + 'navigation-history/load-page',

    // notification setting
    NOTIFICATION_SETTING_LIST: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'notification-setting',
    NOTIFICATION_SETTING_DELETE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'notification-setting/',

    // sms service
    SMS_SERVICE_DETAIL: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'config/sms/get',
    SMS_SERVICE_UPDATE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'config/sms/save',
    TEST_SMS_SERVICE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'config/sms/test',
    // email service
    EMAIL_SERVICE_DETAIL: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'config/email/get',
    EMAIL_SERVICE_UPDATE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'config/email/save',
    SES_TEST_EMAIL_SERVICE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'config/email/ses/test',
    SMTP_TEST_EMAIL_SERVICE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'config/email/smtp/test',

    // performance curve
    PERFORMANCE_CURVE_LIST: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'performance-curve',
    PERFORMANCE_CURVE_DELETE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'performance-curve/delete',
    PERFORMANCE_CURVE_ADD: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'performance-curve',
    PERFORMANCE_CURVE_UPDATE: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'performance-curve/update',
    PERFORMANCE_CURVE_DOWN: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'performance-curve/download',

    //default patametter
    GET_DEFAULT_PARAMETER: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'default-table',
    UPDATE_DEFAULT_PARAMETER: API_CONFIGURATION.SERVER_WITH_API_VERSION + 'default-table',

    // export plant model
    EXPORT_PLANT_MODEL: API_CONFIGURATION.SERVER + API_CONFIGURATION.PROJECT_NAME_API + 'hss/' + API_CONFIGURATION.RESOURCE_VERSION + 'export',
    IMPORT_PLANT_MODEL: API_CONFIGURATION.SERVER + API_CONFIGURATION.PROJECT_NAME_API + 'hss/' + API_CONFIGURATION.RESOURCE_VERSION + 'import',
    // IMPORT_PLANT_MODEL: '172.18.4.65:9412/v1/import',
    
    // collect tag name
    COLLECT_TAG_NAME: API_CONFIGURATION.SERVER + API_CONFIGURATION.PROJECT_NAME_API + 'collector/' +  API_CONFIGURATION.RESOURCE_VERSION + 'data-collections'
  }
}

export const MESSAGE = {
  SUCCESS: {
    CREATE_CHILLER_PLANT_SUCCESS: 'The new chiller plant was created successfully',
    CREATE_OPERATOR_SUCCESS: 'The new operator was created successfully',
    CREATE_CUSTOMER_SUCCESS: 'The new customer was created successfully',
    CREATE_SCHEDULE_SUCCESS: 'The new schedule was created successfully',
    CREATE_UNIT_PRICE_SUCCESS: 'The New unit price was created successfully',
    SAVE_SUCCESS: 'Saved successfully',
    DELETE_SUCCESS: 'Deleted successfully',
    UPDATE_SUCCESS: 'Updated successfully',
    CHANGE_PASSWORD_SUCCESS: 'Your password has been reset successfully',
    CONNECTION_SUCCESS: 'Connect successfully ',
    EXPORT_SUCCESS: 'Export successfully',
  },

  ERROR: {
    SAVE_ERROR: 'Saved Error',
    DELETE_ERROR: 'Deleted Error',
    UPDATE_ERROR: 'Updated Error',

    CONNECT_SERVER: 'Error Connect To Server',
    NOT_HAVE_DATA: 'Do Not Have Any Data',

    LOST_USERNAME: 'Please Input Username',
    LOST_PASSWORD: 'Please Input Password',
    VALID_USERNAME: 'The username contains at least 5 characters',
    NOT_MATCH_PASS_OLD_CONFIRM: 'Password does not match the confirm password',
    WRONG_USERNAME_PASSWORD: 'Incorrect username or password',
    WRONG_CUR_PASSWORD: 'Incorrect Password',
    INVALID_PASSWORD: 'Password must have at least 8 characters',
    EMAIL_INVALID: 'Please enter a valid email address',
    PHONE_NUMBER_INVALID: 'Phone number is invalid',
    INVALID_TOKEN: 'invalid_token',
    FILL_ON_REQUIRED_FIELD: 'Please fill on required field',
    SOMETHING_WENT_WRONG: 'Something went wrong',
    CONNECTION_FAILURE: 'Connection Fail',
    INVALID_REST_API_URL: 'Invalid REST API url',
    INVALID_URL: 'Invalid URL',
    INVALID_FILE: 'Invalid File',
    INVALID_FILE_SIZE: 'This image is too big. Please choose another one',
    REQUIRED: 'This field is required',
    CHANGE_PASSWORD_ERROR: 'Failed to reset password',
    INVALID_BASELINE_NUMBER: 'Invalid base line number',

    NO_RESULT_FOUND: 'No results found',
    INVALID_EQUIPMENT_NAME: 'Invalid equipment name',
    OPERATOR: {
      INPUT_FIRSTNAME: 'Firstname is required',
      INPUT_LASTNAME: 'Lastname is required',
      INPUT_USERNAME: 'Username is required',
      INPUT_CUR_PASS: 'Current password is required',
    }
  }
}

export const ROLES = {
  CUSTOMER_ROLE_ID: 2,
}

export const LANGUAGES = {
  CUSTOMER_LANGUAGE_ID: 1,
}