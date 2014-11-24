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
 	
var reportNameForFirstNotice = aa.env.getValue("reportNameForFirstNotice");
var reportNameForSecondNotice = aa.env.getValue("reportNameForSecondNotice");
//var reportNameForSetFirstNotice = aa.env.getValue("reportNameForSetFirstNotice");
//var reportNameForSetSecondNotice = aa.env.getValue("reportNameForSetSecondNotice");
//var emailTemplateForSet = aa.env.getValue("emailTemplateForSet");
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var toEmailAddressForSetReport = lookup("EMAIL ADDRESS FOR CONSOLIDATED REPORT", "emailAddress");
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
    var sArray = new Array("Active","About to Expire","Expired","Tonnage Report Overdue","Under Review - SAPA Applies");

    /*------------------------------------------------------------------------------------------------------/
    |  Get the AGM Tonnage Licenses
    /------------------------------------------------------------------------------------------------------*/

    //Identify the AGM records for tonnage
    var aeSubTypes = new Array("Commercial Fertilizer","Ammonium Nitrate Fertilizer");
	
	 //Loop through the AGM records for tonnage
    for (aest in aeSubTypes) {
        
        capTypeModel = capModel.getCapType();
        capTypeModel.setGroup("Licenses");
        capTypeModel.setType("Plant");
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
	setID1=  "Tonnage Letter" + "_" + dateString + "_" + "Commercial Fertilizer-First notice";
	setID2= "Tonnage Letter" + "_" + dateString + "_" + "Commercial Fertilizer-Second Notice";
	logDebug("Set ID1: " + setID1);
	logDebug("Set ID2: " + setID2);
	var setDescription= "Tonnage Letter" + " " + "-" + " " + "License";
	var setType=setDescription;
	var createSetResult1= createXSet(setID1,setDescription, setType, "Pending", "Processing");
	var createSetResult2= createXSet(setID2,setDescription, setType, "Pending", "Processing");
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
		aa.print("Custom ID" + custom);
		var today = new Date();
		var year = today.getFullYear();
		if(status == "Active" || status == "About to Expire" || status == "Expired" || status == "Tonnage Report Overdue" || status == "Under Review - SAPA Applies")
		{
		
			var date = new Date();
			if(year > 2012){
					if(date.getDate() == 01){
					if(date.getMonth()+1 == 01){
					if(date.getFullYear() >= 2013){
						
					var addResult= aa.set.addCapSetMember((renewalSetFor60.getSetID()),capId);
					logDebug("Add set result: " + addResult.getSuccess());
					runTonnageReport(reportNameForFirstNotice, capId.getCustomID());
						}
					}						
				}
			}
		}
		else{
		aa.print("Invalid Record");
		}
		   var capType = "Licenses/Amendment/Tonnage Report/Fertilizer";
		   var arrProdCaps = getChildren(capType, capId);
		   var dateReq = new Date();
		   
		   if(arrProdCaps == null || arrProdCaps == 0 || arrProdCaps == "undefined")
		   {
		   if((dateReq.getMonth()+1) == 02 && dateReq.getDate() == 01)
				{
					amendSendReport(arrProdCaps, renewalSetFor30, capId)
				}
		   }
		   if(arrProdCaps != null)
		   {
					for(zz in arrProdCaps)
					{
						var test = arrProdCaps[zz].getCustomID();
						var status = aa.cap.getCap(arrProdCaps[zz]).getOutput().getCapStatus();
						var amendmentMonth = aa.cap.getCap(arrProdCaps[zz]).getOutput().getFileDate().getMonth();
						var amendmentYear = aa.cap.getCap(arrProdCaps[zz]).getOutput().getFileDate().getYear();  
						logDebug("Amendment Year" + amendmentYear);
						if(amendmentMonth == 02 && amendmentYear == year)
						{
							continue;
						}
						else if((dateReq.getMonth()+1) == 02 && dateReq.getDate() == 01)
						{
							var addResult= aa.set.addCapSetMember((renewalSetFor30.getSetID()),capId);
							logDebug("Add set result: " + addResult.getSuccess());
							runTonnageReport(reportNameForSecondNotice, capId.getCustomID());
						}
					}
		   }

	}
	
	/*------------------------------------------------------------------------------------------------------/
        |  Generate set report
        /------------------------------------------------------------------------------------------------------*/
	if(renewalSetFor60)
	{
		var setMembers=aa.set.getCAPSetMembersByPK(renewalSetFor60.getSetID());
		var array=new Array();
		if(setMembers != null)
		{
			array=setMembers.getOutput();
		}
		else
		{
			logDebug("ERROR Message: Set does not have any records to process");
		}
		if(array.size() > 0)
		{
			var license;
			for(var j=0; j<array.size(); j++)
			{ 
				var setMember=array.get(j);
				setMember=setMember.toString();
				var ids=new Array();
				ids=setMember.split("-");
				license = aa.cap.getCap(ids[0], ids[1], ids[2]);
				license= license.getOutput();
				break;
   
			}
			var licenseID = license.getCapID();
			runSetReport(emailTemplateForSet, license, reportNameForSetFirstNotice, licenseID.getCustomID(), setID1);
		}
	}
	
	if(renewalSetFor30)
	{
		var setMembers=aa.set.getCAPSetMembersByPK(renewalSetFor30.getSetID());
		var array=new Array();
		if(setMembers != null)
		{
			array=setMembers.getOutput();
		}
		else
		{
			logDebug("ERROR Message: Set does not have any records to process");
		}
		if(array.size() > 0)
		{
			var license;
			for(var j=0; j<array.size(); j++)
			{ 
				var setMember=array.get(j);
				setMember=setMember.toString();
				var ids=new Array();
				ids=setMember.split("-");
				license = aa.cap.getCap(ids[0], ids[1], ids[2]);
				license= license.getOutput();
				break;
   
			}
			var licenseID = license.getCapID();
			runSetReport(emailTemplateForSet, license, reportNameForSetSecondNotice, licenseID.getCustomID(), setID2);
		}
	}
	
	/*------------------------------------------------------------------------------------------------------/
        |  Update the Set
        /------------------------------------------------------------------------------------------------------*/
	
	var setUpdateFor60= new capSet(renewalSetFor60.getSetID());
	setUpdateFor60.status="Completed";
	setUpdateFor60.comment="Successfully processed";
	setUpdateFor60.update();
	
	var setUpdateFor30= new capSet(renewalSetFor30.getSetID());
	setUpdateFor30.status="Completed";
	setUpdateFor30.comment="Successfully processed";
	setUpdateFor30.update();
}
	
	/*------------------------------------------------------------------------------------------------------/
        |Amendments Send Report function if no amendments
        /------------------------------------------------------------------------------------------------------*/
		
	function amendSendReport(arrProdCapsTest, setTest, capId)
	{
			var addResult1= aa.set.addCapSetMember((setTest.getSetID()),capId);
			logDebug("Add set result: " + addResult1.getSuccess());
			logDebug("Second notice sent");
			runTonnageReport(reportNameForSecondNotice, capId.getCustomID());
	}
	
	/*------------------------------------------------------------------------------------------------------/
        |Tonnage Send Report Function
        /------------------------------------------------------------------------------------------------------*/
		
