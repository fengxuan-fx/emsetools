/*------------------------------------------------------------------------------------------------------/
| Program : ACA MILK STATISTICAL OOS REPORT FOR SCHEDULE H.js
| Event   : ACA_AfterButton Event
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var showMessage = false;						// Set to true to see results in popup window
var showDebug = false;							// Set to true to see debug messages in popup window
var useAppSpecificGroupName = false;			// Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false;			// Use Group name when populating Task Specific Info Values
var cancel = false;
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startTime = startDate.getTime();
var message =	"";							// Message String
var debug = "";								// Debug String
var br = "<BR>";							// Break Tag

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

var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var servProvCode = capId.getServiceProviderCode()       		// Service Provider Code
var publicUser = false;
var currentUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) { currentUserID = "ADMIN"; publicUser = true }  // ignore public users
var capIDString = capId.getCustomID(); 				// alternate cap id string
var systemUserObj = aa.person.getUser(currentUserID).getOutput();  	// Current User Object
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString(); 			// Convert application type to string ("Building/A/B/C")
var appTypeArray = appTypeString.split("/"); 			// Array of application type string
var currentUserGroup;
var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0], currentUserID).getOutput()
if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
var capName = cap.getSpecialText();
var capStatus = cap.getCapStatus();

var AInfo = new Array();						// Create array for tokenized variables
//loadAppSpecific4ACA(AInfo); 						// Add AppSpecific Info
//loadTaskSpecific(AInfo);						// Add task specific info
//loadParcelAttributes(AInfo);						// Add parcel attributes
loadASITables4ACA();

var AInfo = new Array(); 					// Create array for tokenized variables

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
/*try
{ */
var totalLbsOfMilkUsed=0;
var totalLbsOfButterFatMilkUsed=0;
var totalLbsOfProductMade=0;
var totalLbsOfMilkCreamUsed=0;
var totalLbsOfButterfatCreamUsed=0;
var totalLbsOfSkimMilkUsed=0;
var totalLbsOfButterfatSkimMilkUsed=0;
var totalLbsOfOtherIngredientsUsed=0;
var totalLbsOfButterfatOtherIngredientsUsed=0;

if(typeof(SCHEDULECDAIRYINGREDIENTS) == "object")
{
	for(a in SCHEDULECDAIRYINGREDIENTS) {(totalLbsOfProductMade = totalLbsOfProductMade + parseFloat(SCHEDULECDAIRYINGREDIENTS[a]["Lbs Made"]))};
	for(b in SCHEDULECDAIRYINGREDIENTS) {(totalLbsOfMilkUsed = totalLbsOfMilkUsed + parseFloat(SCHEDULECDAIRYINGREDIENTS[b]["Lbs of Milk Used"]))};
	for(c in SCHEDULECDAIRYINGREDIENTS) {(totalLbsOfButterFatMilkUsed = totalLbsOfButterFatMilkUsed + parseFloat(SCHEDULECDAIRYINGREDIENTS[c]["Lbs of Butterfat Milk Used"]))};
	
	for(d in SCHEDULECDAIRYINGREDIENTS) {(totalLbsOfMilkCreamUsed = totalLbsOfMilkCreamUsed + parseFloat(SCHEDULECDAIRYINGREDIENTS[d]["Lbs of Milk Cream Used"]))};
	
	for(e in SCHEDULECDAIRYINGREDIENTS) {(totalLbsOfButterfatCreamUsed =  totalLbsOfButterfatCreamUsed + parseFloat(SCHEDULECDAIRYINGREDIENTS[e]["Lbs of Butterfat Cream Used"]))};
	
	for(f in SCHEDULECDAIRYINGREDIENTS) {(totalLbsOfSkimMilkUsed =  totalLbsOfSkimMilkUsed + parseFloat(SCHEDULECDAIRYINGREDIENTS[f]["Lbs of Skim Milk Used"]))};
	
	for(g in SCHEDULECDAIRYINGREDIENTS) {(totalLbsOfButterfatSkimMilkUsed = totalLbsOfButterfatSkimMilkUsed + parseFloat(SCHEDULECDAIRYINGREDIENTS[g]["Lbs of Butterfat Skim Milk Used"]))};

	for(h in SCHEDULECDAIRYINGREDIENTS) {(totalLbsOfOtherIngredientsUsed = totalLbsOfOtherIngredientsUsed + parseFloat(SCHEDULECDAIRYINGREDIENTS[h]["Lbs of Other Ingredients Used"]))};
	
	for(i in SCHEDULECDAIRYINGREDIENTS) {(totalLbsOfButterfatOtherIngredientsUsed = totalLbsOfButterfatOtherIngredientsUsed + parseFloat(SCHEDULECDAIRYINGREDIENTS[i]["Lbs of Butterfat Other Ingredients Used"]))};
}


editAppSpecific4ACA("Total Lbs of Product Made",totalLbsOfProductMade);
editAppSpecific4ACA("Total Lbs of Milk Used",totalLbsOfMilkUsed);
editAppSpecific4ACA("Total Lbs of Butterfat Milk Used",totalLbsOfButterFatMilkUsed);

editAppSpecific4ACA("Total Lbs of Cream Used",totalLbsOfMilkCreamUsed);

editAppSpecific4ACA("Total Lbs of Butterfat Cream Used",totalLbsOfButterfatCreamUsed);
editAppSpecific4ACA("Total Lbs of Skim Milk Used",totalLbsOfSkimMilkUsed);
editAppSpecific4ACA("Total Lbs of Butterfat Skim Milk Used",totalLbsOfButterfatSkimMilkUsed);
editAppSpecific4ACA("Total Lbs of Other Ingredients Used",totalLbsOfOtherIngredientsUsed);
editAppSpecific4ACA("Totals Lbs of Butterfat Other Ingredients Used",totalLbsOfButterfatOtherIngredientsUsed);
aa.env.setValue("CapModel", cap);

/*}
catch (err) { logDebug("**ERROR : " + err); }	*/	
	
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

if (debug.indexOf("**ERROR") > 0) {
    aa.env.setValue("ErrorCode", "1");
    aa.env.setValue("ErrorMessage", debug);
}
else {
    if (cancel) {
        aa.env.setValue("ErrorCode", "-2");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
    else {
        aa.env.setValue("ErrorCode", "0");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
}

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
