import { Address } from '../model/address'
import { ValidationException } from '../exception/validation.exception'
import { AddressParamsValidator } from './address.params.validator'
import { StateTypeValidator } from './state.type.validator'


export class UpdateAddressValidator {
    public static validate(item: Address): void | ValidationException {
        if (item.zip_code !== undefined) AddressParamsValidator.validateZipCode(item.zip_code)
        if (item.street !== undefined) AddressParamsValidator.validateStreet(item.street)
        if (item.number !== undefined) AddressParamsValidator.validateNumber(item.number)
        if (item.complement !== undefined) AddressParamsValidator.validateComplement(item.complement)
        if (item.district !== undefined) AddressParamsValidator.validateDistrict(item.district)
        if (item.city !== undefined) AddressParamsValidator.validateCity(item.city)
        if (item.state !== undefined) StateTypeValidator.validate(item.state)
    }
}
