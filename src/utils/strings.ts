export abstract class Strings {
    public static readonly APP: any = {
        TITLE: 'Account Service',
        APP_DESCRIPTION: 'Micro-service for Account.'
    }

    public static readonly PARAMETERS: any = {
        COULD_NOT_BE_UPDATED: 'This parameter could not be updated!'
    }

    public static readonly ENUM_VALIDATOR: any = {
        NOT_MAPPED: 'Values not mapped for {0}',
        NOT_MAPPED_DESC: 'The mapped values are: {0}'
    }

    public static readonly USER: any = {
        EMAIL_ALREADY_REGISTERED: 'An User with this email already registered!',
        NOT_FOUND: 'User not found!',
        NOT_FOUND_DESCRIPTION: 'User not found or already removed. A new operation for the same resource is required!',
        PASSWORD_NOT_MATCH: 'Password does not match!',
        PASSWORD_NOT_MATCH_DESCRIPTION: 'The old password parameter does not match with the actual user password.',
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {user_id} is not in valid format!'
    }

    public static readonly ADMIN: any = {
        NOT_FOUND: 'Admin not found!',
        NOT_FOUND_DESCRIPTION: 'Admin not found or already removed. A new operation for the same resource is required.'
    }

    public static readonly ERROR_MESSAGE: any = {
        REQUEST_BODY_INVALID: 'Unable to process request body!',
        REQUEST_BODY_INVALID_DESC: 'Please verify that the JSON provided in the request body has a valid format and try again.',
        ENDPOINT_NOT_FOUND: 'Endpoint {0} does not found!',
        UNEXPECTED: 'An unexpected error has occurred. Please try again later...',
        PARAMETER_COULD_NOT_BE_UPDATED: 'This parameter could not be updated.',
        OPERATION_CANT_BE_COMPLETED: 'The operation could not be performed successfully.',
        OPERATION_CANT_BE_COMPLETED_DESC: 'Probably one or more of the request parameters are incorrect.',
        INTERNAL_SERVER_ERROR: 'An internal server error has occurred.',
        INTERNAL_SERVER_ERROR_DESC: 'Check all parameters of the operation being requested.',
        VALIDATE: {
            REQUIRED_FIELDS: 'Required fields were not provided...',
            REQUIRED_FIELDS_DESC: '{0} are required!',
            UUID_NOT_VALID_FORMAT: 'Some ID provided does not have a valid format!',
            UUID_NOT_VALID_FORMAT_DESC: 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.',
            INVALID_FIELDS: 'One or more request fields are invalid...',
            INVALID_BOOLEAN: '{0} must be a boolean!',
            INVALID_STRING: '{0} must be a string!',
            EMPTY_STRING: '{0} must have at least one character!',
            INVALID_NUMBER: '{0} must be a number!',
            NEGATIVE_INTEGER: '{0} must be an integer greater than or equal to zero!',
            NEGATIVE_OR_ZERO_INTEGER: '{0} must be an integer greater than zero!',
            NEGATIVE_NUMBER: '{0} must be a number greater than or equal to zero!',
            EDUCATION_LEVEL_TYPES_DESC: 'The allowed education level types are: {0}.',
            STATE_TYPES_DESC: 'The allowed state types are: {0}.',
            INVALID_DATA_TYPES_DESC: 'The data_types array must contain at least one element.',
            IMAGE_FORMAT_DESC: 'The image format must be jpg, jpeg or png.',
            IMAGE_SIZE_TOO_LARGE: 'The image size must be equal to or less than 500kb.'
        },
        DATE: {
            YEAR_NOT_ALLOWED: 'Date {0} has year not allowed. The year must be greater than 1678 and less than 2261.',
            INVALID_DATE_FORMAT: 'Date: {0}, is not in valid ISO 8601 format.',
            INVALID_DATE_FORMAT_DESC: 'Date must be in the format: yyyy-MM-dd',
            INVALID_DATETIME_FORMAT: 'Datetime: {0}, is not in valid ISO 8601 format.',
            INVALID_DATETIME_FORMAT_DESC: 'Datetime must be in the format: yyyy-MM-ddTHH:mm:ssZ'
        }
    }

    public static readonly IMAGE: any = {
        NOT_FOUND: 'Image not found!',
        NOT_FOUND_DESCRIPTION: 'Image not found or already removed. A new operation for the same resource is required.'
    }

    public static readonly HOLDER: any = {
        NOT_FOUND: 'Holder not found!',
        NOT_FOUND_DESCRIPTION: 'Holder not found or already removed. A new operation for the same resource is required.',
        CANNOT_BE_REMOVED: 'Holder cannot be removed!',
        CANNOT_BE_REMOVED_DESC: 'This Holder has associated dependents!',
    }

    public static readonly DEPENDENT: any = {
        NOT_FOUND: 'Dependent not found!',
        NOT_FOUND_DESCRIPTION: 'Dependent not found or already removed. A new operation for the same resource is required.',
        NOT_ASSOCIATED: 'Dependent not associated!',
        NOT_ASSOCIATED_DESCRIPTION: 'Dependent is not associated, make the association first'
    }
}
