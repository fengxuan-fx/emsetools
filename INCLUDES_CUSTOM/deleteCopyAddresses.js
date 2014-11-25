function deleteCopyAddresses(pFromCapId, pToCapId) {
    //Copies all property addresses from pFromCapId to pToCapId
    //If pToCapId is null, copies to current CAP
    //

    // modified original function to delete all of the addresses
    // on the target CAP first
	logDebug("Inside deletCopyAddress Function");
    if (pToCapId == null){
        var vToCapId = capId;
		logDebug("PTOCAOD NULL" + vToCapId);
		}
    else{
        var vToCapId = pToCapId;
	logDebug("PTOCAOD NOT NULL" + vToCapId);
	}
    //check if target CAP has primary address
    var capAddressResult = aa.address.getAddressByCapId(vToCapId);
	logDebug("Cap Addresses" + capAddressResult.getSuccess());
    if (capAddressResult.getSuccess()) {
        Address = capAddressResult.getOutput();
		logDebug("Address" + Address);
        for(yy in Address) {
		
            addrOnTarget = Address[yy];
			logDebug("Address On Target" + addrOnTarget);
            delResult = aa.address.removeAddress(vToCapId, addrOnTarget.getAddressId());
			logDebug("Delete Result" +delResult.getSuccess());
            if (!delResult.getSuccess()) {
                logDebug("Error removing address on target CAP " + delResult.getErrorMessage());
				logDebug("Errors Out");
            }
        }
    }
    else {
        logMessage("**ERROR: Failed to get addresses: " + capAddressResult.getErrorMessage());
        return false;
    };

    //logDebug("pFromCapId=" + pFromCapId + "pToCapId=" + pToCapId);

    //get addresses from originating CAP
    var capAddressResult = aa.address.getAddressWithAttributeByCapId(pFromCapId);
    var copied = 0;
    if (capAddressResult.getSuccess()) {
        Address = capAddressResult.getOutput();
        for(yy in Address) {
		logDebug("Address Info Test" + Address[yy]);
            newAddress = Address[yy];
            newAddress.setCapID(vToCapId);
            aa.address.createAddressWithAPOAttribute(vToCapId, newAddress);
            logDebug("Copied address from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
            copied++;
        }
    }
    else {
        logMessage("**ERROR: Failed to get addresses: " + capAddressResult.getErrorMessage());
        return false;
    }
    return copied;
}