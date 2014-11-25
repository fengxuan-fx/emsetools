function runReportForAmendment(capId, status, seqNumber,reportName)
{
	logDebug("Inside runReport");
	var parameters=aa.util.newHashMap();
	parameters.put("capID", capId.getCustomID());
	parameters.put("Status", status);
	report=aa.reportManager.getReportInfoModelByName(reportName);
	report=report.getOutput();
   
	report.setCapId(capId.getCustomID());
	report.setModule("Licenses");
	report.setReportParameters(parameters); 
						
	logDebug("Report parameters: "+ report.getReportParameters());
	var checkPermission=aa.reportManager.hasPermission("License Certificate",currentUserID);
	if(checkPermission.getOutput().booleanValue())
	{
		logDebug(currentUserID + "  has permission"); 
		/*var reportResult=aa.reportManager.getReportResult(report);
		if(reportResult)
		{
			reportResult=reportResult.getOutput();
			logDebug("Report result: " + reportResult);
			reportFile=aa.reportManager.storeReportToDisk(reportResult);
			reportFile=reportFile.getOutput();
			logDebug("Report File: " +reportFile);
		}*/       
	}
}