function runTonnageReport(reportName,itemCap)
{
     var parameters=aa.util.newHashMap();
     if(arguments.length==2)
    {
        parameters.put("ALT_ID", itemCap);
        parameters.put("SET_ID", "ALL");
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

/*------------------------------------------------------------------------------------------------------/
        | Set Report Function
        /------------------------------------------------------------------------------------------------------*/

function runSetReport(emailTemplateName, license, reportName, customID, setID)
{
		var parameters=aa.util.newHashMap();
		parameters.put("ALT_ID", "ALL");
		parameters.put("SET_ID", setID);
		logDebug("Report parameters for license: " + parameters);

		report=aa.reportManager.getReportInfoModelByName(reportName);
		report=report.getOutput();
		report.setCapId(customID);
		report.setModule("Licenses");
		report.setReportParameters(parameters);
		//aa.print("Report ID: " + report.getReportId());
		logDebug("Report parameters: "+ report.getReportParameters());
		var checkPermission=aa.reportManager.hasPermission(reportName,"admin");
		//logDebug("Permission: " + checkPermission);
		logDebug("Permission: " + checkPermission.getOutput().booleanValue());
		if(checkPermission.getOutput().booleanValue())
		{
		var reportResult=aa.reportManager.getReportResult(report);
		if(reportResult)
		{
			reportResult=reportResult.getOutput();
			logDebug("Report result for set report: " + reportResult);
			reportFile=aa.reportManager.storeReportToDisk(reportResult);
			reportFile=reportFile.getOutput();
			logDebug("Report File for set report: " +reportFile);
			if(reportFile)
		{
			setEmailParametersForSet(license,emailTemplateName,reportFile, setID);
		}
		}
	}
}

/*------------------------------------------------------------------------------------------------------/
        | Send Email for set report
        /------------------------------------------------------------------------------------------------------*/
		
function setEmailParameters(license, emailTemplateName,reportFile,setID)
{
	var sendEmailToContactType = "Business"; //Applicant";
    var FromEmailAddress = "noreply@accela.com";
    //var toEmailAddress = "aditi@gcomsoft.com";
	var setTitle;
	var currentDate = new Date();
	var currentDateString = (currentDate.getMonth() +1) + "/" +  currentDate.getDate() + "/" + currentDate.getFullYear();
	var rFiles = new Array();
	rFiles.push(reportFile);
	
	var capId = license.getCapID();
	var capContactResult=aa.people.getCapContactByCapID(capId);
	
	var licenseSet  = aa.set.getSetByPK(setID);
	if(licenseSet.getSuccess())
	{
		licenseSet = licenseSet.getOutput();
		setTitle = licenseSet.getSetTitle();
	}
	
	if(toEmailAddressForSetReport)
	{
			var params=aa.util.newHashtable();
			params.put("$$setID$$", setID);
			params.put("$$CURRENTDATE$$",currentDateString);
			params.put("$$setName$$", setTitle);
         
            sendNotification("noreply@accela.com",toEmailAddressForSetReport,"",emailTemplateName,params,rFiles,capId);
    }
    
}