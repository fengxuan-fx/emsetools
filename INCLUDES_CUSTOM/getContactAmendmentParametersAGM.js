function getContactAmendmentParametersAGM() {
	
	var feeRecordTypesToAmendSting = lookup("CONTACT AMENDMENT PARAMETERS","feeRecordTypesToAmend");
	if (!matches(feeRecordTypesToAmendSting,undefined,null,"")) 
		feeRecordTypesToAmend = feeRecordTypesToAmendSting.split(",");
	else
		feeRecordTypesToAmend = [];

	var noFeeRecordTypesToAmendString = lookup("CONTACT AMENDMENT PARAMETERS","noFeeRecordTypesToAmend");
	if (!matches(noFeeRecordTypesToAmendString,undefined,null,""))
		noFeeRecordTypesToAmend = noFeeRecordTypesToAmendString.split(",");
	else
		noFeeRecordTypesToAmend = [];

	var excludedStatusListString = lookup("CONTACT AMENDMENT PARAMETERS","excludedStatusList");
	if (!matches(excludedStatusListString,undefined,null,""))
		excludedStatusList = excludedStatusListString.split(",");
	else
		excludedStatusList = [];

	var includedStatusListString = lookup("CONTACT AMENDMENT PARAMETERS","includedStatusList");
	if (!matches(includedStatusListString,undefined,null,""))
		includedStatusList = includedStatusListString.split(",");
	else
		includedStatusList = [];

	var changeFeeString = lookup("CONTACT AMENDMENT PARAMETERS","changeFee");
	if (changeFeeString != undefined)
		changeFee = changeFeeString;
	else
		changeFee = 0;

}