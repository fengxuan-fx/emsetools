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
var emailAddress = getParam("emailAddress");
var recordType = "Agricultural Development";
var recordSubType ="Farm Products Dealer";
var reportNameFirstNotice = "Stated Grape Price Reminder";
var reportNameSecondNotice = "Stated Grape Price Followup";
//var reportNameForSetFirstNotice = aa.env.getValue("reportNameForSetFirstNotice");
//var reportNameForSetSecondNotice = aa.env.getValue("reportNameForSetSecondNotice");
//var emailTemplateForSet = aa.env.getValue("emailTemplateForSet");
var timeExpired = false;
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
if (!timeExpired) mainProcess();

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

if (emailAddress.length)
    aa.sendMail("noreply@accela.com", emailAddress, "", batchJobName + " Results", emailText);
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
	 var sArray = new Array("Active","About to Expire","Expired","Under Review - SAPA Applies");
	 var appList = new Array();
	 var tempAppList = new Array();
    var emptyCm = aa.cap.getCapModel().getOutput();
	var emptyCt = emptyCm.getCapType();
	emptyCt.setGroup("Licenses");
	emptyCt.setType(recordType);
	emptyCt.setSubType(recordSubType);
	emptyCt.setCategory("License");
	emptyCm.setCapType(emptyCt);
	
	for (sa in sArray) {
        
        emptyCm.setCapStatus(sArray[sa]);

        appListResult = aa.cap.getCapIDListByCapModel(emptyCm);

        if (appListResult.getSuccess()) {
            tempAppList = appListResult.getOutput();
           
            if (tempAppList.length > 0) {
                for (tal in tempAppList) {
                    
                        appList.push(tempAppList[tal]);
                }
            }
        }       
    }

    logDebug("********************************");
    logDebug("Retrieving license applications for evaluation (END)");
    logDebug("********************************");
        
    if (appList.length > 0) {
        logDebug("Processing " + appList.length + " application records");
    } else {
        logDebug("No applications returned:"); 
        return false; 
    }

    logDebug("********************************");
	
	
	var vCapList;
	var emptyGISArray = new Array();
	var tDate=new Date();
	var dateString = (tDate.getMonth() + 1) + "/" + tDate.getDate() + "/" + tDate.getFullYear();	
	var existingSet;
	var flag;
	var setID1;
	var setID2;
		//Generate set id
	var recordSubTypeUpCase = recordSubType.toUpperCase();
	setID1=  recordSubTypeUpCase + "_" + dateString + "_" + "Grape-FirstNotice";
	setID2= recordSubTypeUpCase + "_" + dateString + "_" + "Grape-SecondNotice";
	logDebug("Set ID1: " + setID1);
	logDebug("Set ID2: " + setID2);
	var setDescription= recordSubType + " " + "-" + " " + "Renewal";
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
	
	
	for (thisCap in appList)
	{
		if (elapsed() > maxSeconds) { // only continue if time hasn't expired 
            logDebug("A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
            timeExpired = true ;
            break;
        }
		
		var capId = aa.cap.getCapID(appList[thisCap].getCapID().getID1(),appList[thisCap].getCapID().getID2(),appList[thisCap].getCapID().getID3()).getOutput();
		if(capId == null){
		continue;
		}
		//logDebug("Cap ID: " + capId.getCustomID());
		var pLicArray = String(capId).split("-");
		var plCapId = aa.cap.getCapID(pLicArray[0],pLicArray[1],pLicArray[2]).getOutput();
		//aa.print("Test" + plCapId);
		
		
		//aa.print("Loading of ASIT table successful");
		var today = new Date();
		var year = today.getFullYear();
		var date = new Date();
		var dmonth = date.getMonth() + 1;
		if(date.getDate() == 28 && dmonth == 7 && date.getFullYear() >= 2013){
		var testASIT = loadASITable("LIST OF COMMODITIES", capId);
		for(i in testASIT){
		var firstRow = testASIT[i];
		var columnA = firstRow["Commodity"];
		if(columnA.fieldValue != "Grapes"){
		continue;
		}
				var operationASIT = loadASITable("TYPE OF OPERATION(S)", capId);
				for(j in operationASIT){
					var operRow = operationASIT[j];
					var columnB = operRow["Type of Operation"];
					if(columnB.fieldValue != "Processor"){
					continue;
					}
		if(columnA.fieldValue == "Grapes" && columnB.fieldValue == "Processor"){
				 var capType = "Licenses/Amendment/Stated Grape Price Report/NA";
				 var arrProdCaps = getChildren(capType, capId);
				 aa.print(arrProdCaps.length);
							if(arrProdCaps != null){
									if(arrProdCaps.length > 0){
									 for(zz in arrProdCaps){
											var amendmentYear = aa.cap.getCap(arrProdCaps[zz]).getOutput().getFileDate().getYear();  
																																	
											if(year == amendmentYear){
											break;
																						}
											else{
											var addResult= aa.set.addCapSetMember((renewalSetFor60.getSetID()),capId);
											runGrapeReport(reportNameFirstNotice, capId.getCustomID());
											
											break;
											}
					
									}
								}
							}
							
							
									if(arrProdCaps.length == 0){
											logDebug("Comes here");
											var addResult= aa.set.addCapSetMember((renewalSetFor60.getSetID()),capId);
											runGrapeReport(reportNameFirstNotice, capId.getCustomID());
											
											}
										}
							}
							
					}
		}
		
		if(date.getDate() == 15 && dmonth == 8 && date.getFullYear() >= 2013){
		var testASIT = loadASITable("LIST OF COMMODITIES", capId);
			for(i in testASIT){
		var firstRow = testASIT[i];
		var columnA = firstRow["Commodity"];
		if(columnA.fieldValue != "Grapes"){
		continue;
		}
				var operationASIT = loadASITable("TYPE OF OPERATION(S)", capId);
				for(j in operationASIT){
					var operRow = operationASIT[j];
					var columnB = operRow["Type of Operation"];
					if(columnB.fieldValue != "Processor"){
					continue;
					}
		if(columnA.fieldValue == "Grapes" && columnB.fieldValue == "Processor"){
				 var capType = "Licenses/Amendment/Stated Grape Price Report/NA";
				 var arrProdCaps = getChildren(capType, capId);
				 aa.print(arrProdCaps.length);
							if(arrProdCaps != null){
									if(arrProdCaps.length > 0){
									 for(zz in arrProdCaps){
											var amendmentYear = aa.cap.getCap(arrProdCaps[zz]).getOutput().getFileDate().getYear();  
																																	
											if(year == amendmentYear){
											break;
																						}
											else{
											var addResult= aa.set.addCapSetMember((renewalSetFor30.getSetID()),capId);
											runGrapeReport(reportNameSecondNotice, capId.getCustomID());
											
											break;
											}
					
									}
								}
							}
							
							
									if(arrProdCaps.length == 0){
											logDebug("Comes here");
											var addResult= aa.set.addCapSetMember((renewalSetFor30.getSetID()),capId);
											runGrapeReport(reportNameSecondNotice, capId.getCustomID());
											
											}
										}
							}
							
					}
		}
					
	}
	
	//Generate set report
	
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
	
	var setUpdateFor60= new capSet(renewalSetFor60.getSetID());
	setUpdateFor60.status="Completed";
	setUpdateFor60.comment="Successfully processed";
	setUpdateFor60.update();
	
	var setUpdateFor30= new capSet(renewalSetFor30.getSetID());
	setUpdateFor30.status="Completed";
	setUpdateFor30.comment="Successfully processed";
	setUpdateFor30.update();

}

