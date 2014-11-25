function copyContactAddressToAddress(conObj, conAddrType, trxAddrType) { // optional fromCapId, optional toCapId

    itemCap = capId;
    toCapId = capId;

    if (arguments.length == 4) {
        itemCap = arguments[3]; // use cap ID specified in args
    }

    if (arguments.length == 5) {
        toCapId = arguments[4]; // use cap ID specified in args
    }

    var contactAddressModelArr = conObj.people.getContactAddressList();

    // loop through the array list to find the conAddrType address
    for (var index = 0; index < contactAddressModelArr.size(); index++) {
        var contactAddress = contactAddressModelArr.get(index);

        if (contactAddress.getAddressType().toUpperCase() == conAddrType.toUpperCase()) {

            addressModel = aa.address.createRefAddressScriptModel();

            addressModel.getRefAddressModel().setFullAddress(contactAddress.getFullAddress());
            addressModel.getRefAddressModel().setAddressLine1(contactAddress.getAddressLine1());
            addressModel.getRefAddressModel().setAddressLine2(contactAddress.getAddressLine2());
            addressModel.getRefAddressModel().setCounty(contactAddress.getAddressLine3());
            addressModel.getRefAddressModel().setHouseNumberStart(contactAddress.getHouseNumberStart());
            addressModel.getRefAddressModel().setHouseNumberEnd(contactAddress.getHouseNumberEnd());
            addressModel.getRefAddressModel().setHouseNumberAlphaStart(contactAddress.getHouseNumberAlphaStart());
            addressModel.getRefAddressModel().setHouseNumberAlphaEnd(contactAddress.getHouseNumberAlphaEnd());
            addressModel.getRefAddressModel().setLevelPrefix(contactAddress.getLevelPrefix());
            addressModel.getRefAddressModel().setLevelNumberStart(contactAddress.getLevelNumberStart());
            addressModel.getRefAddressModel().setLevelNumberEnd(contactAddress.getLevelNumberEnd());
            addressModel.getRefAddressModel().setValidateFlag(contactAddress.getValidateFlag());
            addressModel.getRefAddressModel().setStreetDirection(contactAddress.getStreetDirection());
            addressModel.getRefAddressModel().setStreetPrefix(contactAddress.getStreetPrefix());
            addressModel.getRefAddressModel().setStreetName(contactAddress.getStreetName());
            addressModel.getRefAddressModel().setStreetSuffix(contactAddress.getStreetSuffix());
            addressModel.getRefAddressModel().setUnitType(contactAddress.getUnitType());
            addressModel.getRefAddressModel().setUnitStart(contactAddress.getUnitStart());
            addressModel.getRefAddressModel().setUnitEnd(contactAddress.getUnitEnd());
            addressModel.getRefAddressModel().setStreetSuffixdirection(contactAddress.getStreetSuffixDirection());
            addressModel.getRefAddressModel().setCountryCode(contactAddress.getCountryCode());
            addressModel.getRefAddressModel().setCity(contactAddress.getCity());
            addressModel.getRefAddressModel().setState(contactAddress.getState());
            addressModel.getRefAddressModel().setZip(contactAddress.getZip());
            //addressModel.getRefAddressModel().setRefAddressId(contactAddress.getAddressID());
            addressModel.getRefAddressModel().setAuditStatus("A");
            addressModel.getRefAddressModel().setAuditID("ADMIN");
            addressModel.getRefAddressModel().setAuditDate(aa.util.now());
            addressModel.getRefAddressModel().setAddressType(trxAddrType); // doesn't work, have to set it below.

            createAddressResult = aa.address.createAddressWithRefAddressModel(toCapId, addressModel.getRefAddressModel());

            if (createAddressResult.getSuccess()) {
                logDebug("Successfully copied the " + contactAddress.getStreetName() + " " + conAddrType + " contact address on the " + conObj + " contact to the address tab.");

                var newAddModel = aa.address.getAddressByPK(toCapId, createAddressResult.getOutput()).getOutput().getAddressModel();
                newAddModel.setAddressType(trxAddrType);
                var editAddResult = aa.address.editAddress(newAddModel);

                if (editAddResult.getSuccess())
                    logDebug("Updated address type to " + trxAddrType);
                else
                    logDebug("Error updating address type to " + trxAddrType + " : " + editAddResult.getErrorMessage());

                assignInspectionDistrict(toCapId,contactAddress.getAddressLine3(),createAddressResult.getOutput());
                
                return true;
            } else {
                logDebug("Could not copy the contact address to the address: " + createAddressResult.getErrorType() + ":" + createAddressResult.getErrorMessage());
                return false;
            }
        }
    }

    logDebug("Error copying contact address to address");
    return false;
}