function addRecordToSet(capId)
{
	logDebug("Inside addRecordToSet");
	var tDate=sysDateMMDDYYYY;
	var setId = "Security Letter" + "_" + tDate;
	logDebug("Set Id: " + setId);

	var result;
	var addResultToSet;
	var setResult=aa.set.getSetByPK(setId);
	if(setResult.getSuccess())
	{
		setResult=setResult.getOutput();
		addResultToSet = aa.set.addCapSetMember(setResult.getSetID(),capId);
		logDebug("Add result to set: " + addResultToSet.getSuccess());
	}
	else
	{
		result=createSet(setId,"Milk Dealer - Security Letter","Milk Dealer - Security Letter" , "Pending", "Processing");
		if(result)
		{
			logDebug("Set created");
			var newSetResult=aa.set.getSetByPK(setId);
			if(newSetResult.getSuccess())
			{
				newSetResult=newSetResult.getOutput();
				addResultToSet = aa.set.addCapSetMember(newSetResult.getSetID(),capId);
				logDebug("Add result to set: " + addResultToSet.getSuccess());
			}
		}
	}
	
	/*if(addResultToSet)
	{
		var parameters=aa.util.newHashMap();
		parameters.put("capID", itemCap);
        parameters.put("Status", "Active");
		logDebug("Report parameters for license: " + parameters);
		report=aa.reportManager.getReportInfoModelByName("License Certificate");
		report=report.getOutput();
		report.setCapId(itemCap);
		report.setModule("Licenses");
		report.setReportParameters(parameters);
		logDebug("Report parameters: "+ report.getReportParameters());
		var checkPermission=aa.reportManager.hasPermission("License Certificate",currentUserID);
		if(checkPermission.getOutput().booleanValue())
		{
			var reportResult=aa.reportManager.getReportResult(report);
			if(reportResult)
			{
				reportResult=reportResult.getOutput();
				logDebug("Report result: " + reportResult);
				reportFile=aa.reportManager.storeReportToDisk(reportResult);
				reportFile=reportFile.getOutput();
				logDebug("Report File: " +reportFile);
         }       
    }
	}*/
}