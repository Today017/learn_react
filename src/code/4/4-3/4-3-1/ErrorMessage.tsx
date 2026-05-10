import * as yup from 'yup';

const enLocale = {
    mixed: {
        required: param => `${param.label} is required.(myerror)`,
        oneOf: param => `${param.label} must be one of the following values: ${param.values}.(myerror)`,
    },
    string: {
        length: param => `${param.label} must be exactly ${param.length} characters.(myerror)`,
        min: param => `${param.label} must be at least ${param.min} characters.(myerror)`,
        max: param => `${param.label} must be at most ${param.max} characters.(myerror)`,
        matches: param => `${param.label} must match the following: "${param.regex}".(myerror)`,
        email: param => `${param.label} must be a valid email address.(myerror)`,
        url: param => `${param.label} must be a valid URL.(myerror)`,
    },
    number: {
        min: param => `${param.label} must be greater than or equal to ${param.min}.(myerror)`,
        max: param => `${param.label} must be less than or equal to ${param.max}.(myerror)`,
        lessThan: param => `${param.label} must be less than ${param.less}.(myerror)`,
        moreThan: param => `${param.label} must be greater than ${param.more}.(myerror)`,
        positive: param => `${param.label} must be a positive number.(myerror)`,
        negative: param => `${param.label} must be a negative number.(myerror)`,
        integer: param => `${param.label} must be an integer.(myerror)`,
    },
    date: {
        min: param => `${param.label} must be later than ${param.min}.(myerror)`,
        max: param => `${param.label} must be earlier than ${param.max}.(myerror)`,
    },
};

yup.setLocale(enLocale);
export default yup;