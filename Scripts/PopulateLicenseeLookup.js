/*
aa.env.setValue("showDebug","Y");
aa.env.setValue("appGroup","Licenses");
aa.env.setValue("appType","");
aa.env.setValue("appSubType","");
aa.env.setValue("appCategory","License");
aa.env.setValue("emailAddress","saxthelm@accela.com");
aa.env.setValue("BatchJobName","TestBatch"); */
/*------------------------------------------------------------------------------------------------------/
| Program: PopulateLicenseeLookup.js  Trigger: Batch
| Client:
|
| Version 1.0 - Base Version. 08/19/2013 - Seth Axthelm
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
emailText = "";
maxSeconds = 4.5 * 60;      // number of seconds allowed for batch processing, usually < 5*60
message = "";
br = "<br>";
var currentUserID = "ADMIN";
var servProvCode = aa.getServiceProviderCode();
/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 2.0

var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_FOR_EMSE"); 
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") { 
    useSA = true;   
    SA = bzr.getOutput().getDescription();
    bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_INCLUDE_SCRIPT"); 
    if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); }
    }
    
if (SA) {
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",SA));
    eval(getScriptText(SAScript,SA));
    }
else {
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
    }

eval(getScriptText("INCLUDES_BATCH"));    
eval(getScriptText("INCLUDES_CUSTOM"));

function getScriptText(vScriptName){
    var servProvCode = aa.getServiceProviderCode();
    if (arguments.length > 1) servProvCode = arguments[1]; // use different serv prov code
    vScriptName = vScriptName.toUpperCase();    
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try {
        var emseScript = emseBiz.getScriptByPK(servProvCode,vScriptName,"ADMIN");
        return emseScript.getScriptText() + ""; 
        } catch(err) {
        return "";
    }
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

var emailAddress = getParam("emailAddress");                    // email to send report
var appGroup = getParam("appGroup");
var appType = getParam("appType");
var appSubType = getParam("appSubType");
var appCategory = getParam("appCategory");


/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var timeExpired = false;
var capId = null;
var useAppSpecificGroupName = false;

var startTime = startDate.getTime();            // Start timer
var systemUserObj = aa.person.getUser("ADMIN").getOutput();


/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");
logDebug("********************************");

if (!timeExpired) mainProcess();

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

if (emailAddress.length)
    aa.sendMail("noreply@accela.com", emailAddress, "", batchJobName + " Results", emailText);


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/


function mainProcess() {
    var capCount = 0;

    logDebug("Retrieving licenses for evaluation (START)");
    logDebug("********************************");

    //Create a capModel for use with the get records method
    var capModel = aa.cap.getCapModel().getOutput();

    //Initialize the appList array
    var appList = new Array();

    /*------------------------------------------------------------------------------------------------------/
    |  Get the licenses
    /------------------------------------------------------------------------------------------------------*/

    capTypeModel = capModel.getCapType();
    capTypeModel.setGroup(appGroup);
    capTypeModel.setType(appType);
    capTypeModel.setSubType(appSubType);
    capTypeModel.setCategory(appCategory);
    capModel.setCapType(capTypeModel);

    appListResult = aa.cap.getCapIDListByCapModel(capModel);

    if (appListResult.getSuccess()) {
        appList = appListResult.getOutput();
    }

    logDebug("********************************");
    logDebug("Retrieving licenses (END)");
    logDebug("********************************");
        
    if (appList.length > 0) {
        logDebug("Processing " + appList.length + " license records");
    } else {
        logDebug("No licenses returned:"); 
        return false; 
    }

    logDebug("********************************");

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
        |  Check if opened in the last 12 months, skip if newer than 12 months
        /------------------------------------------------------------------------------------------------------*/

        //var capId = appList[al];
        capId = aa.cap.getCapID(appList[al].getCapID().getID1(),appList[al].getCapID().getID2(),appList[al].getCapID().getID3()).getOutput();
        var cap = aa.cap.getCap(capId).getOutput();
        appTypeResult = cap.getCapType();
        appTypeString = appTypeResult.toString();
        appTypeArray = appTypeString.split("/");

        if (matches(appTypeArray[2],"Nursery Grower","Nursery Dealer")) {
            createRefLP4Lookup4NurseryGrowerDealer(capId);
        } else {
            createRefLP4Lookup(capId);
        }

        capCount++;
        logDebug("********************************");


    } 
    
    logDebug("********************************");
    logDebug("Total CAPS qualified criteria: " + appList.length);
    logDebug("Total CAPS processed: " + capCount);
    
 }