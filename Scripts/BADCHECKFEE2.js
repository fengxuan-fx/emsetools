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
maxSeconds = 4.5 * 1311;         // number of seconds allowed for batch processing, usually < 5*60
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
   logDebug("Batch Job" + batchJobName + " Job ID is " + batchJobID);
}
else
   logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());

/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var setType = aa.env.getValue("setType");
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
	var flag=0;
	
	for(i=0;;i++)
	{
		var setID= setType + "_" + tDate + "_" + (i+1);
		var setScriptSearch = aa.set.getSetHeaderScriptModel().getOutput();
		setScriptSearch.setSetID(setID);
		//setScriptSearch.setSetStatus("Pending");
		var setHeaderList = aa.set.getSetHeaderListByModel(setScriptSearch);
		if (setHeaderList.getSuccess()) 
		{
			setHeaderList = setHeaderList.getOutput();
			if(setHeaderList.get(0).getSetStatus().equalsIgnoreCase("Pending"))
			{
				var setList = setHeaderList.getOutput();
				setID4Process = String(setList.get(0).getSetID());
				logDebug("Set ID:" + setID4Process);
				flag=1;
				break;
			}
			else if (setHeaderList.get(0).getSetStatus().equalsIgnoreCase("Completed"))
			{
				//logDebug("Set doesn't exist");
				continue;
			}
		}
		else
		{
			break;
		}
	}
	
	if(flag==1)
	{
		var setMembers=aa.set.getCAPSetMembersByPK(setID4Process);
		var array=new Array();
		array=setMembers.getOutput();
		logDebug("Number of CAP members: " + array.size());
	
		for(j=0;j<array.size();j++)
		{
			var setMember=array.get(j);
			setMember=setMember.toString();
			var ids=new Array();
			ids=setMember.split("-");
			var license = aa.cap.getCap(ids[0], ids[1], ids[2]);
			license= license.getOutput();
			var licenseID = license.getCapID();
			var custID = licenseID.getCustomID();
			logDebug("Set Member " + (j+1) + ":" + custID);
		
			var parameters=aa.util.newHashMap();
			parameters.put("b1.b1_alt_id",custID);
						
			report=aa.reportManager.getReportInfoModelByName(reportName);
			report=report.getOutput();
			report.setCapId(custID);
			report.setModule("Licenses");
			report.setReportParameters(parameters);
			logDebug("Report parameters: "+ report.getReportParameters());
			var checkPermission=aa.reportManager.hasPermission(reportName,currentUserID);
				
			if(checkPermission.getOutput().booleanValue())
			{   
				logDebug(currentUserID + "has permission");
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
		
		var setUpdate= new capSet(setID4Process);
		setUpdate.status="Completed";
		setUpdate.comment="Successfully processed";
		setUpdate.update();
	}		
}

