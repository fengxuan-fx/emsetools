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
var appGroup = aa.env.getValue("appGroup"); 						//   app Group to process {Licenses}
var appTypeType = aa.env.getValue("appTypeType"); 					//   app type to process {Rental License}
var appSubtype = aa.env.getValue("appSubtype"); 					//   app subtype to process {NA}
var appCategory = aa.env.getValue("appCategory"); 
var arrProcessAppList = aa.env.getValue("processAppList"); 	
var reportNameForFirstNotice = aa.env.getValue("reportNameForFirstNotice");
var reportNameForSecondNotice = aa.env.getValue("reportNameForSecondNotice");
var emailTemplateForSet = aa.env.getValue("emailTemplateForSet");
var reportNameForSetFirst = aa.env.getValue("reportNameForSetFirst");
var reportNameForSetSecond = aa.env.getValue("reportNameForSetSecond");

var emptyGISArray = new Array();

var emptyCm = aa.cap.getCapModel().getOutput();
	var emptyCt = emptyCm.getCapType();
	emptyCt.setGroup("Licenses");
	emptyCt.setType("Plant");
	//emptyCt.setSubType(recordSubType);
	emptyCt.setCategory("License");
	emptyCm.setCapType(emptyCt);

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
mainProcess();
logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
function createXSet(setName,setDescription,setType,setStatus,setStatusComment) {

//optional 3rd parameter is setType
//optional 4th parameter is setStatus
//optional 5th paramater is setStatusComment


//var setType = "";
//var setStatus = "";
//var setStatusComment = "";


/* if (arguments.length > 2) {
setType = arguments[2]
}


if (arguments.length > 3) {
setStatus = arguments[3]
}


if (arguments.length > 4) {
setStatusComment = arguments[4];
} */

//logDebug("Inside create set");

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
  
	var arrProcAppList = arrProcessAppList.split(",");
	for (xx in arrProcAppList) 
	{
		emptyCt.setSubType(arrProcAppList[xx]);
		aa.print("Running for >>>>> "+arrProcAppList[xx]);
		processTonnageReports();
		aa.print("End for >>>>> "+arrProcAppList[xx]);
	}
	logDebug("This is a test");
	}
	
	function processTonnageReports(){
	var vCapList;
	var emptyGISArray = new Array();
	
	var existingSet;
	var flag;
	var setID1;
	var setID2;
		//Generate set id
	var tDate= new Date();
	var dateString = (tDate.getMonth() +1) + "/" +  tDate.getDate() + "/" + tDate.getFullYear();
	setID1=  "Tonnage Letter" + "_" + dateString + "_" + "Commercial Fertilizer-First notice";
	setID2= "Tonnage Letter" + "_" + dateString + "_" + "Commercial Fertilizer-Second Notice";
	logDebug("Set ID1: " + setID1);
	logDebug("Set ID2: " + setID2);
	var setDescription= "Tonnage Letter" + " " + "-" + " " + "License";
	logDebug("Description:" + setDescription);
	var setType=setDescription;
	var createSetResult1= createXSet(setID1,setDescription, setType, "Pending", "Processing");
	var createSetResult2= createXSet(setID2,setDescription, setType, "Pending", "Processing");
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
		logDebug("Cap ID: " + capId.getCustomID());
		var pLicArray = String(capId).split("-");
		var plCapId = aa.cap.getCapID(pLicArray[0],pLicArray[1],pLicArray[2]).getOutput();
		aa.print("Test" + plCapId);
		var status = aa.cap.getCap(capId).getOutput().getCapStatus();
		aa.print("CAP Status" + aa.cap.getCap(capId).getOutput().getCapStatus());
		//var addResult= aa.set.addCapSetMember((renewalSetFor60.getSetID()),capId);
		var custom = capId.getCustomID();
		aa.print("Custom ID" + custom);
		var today = new Date();
		var year = today.getFullYear();
		if(status == "Active" || status == "About to Expire" || status == "Expired" || status == "Tonnage Report Overdue" || status == "Under Review - SAPA Applies"){
		aa.print("Do nothing");
		
		
			
							
			var date = new Date();
			if(year > 2012){
					if(date.getDate() == 01){
					if(date.getMonth()+1 == 01){
					if(date.getFullYear() >= 2013){
						
					var addResult= aa.set.addCapSetMember((renewalSetFor60.getSetID()),capId);
					logDebug("Add set result: " + addResult.getSuccess());
					runTonnageReport(reportNameForFirstNotice, capId.getCustomID());
					logDebug("Report will def be sent");			
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
		   
		   if(arrProdCaps == null || arrProdCaps == 0 || arrProdCaps == "undefined"){
		   if((dateReq.getMonth()+1) > 1){
		   amendSendReport(arrProdCaps, renewalSetFor30)
				}
		   }
		   if(arrProdCaps != null){
		  
		   for(zz in arrProdCaps){
		   var test = arrProdCaps[zz].getCustomID();
		   logDebug("Test" + test);
		   var status = aa.cap.getCap(arrProdCaps[zz]).getOutput().getCapStatus();
		   logDebug("Status" + status);
		  
		   var amendmentMonth = aa.cap.getCap(arrProdCaps[zz]).getOutput().getFileDate().getMonth();
		   logDebug("File Date" + amendmentMonth);
		   
		   var amendmentYear = aa.cap.getCap(arrProdCaps[zz]).getOutput().getFileDate().getYear();  
		   logDebug("Amendment Year" + amendmentYear);
		   if(amendmentMonth == 02 && amendmentYear == year){
		   logDebug("Do absolutely nothing");
		   }
		   else {
		    var addResult= aa.set.addCapSetMember((renewalSetFor30.getSetID()),capId);
			logDebug("Add set result: " + addResult.getSuccess());
			logDebug("Amendment sent");
			runTonnageReport(reportNameForSecondNotice, capId.getCustomID());
		   }
		   }
		   }
	}
	
	/*
	
	if(setID1){
	var setMembers=aa.set.getCAPSetMembersByPK(setID1);
	var array=new Array();
	if(setMembers != null){
	array=setMembers.getOutput();
	}
	else{
	logDebug("ERROR Message: Set does not have any records to process");
	}
	if(array.size() > 0){
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
		runSetReport(emailTemplateForSetFirst, license, reportNameForSetFirst, licenseID.getCustomID(), setID1);
	 
		}
	}
	
	
	if(setID2){
	var setMembersForLate=aa.set.getCAPSetMembersByPK(setID2);
	var array=new Array();
	if(setMembersForLate != null){
	array=setMembersForLate.getOutput();
	}
	else{
	logDebug("ERROR Message: Set does not have any records to process");
	}
	if(array.size() > 0){
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
		runSetReport(emailTemplateForSet, license, reportNameForSetLateNotice, licenseID.getCustomID(), setID2);
	 
		}
	}
	
	*/
	
	var setUpdateFor60= new capSet(renewalSetFor60.getSetID());
	setUpdateFor60.status="Completed";
	setUpdateFor60.comment="Successfully processed";
	setUpdateFor60.update();
	
	var setUpdateFor30= new capSet(renewalSetFor30.getSetID());
	setUpdateFor30.status="Completed";
	setUpdateFor30.comment="Successfully processed";
	setUpdateFor30.update();
}

function amendSendReport(arrProdCapsTest, setTest){
var addResult1= aa.set.addCapSetMember((setTest.getSetID()),capId);
			logDebug("Add set result: " + addResult1.getSuccess());
			logDebug("Second notice sent");
			//runTestReport(reportName, capId.getCustomID());
}

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
    report=report.getOutput();
    aa.print("Report Test" + report);
    report.setCapId(itemCap);
    report.setModule("Licenses");
    report.setReportParameters(parameters); 
     //aa.print("Report ID: " + report.getReportId());
     logDebug("Report parameters: "+ report.getReportParameters());
	var checkPermission=aa.reportManager.hasPermission(reportName,"admin");
    aa.print("Permission: " + checkPermission.getOutput().booleanValue());
    if(checkPermission.getOutput().booleanValue())
    {
        //aa.print("User has permission");    
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

/*
function runSetReport(emailTemplateName, license, reportName, customID, setID)
{
		var parameters=aa.util.newHashMap();
//if(arguments.length==6)
		parameters.put("SET_ID", setID);
//parameters.put("Status", "Active");
		logDebug("Report parameters for license: " + parameters);

		report=aa.reportManager.getReportInfoModelByName(reportName);
		report=report.getOutput();
//aa.print(report);
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
//aa.print("User has permission");
		var reportResult=aa.reportManager.getReportResult(report);
		if(reportResult)
		{
			reportResult=reportResult.getOutput();
			logDebug("Report result: " + reportResult);
			reportFile=aa.reportManager.storeReportToDisk(reportResult);
			reportFile=reportFile.getOutput();
			logDebug("Report File: " +reportFile);
			if(reportFile)
		{
			setEmailParametersForSet(license,emailTemplateName,reportFile,setID);
		}
		}
	}
}

*/
function setEmailParametersForSet(license, emailTemplateName,reportFile,setID)
{
		var sendEmailToContactType = "Business"; //Applicant";
		var FromEmailAddress = "noreply@accela.com";
		var toEmailAddress = "mihir@gcomsoft.com";
		var rFiles = new Array();
		rFiles.push(reportFile);
 
		var capId = license.getCapID();
		
		var licenseSet  = aa.set.getSetByPK(setID);
		if(licenseSet.getSuccess())
		{
			licenseSet = licenseSet.getOutput();
			setTitle = licenseSet.getSetTitle();
		}
		
		if(toEmailAddress)
		{
			var params=aa.util.newHashtable();
			params.put("$$setID$$", setID);
			params.put("$$CURRENTDATE$$",currentDateString);
			params.put("$$setName$$", setTitle);
			sendNotification("noreply@accela.com",toEmailAddress,"",emailTemplateName,params,rFiles,capId);
		}

}