function runGrapeReport(reportName,itemCap)
{
     var parameters=aa.util.newHashMap();
     if(arguments.length==2)
    {
        parameters.put("ALT_ID", itemCap);
		parameters.put("SET_ID", "ALL");
        //parameters.put("Status", "About to Expire");
        logDebug("Report parameters for license: " + parameters);
    }
    else if (arguments.length==3)
    {
        parameters.put("capID", itemCap.getCustomID());
        parameters.put("cSeqNumber", cSeqNumber);
        parameters.put("Status", "Active");
        logDebug("Report parameters for contact: " + parameters);
    }
    report=aa.reportManager.getReportInfoModelByName(reportName);
    report=report.getOutput();
    //aa.print("Report Test" + report);
    report.setCapId(itemCap);
    report.setModule("Licenses");
    report.setReportParameters(parameters); 
     //aa.print("Report ID: " + report.getReportId());
     //logDebug("Report parameters: "+ report.getReportParameters());
	var checkPermission=aa.reportManager.hasPermission(reportName,"admin");
    //aa.print("Permission: " + checkPermission.getOutput().booleanValue());
    if(checkPermission.getOutput().booleanValue())
    {
        //aa.print("User has permission");    
        var reportResult=aa.reportManager.getReportResult(report);
        if(reportResult)
        {
            reportResult=reportResult.getOutput();
            //logDebug("Report result: " + reportResult);
            reportFile=aa.reportManager.storeReportToDisk(reportResult);
            reportFile=reportFile.getOutput();
            logDebug("Report File: " +reportFile);
         }       
    }
}

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
	
