import { ValidationException } from '../exception/validation.exception'
import { LanguageTypes } from '../utils/language.types'


export class LanguageValidator {
    public static validate(lang: string): void | ValidationException {
        const languageTypes: Array<string> = Object.values(LanguageTypes)

        if (!languageTypes.includes(lang)) {
            throw new ValidationException(`The name of language provided ${lang} is not supported...`,
                `The names of the allowed language are: ${languageTypes.join(', ')}.`)
        }
    }
}
