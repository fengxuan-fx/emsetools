
function getCapsByContAndAddress(conObj, conAddrType) {

    // retrieves caps with matching contact names and trx address matches contact address
    itemCap = capId;
    if (arguments.length == 3) {
        itemCap = arguments[2]; // use cap ID specified in args
    }

    var returnArray = new Array();

    var theContact = conObj;

    var addr = null;
    var pmcal = theContact.addresses;
    if (pmcal) {
        for (var thisPm in pmcal) {
            if (conAddrType == String(pmcal[thisPm].getAddressType())) {
                addr = pmcal[thisPm];
				logDebug("addr = " + addr);
                if (addr) {
                    caps = aa.cap.getCapListByDetailAddress(addr.getStreetName(), addr.getHouseNumberStart() ? parseInt(addr.getHouseNumberStart()) : null, addr.getStreetSuffix(), addr.getZip(), addr.getStreetSuffixDirection(), null).getOutput();

                    if (caps && caps.length) {
                        logDebug("found " + caps.length + " record(s) at this address: " + addr.getHouseNumberStart() + " " + addr.getStreetSuffixDirection() + " " + addr.getStreetName() + " " + addr.getStreetSuffix() + " " + addr.getZip());
                        for (var iii in caps) {
                            var contactArray2 = getContactObjs(caps[iii].getCapID());
                            for (var ic in contactArray2) {
                                logDebug("comparing " + theContact + " ==> " + contactArray2[ic]);
                                if (contactArray2[ic].equals(theContact))
                                    returnArray.push(caps[iii]);
                            }
                        }
                    }
                }
                else {
                    logDebug("no records found at address: " + addr.getHouseNumberStart() + " " + addr.getStreetSuffixDirection() + " " + addr.getStreetName() + " " + addr.getStreetSuffix() + " " + addr.getZip());
                }
            }
        }
    }



    if (returnArray.length) {
        logDebug("returning " + returnArray.length + " records");
        return returnArray;
    }
    else {
        logDebug("no records found for contact/address " + conObj + " : " + conAddrType);
        return false;
    }
}

