function createRefLP4Lookup(vCapId) { //option contact object override


    var refLPCreated = false;
    var licCapTypeArray = aa.cap.getCap(vCapId).getOutput().getCapType().toString().split("/");
    
    var refLicLookupValue = lookup("Lookup:RefLicProf",licCapTypeArray[1]+"/"+licCapTypeArray[2]+"/"+licCapTypeArray[3]);

    if (refLicLookupValue != undefined) {

        var refLicLookupValueArray = refLicLookupValue.split("|");
        var refLicType = refLicLookupValueArray[0];
        var refLicAddressList = refLicLookupValueArray[1];
        var refLicAddressArray = refLicAddressList.split(",");

        if (arguments.length == 2) {
            var conObj = arguments[1];
        } else {
            //Create/sync based fields
            var conObj = getContactObj(vCapId,"Business");          
        }

        if (conObj) {
            var lNum;
            if (conObj.type == "Business")
                lNum = vCapId.getCustomID()
            if (conObj.type == "Additional Location") {
                lNum = conObj.getAttribute("LICENSE #");
                if (matches(lNum,null,undefined,"")) lNum = vCapId.getCustomID() + "-" + String(conObj.seqNumber); // this needs removed when confident license number is set correctly.
            }

            refLPCreated = conObj.createRefLicProf(lNum,refLicType,refLicAddressArray[0],"NY","NYELS");
        }  

        if (refLPCreated) {
            //update the date fields
            var licIssuedDate = "";
            var licEffectDate = "";
            var licExpDate = "";
           
            var cdScriptObjResult = aa.cap.getCapDetail(vCapId);

            if (cdScriptObjResult.getSuccess()) { 
                var cdScriptObj = cdScriptObjResult.getOutput();

                if (cdScriptObj) { 
                    cd = cdScriptObj.getCapDetailModel();

                    if (cd.getFirstIssuedDate()) {
                        var licIssuedDateJS = new Date(cd.getFirstIssuedDate().getTime());
                        licIssuedDate = aa.date.parseDate((licIssuedDateJS.getMonth()+1) + "/" + licIssuedDateJS.getDate() + "/" + licIssuedDateJS.getFullYear());                        
                    }
               

                    if (cd.getScheduledDate()) {
                        var licEffectDateJS = new Date(cd.getScheduledDate().getTime());
                        licEffectDate = aa.date.parseDate((licEffectDateJS.getMonth()+1) + "/" + licEffectDateJS.getDate() + "/" + licEffectDateJS.getFullYear());                         
                    }
                          
                } else {
                    logDebug("No cap detail script object");
                }
                
            } else {
                logDebug("Failed to get the CapDetailScriptModel");
            }

            b1ExpResult = aa.expiration.getLicensesByCapID(vCapId)
            if (b1ExpResult.getSuccess())
            {
                var expObj = b1ExpResult.getOutput();
                licExpDate = expObj.getExpDate();
            }
            
            aa.setDelegateAgencyCode("NYELS");
            refLP = new licenseProfObject(lNum,refLicType,"NYELS");
            aa.resetDelegateAgencyCode();

            if (licExpDate != "") refLP.refLicModel.setLicenseExpirationDate(licExpDate);
            if (licIssuedDate != "") refLP.refLicModel.setLicenseIssueDate(licIssuedDate);
            if (licEffectDate != "") refLP.refLicModel.setBusinessLicExpDate(licEffectDate);
            refLP.setAttribute("DBA",conObj.people.getTradeName());

            //Override the setting of the address based on the business rules for AGM
            var defaultArray = refLicAddressArray;
            var defaultFound = false;

            refLP.refLicModel.setAddress1("");
            refLP.refLicModel.setAddress2("");
            refLP.refLicModel.setAddress3("");
            refLP.refLicModel.setCity("");
            refLP.refLicModel.setState("");
            refLP.refLicModel.setZip("");
            refLP.refLicModel.getLicenseModel().setTitle("");
            refLP.refLicModel.setPhone1(conObj.people.getPhone3());

            for (da in defaultArray) {
                for (ta in conObj.addresses) {
                    thisAddr = conObj.addresses[ta];
                    if (defaultArray[da].toUpperCase() == thisAddr.addressType.toUpperCase()) {
                        
                        if (thisAddr.getCity() != null) refLP.refLicModel.setCity(thisAddr.getCity());
                        if (thisAddr.getState() != null) refLP.refLicModel.setState(thisAddr.getState());
                        if (thisAddr.getZip() != null) {
                            var updateZip = thisAddr.getZip();
                            if (updateZip.length == 9)
                                updateZip = updateZip.substr(0,5) + "-" + 
                            refLP.refLicModel.setZip(thisAddr.getZip());
                        }
                        if (thisAddr.getAddressLine3() != null) refLP.refLicModel.getLicenseModel().setTitle(thisAddr.getAddressLine3());
                        
                        defaultFound = true;
                        break;
                    }
                }
                if (defaultFound) {
                    break;
                }
            }
            //Begin license specific logic
            /*------------------------------------------------------------------------------------------------------/
            | Nursery Grower / Dealer
            /------------------------------------------------------------------------------------------------------*/
            if (matches(refLicType,"Nursery Dealer","Nursery Grower")) {
                if (conObj.type == "Business") {
                    refLP.setAttribute("OPERATION TYPE",getAppSpecific("Operation Type",vCapId));
                    refLP.setAttribute("SITE TYPE",getAppSpecific("Site Type",vCapId));
                    
                    var nurserySize = getAppSpecific("Nursery Size",vCapId);
                    var greenhouseSize = getAppSpecific("Greenhouse Size",vCapId);
                    var sizeValue = "";

                    if (!matches(nurserySize,null,undefined,"")) {
                        sizeValue = nurserySize + " (Nursery)";
                    }

                    if (!matches(greenhouseSize,null,undefined,"")) {
                        sizeValue += " " + greenhouseSize + " (Greenhouse)";
                    }                       
                    refLP.setAttribute("SIZE",sizeValue);
                }

                if (conObj.type == "Additional Location") {
                    if (refLicType == "Nursery Dealer") {
                        refLP.setAttribute("OPERATION TYPE",conObj.getAttribute("OPERATION TYPE DEALER"));    
                    } else {
                        refLP.setAttribute("OPERATION TYPE",conObj.getAttribute("OPERATION TYPE"));    
                    }
                    
                    refLP.setAttribute("SITE TYPE",conObj.getAttribute("SITE TYPE"));
                    
                    var nurserySize = conObj.getAttribute("NURSERY SIZE");
                    var greenhouseSize = conObj.getAttribute("GREENHOUSE SIZE");
                    var sizeValue = "";

                    if (nurserySize != null) {
                        sizeValue = nurserySize + " (Nursery)";
                    }

                    if (greenhouseSize != null) {
                        sizeValue += " " + greenhouseSize + " (Greenhouse)";
                    }

                    refLP.setAttribute("SIZE",sizeValue);
                }   
            }

            /*------------------------------------------------------------------------------------------------------/
            | Lime Brand
            /------------------------------------------------------------------------------------------------------*/

            if (refLicType == "Agricultural Lime Brand") {
                refLP.removeTable("LIME BRAND");
                
                var LB = loadASITable("LIME BRAND",vCapId);

                if (typeof(LB) == "object") {
                    for (var z in LB) {
                        var thisRow = LB[z];
                        var newRow = new Array(); 
                        newRow["Brand Name"] = thisRow["Brand Name"];
                        var pLoc = thisRow["Name"] + ", " + thisRow["Address"] + " " + thisRow["City"] + ", " + thisRow["State"] + " " + thisRow["Zip"]
                        newRow["Product Location"] = pLoc;
                        newRow["Type of Lime"] = thisRow["Type of Liming Material"];
                        newRow["TNV"] = thisRow["TNV"];
                        newRow["FINE-20"] = thisRow["20 - Mesh"];
                        newRow["FINE-100"] = thisRow["100 - Mesh"];
                        newRow["CALC"] = thisRow["Ca %"];
                        newRow["MAGN"] = thisRow["Mg %"];
                        newRow["ENV"] = thisRow["ENV"];                 
                        refLP.addTableRow("LIME BRAND",newRow);                        
                    }
                }
            }

            /*------------------------------------------------------------------------------------------------------/
            | Fertilizer Distributor / Compost Distributor
            /------------------------------------------------------------------------------------------------------*/

            if (matches(refLicType,"Compost Distributor","Fertilizer Distributor")) {
                refLP.removeTable("PRODUCT LIST");
                
                if (refLicType == "Compost Distributor")
                    var PL = loadASITable("BRAND/PRODUCT LIST",vCapId);
                if (refLicType == "Fertilizer Distributor")
                    var PL = loadASITable("FERTILIZER BRAND/PRODUCT NAMES",vCapId);

                if (typeof(PL) == "object") {
                    for (var z in PL) {
                        var thisRow = PL[z];
                        var newRow = new Array(); 
                        newRow["Brand"] = thisRow["Brand"];
                        newRow["Product"] = thisRow["Product"];                
                        refLP.addTableRow("PRODUCT LIST",newRow);                        
                    }
                }               
            }

            /*------------------------------------------------------------------------------------------------------/
            | Farm Products Dealer
            /------------------------------------------------------------------------------------------------------*/

            if (refLicType == "Farm Products Dealer") {

                refLP.removeTable("LIST OF COMMODITIES");
                
                var LC = loadASITable("LIST OF COMMODITIES",vCapId);

                if (typeof(LC) == "object") {
                    for (var z in LC) {
                        var thisRow = LC[z];
						if(thisRow){
                        if (thisRow["Status"] == "Active") {
                            var newRow = new Array(); 
                            newRow["Commodity"] = thisRow["Commodity"];                
                            refLP.addTableRow("LIST OF COMMODITIES",newRow);                            
                        }
                       }
                    }
                }

                var surety = loadASITable("SECURITY INSTRUMENTS TYPE",vCapId);

                var suretyTotal = 0;
                var suretyTotalString;
                if (typeof(surety) == "object") {
                    for (var s in surety) {
                        suretyTotal += parseFloat(surety[s]["Surety Amount $"]);
                    }
                }

                if (suretyTotal > 0) {
                    suretyTotalString = "$" + String(suretyTotal.toFixed(2));
                } else {
                    suretyTotalString = "";
                }
                refLP.setAttribute("SURETY",suretyTotalString);
            }

            /*------------------------------------------------------------------------------------------------------/
            | Soil or Plant Inoculant
            /------------------------------------------------------------------------------------------------------*/

            if (refLicType == "Soil or Plant Inoculant") {

                refLP.removeTable("LIST OF PRODUCTS");

                var childProducts = getChildren("Licenses/Plant/Soil or Plant Inoculant/Product",vCapId);

                if (childProducts) {
                    for (var z in childProducts) {
                        var childCapId = childProducts[z];
                        var childCap = aa.cap.getCap(childCapId).getOutput();
                        var childCapStatus = childCap.getCapStatus();

                        if (childCapStatus != "Inactive") {
                            var newRow = new Array(); 
                            newRow["Product Name"] = getAppSpecific("Name of Product",childCapId);                
                            refLP.addTableRow("LIST OF PRODUCTS",newRow);                               
                        }
                    }
                }

            }

            aa.setDelegateAgencyCode("NYELS");
            refLP.updateRecord();
            aa.resetDelegateAgencyCode();

        }
    }
}

