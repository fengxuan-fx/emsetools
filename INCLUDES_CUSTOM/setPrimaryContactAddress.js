function setPrimaryContactAddress(contObj) {

    var defaultFound = false;

    if (contObj.addresses.length == 1) {
        contObj.addresses[0].getContactAddressModel().setPrimary("Y");
        defaultFound = true;
    } else if (contObj.addresses.length > 1) {
        var contactAddressTypeDefaultList = lookup("CONTACT_ADDRESS_TYPE_PRIMARY_DEFAULT",contObj.type);
        if (contactAddressTypeDefaultList != undefined) {
            defaultArray = contactAddressTypeDefaultList.split(",");
            
            for (da in defaultArray) {
                for (ta in contObj.addresses) {
                    if (defaultArray[da].toUpperCase() == contObj.addresses[ta].addressType.toUpperCase()) {
                        contObj.addresses[ta].getContactAddressModel().setPrimary("Y");
                        defaultFound = true;
                        break;
                    }
                }
                if (defaultFound) {
                    break;
                }
            }
        }
    }
    
    if (defaultFound) {
        contObj.save();
        logDebug(contObj.type + " primary address updated successfully.");
        return true;
    } else {
        logDebug(contObj.type + " primary address update failed.");
        return false;
    }

}