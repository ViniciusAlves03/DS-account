import { ValidationException } from '../exception/validation.exception'
import { Address } from '../model/address'
import { AddressParamsValidator } from './address.params.validator'
import { StateTypeValidator } from './state.type.validator'


export class CreateAddressValidator {
    public static validate(item: Address): void | ValidationException {
        const fields: Array<string> = []

        if (item.zip_code !== undefined) AddressParamsValidator.validateZipCode(item.zip_code)
        if (item.street !== undefined) AddressParamsValidator.validateStreet(item.street)
        if (item.number !== undefined) AddressParamsValidator.validateNumber(item.number)
        if (item.complement !== undefined) AddressParamsValidator.validateComplement(item.complement)
        if (item.district !== undefined) AddressParamsValidator.validateDistrict(item.district)
        if (item.city !== undefined) AddressParamsValidator.validateCity(item.city)
        if (item.state === undefined) fields.push('address.state')
        else StateTypeValidator.validate(item.state)

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Address validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
