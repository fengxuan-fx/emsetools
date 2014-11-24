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
maxSeconds = 4.5 * 500;         // number of seconds allowed for batch processing, usually < 5*60
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
var recordType = aa.env.getValue("recordType");
var recordSubType =aa.env.getValue("recordSubType");
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
    var emptyCm = aa.cap.getCapModel().getOutput();
	var emptyCt = emptyCm.getCapType();
	emptyCt.setGroup("Licenses");
	emptyCt.setType(recordType);
	emptyCt.setSubType(recordSubType);
	emptyCt.setCategory("License");
	emptyCm.setCapType(emptyCt);
	var vCapList;
	var emptyGISArray = new Array();
	var tDate=sysDateMMDDYYYY;	
	var existingSet;
	var flag;
	var setID1;
	var setID2;
	//Generate set id
	setID1=  recordSubType + "_" + tDate + "_" + "RenewalNotice60DaysPrior";
	setID2= recordSubType + "_" + tDate + "_" + "RenewalNotice30DaysPrior";
	logDebug("Set ID1: " + setID1);
	logDebug("Set ID2: " + setID2);
	var setDescription= recordSubType + " " + "-" + " " + "Renewal";
	logDebug("Description:" + setDescription);
	var setType=setDescription;
	var createSetResult1= createSet(setID1,setDescription, setType, "Pending", "Processing");
	var createSetResult2= createSet(setID2,setDescription, setType, "Pending", "Processing");
	logDebug("Create Set Result for " + setID1 + ":  " + createSetResult1);
	logDebug("Create Set Result for " + setID2 + ":  " + createSetResult2);
	var renewalSetFor60=aa.set.getSetByPK(setID1);
	if(renewalSetFor60.getSuccess())
	{
		renewalSetFor60=renewalSetFor60.getOutput();
	}
 
	var renewalSetFor30=aa.set.getSetByPK(setID2);
	if(renewalSetFor30.getSuccess())
	{
		renewalSetFor30=renewalSetFor30.getOutput();
	}
	var vCapListResult = aa.cap.getCapListByCollection(emptyCm, null, null, null, null, null, emptyGISArray);
	if (vCapListResult.getSuccess())
	{
		vCapList = vCapListResult.getOutput();
	}
	else
	{
		logMessage("ERROR", "ERROR: Getting Records, reason is: " + vCapListResult.getErrorType() + ":" + vCapListResult.getErrorMessage());
	}
 
	for (thisCap in vCapList)
	{
		var capId = aa.cap.getCapID(vCapList[thisCap].getCapID().getID1(),vCapList[thisCap].getCapID().getID2(),vCapList[thisCap].getCapID().getID3()).getOutput();
		logDebug("Cap ID: " + capId);
		var b1ExpResultRec=aa.expiration.getLicensesByCapID(capId);
		//aa.print(b1ExpResultRec.getOutput());
		if(b1ExpResultRec.getSuccess())
		{
			//aa.print("test");
			b1ExpResult=b1ExpResultRec.getOutput();
 
			var expDate = b1ExpResult.getExpDate();
			if(expDate)
			{
				var b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
				logDebug("Expiration date Test: " + b1ExpDate);
				var oneDay = 24*60*60*1000;
				var addDays = new Date(Date.parse(b1ExpDate));
				//logDebug("Added Days" + addDays);
				var today = new Date();
				var dd = today.getDate();
				var mm = today.getMonth()+1; //January is 0!
				var yyyy = today.getFullYear();
				if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} var today = mm+'/'+dd+'/'+yyyy;
				var todayDate = new Date(Date.parse(today));
				//aa.print("Current Date" + today);
				var condition = Math.round(Math.abs((addDays.getTime() - todayDate.getTime())/(oneDay)));
				logDebug("Condition for Time: " + condition);
				var b1Status = b1ExpResult.getExpStatus();
				logDebug("Exp Status" + b1Status);
				if(b1Status=="About to Expire")
				{
						if(condition == 60)
						{
							logDebug("Custom ID for 60: " + capId.getCustomID());
							//aa.print(b1ExpResult.getCapID());
							var addResult= aa.set.addCapSetMember((renewalSetFor60.getSetID()),capId);
							//logDebug("Add set result: " + addResult.getSuccess());
							var report1=aa.reportManager.getReportInfoModelByName(reportName);
							report1=report1.getOutput();
							report1.setCapId(capId);
							report1.setModule("Licenses");
							var parameters=aa.util.newHashMap();
							parameters.put("capID", capId.getCustomID());
							parameters.put("Status", "About to Expire");
							report1.setReportParameters(parameters);
							logDebug("Report parameters: "+ report1.getReportParameters());
							var checkPermission=aa.reportManager.hasPermission("License Certificate",currentUserID);
							if(checkPermission.getOutput().booleanValue())
							{ 
								var reportResult1=aa.reportManager.getReportResult(report1);
								if(reportResult1)
								{
									reportResult1=reportResult1.getOutput();
									//logDebug("Report result: " + reportResult1);
									reportFile1=aa.reportManager.storeReportToDisk(reportResult1);
									reportFile1=reportFile1.getOutput();
									logDebug("Report File: " +reportFile1);
								}
							}
						}
						else if(condition == 30)
						{
							logDebug("Custom ID For 30: " + capId.getCustomID());
							var addResult= aa.set.addCapSetMember((renewalSetFor30.getSetID()),capId);
							//logDebug("Add set result: " + addResult.getSuccess());
							var report2=aa.reportManager.getReportInfoModelByName(reportName);
							report2=report2.getOutput();
							report2.setCapId(capId);
							report2.setModule("Licenses");
							var parameters=aa.util.newHashMap();
							parameters.put("capID", capId.getCustomID());
							parameters.put("Status", "About to Expire");
							report2.setReportParameters(parameters);
							logDebug("Report parameters: "+ report2.getReportParameters());
							var checkPermission=aa.reportManager.hasPermission("License Certificate",currentUserID);
							if(checkPermission.getOutput().booleanValue())
							{ 
								var reportResult2=aa.reportManager.getReportResult(report2);
								if(reportResult2)
								{
									reportResult2=reportResult2.getOutput();
									//logDebug("Report result: " + reportResult2);
									reportFile2=aa.reportManager.storeReportToDisk(reportResult2);
									reportFile2=reportFile2.getOutput();
									logDebug("Report File: " +reportFile2);
								}
							}
						}
				}
			}
		}
	}

	var setUpdateFor60= new capSet(renewalSetFor60.getSetID());
	setUpdateFor60.status="Completed";
	setUpdateFor60.comment="Successfully processed";
	setUpdateFor60.update();
 
	var setUpdateFor30= new capSet(renewalSetFor30.getSetID());
	setUpdateFor30.status="Completed";
	setUpdateFor30.comment="Successfully processed";
	setUpdateFor30.update();
}