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
maxSeconds = 4.5 * 400;         // number of seconds allowed for batch processing, usually < 5*60
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
| END: USER CONFIGURABLE PARAMETERS 2
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
 	
var reportNameForSecurityNotice = aa.env.getValue("reportNameForSecurityNotice");
var emailAddressForAgency = aa.env.getValue("emailAddressForAgency");

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
logDebug("********************************");
mainProcess();
logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
function createXSet(setName,setDescription,setType,setStatus,setStatusComment) {


var setScript = aa.set.getSetHeaderScriptModel().getOutput();
setScript.setSetID(setName);
setScript.setSetTitle(setDescription);
setScript.setSetComment(setStatusComment);
setScript.setSetStatus(setStatus);
setScript.setRecordSetType(setType);
setScript.setServiceProviderCode(aa.getServiceProviderCode());
setScript.setAuditDate(aa.date.getCurrentDate());
setScript.setAuditID("admin");


var setCreateResult = aa.set.createSetHeader(setScript);
//logDebug("Result: " + setCreateResult.getSuccess());
return setCreateResult.getSuccess();
}


function mainProcess()
{
	logDebug("Retrieving license applications for evaluation (START)");
    logDebug("********************************");

    //Create a capModel for use with the get records method
    var capModel = aa.cap.getCapModel().getOutput();

    //Initialize the appList array
    var appList = new Array();
    var tempAppList = new Array();

    //List of application statuses to include in review
    var sArray = new Array("Active","About to Expire");

    /*------------------------------------------------------------------------------------------------------/
    |  Get the AGM Tonnage Licenses
    /------------------------------------------------------------------------------------------------------*/

    //Identify the AGM records for tonnage
    var aeSubTypes = new Array("Distributor","Store Selling Wholesale");
	
	 //Loop through the AGM records for tonnage
    for (aest in aeSubTypes) {
        
        capTypeModel = capModel.getCapType();
        capTypeModel.setGroup("Licenses");
        capTypeModel.setType("Milk Dealer");
        capTypeModel.setSubType(aeSubTypes[aest]);
        capTypeModel.setCategory("License");
        capModel.setCapType(capTypeModel);

        //Loop through the included statuses
        for (sa in sArray) {
            capModel.setCapStatus(sArray[sa]);

            appListResult = aa.cap.getCapIDListByCapModel(capModel);

            if (appListResult.getSuccess()) {
                tempAppList = appListResult.getOutput();
                logDebug(aeSubTypes[aest] + " - " + sArray[sa] + ": " + tempAppList.length);
                if (tempAppList.length > 0) {
                    for (tal in tempAppList) {
                        appList.push(tempAppList[tal]);
                    }
                }
            }       
        }

    }
	
	/*------------------------------------------------------------------------------------------------------/
    |  Create Set for storing of the records processed during the batch job
    /------------------------------------------------------------------------------------------------------*/
	var existingSet;
	var flag;
	var setID1;
	var setID2;
		
	var tDate= new Date();
	var dateString = (tDate.getMonth() +1) + "/" +  tDate.getDate() + "/" + tDate.getFullYear();
	setID1=  "Security Letter" + "_" + dateString;
	logDebug("Set ID1: " + setID1);
	var setDescription= "Security Letter" + " " + "-" + " " + "License";
	var setType=setDescription;
	var createSetResult1= createXSet(setID1,setDescription, setType, "Pending", "Processing");
	
	var renewalSetFor60=aa.set.getSetByPK(setID1);
	if(renewalSetFor60.getSuccess())
	{
		renewalSetFor60=renewalSetFor60.getOutput();
	}
	
	  /*------------------------------------------------------------------------------------------------------/
    |  Loop through the list of applications
    /------------------------------------------------------------------------------------------------------*/
    
    for (al in appList) {
        
        if (elapsed() > maxSeconds) { // only continue if time hasn't expired 
            logDebug("A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
            timeExpired = true ;
            break;
        }
		
	/*------------------------------------------------------------------------------------------------------/
        |  Check ethe tonnage requirements
        /------------------------------------------------------------------------------------------------------*/
		
		var capId = aa.cap.getCapID(appList[al].getCapID().getID1(),appList[al].getCapID().getID2(),appList[al].getCapID().getID3()).getOutput();
		logDebug("Cap ID: " + capId.getCustomID());
		var pLicArray = String(capId).split("-");
		var plCapId = aa.cap.getCapID(pLicArray[0],pLicArray[1],pLicArray[2]).getOutput();
		aa.print("Test" + plCapId);
		var status = aa.cap.getCap(capId).getOutput().getCapStatus();
		aa.print("CAP Status" + aa.cap.getCap(capId).getOutput().getCapStatus());
		
		var custom = capId.getCustomID();
		var license = aa.cap.getCap(capId).getOutput();
		var licenseID = license.getCapID();
		var b1ExpResultRec=aa.expiration.getLicensesByCapID(licenseID);
		
		if(b1ExpResultRec.getSuccess())
		{
			b1ExpResult=b1ExpResultRec.getOutput();
			var b1Status = b1ExpResult.getExpStatus();
			var expDate = b1ExpResult.getExpDate();
			if (expDate) var b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
			var oneDay = 24*60*60*1000;
			var addDays = new Date(Date.parse(b1ExpDate));
			
			var today = new Date();
    		var dd = today.getDate();
    		var mm = today.getMonth()+1; //January is 0!

    		var yyyy = today.getFullYear();
    		if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} var today = mm+'/'+dd+'/'+yyyy;
			var todayDate = new Date(Date.parse(today));
			
			
			var condition = Math.round(Math.abs((todayDate.getTime() - addDays.getTime())/(oneDay)));
			logDebug("Condition for Time" + condition);
			
			if(condition == 120)
			{
				var options = loadASITable("SECURITY OPTIONS", capId);
				for(i in options)
				{
					var firstRow = options[i];
					var columnA = firstRow["Security Option"];
					if(columnA.fieldValue == "In Fund - Exempt" || columnA.fieldValue == "In Fund with Security MMS (Mandatory Minimum Security)" || columnA.fieldValue == "In Fund with Security Supplemental")
					{
						var addResult= aa.set.addCapSetMember((renewalSetFor60.getSetID()),capId);
						runSecurityReport(reportNameForSecurityNotice, capId.getCustomID());
					}
					else
					{
						continue;
					}
				}
			}
		}
		
	}
	
/*------------------------------------------------------------------------------------------------------/
        |  Update the Set
/------------------------------------------------------------------------------------------------------*/
	
	var setUpdateFor60= new capSet(renewalSetFor60.getSetID());
	setUpdateFor60.status="Completed";
	setUpdateFor60.comment="Successfully processed";
	setUpdateFor60.update();
	
}

/*------------------------------------------------------------------------------------------------------/
        |Tonnage Send Report Function
/------------------------------------------------------------------------------------------------------*/
		
function runSecurityReport(reportName,itemCap)
{
     var parameters=aa.util.newHashMap();
     if(arguments.length==2)
    {
        parameters.put("ALT_ID", itemCap);
        logDebug("Report parameters for license: " + parameters);
    }
   
    report=aa.reportManager.getReportInfoModelByName(reportName);
	if(report != null)
	{
    reportFile=report.getOutput();
		
	
    aa.print("Report Test" + report);
    reportFile.setCapId(itemCap);
    reportFile.setModule("Licenses");
    reportFile.setReportParameters(parameters); 

     logDebug("Report parameters: "+ reportFile.getReportParameters());
	var checkPermission=aa.reportManager.hasPermission(reportName,"admin");
    aa.print("Permission: " + checkPermission.getOutput().booleanValue());
    if(checkPermission.getOutput().booleanValue())
		{
        //aa.print("User has permission");    
        var reportResult=aa.reportManager.getReportResult(reportFile);
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
	else{
	logDebug("Report is null");
	}
}