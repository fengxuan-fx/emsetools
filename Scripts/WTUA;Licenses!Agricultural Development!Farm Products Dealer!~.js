//logDebug("Inside Farm Products Dealer Renewal and App" + capId);
if (wfTask == "Preliminary Security Review" && wfStatus == "No Security Required")
{
	//logDebug("Inside security review");
	if(appMatch("Licenses/Agricultural Development/Farm Products Dealer/Application"))
	{
		addToSecuritySet("Farm Products Dealer", capId, "Security Participation", "App");
	}
	
	if (appMatch("Licenses/Agricultural Development/Farm Products Dealer/Renewal"))
	{
		addToSecuritySet("Farm Products Dealer", capId, "Security Participation", "Renewal");
	}
}


