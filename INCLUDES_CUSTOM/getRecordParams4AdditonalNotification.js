  function getRecordParams4AdditonalNotification(params) {    // pass in a hashtable and it will add the additional parameters to the table    var thisArr = new Array();	useTaskSpecificGroupName = true;    loadTaskSpecific(thisArr);	//logDebug("App Specific Info for Additional: " + thisArr);	/*for(x in thisArr)	{		logDebug(thisArr[x]);	}*/    var tsiVal = "";	var bre = "\r\n";    //how to reference TSI when useTaskSpecificGroupName is set to true.    if (thisArr[wfProcess + "." + wfTask + ".Application Requires an Original Ink Signature"] == "CHECKED") {			tsiVal += ("Application Requires an Original Ink Signature, ");		    }           if (thisArr[wfProcess + "." + wfTask + ".License Fee is incorrect or not included"] == "CHECKED") {			tsiVal += ("License Fee is incorrect or not included, ");		    }	    if (thisArr[wfProcess + "." + wfTask + ".Missing answers to questions"] == "CHECKED") {			tsiVal += ("Missing answers to questions, ");    }				 if (thisArr[wfProcess + "." + wfTask + ".Business Name"] == "CHECKED") {			tsiVal += ("Business Name, ");    }  	 if (thisArr[wfProcess + "." + wfTask + ".Felony or Misdemeanor Information"] == "CHECKED") {			tsiVal += ("Felony or Misdemeanor Information, ");    }     if (thisArr[wfProcess + "." + wfTask + ".Business Address"] == "CHECKED") {			tsiVal += ("Business Address, ");    }   	 if (thisArr[wfProcess + "." + wfTask + ".Check Not Signed"] == "CHECKED") {			tsiVal += ("Check Not Signed, ");		    }		 if (thisArr[wfProcess + "." + wfTask + ".Business Telephone and/or Fax Number"] == "CHECKED") {			tsiVal += ("Business Telephone and/or Fax Number, ");		    }   		 if (thisArr[wfProcess + "." + wfTask + ".Federal ID/Social Security Number"] == "CHECKED") {			tsiVal += ("Federal ID/Social Security Number, ");		    }				 if (thisArr[wfProcess + "." + wfTask + ".Name of Applicants"] == "CHECKED") {			tsiVal += ("Name of Applicants, ");	    }		 if (thisArr[wfProcess + "." + wfTask + ".Financial Update/Balance Sheet"] == "CHECKED") {			tsiVal += ("Financial Update/Balance Sheet, ");	    }		 if (thisArr[wfProcess + "." + wfTask + ".Names of Corporate Officers"] == "CHECKED") {			tsiVal += ("Names of Corporate Officers, ");		    }		 if (thisArr[wfProcess + "." + wfTask + ".State Incorporated In"] == "CHECKED") {			tsiVal += ("State Incorporated In, ");		    }			 if (thisArr[wfProcess + "." + wfTask + ".Home Addresses of Corporate Officers"] == "CHECKED") {			tsiVal += ("Home Addresses of Corporate Officers, ");		    }	 if (thisArr[wfProcess + "." + wfTask + ".Date Incorporated"] == "CHECKED") {			tsiVal += ("Date Incorporated, ");		    }		 if (thisArr[wfProcess + "." + wfTask + ".Corporate Officers Stockholder Statement"] == "CHECKED") {			tsiVal += ("Corporate Officers Stockholder Statement, ");		    }			 if (thisArr[wfProcess + "." + wfTask + ".Business Year End"] == "CHECKED") {			tsiVal += ("Business Year End, ");		    }	 if (thisArr[wfProcess + "." + wfTask + ".Schedule A"] == "CHECKED") {			tsiVal += ("Schedule A, ");		    }  	 if (thisArr[wfProcess + "." + wfTask + ".Surety Bond Missing/Incorrect/Expired"] == "CHECKED") {			tsiVal += ("Surety Bond Missing/Incorrect/Expired, ");		    }			 if (thisArr[wfProcess + "." + wfTask + ".Supplier Not Identified"] == "CHECKED") {			tsiVal += ("Supplier Not Identified, ");		    }  		 if (thisArr[wfProcess + "." + wfTask + ".Security Time Period"] == "CHECKED") {			tsiVal += ("Security Time Period, ");    }		 if (thisArr[wfProcess + "." + wfTask + ".Irrevocable Letter of Credit Time Period"] == "CHECKED") {			tsiVal += ("Irrevocable Letter of Credit Time Period, ");		    }			 if (thisArr[wfProcess + "." + wfTask + ".CHECKED"] == "CHECKED") {			tsiVal += ("CHECKED, ");	    } 		if (thisArr[wfProcess + "." + wfTask + ".Comments"] == null || thisArr[wfProcess + "." + wfTask + ".Comments"] == ""){	//thisArr["Comments"] == " ";	 //tsiVal += thisArr["Comments"];	 var tsiValueComments = tsiVal;	 logDebug("TSI VALUE COMMENTS::" + tsiValueComments);	  addParameter(params, "$$TASKSPECIFICINFO$$", tsiValueComments);	}		else{    tsiVal += "Comments: " + thisArr[wfProcess + "." + wfTask + ".Comments"];	addParameter(params, "$$TASKSPECIFICINFO$$", tsiVal);	}    aa.print("tsiVal:" + tsiVal);    //addParameter(params, "$$TASKSPECIFICINFO$$", tsiVal);    return params;}     //START IMPROVED CODE /*  function getRecordParams4AdditonalNotification(params) {    // pass in a hashtable and it will add the additional parameters to the table	logDebug("Setting task specific info");    var thisArr = new Array();    loadTaskSpecific(thisArr);		logDebug("thisArr: " + thisArr);     var tsiVal = "";	//var bre = "\r\n";    if (thisArr["Application Requires an Original Ink Signature"] == "CHECKED") {        tsiVal +=  "Application Requires an Original Ink Signature, \n";				    }	    if (thisArr["License Fee is incorrect or not included"] == "CHECKED") {        tsiVal += "License Fee is incorrect or not included, \n";		    }			if (thisArr["Missing answers to questions"] == "CHECKED") {        tsiVal += "Missing answers to questions, \n";		    }    if (thisArr["Business Name"] == "CHECKED") {        tsiVal += "Business Name, \n";		    }		if (thisArr["Felony or Misdemeanor Information"] == "CHECKED") {        tsiVal += "Felony or Misdemeanor Information, \n";		    }    if (thisArr["Business Address"] == "CHECKED") {        tsiVal += "Business Address, \n";		    }		if (thisArr["Check Not Signed"] == "CHECKED") {        tsiVal += "Check Not Signed, \n";		    }    if (thisArr["Business Telephone and/or Fax Number"] == "CHECKED") {        tsiVal += "Business Telephone and/or Fax Number, \n";		    }		if (thisArr["Federal ID/Social Security Number"] == "CHECKED") {        tsiVal += "Federal ID/Social Security Number, \n";		    }    if (thisArr["Name of Applicants"] == "CHECKED") {        tsiVal += "Name of Applicants, \n";		    }		if (thisArr["Financial Update/Balance Sheet"] == "CHECKED") {        tsiVal += "Financial Update/Balance Sheet, \n";		    }    if (thisArr["Names of Corporate Officers"] == "CHECKED") {        tsiVal += "Names of Corporate Officers, \n";		    }		if (thisArr["State Incorporated In"] == "CHECKED") {        tsiVal += "State Incorporated In, \n";		    }    if (thisArr["Home Addresses of Corporate Officers"] == "CHECKED") {        tsiVal += "Home Addresses of Corporate Officers, \n";		    }    if (thisArr["Date Incorporated"] == "CHECKED") {        tsiVal += "Date Incorporated, \n";		    }			if (thisArr["Corporate Officers Stockholder Statement"] == "CHECKED") {        tsiVal += "Corporate Officers Stockholder Statement, \n";		    }    if (thisArr["Business Year End"] == "CHECKED") {        tsiVal += "Business Year End, \n";		    }    if (thisArr["Schedule A"] == "CHECKED") {        tsiVal += "Schedule A, \n";		    }			if (thisArr["Surety Bond Missing/Incorrect/Expired"] == "CHECKED") {        tsiVal += "Surety Bond Missing/Incorrect/Expired, \n";		    }    if (thisArr["Supplier Not Identified"] == "CHECKED") {        tsiVal += "Supplier Not Identified, \n";		    }    if (thisArr["Security Time Period"] == "CHECKED") {        tsiVal += "Security Time Period, \n";		    }	if (thisArr["Irrevocable Letter of Credit Time Period"] == "CHECKED") {        tsiVal += "Irrevocable Letter of Credit Time Period, \n";		    }    if (thisArr["Other"] == "CHECKED") {        tsiVal += "Other, \n";		    }			//if (thisArr["Comments"] != "null") {     //   tsiVal += "Comments:";		    //}	/*var arrayComments = thisArr["Comments"];	if(arrayComments != null){    tsiVal += "Comments: " + arrayComments;	}		logDebug("Task specific info:" + tsiVal);    addParameter(params, "$$TASKSPECIFICINFO$$", tsiVal);    return params;*///OLD CODE AT BOTTOM STILL VERSUS ADITI CODE ABOVE/* tsiVal += "Comments: " + thisArr["Comments"];    aa.print("tsiVal:" + tsiVal);    addParameter(params, "$$TASKSPECIFICINFO$$", tsiVal);    return params;}*/