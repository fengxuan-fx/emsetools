function copyContactAddressForAdditionalLocation(conType, srcCapId, pcapId) { // optional fromCapId, optional toCapId

    itemCap = srcCapId;
    toCapId = pcapId;
    
   
    
    capContactResult = aa.people.getCapContactByCapID(itemCap);

    if (capContactResult.getSuccess()) {
        Contacts = capContactResult.getOutput();
        //loop through the contacts to find the contact type
        for (yy in Contacts) {
            var theContact = Contacts[yy].getCapContactModel();

            if(theContact.getContactType().toUpperCase().equals(conType.toUpperCase())) {

                var peopleModel = theContact.getPeople();
                var contactAddressrs = aa.address.getContactAddressListByCapContact(theContact);
                
                if (contactAddressrs.getSuccess()) {
                    var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());

                    // loop through the array list to find the conAddrType address
                    for(var index = 0; index < contactAddressModelArr.size(); index++) {
                        var contactAddress = contactAddressModelArr.get(index);

                      
                            
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

                            createAddressResult = aa.address.createAddressWithRefAddressModel(toCapId,addressModel.getRefAddressModel());

                            if (createAddressResult.getSuccess()) {
                                logDebug("Successfully copied the " + contactAddress.getStreetName() + " " + conType + " contact to the address tab.");
                                return true;
                            } else {
                                logDebug("Could not copy the contact address to the address: " + createAddressResult.getErrorType() + ":" + createAddressResult.getErrorMessage());
                                return false;
                            }
                        
                    }
                } 
            }
        }
    } else {
        logDebug("Could not retrieve record contacts: " + capContactResult.getErrorType() + ":" + capContactResult.getErrorMessage());
        return false;
    }

    logDebug("Error copying contact address to address");
    return false;
}

function convertContactAddressModelArr(contactAddressScriptModelArr)
{
    var contactAddressModelArr = null;
    if(contactAddressScriptModelArr != null && contactAddressScriptModelArr.length > 0)
    {
        contactAddressModelArr = aa.util.newArrayList();
        for(loopk in contactAddressScriptModelArr)
        {
            contactAddressModelArr.add(contactAddressScriptModelArr[loopk].getContactAddressModel());
        }
    }   
    return contactAddressModelArr;
}
