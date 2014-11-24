

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
maxSeconds = 4.5 * 60;		// number of seconds allowed for batch processing, usually < 5*60
message = "";
br = "<br>";
/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 2.0

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_CUSTOM"));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS_ASB"));
eval(getScriptText("INCLUDES_BATCH"));



function getScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),vScriptName,"ADMIN");
	return emseScript.getScriptText() + "";
}

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
showDebug = aa.env.getValue("showDebug").substring(0,1).toUpperCase().equals("Y");

sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID()
batchJobName = "" + aa.env.getValue("BatchJobName");
wfObjArray = null;


batchJobID = 0;
if (batchJobResult.getSuccess())
  {
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
								
					//
var lookAheadDays = aa.env.getValue("lookAheadDays");   		// Number of days from today
var daySpan = aa.env.getValue("daySpan");						// Days to search (6 if run weekly, 0 if daily, etc.)
var appGroup = getParam("appGroup");							//   app Group to process {Licenses}
var appTypeType = getParam("appTypeType");						//   app type to process {Rental License}
var appSubtype = getParam("appSubtype");						//   app subtype to process {NA}
var appCategory = getParam("appCategory");						//   app category to process {NA}
var expStatus = aa.env.getValue("expirationStatus")					//   test for this expiration status
var newExpStatus = getParam("newExpirationStatus")				//   update to this expiration status
var newAppStatus = getParam("newApplicationStatus")			//   update the CAP to this status
var gracePeriodDays = getParam("gracePeriodDays")				//	bump up expiration date by this many days
var setPrefix = getParam("setPrefix");							//   Prefix for set ID
var setType = getParam("setType");							//   Set type
var setStatus = getParam("setStatus");							//   Set Status
var inspSched = getParam("inspSched");							//   Schedule Inspection
var skipAppStatusArray = getParam("skipAppStatus").split(",");	//   Skip records with one of these application statuses
var emailAddress = getParam("emailAddress");					// email to send report
var sendEmailToContactTypes = getParam("sendEmailToContactTypes");// send out emails?
var emailTemplate = getParam("emailTemplate");					// email Template
var deactivateLicense = getParam("deactivateLicense");			// deactivate the LP
var lockParentLicense = getParam("lockParentLicense");     		// add this lock on the parent license
var createRenewalRecord = getParam("createTempRenewalRecord");	// create a temporary record
var feeSched = getParam("feeSched"); 							//
var feeList = getParam("feeList");								// comma delimted list of fees to add
var feePeriod = getParam("feePeriod");							// fee period to use {LICENSE}
var reportName = aa.env.getValue("reportName");
var reportNameForSet = aa.env.getValue("reportNameForSet");
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var timeExpired = false;

/*if (!fromDate.length) // no "from" date, assume today + number of days to look ahead
	fromDate = dateAdd(null,parseInt(lookAheadDays))

if (!toDate.length)  // no "to" date, assume today + number of look ahead days + span
	toDate = dateAdd(null,parseInt(lookAheadDays)+parseInt(daySpan))*/

var mailFrom = lookup("ACA_EMAIL_TO_AND_FROM_SETTING","RENEW_LICENSE_AUTO_ISSUANCE_MAILFROM");
var acaSite = lookup("ACA_CONFIGS","OFFICIAL_WEBSITE_URL");


//logDebug("Date Range -- fromDate: " + fromDate + ", toDate: " + toDate)



var startTime = startDate.getTime();			// Start timer
var systemUserObj = aa.person.getUser("ADMIN").getOutput();

if (appGroup=="")
	appGroup="*";
if (appTypeType=="")
	appTypeType="*";
if (appSubtype=="")
	appSubtype="*";
if (appCategory=="")
	appCategory="*";
var appType = appGroup+"/"+appTypeType+"/"+appSubtype+"/"+appCategory;

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
	
	var tDate= new Date();
	
   var dateString = (tDate.getMonth() +1) + "/" +  tDate.getDate() + "/" + tDate.getFullYear();
	var existingSet;
	var flag;
	var setID1;
	var setID2;
		//Generate set id
	setID1=  "Expiration Letter" + "_" + dateString;
	
	logDebug("Set ID1: " + setID1);
	
	var setDescription= "Expiration Letter" + " " + "-" + " " + "License";
	logDebug("Description:" + setDescription);
	var setType=setDescription;
	var createSetResult1= createXSet(setID1,setDescription, setType, "Pending", "Processing");
	
	logDebug("Create Set Result for " + setID1 + ":  " + createSetResult1);
	
	var expirationSet=aa.set.getSetByPK(setID1);
	if(expirationSet.getSuccess())
	{
		expirationSet=expirationSet.getOutput();
	}
	
	var today = new Date();
    	var dd = today.getDate();
    	var mm = today.getMonth()+1; //January is 0!

    	var yyyy = today.getFullYear();
    	if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} var today = mm+'/'+dd+'/'+yyyy;

	logDebug("Current Date" + today);
	
	var capFilterType = 0
	var capFilterInactive = 0;
	var capFilterError = 0;
	var capFilterStatus = 0;
	var capDeactivated = 0;
	var capCount = 0;
	var inspDate;
	var setName;
	var setDescription;

	var expResult = aa.expiration.getLicensesByStatus(expStatus);

	if (expResult.getSuccess())
		{
		myExp = expResult.getOutput();
		
		}
	else
		{ logDebug("ERROR: Getting Expirations, reason is: " + expResult.getErrorType() + ":" + expResult.getErrorMessage()) ; return false }

	for (thisExp in myExp)  // for each b1expiration (effectively, each license app)
		{
		if (elapsed() > maxSeconds) // only continue if time hasn't expired
			{
			logDebug("A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
			timeExpired = true ;
			break;
			}

		b1Exp = myExp[thisExp];
		var	expDate = b1Exp.getExpDate();
		
		if (expDate) var b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
		var b1Status = b1Exp.getExpStatus();
		
		var renewalCapId = null;

		
		

		capId = aa.cap.getCapID(b1Exp.getCapID().getID1(),b1Exp.getCapID().getID2(),b1Exp.getCapID().getID3()).getOutput();

		if (!capId)
			{
			logDebug("Could not get a Cap ID for " + b1Exp.getCapID().getID1() + "-" + b1Exp.getCapID().getID2() + "-" + b1Exp.getCapID().getID3());
			continue;
		}

		altId = capId.getCustomID();

		

		var capResult = aa.cap.getCap(capId);

		if (!capResult.getSuccess()) {
			logDebug(altId + ": Record is deactivated, skipping");
			capDeactivated++;
			continue;
			}
		else	{
			var cap = capResult.getOutput();
			}

		var capStatus = cap.getCapStatus();

		appTypeResult = cap.getCapType();		//create CapTypeModel object
		appTypeString = appTypeResult.toString();
		appTypeArray = appTypeString.split("/");

		// Filter by CAP Type
		if (appType.length && !appMatch(appType))
			{
			capFilterType++;
			//logDebug(altId + ": Application Type does not match")
			continue;
			}

		// Filter by CAP Status
		if (exists(capStatus,skipAppStatusArray))
			{
			capFilterStatus++;
			
			continue;
			}

		capCount++;


		// Create Set
		if (setPrefix != "" && capCount == 1)
			{
			var yy = startDate.getFullYear().toString().substr(2,2);
			var yyyy = startDate.getFullYear().toString();
			var mm = (startDate.getMonth()+1).toString();
			if (mm.length<2)
				mm = "0"+mm;
			var dd = startDate.getDate().toString();
			if (dd.length<2)
				dd = "0"+dd;
			var hh = startDate.getHours().toString();
			if (hh.length<2)
				hh = "0"+hh;
			var mi = startDate.getMinutes().toString();
			if (mi.length<2)
				mi = "0"+mi;

			var setName = setPrefix.substr(0,5) + yyyy + mm + dd;

			setDescription = setPrefix + " : " + startDate.toLocaleString()
			
			if (setType != "") {
				var setscript = aa.set.getSetHeaderScriptModel().getOutput();
				setscript.setSetID(setName);
				setscript.setSetTitle(setDescription);
				setscript.setSetStatusComment("");
				setscript.setSetStatus(setStatus);
				setscript.setRecordSetType(setType);
				//setscript.setServiceProviderCode("AGM");
				setscript.setAuditDate(aa.date.getCurrentDate());
				setscript.setAuditID("ADMIN");

				var setCreateResult = aa.set.createSetHeader(setscript);

			} else {
				var setCreateResult= aa.set.createSet(setName,setDescription);
			}


			if (setCreateResult.getSuccess())
				logDebug("Set ID "+setName+" created for CAPs processed by this batch job.");
			else
				logDebug("ERROR: Unable to create new Set ID "+setName+" created for CAPs processed by this batch job.");

			}


		// Actions start here:

		var refLic = getRefLicenseProf(altId) // Load the reference License Professional

		if (refLic && deactivateLicense.substring(0,1).toUpperCase().equals("Y"))
			{
			refLic.setAuditStatus("I");
			aa.licenseScript.editRefLicenseProf(refLic);
			//logDebug(altId + ": deactivated linked License");
			}

		// update expiration status


		if (newExpStatus.length > 0)
			{
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
			
			
			if(condition == 0){
			b1Exp.setExpStatus(newExpStatus);
			aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
			
			
			var addResult= aa.set.addCapSetMember((expirationSet.getSetID()),capId);
			
			capId=capId.toString();

			var ids=new Array();
			ids=capId.split("-");
 
			var license = aa.cap.getCap(ids[0], ids[1], ids[2]);
			license= license.getOutput();
			var licenseID = license.getCapID();
			runExpirationLetter(reportName, licenseID.getCustomID());

			setEmailParameters(license, emailTemplate);
		
				}
			
			}

		// update CAP status

		if (newAppStatus.length > 0 && capStatus != "Canceled")
			{
			if(b1Exp.getExpStatus() == "Expired"){
			updateAppStatus(newAppStatus,"", licenseID);
			
		}
		}


		}

	var setMembers=aa.set.getCAPSetMembersByPK(setID1);
	var array=new Array();
	array=setMembers.getOutput();
	if(array.size > 0){
		var license;
		
		
		for(var j=0; j<array.size(); j++)
		{                             
		
			var setMember=array.get(j);
			setMember=setMember.toString();
			var ids=new Array();
			ids=setMember.split("-");
			license = aa.cap.getCap(ids[0], ids[1], ids[2]);
			license= license.getOutput();
			
		}
		
		var licenseID = license.getCapID();
		runSetReport(reportNameForSet,setID1, licenseID.getCustomID(),license);
		
		
		if(setID1)
		{
			var setUpdate= new capSet(setID1);
			setUpdate.status="Completed";
			setUpdate.comment="Successfully processed";
			setUpdate.update();
		
		}
	}
	
	var setUpdateFor60= new capSet(expirationSet.getSetID());
	setUpdateFor60.status="Completed";
	setUpdateFor60.comment="Successfully processed";
	setUpdateFor60.update();
 	}
	
	function runExpirationLetter(reportName,customID,cSeqNumber)
{
     var parameters=aa.util.newHashMap();
     if(arguments.length==2)
    {
        parameters.put("ALT_ID", customID);
        //parameters.put("Status", "About to Expire");
        logDebug("Report parameters for license: " + parameters);
    }
    else if (arguments.length==3)
    {
        parameters.put("capID", customID);
        parameters.put("cSeqNumber", cSeqNumber);
        parameters.put("Status", "Active");
        logDebug("Report parameters for contact: " + parameters);
    }
    report=aa.reportManager.getReportInfoModelByName(reportName);
    report=report.getOutput();
    //aa.print(report);
    report.setCapId(customID);
    report.setModule("Licenses");
    report.setReportParameters(parameters); 
     //aa.print("Report ID: " + report.getReportId());
     logDebug("Report parameters: "+ report.getReportParameters());
	var checkPermission=aa.reportManager.hasPermission(reportName,currentUserID);
    //aa.print("Permission: " + checkPermission.getOutput().booleanValue());
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

function runSetReport(reportName,setID4Process,itemCap,license)
{
		var parameters=aa.util.newHashMap();
//if(arguments.length==6)
		parameters.put("SET_ID", setID4Process);
//parameters.put("Status", "Active");
		logDebug("Report parameters for license: " + parameters);

		report=aa.reportManager.getReportInfoModelByName(reportName);
		report=report.getOutput();
//aa.print(report);
		report.setCapId(itemCap);
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
			setEmailParametersForSet(license,"BATCH JOB SUMMARY REPORT",reportFile);
		}
		}
	}
}
	
	function setEmailParameters(license, emailTemplateName,reportFile)
{
 var sendEmailToContactType = "Business"; //Applicant";
var FromEmailAddress = "noreply@accela.com";
var toEmailAddress = "";
 
 
 var capId = license.getCapID();
 var capContactResult=aa.people.getCapContactByCapID(capId);
 if(capContactResult.getSuccess())
 {
 capContactResult=capContactResult.getOutput();
  for(yy in capContactResult)
 {
 var peopleModel=capContactResult[yy].getPeople();
 if(peopleModel.getContactType()=="Business")
 {
 toEmailAddress=peopleModel["email"];
 logDebug("Email Address: " + toEmailAddress);
 break;
 }
 }
 if(toEmailAddress)
 {
 var params=aa.util.newHashtable();
params.put("$$licenseType$$",license.getCapType().getAlias());
params.put("$licAltID$$",capId.getCustomID());
params.put("$$licenseTypeThirdLevel$$",appSubtype);
sendNotification("noreply@accela.com",toEmailAddress,"","APPLICATION RECEIVED",params,null,capId);
}
}
}

function setEmailParametersForSet(license, emailTemplateName,reportFile)
{
		var sendEmailToContactType = "Business"; //Applicant";
		var FromEmailAddress = "noreply@accela.com";
		var toEmailAddress = "mihir@gcomsoft.com";
		var rFiles = new Array();
		rFiles.push(reportFile);
 
		var capId = license.getCapID();
		var capContactResult=aa.people.getCapContactByCapID(capId);
		if(capContactResult.getSuccess())
		{
				capContactResult=capContactResult.getOutput();
				for(yy in capContactResult)
				{
					var peopleModel=capContactResult[yy].getPeople();
					if(peopleModel.getContactType()=="Business")
					{
						toEmailAddress=peopleModel["email"];
						logDebug("Email Address: " + toEmailAddress);
						break;
					}
				}
				if(toEmailAddress)
				{
					var params=aa.util.newHashtable();
					params.put("$$licenseType$$",license.getCapType().getAlias());
					params.put("$licAltID$$",capId.getCustomID());
					params.put("$$licenseTypeThirdLevel$$",recordSubType);
					sendNotification("noreply@accela.com",toEmailAddress,"",emailTemplateName,params,rFiles,capId);
				}
}
}

	