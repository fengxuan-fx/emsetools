var testInspID;
var toEmailAddress;
var strSendEmail = "sendEmail";
var strNoEmail = "noEmail";
var rFiles = new Array();
var inspEmail;
var reportsToRun = new Array();

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
	}
	
	//Add inspection to set
	var tDate = new Date();
	var dateString = (tDate.getMonth() + 1) + "/" + tDate.getDate() + "/" + tDate.getFullYear();
	var setString;
	if(inspType.equalsIgnoreCase("Nursery Grower") || inspType.equalsIgnoreCase("Nursery Grower Re-Inspection"))
	{
		setString = "Nursery Grower";
	}
	else if(inspType.equalsIgnoreCase("Nursery Dealer") || inspType.equalsIgnoreCase("Nursery Dealer Re-Inspection"))
	{
		setString = "Nursery Dealer";
	}
	else if(inspType.equalsIgnoreCase("Commodity") || inspType.equalsIgnoreCase("Commodity Re-Inspection"))
	{
		setString = "Commodity"
	}
	else if(inspType.equalsIgnoreCase("Ammonium Nitrate") || inspType.equalsIgnoreCase("Ammonium Nitrate Re-Inspection"))
	{
		setString = "Ammonium Nitrate";
	}
	else if(inspType.equalsIgnoreCase("Plum Pox Compliance Agreement Interview"))
	{
		setString = "Plum Pox Compliance Agreement Interview";
	}
	else if(inspType.equalsIgnoreCase("Plum Pox Virus Eradication Program Compliance") || inspType.equalsIgnoreCase("Plum Pox Virus Eradication Program Compliance Re-Inspection"))
	{
		setString = "Plum Pox Virus Eradication Program Compliance";
	}
	else if(inspType.equalsIgnoreCase("Emerald Ash Borer") || inspType.equalsIgnoreCase("Emerald Ash Borer Re-Inspection"))
	{
		setString = "Emerald Ash Borer";
	}
	else if(inspType.equalsIgnoreCase("Emerald Ash Borer Compliance Agreement Interview"))
	{
		setString = "Emerald Ash Borer Compliance Agreement Interview";
	}
	var setID = setString + "_" + dateString;
	logDebug("Set ID: " + setID);
	var setDescription = setString + " Inspection";
	
	var setResult = aa.set.getSetByPK(setID);
	if(setResult.getSuccess())
	{
		setResult=setResult.getOutput();
		
		//Update set status to "Pending"
		var updateSet = new capSet(setID);
		updateSet.status = "Pending";
		updateSet.comment = "Processing";
		updateSet.update();
		
		//Check if establishment already exists in set
		var setMembers=aa.set.getCAPSetMembersByPK(setResult.getSetID());
		var array = new Array();
		array=setMembers.getOutput();
		var estID = capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3();
		logDebug("Establishment ID: " + estID);
		var checkEstExists=0;
		for(i=0;i<array.size();i++)
		{
			var setMember=array.get(i);
			setMember=setMember.toString();
			logDebug("Set member ID: " + setMember);
			if(setMember==estID)
			{
				logDebug("Record exists in set");
				checkEstExists=1;
				break;
			}
		}
		
		//Add establishment to set if it is not present in the set
		if(checkEstExists == 0)
		{
			var addSetMember = new capSet(setID);
			//addSetMember.add(capId, inspId);
			var addToSet= aa.set.addCapSetMember(setResult.getSetID(),capId); 
			logDebug("Add result " + addToSet.getSuccess());
		}
		/*else if(checkEstExists == 1)
		{
			var setDetailsScriptModel = aa.set.getSetDetailsScriptModel().getOutput();
			setDetailsScriptModel.setSetID(setID);
			setDetailsScriptModel.setID1(capId.getID1());
			setDetailsScriptModel.setID2(capId.getID2());
			setDetailsScriptModel.setID3(capId.getID3());
			var setDetailList = aa.set.getSetMembers(setDetailsScriptModel).getOutput();
			logDebug("Set members: " + setDetailList.size());
			if(setDetailList != null)
			{
				var status = setDetailList.get(0).getSetMemberStatus();
				status = status + "," + inspId;
				setDetailsScriptModel.setSetMemberStatus(status);
				setDetailsScriptModel.setSetMemberStatusDate(aa.date.getCurrentDate());
				var updateResult = aa.set.updateSetMemberStatus(setDetailsScriptModel);
				logDebug("Updated status result: " + updateResult.getSuccess());
			}
		}*/
	}
	else		//Create new set if it does not already exist
	{
		var result=createSet(setID,setDescription, setDescription, "Pending", "Processing");
		logDebug("createSet Result: " + result);
		if(result)
		{
    	   	logDebug("Set created");
     		setResult=aa.set.getSetByPK(setID);
     		if(setResult.getSuccess())
     		{
        		logDebug("Set success");
				setResult=setResult.getOutput();
				//Add establishment to set
				var addSetMember = new capSet(setResult.getSetID());
				//addSetMember.add(capId, inspId);
				var addToSet= aa.set.addCapSetMember(setID,capId); 
				logDebug("Add result " + addToSet.getSuccess());
				//var setMembers=aa.set.getCAPSetMembersByPK(setID);
				//logDebug(setMembers.getOutput());
        		//var addResult= aa.set.addCapSetMember((setResult.getSetID()),capId); 
        		//logDebug("Result for 1st new set: " + addResult.getSuccess());
				
				/*var setDetailsScriptModel = aa.set.getSetDetailsScriptModel().getOutput();
				setDetailsScriptModel.setSetID(setID);
				setDetailsScriptModel.setID1(capId.getID1());
				setDetailsScriptModel.setID2(capId.getID2());
				setDetailsScriptModel.setID3(capId.getID3());
				setDetailsScriptModel.setSetMemberStatus(inspId);
				setDetailsScriptModel.setSetMemberStatusDate(aa.date.getCurrentDate());
				var updateResult = aa.set.updateSetMemberStatus(setDetailsScriptModel);*/
     		}
		}
	}
	logDebug("Final set members");
	var finalSetMembers = aa.set.getCAPSetMembersByPK(setID);
	var finalArray = new Array();
	finalArray = finalSetMembers.getOutput();
	for(i=0;i<finalArray.size();i++)
		{
			var setMember=finalArray.get(i);
			setMember=setMember.toString();
			logDebug("Set member ID: " + setMember);
		}
	
	
