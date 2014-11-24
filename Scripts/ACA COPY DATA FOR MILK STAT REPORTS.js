/*------------------------------------------------------------------------------------------------------/
| Program : ACA COPY CONTACTS FOR  MILK STAT REPORTS.js
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
//loadASITables4ACA();

var AInfo = new Array(); 					// Create array for tokenized variables

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
try {
    cancel = true;
	parentCapIdString = getParent();
	logDebug("Parent ID" + parentCapIdString);
	productArray = getChildren("Licenses/Amendment/Milk Statistical Report/Milk Statistical OOS Report", parentCapIdString);
	message = "Parent ID: " + parentCapIdString + "Length" + productArray.length + "Done testing";
	var arrayDates = new Array();
    var parameter = aa.util.newHashMap();
	logDebug("Parent ID: " + parentCapIdString + "Length" + productArray.length + "Done testing");
	
	
   for(i = 0; i<productArray.length; i++){
	status = aa.cap.getCap(productArray[i]).getOutput().getCapStatus();
	if(status == null || status == ""){
	continue;
	}
	else{
	amenDate = aa.cap.getCap(productArray[i]).getOutput().getFileDate();
	message = "File Date" + amenDate;
	logDebug("File Date" + amenDate);
	if(amenDate != null){
	 var b1ExpDate = amenDate.getMonth() + "/" + amenDate.getDayOfMonth() + "/" + amenDate.getYear();
	var oneDay = 24*60*60*1000;
   var addDays = new Date(Date.parse(b1ExpDate));
 
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!

	var yyyy = today.getFullYear();
	if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} var today = mm+'/'+dd+'/'+yyyy;
	var todayDate = new Date(Date.parse(today));
	
 
	condition = Math.round(Math.abs((todayDate.getTime() - addDays.getTime())/(oneDay)));
	message = "Condition of days" + condition;
	logDebug("Condition of days" + condition);
	arrayDates[i] = condition;
	parameter.put(condition, productArray[i]);
	}
	else{
	logDebug("Dont display this ever");
	}
	}
	}
	var sortArray = new Array();
	sortArray = arrayDates.sort();
	message = "test6" + "Test Array Value" + sortArray[sortArray.length - 1];
	logDebug("test6" + "Test Array Value" + sortArray[sortArray.length - 1]);
	
	for(i in sortArray){
	if(sortArray[i] == null){
	continue;
	}
	else{
	latestCapId = parameter.get(sortArray[i]);
	message = "Latest Amendment" + latestCapId;
	logDebug("Latest Amendment" + latestCapId);
	break;
	
	}
	}
	
// Start Populating Milk Stat Amendment Code
	parentCapId = latestCapId;
	
	if (parentCapId) {
		parentCap =aa.cap.getCapViewBySingle4ACA(parentCapId);
		}

	if (parentCap) {
		n_asit = parentCap.getAppSpecificTableGroupModel();
		}

	if (parentCap) {
		cap.setAppSpecificTableGroupModel(n_asit);
		}

	if (parentCap) {
		contactList = parentCap.getContactsGroup();
		for (i = 0;
		i < contactList.size();
		i++) contactList.get(i).getPeople().setContactSeqNumber(null);
		}

	if (parentCap) {
		cap.setContactsGroup(contactList);
		}

	copyAppSpecific4ACA(parentCap);
	// test = parentCap.getAppSpecificInfoGroups();
	
	if (parentCap) {
		aa.env.setValue("CapModel",cap);
		}
	 

	}
catch (err) { message = "**ERROR : " + err; }
	
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