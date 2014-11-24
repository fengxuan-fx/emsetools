if (wfTask == "Security Review" && wfStatus == "Security Required") 
{
	var capId = getCapId();
	logDebug("Cap ID: " + capId);
	if(appMatch("Licenses/Milk Dealer/*/Application") || appMatch("Licenses/Milk Dealer/*/Renewal"))
	{
		addRecordToSet(capId);
	}
}