if (matches(inspResult,"Completed","Not Complete","Stop Sale","Stop Sale Partially Released","Stop Sale Released","Quarantine Issued","Quarantine Partially Released","Quarantine Released","Violation of Quarantine","Unlicensed labeler","Violation of Stop Sale", "Deficiencies found", "Unlicensed Establishment", "Revoked", "Issued", "Not Issued", "Declined", "Released", "Denied", "Prunus onsite", "Compliance Agreement Wanted", "Pass", "Fail")) {
	
	//Run Report for GuideSheet Parameters and send email where needed
	var parameterGuideSheet=aa.util.newHashMap();
	parameterGuideSheet.put("ALT_ID", capId.getCustomID());
    parameterGuideSheet.put("INSPECTION_ID", inspId);
	parameterGuideSheet.put("SET_ID", "ALL");
    logDebug("Report parameters for guide sheet: " + parameterGuideSheet);
	logDebug("Cap Id Test" + capId);
	logDebug("Business Email Address =" + toEmailAddress);
	
	
	
	var params = aa.util.newHashtable();
	
	//addParameter(params, "$$toEmailAddress$$", toEmailAddress);
		
		
	var estCounty = getAddressCountyByAddressType("Physical Address");
	var supervisorEmail = "";
	var emailTemplate = "";
	var productNames = " ";
	var agreementTypes = " ";
	var flagForInvestigation = 0;
	//var inspID = getInspector();
	//var licTyp = getInspectionType();
	
	getRecordParams4Notification(params);
    var conObj = getContactObj(capId,"Business");  //Need to handle if an individual name is entered
    conObj.getEmailTemplateParams(params);
    addParameter(params, "$$inspDate$$", inspResultDate);
	addParameter(params, "$$inspType$$" , inspType);
	
	var inspTest = aa.inspection.getInspection(capId, inspId);
	var inspOutput = inspTest.getOutput();
	logDebug("Inspection test" + inspOutput);
	var inspFirstName;
	var inspLastName;
	var userID = getInspectorAGM(inspOutput);
	logDebug("User ID" + userID);
	var inspector = inspOutput.getInspector();
				var capDetailObjResult = aa.cap.getCapDetail(capId);                          
                                                                               
                  if (capDetailObjResult.getSuccess()) {
                  capDetail = capDetailObjResult.getOutput();
				  capDetail.setAsgnStaff(userID);
				  var assignedID = capDetail.getAsgnStaff();
                                                                                               
             if (!matches(assignedID,null,undefined,"")) {
 
                     personObjResult = aa.person.getUser(assignedID);
                        if (personObjResult.getSuccess()) {
                                                                                                                               
                            personObj = personObjResult.getOutput();
								if(personObj.getFirstName() != "") {
								inspFirstName = personObj.getFirstName();
								 logDebug("FirstName final" + inspFirstName);
								//addParameter(params, "$$inspEmail$$", inspEmail);
                                  
                                  } else {
                                   logDebug("**ERROR: Inspector Email is null");
                                   }
							
							if(personObj.getLastName() != "") {
									inspLastName = personObj.getLastName();
									logDebug("Last Name final" + inspLastName);
									//addParameter(params, "$$inspPhone$$", inspPhone);
                                    
                                    } else {
                                    logDebug("**ERROR: Inspector Phone is null");
                                      }
                                 
 
                                  } else {
                                           logDebug("**ERROR: Could not retrieve the personScriptModel: " + personObjResult.getErrorMessage());
                                             sendEmail = false;
                                          }
                                        } else {
                                            logDebug("**ERROR: No staff assigned.");
                                            sendEmail = false;
                                   }				  
				  }
				  else {
                  logDebug("**ERROR: Could not retrieve the capDetailModel: " + capDetailObjResult.getErrorMessage());
                  sendEmail = false;
                       }  
				  
    var userFullName = inspFirstName + " " + inspLastName;
    if (userFullName)
    	addParameter(params, "$$inspName$$", userFullName);
    var physicalAddress = getAddressLineByAddressType("Physical Address");
    if (physicalAddress) addParameter(params, "$$phyicalAddress$$", physicalAddress);
	var user = aa.person.getCurrentUser();
	
	logDebug("Email parameter for inspection");
	
	var inspID = inspId;
	logDebug("Inspection ID: " + inspID);
	
	var gsArray = new Array();
	gsArray = getGuideSheetObjects(inspID);
	
	//Setting the email template if inspection has report of investigation
	for(yy in gsArray)
	{
		var gsObj = gsArray[yy];
		if(gsObj.gsType == "Report of Investigation")
		{
			//logDebug("Inspection has investigation report");
			flagForInvestigation = 1;
			break;
		}
	}
	
	logDebug("Inspection type: " + inspType);
	if(inspType.equalsIgnoreCase("Commodity") || inspType.equalsIgnoreCase("Commodity Re-Inspection") || inspType.equalsIgnoreCase("Ammonium Nitrate") || inspType.equalsIgnoreCase("Ammonium Nitrate Re-Inspection"))
	{
		if(matches(inspResult,"Stop Sale"))
		{
			for(yy in gsArray)
			{
				var gsObj = gsArray[yy];
				if(gsObj.gsType == "Stop Sale Order" && gsObj.text == "Stop Sale Products")
				{
					logDebug("Guidesheet data:" + gsObj.gsType + "  " + gsObj.text);
					gsObj.loadInfoTables();
					if(gsObj.validTables)
					{
						if(typeof(gsObj.infoTables["STOP SALE PRODUCTS"]) == "object")
						{
							logDebug("Table found");
							var table = gsObj.infoTables["STOP SALE PRODUCTS"];
							for(i in table)
							{	
								if((table[i]["STATUS"]).toUpperCase() == "ISSUED")
								{
									logDebug("Product name: " + table[i]["PRODUCT BRAND AND/OR GRADE"]);
									if(productNames == " " )
									{
										productNames = table[i]["PRODUCT BRAND AND/OR GRADE"];
									}
									else
									{
										productNames = productNames + "," + " " + table[i]["PRODUCT BRAND AND/OR GRADE"];
									}
								}
							}
						}
					}
				}
			}
		}
		else if(matches(inspResult,"Violation of Stop Sale"))
		{
			for(yy in gsArray)
			{
				var gsObj = gsArray[yy];
				if(gsObj.gsType == "Stop Sale Order" && gsObj.text == "Stop Sale Products")
				{
					logDebug("Guidesheet data:" + gsObj.gsType + "  " + gsObj.text);
					gsObj.loadInfoTables();
					if(gsObj.validTables)
					{
						if(typeof(gsObj.infoTables["STOP SALE PRODUCTS"]) == "object")
						{
							logDebug("Table found");
							var table = gsObj.infoTables["STOP SALE PRODUCTS"];
							for(i in table)
							{	
								if((table[i]["VIOLATION OF STOP SALE?"]).toUpperCase() == "YES")
								{
									logDebug("Product name: " + table[i]["PRODUCT BRAND AND/OR GRADE"]);
									if(productNames == " " )
									{
										productNames = table[i]["PRODUCT BRAND AND/OR GRADE"];
									}
									else
									{
										productNames = productNames + "," + " " + table[i]["PRODUCT BRAND AND/OR GRADE"];
									}
								}
							}
						}
					}
				}
			}
		}
		else if(matches(inspResult,"Unlicensed labeler"))
		{
			logDebug("Inside unlicensed labeler");
			for(yy in gsArray)
			{
				var gsObj = gsArray[yy];
				if(gsObj.gsType == "Commodity Inspection" && gsObj.text == "Unlicensed Labelers Found")
				{
					logDebug("Guidesheet data:" + gsObj.gsType + "  " + gsObj.text);
					gsObj.loadInfoTables();
					if(gsObj.validTables)
					{
						if(typeof(gsObj.infoTables["UNLICENSED LABELERS FOUND"]) == "object")
						{
							logDebug("Table found");
							var table = gsObj.infoTables["UNLICENSED LABELERS FOUND"];
							for(i in table)
							{	
								logDebug("Product name: " + table[i]["Product"]);
								if(productNames == " " )
								{
									productNames = table[i]["Product"];
								}
								else
								{
									productNames = productNames + "," + " " + table[i]["Product"];
								}		
							}
						}
					}
				}
			}
		}
	}
	else if(inspType.equalsIgnoreCase("Nursery Dealer") || inspType.equalsIgnoreCase("Nursery Dealer Re-Inspection") || inspType.equalsIgnoreCase("Nursery Grower") || inspType.equalsIgnoreCase("Nursery Grower Re-Inspection"))
	{
		if(matches(inspResult, "Quarantine Issued"))
		{
			for(yy in gsArray)
			{
				var gsObj = gsArray[yy];
				if(gsObj.gsType == "Quarantine Order" && gsObj.text == "Product List")
				{
					logDebug("Guidesheet data:" + gsObj.gsType + "  " + gsObj.text);
					gsObj.loadInfoTables();
					if(gsObj.validTables)
					{
						if(typeof(gsObj.infoTables["QUARANTINE PRODUCTS"]) == "object")
						{
							logDebug("Table found");
							var table = gsObj.infoTables["QUARANTINE PRODUCTS"];
							for(i in table)
							{	
								if((table[i]["Status"]).toUpperCase() == "ISSUED")
								{
									logDebug("Product name: " + table[i]["PRODUCT NAME"]);
									if(productNames == " " )
									{
										productNames = table[i]["PRODUCT NAME"] ;
									}
									else
									{
										productNames = productNames + "," +  " "  + table[i]["PRODUCT NAME"];
									}
								}
							}
						}
					}
				}
			}
		}
		else if(matches(inspResult, "Violation of Quarantine"))
		{
			for(yy in gsArray)
			{
				var gsObj = gsArray[yy];
				if(gsObj.gsType == "Quarantine Order" && gsObj.text == "Product List")
				{
					logDebug("Guidesheet data:" + gsObj.gsType + "  " + gsObj.text);
					gsObj.loadInfoTables();
					if(gsObj.validTables)
					{
						if(typeof(gsObj.infoTables["QUARANTINE PRODUCTS"]) == "object")
						{
							logDebug("Table found");
							var table = gsObj.infoTables["QUARANTINE PRODUCTS"];
							for(i in table)
							{	
								if((table[i]["Violation of Quarantine?"]).toUpperCase() == "YES")
								{
									logDebug("Product name: " + table[i]["PRODUCT NAME"]);
									if(productNames == " " )
									{
										productNames = table[i]["PRODUCT NAME"] ;
									}
									else
									{
										productNames = productNames + "," +  " "  + table[i]["PRODUCT NAME"];
									}
								}
							}
						}
					}
				}
			}
		}
		else if(matches(inspResult, "Unlicensed Establishment"))
		{
			//logDebug("Inside unlicensed establishment");
			
			var inspectionObj = aa.inspection.getInspections(capId);
		
			if (inspectionObj.getSuccess())
			{
				var inspectionList = inspectionObj.getOutput();
				for(i in inspectionList)
				{
					if(inspectionList[i].getIdNumber() == inspId)
					{
						//logDebug("Found inspection");
						var inspectionModel = inspectionList[i].getInspection();
						var guideSheets = inspectionModel.getGuideSheets();
						if(guideSheets)
						{
							for(var j=0; j<guideSheets.size(); j++)
							{
								var gsObj = guideSheets.get(j);
								if(gsObj.getGuideType() == "Nursery Grower Insp Report")
								{
									//logDebug("Found guide sheet");
									var items = gsObj.getItems();
									
									for(var k=0; k< items.size(); k++)
									{
										var item = items.get(k);
										if(item.getGuideItemText() == "General Information" && item.getGuideItemASIGroupName() == "NRSGRW_INSGI")
										{
											//logDebug("ASI Group: " + item.getGuideItemASIGroupName());
											var asiSubGroups = item.getItemASISubgroupList();
											if(asiSubGroups)
											{
												for(var l=0; l<asiSubGroups.size(); l++)
												{
													var asiSubGroup = asiSubGroups.get(l);
													if(asiSubGroup && asiSubGroup.getSubgroupCode().toUpperCase() == "GENERAL INFORMATION")
													{
														//logDebug("Found sub group");
														var asiModels = asiSubGroup.getAsiList();
														if(asiModels)
														{
															for(var m=0; m<asiModels.size(); m++)
															{
																var asiModel = asiModels.get(m);
																if(asiModel && asiModel.getAsiName() == "Unlicensed Establishment Type")
																{
																	//logDebug("ASI value: " + asiModel.getAttributeValue());
																	if(asiModel.getAttributeValue())
																	{
																		addParameter(params,"$$licType$$",asiModel.getAttributeValue());
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
	
		
	if(productNames != " ")
	{
		logDebug("Product names: " + productNames);
		addParameter(params, "$$product$$", productNames);
	}
	else
	{
		addParameter(params,"$$product$$", " ");
	}
	
	//var userPhoneNumber = user.getPhoneNumber();
	//if (userPhoneNumber) addParameter(params, "$$inspPhone$$", userPhoneNumber);
    getACARecordParam4Notification(params,acaUrl);
	getContactParams4Notification(params, "Business");


	//get the userId from the lookup
	if (estCounty) {
		var supUserID = lookup("PLANT_INSPECTION_SUPERVISOR_LOOKUP",estCounty);

		if (supUserID != undefined) {
			supervisorEmail = getUserEmail(supUserID);
		}
	}
	
	if((inspType == "Plum Pox Compliance Agreement Interview" || inspType == "Emerald Ash Borer Compliance Agreement Interview") && inspResult == "Revoked")
	{
		emailTemplate = "COMPLIANCE AGREEMENT REVOKED EMAIL";
		
		if(inspType == "Emerald Ash Borer Compliance Agreement Interview")
		{
			logDebug("Inside Emerald Ash Agreement");
			for(yy in gsArray)
			{
				var gsObj = gsArray[yy];
				if(gsObj.gsType == "Emerald Ash Borer Inspection" && gsObj.text == "COMPLIANCE AGREEMENT TYPE")
				{
					logDebug("Guidesheet data:" + gsObj.gsType + "  " + gsObj.text);
					gsObj.loadInfoTables();
					if(gsObj.validTables)
					{
						if(typeof(gsObj.infoTables["COMPLIANCE AGREEMENT TYPE"]) == "object")
						{
							logDebug("Table found");
							var table = gsObj.infoTables["COMPLIANCE AGREEMENT TYPE"];
							for(i in table)
							{	
								logDebug("Agreement type: " + table[i]["Compliance Agreement Type"]);
								if(agreementTypes == " " )
								{
									agreementTypes = table[i]["Compliance Agreement Type"];
								}
								else
								{
									agreementTypes = agreementTypes + "," + " " + table[i]["Compliance Agreement Type"];
								}
							}
						}
					}
				}
			}
		}
	}
	
	if(agreementTypes != " ")
	{
		logDebug("Agreement Types: " + agreementTypes);
		addParameter(params, "$$compType$$", agreementTypes);
	}
	else
	{
		addParameter(params,"$$compType$$", " ");
	}
	
			
			var inspectionObj = aa.inspection.getInspections(capId);
			if (inspectionObj.getSuccess())
			{
				var inspectionList = inspectionObj.getOutput();
				for(i in inspectionList)
				{
					if(inspectionList[i].getIdNumber() == inspId)
					{
						//logDebug("Found inspection");
						var inspectionModel = inspectionList[i].getInspection();
						var guideSheets = inspectionModel.getGuideSheets();
						if(guideSheets)
						{
							for(var j=0; j<guideSheets.size(); j++)
							{
								var gsObj = guideSheets.get(j);
								if(gsObj.getGuideType() == "Stop Sale Order" || gsObj.getGuideType() == "Quarantine Order")
								{
									//logDebug("Found guide sheet");
									var items = gsObj.getItems();
									
									for(var k=0; k< items.size(); k++)
									{
										var item = items.get(k);
										if(item.getGuideItemText() == "Stop Sale Status" && item.getGuideItemASIGroupName() == "SSSTAT")
										{
											var asiSubGroups = item.getItemASISubgroupList();
											if(asiSubGroups)
											{
												for(var l=0; l<asiSubGroups.size(); l++)
												{
													var asiSubGroup = asiSubGroups.get(l);
													if(asiSubGroup && asiSubGroup.getSubgroupCode().toUpperCase() == "STOP SALE STATUS")
													{
														logDebug("Found sub group");
														var asiModels = asiSubGroup.getAsiList();
														if(asiModels)
														{
															for(var m=0; m<asiModels.size(); m++)
															{
																var asiModel = asiModels.get(m);
																if(asiModel && asiModel.getAsiName() == "Stop Sale Status")
																{
																	logDebug("ASI value: " + asiModel.getAttributeValue());
																	if(asiModel.getAttributeValue() == "Issued")
																	{
																		logDebug("Stop Sale Issued Works");
																		var reportToRun = new runReportObj();
																		reportToRun.reportName = "Stop Sale Order";
																		reportToRun.reportParams = parameterGuideSheet;

																		reportsToRun.push(reportToRun);
																		//runReportAsyncTest("Stop Sale Order", parameterGuideSheet, "Licenses", capId, toEmailAddress, params);
																	}
																	
																	else
																	{
																		logDebug("Stop Sale Released Works");
																		runReportAsyncTest("Stop Sale Order Release", parameterGuideSheet, "Licenses", capId, toEmailAddress, params);
																	}
																
																}
															}
														}
													}
												}
											}
										}
										
										if(item.getGuideItemText() == "Quarantine Status" && item.getGuideItemASIGroupName() == "QSTAT")
										{
											var asiSubGroups = item.getItemASISubgroupList();
											if(asiSubGroups)
											{
												for(var l=0; l<asiSubGroups.size(); l++)
												{
													var asiSubGroup = asiSubGroups.get(l);
													if(asiSubGroup && asiSubGroup.getSubgroupCode().toUpperCase() == "QUARANTINE STATUS")
													{
														//logDebug("Found sub group");
														var asiModels = asiSubGroup.getAsiList();
														if(asiModels)
														{
															for(var m=0; m<asiModels.size(); m++)
															{
																var asiModel = asiModels.get(m);
																if(asiModel && asiModel.getAsiName() == "Quarantine Status")
																{
																	logDebug("ASI value: " + asiModel.getAttributeValue());
																	if(asiModel.getAttributeValue() == "Issued")
																	{
																		logDebug("Quarantine Issued Works");
																		runReportAsyncTest("Quarantine Order", parameterGuideSheet, "Licenses", capId, toEmailAddress, params);
																	}
																	
																	else
																	{
																		logDebug("Quarantine Released Works");
																		runReportAsyncTest("Quarantine Order Release", parameterGuideSheet, "Licenses", capId, toEmailAddress, params);
																	}
																
																}
															}
														}
													}
												}
											}
										}
										
									if(item.getGuideItemText() == "Violation of Stop Sale?" && item.getGuideItemASIGroupName() == "VIOSS")
										{
											var asiSubGroups = item.getItemASISubgroupList();
											if(asiSubGroups)
											{
												for(var l=0; l<asiSubGroups.size(); l++)
												{
													var asiSubGroup = asiSubGroups.get(l);
													if(asiSubGroup && asiSubGroup.getSubgroupCode().toUpperCase() == "VIOLATION OF STOP SALE")
													{
														//logDebug("Found sub group");
														var asiModels = asiSubGroup.getAsiList();
														if(asiModels)
														{
															for(var m=0; m<asiModels.size(); m++)
															{
																var asiModel = asiModels.get(m);
																if(asiModel && asiModel.getAsiName() == "Violation of Stop Sale")
																{
																	logDebug("ASI value: " + asiModel.getAttributeValue());
																	if(asiModel.getAttributeValue() == "Yes")
																	{
																		logDebug("Violation of stop sale works");
																		runReportAsyncTest("Notice of Violation Stop Sale Order", parameterGuideSheet, "Licenses", capId, toEmailAddress, params);
																	}
																	
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
						
						 else 
						 {
							logDebug("No inspections on the record");
							
						}
					}
				}
			}
		
	if (inspResult == "Unlicensed labeler") {
	
		//runInspectionReport("Unlicensed Labeler",capId.getCustomID(), inspId,params,strNoEmail);
		runReportAsyncTest("Unlicensed Labeler", parameterGuideSheet, "Licenses", capId, toEmailAddress, params);
		emailTemplate = "UNLICENSED LABELER FOUND";
		if (!appHasCondition("Inspection Conditions","Applied","Unlicensed Labeler Found","Notice")){
		addAppCondition("Inspection Conditions","Applied","Unlicensed Labeler Found","Unlicensed Labeler Found","Notice");
		//email("Rich.Foggo@eLicensing.ny.gov","noreply@accela.com","Unlicensed Labeler Found","Unlicensed Labeler Found");
		}
		}
	
	if (inspResult == "Unlicensed Establishment") {
	
		//runInspectionReport("Unlicensed Establishment",capId.getCustomID(), inspId,params,strNoEmail);
		runReportAsyncTest("Unlicensed Establishment", parameterGuideSheet, "Licenses", capId, toEmailAddress, params);
		emailTemplate = "UNLICENSED ESTABLISHMENT FOUND";
		if (!appHasCondition("Inspection Conditions","Applied","Unlicensed Establishment","Notice")){
		addAppCondition("Inspection Conditions","Applied","Unlicensed Establishment","Unlicensed Establishment","Notice");
		
		//email("Rich.Foggo@eLicensing.ny.gov","noreply@accela.com","Unlicensed Labeler Found","Unlicensed Labeler Found");
		}
		}
	
	if (inspResult == "Violation of Stop Sale") {
		//runInspectionReport("Notice of Violation Stop Sale Order",capId.getCustomID(), inspId,params,strNoEmail);
		runReportAsyncTest("Notice of Violation Stop Sale Order", parameterGuideSheet, "Licenses", capId, toEmailAddress, params);
		//addStdCondition("Inspection Conditions","Unlicensed Labeler Found");
		//email("Rich.Foggo@eLicensing.ny.gov","noreply@accela.com","Unlicensed Labeler Found","Unlicensed Labeler Found");
		emailTemplate = "VIOLATION OF STOP SALE";
		if (!appHasCondition("Inspection Conditions","Applied","Violation of Stop Sale","Notice")){
		addAppCondition("Inspection Conditions","Applied","Violation of Stop Sale","Violation of Stop Sale","Notice");
		}	
		//runReportAndAddToSet(capId,"Violation of Stop Sale", inspId);
		}
		
	if (inspResult == "Violation of Quarantine") {
		//addStdCondition("Inspection Conditions","Unlicensed Labeler Found");
		//email("Rich.Foggo@eLicensing.ny.gov","noreply@accela.com","Unlicensed Labeler Found","Unlicensed Labeler Found");
		logDebug("Quarantine condition");
		//var inspectionId = getInspectorId();
		logDebug("Inspection Id: " + inspId);
		emailTemplate = "VIOLATION OF QUARANTINE";
		if (!appHasCondition("Inspection Conditions","Applied","Violation of Quarantine","Notice")){
		addAppCondition("Inspection Conditions","Applied","Violation of Quarantine","Violation of Quarantine","Notice");
		}
		//runReportAndAddToSet(capId,"Violation of Quarantine",inspId);
		}
		
		if(inspResult == "Prunus onsite")
		{
			logDebug("Has condition prunus onsite");
			if (!appHasCondition("Inspection Conditions","Applied","Prunus Onsite","Notice"))
			{
				logDebug("Adding condition");
				addAppCondition("Inspection Conditions","Applied","Prunus Onsite","Prunus Onsite","Notice");
			}
		}
		
		if(inspResult=="Completed")
		{
			//Add establishment record to the set and generate a report for the record
			var foundID;
			var inspResultObj = aa.inspection.getInspections(capId);
			
			addLicenseToSet("Establishment",capId);
			logDebug("Inspection completed");
			logDebug("Cap ID: " + capId);	
			
		}
		
		
		

	
	



//aa.print(licTyp);


		var foundID;
		
		var hashInspectionID = aa.util.newHashMap();
		
		var inspResultObj = aa.inspection.getInspections(capId);
		
		if (inspResultObj.getSuccess())
		{
			var inspList = inspResultObj.getOutput();
			var length = inspList.length;
			logDebug("Inspection List Length" + length);
			for (var xx = 0; xx < length; xx++)
				
			{
			var inspTest = inspList[xx];
			
				var userID = getInspectorAGM(inspTest);
				logDebug("User ID" + userID);
				var inspector = inspList[xx].getInspector();
				var capDetailObjResult = aa.cap.getCapDetail(capId);                          
                                                                               
                  if (capDetailObjResult.getSuccess()) {
                  capDetail = capDetailObjResult.getOutput();
				  capDetail.setAsgnStaff(userID);
				  var assignedID = capDetail.getAsgnStaff();
                                                                                               
             if (!matches(assignedID,null,undefined,"")) {
 
                     personObjResult = aa.person.getUser(assignedID);
                        if (personObjResult.getSuccess()) {
                                                                                                                               
                            personObj = personObjResult.getOutput();
								if(personObj.getEmail != "") {
								inspEmail = personObj.getEmail();
								 logDebug("Email final" + inspEmail);
								addParameter(params, "$$inspEmail$$", inspEmail);
                                  logDebug("Email final" + inspEmail);
                                  } else {
                                   logDebug("**ERROR: Inspector Email is null");
                                   }
                                                                                                                                
 
                                    if(personObj.getPhoneNumber() != "") {
									var inspPhone = personObj.getPhoneNumber();
									logDebug("Phone Number final" + inspPhone);
									addParameter(params, "$$inspPhone$$", inspPhone);
                                    
                                    } else {
                                    logDebug("**ERROR: Inspector Phone is null");
                                      }
 
                                  } else {
                                           logDebug("**ERROR: Could not retrieve the personScriptModel: " + personObjResult.getErrorMessage());
                                             sendEmail = false;
                                          }
                                        } else {
                                            logDebug("**ERROR: No staff assigned.");
                                            sendEmail = false;
                                   }				  
				  }
				  else {
                  logDebug("**ERROR: Could not retrieve the capDetailModel: " + capDetailObjResult.getErrorMessage());
                  sendEmail = false;
                       }  
				
				foundID = inspList[xx].getIdNumber();
				hashInspectionID.put(xx, foundID);
				testInspID = foundID;
				logDebug("Inspection ID" + foundID);
				status = inspList[xx].getInspectionStatus();
				logDebug("Status" + status);
				
				type =  inspList[xx].getInspectionType();
				logDebug("Inspection Type" + type);
				var inspModel = inspList[xx].getInspection();

				var gs = inspModel.getGuideSheets();
				if(gs){
				gsArray = gs.toArray();
				for (var loopk = 0; loopk < gsArray.length; loopk++){
				logDebug("GuideSheet Array::" + gsArray[loopk].getGuideType());
				
				if(type == "Emerald Ash Borer Compliance Agreement Interview" || type == "Plum Pox Compliance Agreement Interview"){
				if(gsArray[loopk].getGuideType().toUpperCase() == "EMERALD ASH BORER INSPECTION" && status == "Issued"){
				//hashGuideID.put(loopk, gsArray[loopk]);
				var guideSheetID = "A" + foundID + guideSheetId(loopk);
				logDebug("COMPLIANCE AGREEMENT NO::" + guideSheetID);
				gsArray[loopk].setIdentifier(guideSheetID);
				var updateResult = aa.guidesheet.updateGGuidesheet(gsArray[loopk],gsArray[loopk].getAuditID());
				
						}
					}
					
				if(type == "Ammonium Nitrate" || type == "Ammonium Nitrate Re-inspection" || type == "Commodity" || type == "Commodity Re-inspection"){
				if(gsArray[loopk].getGuideType().toUpperCase() == "STOP SALE ORDER"){
				//hashSSID.put(loopk, gsArray[loopk]);
				var guideSheetID = "SS" + foundID + guideSheetId(loopk);
				logDebug("STOP SALE ORDER NO::" + guideSheetID);
				gsArray[loopk].setIdentifier(guideSheetID);
				var updateResult = aa.guidesheet.updateGGuidesheet(gsArray[loopk],gsArray[loopk].getAuditID());
						}
					}
					
				if(type == "Nursery Grower" || type == "Nursery Grower Re-Inspection" || type == "Nursery Dealer" || type == "Nursery Dealer Re-Inspection" || type == "Plum Pox Virus Eradication Program Compliance" || type == "Plum Pox Virus Eradication Program Compliance Re-Inspection" || type == "Emerald Ash Borer" || type == "Emerald Ash Borer Re-Inspection"){
				if(gsArray[loopk].getGuideType().toUpperCase() == "QUARANTINE ORDER"){
				//hashQID.put(loopk, gsArray[loopk]);
				var guideSheetID = "Q" + foundID + guideSheetId(loopk);
				gsArray[loopk].setIdentifier(guideSheetID);
				var updateResult = aa.guidesheet.updateGGuidesheet(gsArray[loopk],gsArray[loopk].getAuditID());
				
						}
					}
				}
				
				/*
				logDebug("HashMap Length - Compl Agreement::" + hashGuideID.size());
				for(var zz = 1; zz <= hashGuideID.size(); zz++){
				//logDebug("HashMap Length" + hashGuideID.size());
				var guideSheetID = "A" + foundID + guideSheetId(zz);
				updateGuidesheetIDAGM(foundID,"Compliance Agreement",guideSheetID);
					}
					
				logDebug("HashMap Length - Stop Sale Order::" + hashSSID.size());
				for(var ss = 0; ss <= hashSSID.size(); ss++){
				
					}
				logDebug("HashMap Length - Quarantine Order::" + hashQID.size());
				for(var qq = 1; qq <= hashQID.size(); qq++){
				//logDebug("HashMap Length" + hashGuideID.size());
				var guideSheetID = "Q" + foundID + guideSheetId(qq);
				logDebug("GuideSheet ID - Quarantine" + guideSheetID);
				updateGuidesheetIDAGM(foundID,"Quarantine Order",guideSheetID);
					}
				*/
				}
			}
		}
		
		if (supervisorEmail != "" && emailTemplate != "") {
		sendNotification(sysFromEmail,supervisorEmail,"",emailTemplate,params,null);
		//sendNotification(sysFromEmail,"Margaret.Kelly@agriculture.ny.gov","",emailTemplate,params,null); // Commented out until go live for AGM emails
		//sendNotification(sysFromEmail,"Jan.Morawski@agriculture.ny.gov","",emailTemplate,params,null); //Commented out until go live for AGM emails
		//sendNotification(sysFromEmail,"Melissa.Heath@agriculture.ny.gov","",emailTemplate,params,null); //Commented out until go live for AGM emails
		}
	
	if(flagForInvestigation == 1)
	{
		//logDebug("Sending email for investigation");
		sendNotification(sysFromEmail,supervisorEmail,"","REPORT OF INVESTIGATION EMAIL",params,null);
	}

	sendInspectionResultReport(params,inspType, toEmailAddress);
	//runRenewalReport(reportName,customID);
		
	//workflow tasks
	 if(inspType.equalsIgnoreCase("Nursery Grower") || inspType.equalsIgnoreCase("Nursery Grower Re-Inspection"))
	 {
		logDebug("ESTABLISHMENT CUSTOM ID" + capId.getCustomID());
			if(!matches(inspResult,"Not Complete"))
			{
			licArray = getChildren("Licenses/Plant/Nursery Grower/License", capId);
			if(licArray != null){
			if(licArray.length > 0)
			{
			for(i in licArray){
			var licStatus = aa.cap.getCap(licArray[i]).getOutput().getCapStatus();
			if(licStatus == "Active" || licStatus == "About to Expire")
						{
						logDebug("License Value" + licArray[i]);
						renewalArray = getRenewalCapByParentCapIDForReviewTest(licArray[i]) ; //getRenewalParentcap4Review
						if(renewalArray != null){
						logDebug("Renewal Cap ID" + renewalArray.getCapID());
						renewalCapId = renewalArray.getCapID();
						var status = aa.cap.getCap(renewalCapId).getOutput().getCapStatus();
						aa.print("Status" + status);
						if(status == "Active" || status == "In Process" || status == "Additional Info Required" || status == "Received Online" || status == "Received")
						{
				
						var workflowResult = aa.workflow.getTasks(renewalCapId); 
						var wfObj;
						var wftrue = workflowResult.getSuccess();
						if (wftrue) {
						wfObj = workflowResult.getOutput(); 
						}
						else { 
						logMessage("**ERROR: Failed to get workflow object: " + renewalCapId.getErrorMessage()); 
						} 
						
						var flag;
						var secondFlag;
						for (i in wfObj) 
						{ 
						var useProcess = true;
						var fTask = wfObj[i]; 
						var desc = fTask.getTaskDescription(); 
						var disp = fTask.getDisposition(); 
						logDebug("Task Description" + desc);
						logDebug("Task Status" + disp);
						if(desc == "Application Review" && disp == "Complete")
						{
							secondFlag = "Yes";
						}
						if(desc == "Inspection")
						{
						var dispositionDate = aa.date.getCurrentDate();
						var stepnumber = fTask.getStepNumber();
						var processID = fTask.getProcessID();

						if (useProcess)
						aa.workflow.handleDisposition(renewalCapId,stepnumber,processID,"Complete",dispositionDate, "","Updated via script",systemUserObj ,"Y");
						else
						aa.workflow.handleDisposition(renewalCapId,stepnumber,"Complete",dispositionDate, "","Updated via script",systemUserObj ,"Y");
						flag = "Yes";
						}
						
						if(desc == "License Issuance" && flag == "Yes" && secondFlag == "Yes"){
						var isIssued = setLicsToIssuedForAGM(renewalCapId);
						aa.print("isIssued:" + isIssued);
						logDebug("isIssued" + isIssued);


						//Test function
						if (isIssued)
						{
							renewLicense(renewalCapId);
							closeTaskRenewalIRSA(renewalCapId, flag, secondFlag);
							addNewContactsForIRSA(renewalCapId);
						
						}
						
						flag = "No";
						secondFlag = "No";
					}
					
					
						else
								{
									continue;
								}
						
							}
						}
						}
					}
				}
			}
		}	
			if(capId)
			{
			productArray = getChildren("Licenses/Plant/Nursery Grower/Application", capId);
				for(zz in productArray){
				logDebug("Application Records" + productArray[zz].getCustomID());
				
				var status = aa.cap.getCap(productArray[zz]).getOutput().getCapStatus();
				aa.print("Status" + status);
				if(status == "Active" || status == "In Process" || status == "Additional Info Required" || status == "Received Online" || status == "Received")
				{
				
				var workflowResult = aa.workflow.getTasks(productArray[zz]); 
				var wfObj;
				var wftrue = workflowResult.getSuccess();
				if (wftrue) {
				wfObj = workflowResult.getOutput(); 
				}
				else { 
				logMessage("**ERROR: Failed to get workflow object: " + capId.getErrorMessage()); 
				} 
				
				var flag;
				var secondFlag;
				for (i in wfObj) 
				{ 
				var useProcess = true;
				var fTask = wfObj[i]; 
				var desc = fTask.getTaskDescription(); 
				var wfTask = desc;
				var disp = fTask.getDisposition(); 
				var wfStatus = disp;
				
				logDebug("Task Description" + desc);
				logDebug("Task Status" + disp);
				if(desc == "Application Review" && disp == "Complete")
				{
				secondFlag = "Yes";
				}
				if(desc == "Inspection")
					{
						var dispositionDate = aa.date.getCurrentDate();
						var stepnumber = fTask.getStepNumber();
						var processID = fTask.getProcessID();

						if (useProcess)
						aa.workflow.handleDisposition(productArray[zz],stepnumber,processID,"Complete",dispositionDate, "","Updated via script",systemUserObj ,"Y");
						else
						aa.workflow.handleDisposition(productArray[zz],stepnumber,"Complete",dispositionDate, "","Updated via script",systemUserObj ,"Y");
			
						flag = "Yes";
					
					}
				
				if(desc == "License Issuance" && flag == "Yes" && secondFlag == "Yes"){
						var isIssued = setLicsToIssuedForAGM(productArray[zz]);
						aa.print("isIssued:" + isIssued);
						logDebug("isIssued" + isIssued);


						//Test function
						if (isIssued)
						{
							issueLicense(productArray[zz]);
							closeTaskRenewalIRSA(productArray[zz], flag, secondFlag);
						
						}
						
						flag = "No";
						secondFlag = "No";
					}
					
					
					
				else
				{
				continue;
				}
				}
				
			}
			
			}
			}
		}	
	 }
	
	}
//updateGuidesheetIDAGM(1616,"Stop Sale Order","SS0001");

function sendInspectionResultReport(params,inspectionType,toEmailAddress) {
	logDebug("Inside sendInspectionResultReport");
	logDebug("Email parameters: " + params);
	var reportName;
	/*var parameters=aa.util.newHashMap();
	var rFile;
    parameters.put("ALT_ID", capId.getCustomID());
	parameters.put("INSPECTION_ID", foundID);*/
	
	// Run report and send email asynchronously
	
	var reportParameters=aa.util.newHashMap();
	reportParameters.put("ALT_ID", capId.getCustomID());
    reportParameters.put("INSPECTION_ID", inspId);
	reportParameters.put("SET_ID", "ALL");
    logDebug("Report parameters for license: " + reportParameters);
	logDebug("Cap Id Test" + capId);
	logDebug("Business Email Address =" + toEmailAddress);
	
	var inspResultObj = aa.inspection.getInspections(capId);
	var inspList;
	var length;
	if (inspResultObj.getSuccess())
	{
		inspList = inspResultObj.getOutput();
		length = inspList.length;
		logDebug("Inspection List Length: " + length);
	}
		
	if(inspectionType.equalsIgnoreCase("Commodity") || inspectionType.equalsIgnoreCase("Commodity Re-Inspection"))
	{
		reportName = "Commodity Inspection Report";

		for (var xx = 0; xx < length; xx++)
		{
			if(inspList[xx].getIdNumber() == inspId)
			{
				var inspModel = inspList[xx].getInspection();
				var gs = inspModel.getGuideSheets();
				if(gs)
				{
					gsArray = gs.toArray();
					for (var i = 0; i < gsArray.length; i++)
					{
						if(gsArray[i].getGuideType() == "Seed Sample") 
						{
							runReportAsyncTest("Seed Sample Report", reportParameters, "Licenses", capId, toEmailAddress, params);
						}
						else if(gsArray[i].getGuideType() == "Agricultural Lime Sample")
						{
							//runReportAsyncTest(reportName, reportParameters, "Licenses", capId, toEmailAddress, params);
						}
						else if(gsArray[i].getGuideType() == "Commercial Fertilizer Sample")
						{
							runReportAsyncTest("Fertilizer Sample Report", reportParameters, "Licenses", capId, toEmailAddress, params);
						}
					}
				}
			}
		}
		var reportToRunTest = new runReportObj();
																		reportToRunTest.reportName = "Commodity Inspection Report";
																		reportToRunTest.reportParams = reportParameters;

																		reportsToRun.push(reportToRunTest);
		runReportAsyncTest(reportsToRun, "Licenses", capId, toEmailAddress, params);
	}
	else if(inspectionType.equalsIgnoreCase("Ammonium Nitrate") || inspectionType.equalsIgnoreCase("Ammonium Nitrate Re-Inspection"))
	{
		reportName = "Ammonium Nitrate Inspection Report";
		//runInspectionReport(reportName,capId.getCustomID(), inspId,params,strSendEmail);
		runReportAsyncTest(reportName, reportParameters, "Licenses", capId, toEmailAddress, params);
	}
	else if(inspectionType.equalsIgnoreCase("Emerald Ash Borer Compliance Agreement Interview"))
	{
		reportName = "Emerald Ash Borer Compliance Agreements";
		//runInspectionReport(reportName,capId.getCustomID(), inspId,params,strSendEmail);
		runReportAsyncTest(reportName, reportParameters, "Licenses", capId, toEmailAddress, params);
	}
	else if(inspectionType.equalsIgnoreCase("Emerald Ash Borer") || inspectionType.equalsIgnoreCase("Emerald Ash Borer Re-Inspection"))
	{
		reportName = "Emerald Ash Borer Compliance Inspection Report";
		
		var runAgreementReport = 0;
		var guideSheetArray = new Array();
		guideSheetArray = getGuideSheetObjects(inspId);
		
		for(i in guideSheetArray)
		{
			var gsObj = guideSheetArray[i];
			if((gsObj.gsType).equalsIgnoreCase("Emerald Ash Borer Inspection") && (gsObj.text).equalsIgnoreCase("COMPLIANCE AGREEMENT TYPE"))
			{
				gsObj.loadInfoTables();
				if(gsObj.validTables)
				{
					if(typeof(gsObj.infoTables["COMPLIANCE AGREEMENT TYPE"]) == "object")
					{
						var table = gsObj.infoTables["COMPLIANCE AGREEMENT TYPE"];
						for(i in table)
						{
							logDebug("Agreement type: " + table[i]["Compliance Agreement Type"]);
							runAgreementReport = 1;
							logDebug("Run agreement report");
							break;
						}
					}
				}
			}
		}
		if(runAgreementReport == 1)
		{
			//runInspectionReport("Emerald Ash Borer Compliance Agreements",capId.getCustomID(), inspId,params,strNoEmail);
			runReportAsyncTest("Emerald Ash Borer Compliance Agreements", reportParameters, "Licenses", capId, "", params);
		}
		//runInspectionReport(reportName,capId.getCustomID(), inspId,params,strSendEmail);
		runReportAsyncTest(reportName, reportParameters, "Licenses", capId, toEmailAddress, params);
	}
	else if(inspectionType.equalsIgnoreCase("Plum Pox Compliance Agreement Interview"))	//report not ready yet
	{
		reportName = "Emerald Ash Borer Compliance Inspection Report";
		//runInspectionReport(reportName,capId.getCustomID(), inspId,params,strSendEmail);
		runReportAsyncTest(reportName, reportParameters, "Licenses", capId, toEmailAddress, params);
	}
	//else if(inspectionType.equalsIgnoreCase("Plum Pox Virus Eradication Program Compliance") || inspectionType.equalsIgnoreCase("Plum Pox Virus Eradication Program Compliance Re-Inspection"))
	else if(inspectionType.equalsIgnoreCase("Plum Pox Virus Eradication Program Compliance"))
	{
		reportName = "PlumPox Virus Eradication Prog Compliance Agmt";
		//runInspectionReport(reportName,capId.getCustomID(), inspId,params,strSendEmail);
		runReportAsyncTest(reportName, reportParameters, "Licenses", capId, toEmailAddress, params);
	}
	else if(inspType.equalsIgnoreCase("Nursery Grower") || inspType.equalsIgnoreCase("Nursery Grower Re-Inspection") || inspType.equalsIgnoreCase("Nursery Dealer") || inspType.equalsIgnoreCase("Nursery Dealer Re-Inspection"))
	{
		reportName = "Plant Inspection Report Nursery";
		//runInspectionReport(reportName,capId.getCustomID(), inspId,params,strSendEmail);
		runReportAsyncTest(reportName, reportParameters, "Licenses", capId, toEmailAddress, params);
	}
	
}


	//var reportName = "Commodity Inspection Result";
//logDebug("HashMap length" + hashInspectionID.size());
/*
for(var yy = 0; yy < hashInspectionID.size(); yy++){
if(hashInspectionID.get(yy) == null){
continue;
}
else{
//runRenewalReport(reportName, customID);	
}
}
*/

/*
function runInspectionReport(reportName,customID,inspID,params,str)
{
	logDebug("Running report file");
     var parameters=aa.util.newHashMap();
     //if(arguments.length==2)
    {
        parameters.put("ALT_ID", customID);
        parameters.put("INSPECTION_ID", inspID);
		parameters.put("SET_ID", "ALL");
        logDebug("Report parameters for license: " + parameters);
    }
   
    logDebug("Custom ID: " + customID);
	report=aa.reportManager.getReportInfoModelByName(reportName);
    report=report.getOutput();
	logDebug("Report: " + report);
    //aa.print(report);
    report.setCapId(customID);
    report.setModule("Licenses");
    report.setReportParameters(parameters); 
     //aa.print("Report ID: " + report.getReportId());
     logDebug("Report parameters: "+ report.getReportParameters());
	var checkPermission=aa.reportManager.hasPermission(reportName,"admin");
    //aa.print("Permission: " + checkPermission.getOutput().booleanValue());
	logDebug("Permission" + checkPermission.getOutput().booleanValue());
    if(checkPermission.getOutput().booleanValue())
    {
        //aa.print("User has permission");    
        var reportResult=aa.reportManager.getReportResult(report);
		logDebug("Report Result" + reportResult);
        if(reportResult)
        {
            reportResult=reportResult.getOutput();
            logDebug("Report result: " + reportResult);
            reportFile=aa.reportManager.storeReportToDisk(reportResult);
            reportFile=reportFile.getOutput();
            logDebug("Report File: " +reportFile);
			if(reportFile && str.equalsIgnoreCase("sendEmail"))
			{
				setEmailParameters("INSPECTION SUMMARY REPORT", reportFile,params);
			}
			else if(str.equalsIgnoreCase("noEmail"))
			{
				rFiles.push(reportFile);
			}
        }       
    }
}

function setEmailParameters(emailTemplateName,reportFile,params)
{
	logDebug("Setting email parameters");
	var sendEmailToContactType = "Business"; //Applicant";
    var FromEmailAddress = "noreply@agriculture.ny.gov";
	rFiles.push(reportFile);
	
	
	if(toEmailAddress)
	{
		logDebug("To email address:" + toEmailAddress);
		sendNotification("noreply@agriculture.ny.gov",toEmailAddress,"",emailTemplateName,params,rFiles,capId);
	}
}

*/
for(i in reportsToRun){
logDebug("Report Names to be passed" + reportsToRun[i].reportName);
}

function runReportAsyncTest(reportsToRun, module, itemCap, toEmailAddress, params) {
	logDebug("Inside run report async");
	var scriptName = "RUNMULTIPLEREPORTSANDEMAIL";
	
	logDebug("Running report file");
   
    
	var envParameters = aa.util.newHashMap();
	envParameters.put("ReportObjs",reportsToRun);
	//envParameters.put("ReportParameters",reportParameters);
	envParameters.put("Module",module);
	envParameters.put("CapID",itemCap);
	envParameters.put("CustomCapId",itemCap.getCustomID());
	envParameters.put("ReportUser", currentUserID);
	envParameters.put("ServProvCode",servProvCode);
	envParameters.put("ErrorEmailTo","mihir@gcomsoft.com");
	envParameters.put("DebugEmailTo","mihir@gcomsoft.com");
	envParameters.put("EmailFrom","noreply@agriculture.ny.gov");
	envParameters.put("EmailTo", toEmailAddress);
	envParameters.put("EmailCC", inspEmail);
	envParameters.put("EmailTemplate","INSPECTION SUMMARY REPORT");
	envParameters.put("EmailParameters",params);
	
	aa.runAsyncScript(scriptName, envParameters);
}



//Add Next Recurring Inspection
	if (inspType == "Nursery Grower") {
	scheduleInspection("Nursery Grower",365,null,null,"scheduled via script"); 
	autoAssignInspection(getScheduledInspId("Nursery Grower"));
	}
	
	if (inspType == "Commodity") {
	scheduleInspection("Commodity",1095,null,null,"scheduled via script"); 
	autoAssignInspection(getScheduledInspId("Commodity"));
	}
	
	if (inspType == "Emerald Ash Borer Compliance Agreement Interview") {
		scheduleInspection("Emerald Ash Borer Compliance Agreement Interview",365,null,null,"scheduled via script"); 
		autoAssignInspection(getScheduledInspId("Emerald Ash Borer Compliance Agreement Interview"));
		if(inspResult == "Issued")
		{
			logDebug("Inside issued");
			runReportAndAddToSet(capId,"Emerald Ash",inspId);
		}
	}
	
	if (inspType == "Nursery Dealer") {
	scheduleInspection("Nursery Dealer",1460,null,null,"scheduled via script"); 
	autoAssignInspection(getScheduledInspId("Nursery Dealer"));
	}
	
	if (inspType == "Ammonium Nitrate") {
	scheduleInspection("Ammonium Nitrate",91,null,null,"scheduled via script"); 
	autoAssignInspection(getScheduledInspId("Ammonium Nitrate"));
	}
	
	if (inspType == "Plum Pox Compliance Agreement Interview") 
	{
		scheduleInspection("Plum Pox Compliance Agreement Interview",365,null,null,"scheduled via script"); 
		autoAssignInspection(getScheduledInspId("Plum Pox Compliance Agreement Interview"));
		if(inspResult == "Issued")
		{
			logDebug("Inside issued");
			runReportAndAddToSet(capId,"Plum Pox",inspId);
		}
	}
	
//START SCRIPT RE-INSPECTION 1-15-14
if(inspResult == "Stop Sale")
		{
			var dateInspection = new Date();
			
			
        dateInspection = DateAdd(dateInspection, "D", 1);
			
			scheduleInspectDateGroup("ESTAB_INSP","Commodity Re-Inspection", dateInspection);
		}
	

	function getInspectorAGM(inspTest)
	{
	
			if (inspTest)
				{
				// have to re-grab the user since the id won't show up in this object.
				inspUserObj = aa.person.getUser(inspTest.getInspector().getFirstName(),inspTest.getInspector().getMiddleName(),inspTest.getInspector().getLastName()).getOutput();
				return inspUserObj.getUserID();
				}
		
	
	}
	
	function getRenewalCapByParentCapIDForReviewTest(parentCapid)
{
    if (parentCapid == null || aa.util.instanceOfString(parentCapid))
    {
        return null;
    }
    //1. Get parent license for review
    var result = aa.cap.getProjectByMasterID(parentCapid, "Renewal", "Incomplete");
    if(result.getSuccess())
    {
        projectScriptModels = result.getOutput();
        if (projectScriptModels == null || projectScriptModels.length == 0)
        {
            aa.print("ERROR: Failed to get renewal CAP by parent CAPID(" + parentCapid + ") for review");
            return null;
        }
        //2. return parent CAPID.
        projectScriptModel = projectScriptModels[0];
        return projectScriptModel;
    }  
    else 
    {
      aa.print("ERROR: Failed to get renewal CAP by parent CAP(" + parentCapid + ") for review: " + result.getErrorMessage());
      return null;
    }
}


function setLicsToIssuedForAGM(appID) {
    var workflowResult = aa.workflow.getTasks(appID); 
				var wfObj;
				var wftrue = workflowResult.getSuccess();
				if (wftrue) {
				wfObj = workflowResult.getOutput(); 
				}
				else { 
				logMessage("**ERROR: Failed to get workflow object: " + appID.getErrorMessage()); 
				} 
				
				for (i in wfObj) 
				{ 
				var useProcess = true;
				var fTask = wfObj[i]; 
				var desc = fTask.getTaskDescription(); 
				var wfTask = desc;
				var disp = fTask.getDisposition(); 
				var wfStatus = disp;
				
				logDebug("Task Description" + desc);
				logDebug("Task Status" + disp);
				
				
					
					if(desc == "License Issuance"){
					var wFlowTask = "License Issuance";
					var wNewflowStatus = "Issued";
	
					if ((isTaskReadyToIssuedForAGM(wFlowTask, appID))) {
					logDebug("Goes inside License Issuance");
					//Update and close task
					//closeTask(wFlowTask, wNewflowStatus, "Closed via script", "");
					var dispositionDate = aa.date.getCurrentDate();
						var stepnumber = fTask.getStepNumber();
						var processID = fTask.getProcessID();

						if (useProcess)
						aa.workflow.handleDisposition(appID,stepnumber,processID,"Issued",dispositionDate, "","Updated via script",systemUserObj ,"Y");
						else
						aa.workflow.handleDisposition(appID,stepnumber,"Issued",dispositionDate, "","Updated via script",systemUserObj ,"Y");
					
					return true;
					}
					return false;
					}
					
				else
				{
				continue;
				}
				}
	
}

function isTaskReadyToIssuedForAGM(wfstr, appId) {
    var useProcess = false;
    var allComplt = true;

    var processName = "";
    var itemCap = capId;
    if (arguments.length > 4) {
        if (arguments[4] != "") {
            processName = arguments[4]; // subprocess
            useProcess = true;
        }
    }

    var workflowResult = aa.workflow.getTasks(appId);
    if (workflowResult.getSuccess())
        var wfObj = workflowResult.getOutput();
    else
    { aa.print("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

    //if (!wfstat) wfstat = "NA";

    for (i in wfObj) {
        var fTask = wfObj[i];
        //        aa.print("fTask.getTaskDescription()" + fTask.getTaskDescription());
        //        aa.print("fTask Status:" + fTask.getDisposition());
        //        aa.print("fTask Active Flag:" + fTask.getActiveFlag());

        if (fTask.getActiveFlag().equals("Y") && (!fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()))) {
            allComplt = false;
        }
        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (allComplt) && fTask.getActiveFlag().equals("Y")) {
            aa.print("Ready to set Issued:");
            return true;
        }
    }
}

function addNewContactsForIRSA(renewalCapId) {
parentid = getParentForIRSA(renewalCapId);
if (parentid) {
	contactlist = getContactArray();
	parentcontactlist = getContactArray(parentid);
	contactSeqList = new Array();
	parentContactSeqList = new Array();
	for (x in contactlist) contactSeqList[contactlist[x]["businessName"]] = contactlist[x]["contactType"];
	for (x in parentcontactlist) parentContactSeqList[parentcontactlist[x]["businessName"]] = parentcontactlist[x]["contactType"];
	for (x in contactSeqList) if (!parentContactSeqList[x]) copyContacts(capId, getParent());
	}
}

function getParentForIRSA(itemCap) {
    // returns the capId object of the parent.  Assumes only one parent!
    //
    //logDebug( "capId==" + capId);

    getCapResult = aa.cap.getProjectParents(itemCap, 1);
    if (getCapResult.getSuccess()) {
        parentArray = getCapResult.getOutput();
        if (parentArray.length)
            return parentArray[0].getCapID();
        else {
            logDebug("**WARNING: GetParent found no project parent for this application");
            return false;
        }
    }
    else {
        logDebug("**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
        return false;
    }
}


//Schedule Re-inspection function
function scheduleInspectDateGroup(inspGroup,iType,DateToSched) // optional inspector ID.  This function requires dateAdd function
 
{
 
logDebug("begin schedule inspection : " + iType + " for " + DateToSched);
 
var inspectorObj = null;
 
if (arguments.length == 4) 

{
 
var inspRes = aa.person.getUser(arguments[3])
 
if (inspRes.getSuccess())
 
inspectorObj = inspRes.getOutput();
 
}
 
var inspModelRes = aa.inspection.getInspectionScriptModel();
 
if (inspModelRes.getSuccess()){
 
logDebug("Successfully get inspection model: " + iType + " for " + DateToSched);
 
var inspModelObj = inspModelRes.getOutput().getInspection();
 
var inspActivityModel = inspModelObj.getActivity();
 
inspActivityModel.setCapID(capId);
 
inspActivityModel.setSysUser(inspectorObj);
 
inspActivityModel.setActivityDate(aa.util.parseDate(DateToSched));
 
inspActivityModel.setActivityGroup("Inspection");
 
inspActivityModel.setActivityType(iType);
 
inspActivityModel.setActivityDescription(iType);
 
inspActivityModel.setRecordDescription("");
 
inspActivityModel.setRecordType("");
 
inspActivityModel.setDocumentID("");
 
inspActivityModel.setDocumentDescription('Insp Scheduled');
 
inspActivityModel.setActivityJval("");
 
inspActivityModel.setStatus("Scheduled");
 
inspActivityModel.setTime1(null);
 
inspActivityModel.setAuditID(currentUserID);
 
inspActivityModel.setAuditStatus("A");
 
inspActivityModel.setInspectionGroup(inspGroup);
 
inspModelObj.setActivity(inspActivityModel);
 
var inspTypeResult = aa.inspection.getInspectionType(inspGroup,iType);
 
if (inspTypeResult.getSuccess() && inspTypeResult.getOutput())
 
{
 
if(inspTypeResult.getOutput().length > 0)
 
{
 
inspActivityModel.setCarryoverFlag(inspTypeResult.getOutput()[0].getCarryoverFlag()); //set carryoverFlag
 
inspActivityModel.setActivityDescription(inspTypeResult.getOutput()[0].getDispType());
 
inspActivityModel.setInspectionGroup(inspTypeResult.getOutput()[0].getGroupCode());
 
inspActivityModel.setRequiredInspection(inspTypeResult.getOutput()[0].getRequiredInspection());
 
inspActivityModel.setUnitNBR(inspTypeResult.getOutput()[0].getUnitNBR());
 
inspActivityModel.setAutoAssign(inspTypeResult.getOutput()[0].getAutoAssign());
 
inspActivityModel.setDisplayInACA(inspTypeResult.getOutput()[0].getDisplayInACA());
 
inspActivityModel.setInspUnits(inspTypeResult.getOutput()[0].getInspUnits());
 
}
 
}
 
var schedRes = aa.inspection.scheduleInspection(inspModelObj,systemUserObj);
 
if (schedRes.getSuccess())
 
logDebug("Successfully scheduled inspection : " + iType);
 
else
 
logDebug( "**ERROR: scheduling inspection (" + iType + "): " + schedRes.getErrorMessage());
 
}
 
else{
 
logDebug( "**ERROR: getting  inspection model  " );
 
}
 
}

function DateAdd(objDate, strInterval, intIncrement)
    {
        if(typeof(objDate) == "string")
        {
            objDate = new Date(objDate);
 
            if (isNaN(objDate))
            {
                throw("DateAdd: Date is not a valid date");
            }
        }
        else if(typeof(objDate) != "object" || objDate.constructor.toString().indexOf("Date()") == -1)
        {
            throw("DateAdd: First parameter must be a date object");
        }
 
        if(
        strInterval != "M"
        && strInterval != "D"
        && strInterval != "Y"
        && strInterval != "h"
        && strInterval != "m"
        && strInterval != "uM"
        && strInterval != "uD"
        && strInterval != "uY"
        && strInterval != "uh"
        && strInterval != "um"
        && strInterval != "us"
        )
        {
            throw("DateAdd: Second parameter must be M, D, Y, h, m, uM, uD, uY, uh, um or us");
        }
 
        if(typeof(intIncrement) != "number")
        {
            throw("DateAdd: Third parameter must be a number");
        }
 
        switch(strInterval)
        {
            case "M":
            objDate.setMonth(parseInt(objDate.getMonth()) + parseInt(intIncrement));
            break;
 
            case "D":
            objDate.setDate(parseInt(objDate.getDate()) + parseInt(intIncrement));
            break;
 
            case "Y":
            objDate.setYear(parseInt(objDate.getYear()) + parseInt(intIncrement));
            break;
 
            case "h":
            objDate.setHours(parseInt(objDate.getHours()) + parseInt(intIncrement));
            break;
 
            case "m":
            objDate.setMinutes(parseInt(objDate.getMinutes()) + parseInt(intIncrement));
            break;
 
            case "s":
            objDate.setSeconds(parseInt(objDate.getSeconds()) + parseInt(intIncrement));
            break;
 
            case "uM":
            objDate.setUTCMonth(parseInt(objDate.getUTCMonth()) + parseInt(intIncrement));
            break;
 
            case "uD":
            objDate.setUTCDate(parseInt(objDate.getUTCDate()) + parseInt(intIncrement));
            break;
 
            case "uY":
            objDate.setUTCFullYear(parseInt(objDate.getUTCFullYear()) + parseInt(intIncrement));
            break;
 
            case "uh":
            objDate.setUTCHours(parseInt(objDate.getUTCHours()) + parseInt(intIncrement));
            break;
 
            case "um":
            objDate.setUTCMinutes(parseInt(objDate.getUTCMinutes()) + parseInt(intIncrement));
            break;
 
            case "us":
            objDate.setUTCSeconds(parseInt(objDate.getUTCSeconds()) + parseInt(intIncrement));
            break;
        }
        return objDate;
    }
	
	function runReportObj () {
		this.reportName = null;
		this.reportParams = null;
	}
