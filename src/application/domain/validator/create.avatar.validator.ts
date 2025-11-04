import { ValidationException } from '../exception/validation.exception'
import { Image, ImageFormats } from '../model/image'
import { Strings } from '../../../utils/strings'


export class CreateAvatarValidator {
    public static validate(item: Image): void | ValidationException {
        const imageFormats: Array<string> = Object.values(ImageFormats)

        if (item.content_type !== undefined && !imageFormats.includes(item.content_type)) {
            throw new ValidationException(Strings.ERROR_MESSAGE.VALIDATE.INVALID_FIELDS,
                Strings.ERROR_MESSAGE.VALIDATE.IMAGE_FORMAT_DESC)
        }
        if (item.size !== undefined && Number(item.size) && Number(item.size) > 512000) {
            throw new ValidationException(Strings.ERROR_MESSAGE.VALIDATE.INVALID_FIELDS,
                Strings.ERROR_MESSAGE.VALIDATE.IMAGE_SIZE_TOO_LARGE)
        }
    }
}
