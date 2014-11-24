showMessage = true;
cancel = true;

logDebug("Inside CTRCA");
message = "Inside CTRCA";

if(!publicUser)
{
	lime = loadASITable("LIME BRAND");
	addlimeCount = 0;
	if (lime) {
		for (x in lime) addlimeCount++;
	}
	
	logDebug("Lime brand count: " + addlimeCount);
	message= "Lime brand count: " + addlimeCount;

	if (addlimeCount > 0) {
		logDebug("Updating fee");
		removeFee("PLNT_AGLIM","FINAL");
		var feeObj = aa.finance.getFeeItemByCapID(capId);
		feeObj = feeObj.getOutput();
		message = "Fee details";
		for(x in feeObj)
		{
		logDebug(feeObj[x].getFee() + " " + feeObj[x].getFeeCod() + " " + feeObj[x].getFeeDescription());
		message = feeObj[x].getFee() + " " + feeObj[x].getFeeCod() + " " + feeObj[x].getFeeDescription();
	}
	addFee("PLNT_AGLIM","PLNT_AGLIM","FINAL",addlimeCount,"Y");
	}
	
aa.cap.updateAccessByACA(capId,"Y");
}
