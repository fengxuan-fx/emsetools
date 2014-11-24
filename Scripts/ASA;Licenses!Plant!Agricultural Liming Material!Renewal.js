showMessage = true;
cancel = true;

logDebug("Inside ASA renewal");
message = "Inside ASA renewal";
lime = loadASITable("LIME BRAND");
addlimeCount = 0;
if (lime) {
	for (x in lime) addlimeCount++;
	}
	
	logDebug("Lime brand count: " + addlimeCount);
	message = "Lime brand count: " + addlimeCount;

if(feeExists("PLNT_AGLIM")) removeFee("PLNT_AGLIM","FINAL");
	var feeObj = aa.finance.getFeeItemByCapID(capId);
	feeObj = feeObj.getOutput();
	message = "Fee details";
	for(x in feeObj)
	{
		logDebug(feeObj[x].getFee() + " " + feeObj[x].getFeeCod() + " " + feeObj[x].getFeeDescription());
		message = feeObj[x].getFee() + " " + feeObj[x].getFeeCod() + " " + feeObj[x].getFeeDescription();
	}
	
if (addlimeCount > 0) {
	if(!feeExists("PLNT_AGLIM")) addFee("PLNT_AGLIM","PLNT_AGLIM","FINAL",addlimeCount,"Y");
	
	}