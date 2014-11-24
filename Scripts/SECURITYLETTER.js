/*------------------------------------------------------------------------------------------------------/
| Program: Batch Expiration.js  Trigger: Batch
| Client:
|
| Version 1.0 - Base Version. 11/01/08 JHS
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
emailText = "";
maxSeconds = 4.5 * 300;         // number of seconds allowed for batch processing, usually < 5*60
message = "";
br = "<br>";
/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 2.0
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_CUSTOM"));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
eval(getScriptText("INCLUDES_BATCH"));

function getScriptText(vScriptName) {
vScriptName = vScriptName.toUpperCase();
var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
return emseScript.getScriptText() + "";
}

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
showDebug = aa.env.getValue("showDebug").substring(0, 1).toUpperCase().equals("Y");
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID();
batchJobName = "" + aa.env.getValue("BatchJobName");
wfObjArray = null;

batchJobID = 0;
if (batchJobResult.getSuccess()) {
   batchJobID = batchJobResult.getOutput();
   logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
}
else
   logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());

/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var reportName = aa.env.getValue("reportName");
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
logDebug("Start of Job");
mainProcess();
logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
function mainProcess() 
{
	var tDate=sysDateMMDDYYYY;
	var emailTemplateName;
	var setId = "Security Letter" + "_" + tDate;
	logDebug("Set Id: " + setId);
	
	var setResult=aa.set.getSetByPK(setId);
	if(setResult.getSuccess())
	{
		setResult=setResult.getOutput();
		if(setResult.getSetStatus.equalsIgnoreCase("Pending"))
		{
			var setMembers=aa.set.getCAPSetMembersByPK(setId);
			var array=new Array();
			array=setMembers.getOutput();
			logDebug("Number of CAP members: " + array.size());
			for(var j=0; j<array.size(); j++)
			{
				var setMember=array.get(j);
				setMember=setMember.toString();
				var ids=new Array();
				ids=setMember.split("-");
				var license = aa.cap.getCap(ids[0], ids[1], ids[2]);
				license= license.getOutput();
				var licenseID = license.getCapID();
				var customID= licenseID.getCustomID();
				logDebug("Set Member " + (j+1) + ":" + customID);
				var parameters=aa.util.newHashMap();
				parameters.put("b1.b1_alt_id", customID);
				//parameters.put("Status", "Additional Info Required");
				logDebug("Report parameters for license: " + parameters);
				report=aa.reportManager.getReportInfoModelByName(reportName);
				report=report.getOutput();
				report.setCapId(customID);
				report.setModule("Licenses");
				report.setReportParameters(parameters); 
				logDebug("Report parameters: "+ report.getReportParameters());
				var checkPermission=aa.reportManager.hasPermission(reportName,currentUserID);
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
			}
		
			var setUpdate= new capSet(setId);
			setUpdate.status="Completed";
			setUpdate.comment="Successfully processed";
			setUpdate.update();
		}
		
	}
}