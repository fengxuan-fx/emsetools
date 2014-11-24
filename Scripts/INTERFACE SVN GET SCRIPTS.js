/*------------------------------------------------------------------------------------------------------/
| Program : SVN Query Service
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START Configurable Parameters
|	The following script code will attempt to read the assocaite event and invoker the proper standard choices
|    
/------------------------------------------------------------------------------------------------------*/

/*aa.env.setValue("ScriptTest","Y");
aa.env.setValue("SERV_PROV_CODE","DOS");*/

var SERV_PROV_CODE = aa.env.getValue("SERV_PROV_CODE");
var scriptTest = aa.env.getValue("ScriptTest");

var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();


try { 
	var sList = emseBiz.getScriptNameListByServProvCode(SERV_PROV_CODE);
	var scriptArray = new Array();

	if (sList) {
		
		for (var s = 0;s < sList[0].length;s++) {
			
			//Get the script model by script name
			
			var scriptCode = sList[0][s];//script code 
			var scriptModel = emseBiz.getScriptByPK(SERV_PROV_CODE,scriptCode,"ADMIN");// get the script
			if (String(scriptModel.getDescription()).equals("SVN")) {
				
				var currentScript ={};
				currentScript.name = new String(scriptCode);
				currentScript.auditDate = new String(scriptModel.getAuditDate());
				
				scriptArray.push(currentScript);				
			}
			//Get the script name and audit date
		}

		aa.env.setValue("SUCCESS","true");
		aa.env.setValue("SCRIPTJSON",JSON.stringify(scriptArray));

	} else {
		aa.env.setValue("SUCCESS","true");
		aa.env.setValue("SCRIPTJSON","");
	}
	
	if (scriptTest == "Y") printEnv();  
} catch(err) {
    aa.env.setValue("SUCCESS","false");
}


function logDebug(estr) {
    aa.print(estr);
}

function printEnv() {
    //Log All Environmental Variables as
    var params = aa.env.getParamValues();
    var keys =  params.keys();
    var key = null;
    while(keys.hasMoreElements())
    {
     key = keys.nextElement();
     eval("var " + key + " = aa.env.getValue(\"" + key + "\");");
     aa.print(key + " = " + aa.env.getValue(key));
    }
}