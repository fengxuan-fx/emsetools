/*------------------------------------------------------------------------------------------------------/
| Program : SVN Push Service
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START Configurable Parameters
|	The following script code will attempt to read the assocaite event and invoker the proper standard choices
|    
/------------------------------------------------------------------------------------------------------*/
var SERV_PROV_CODE = aa.env.getValue("SERV_PROV_CODE");
var SCRIPT_ID = aa.env.getValue("SCRIPT_ID").toUpperCase();
var SCRIPT_TEXT = aa.env.getValue("SCRIPT_TEXT");
var DATE_HOUR = aa.env.getValue("DATE_HOUR");
var DATE_MONTH= aa.env.getValue("DATE_MONTH");
var DATE_DAY = aa.env.getValue("DATE_DAY");
var DATE_YEAR = aa.env.getValue("DATE_YEAR");
var DATE_MIN = aa.env.getValue("DATE_MIN");
var DATE_SEC = aa.env.getValue("DATE_SEC");

var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
var emseDAO = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.ScriptDAOOracle").getOutput();

var d =  new Date(DATE_YEAR,DATE_MONTH,DATE_DAY,DATE_HOUR,DATE_MIN,DATE_SEC);
var p = [SERV_PROV_CODE,SCRIPT_ID,SCRIPT_TEXT,"ADMIN",d,"A"];
var s = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.ScriptModel",p).getOutput();
var creating = false;

try { 
	s = emseBiz.getScriptByPK(SERV_PROV_CODE,SCRIPT_ID,"ADMIN"); 	
	} catch(err) {
    creating = true;
	}

s.setDescription("SVN");
s.setScriptName(SCRIPT_ID);
s.setScriptText(SCRIPT_TEXT);
s.setSripteCode(SCRIPT_ID);
s.setAuditDate(d);

try {

	if (SCRIPT_ID.indexOf("INCLUDES") > 0) { // eval to see if the script compiles
		eval(SCRIPT_TEXT);
		}
		
	if (creating) {
		emseDAO.createScript(s);
		}
	else {
		emseDAO.editScript(s);
		}
	aa.env.setValue("SUCCESS",true);
	}
catch (err) {
    aa.print("create/edit failed error " + err.message);
    aa.env.setValue("SUCCESS",false);
	}
	
		
	