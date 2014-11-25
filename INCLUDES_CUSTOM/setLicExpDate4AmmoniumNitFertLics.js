function setLicExpDate4AmmoniumNitFertLics(capId) { //optional parameter to indicate if renewal

    if (arguments.length > 1) 
        var pcapId = getParentCapID4Renewal();
    else
        var pcapId = getParent();

    logDebug("CapID:" + pcapId);
	 var licNum=pcapId.getCustomID();
       logDebug("Custom ID: " + licNum);
    b1ExpResult = aa.expiration.getLicensesByCapID(pcapId);
    if (b1ExpResult.getSuccess()) {

        logDebug("Inside b1ExpResult");
		var b1Exp = b1ExpResult.getOutput();
        //Get expiration details
        var expDate = b1Exp.getExpDate();
        if (expDate) {
			if(arguments.length>1)	//Renewal
			{
				logDebug("Set exp date on renewal");
				var month=expDate.getMonth();
				var day=expDate.getDayOfMonth();
				logDebug("Day" + day);
				var year=expDate.getYear() +1 ;
				logDebug("Year of License" + year);
				
				var newExpDate=new Date(Date.parse(sysDateMMDDYYYY));
				
				newExpDate.setMonth(month-1);
				logDebug("EXP DATE MONTH" + newExpDate.getMonth() + 1);
				newExpDate.setDate(day);
				logDebug("EXP DATE DATE" + newExpDate.getDate());
				newExpDate.setFullYear(year);
				logDebug("EXP DATE YEAR" + newExpDate.getFullYear());
				
				var newExpDateString= newExpDate.getMonth() +1  + "/" + newExpDate.getDate() + "/" + newExpDate.getFullYear();
				var licNum=pcapId.getCustomID();
				logDebug("Custom ID: " + licNum + " " + "Expiration Date: " + newExpDateString);
				
				thisLic=new licenseObject(licNum,pcapId);
				thisLic.setExpiration(newExpDateString);
			}
			else			//Application
			{
				//new date obj
				logDebug("Set exp date on license issuance");
				var newExpdate = new Date(Date.parse(sysDateMMDDYYYY));
				var yearTest=newExpdate.getFullYear();
				newExpdate.setMonth(11);
				newExpdate.setDate(31);
				newExpdate.setFullYear(yearTest);

				//aa.print("getYear():" + sysDate.getYear());
				var edate = newExpdate.getMonth() + 1 + "/" + newExpdate.getDate() + "/" + newExpdate.getFullYear(); //Adding 1 to the getMonth method to get the Dece
				
				var capId=pcapId.getCustomID();
				logDebug("Custom ID: " + capId+ " " + "Expiration Date: " + edate);
				var expAADate = aa.date.parseDate(edate);
				b1Exp.setExpDate(expAADate);
				aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
				//logDebug("Updating expiration date to " + newExpdate);

			}

		}

	}
	
	//copyContactsForAmmonium(capId, pcapId);
	//getNextLicenseNumber4Amm(pcapId);
	
	/*
	 var capContactResult = aa.people.getCapContactByCapID(pcapId);
    if (capContactResult.getSuccess()) {
        var Contacts = capContactResult.getOutput();
		var j = 1;
		
        for (yy in Contacts) {

            var con = Contacts[yy];
            if (con.getCapContactModel().getPeople().getContactType() == "Facility Location") {
                var arrAtt = Contacts[yy].getPeople().getAttributes().toArray();
                // logDebug("arrAtt.leng:" + arrAtt.length + " capId:" + capId.getCustomID());

                for (xx in arrAtt) {
                    if (arrAtt[xx].getAttributeName() == "LICENSE #" && arrAtt[xx].getAttributeValue() == null) {
                        peop = con.getPeople();

                        //get contact attributes 
                        var attrs = peop.getAttributes();

                        if (attrs) {
                            var ai = attrs.iterator();
                            while (ai.hasNext()) {
                                var xx = ai.next(); // xx is a CapContactAttributeModel
                                //logDebug("xx=" + xx.getAttributeName() + "-- Value=" + xx.getAttributeValue());
                                // update license number
                                if (xx.getAttributeName().toUpperCase() == "LICENSE #") {
                                    xx.setAttributeValue(licNum + "." + j);
									j++;
                                }
                            }
                            //set attributes
                            peop.setAttributes(attrs);
                            //con.setPeople();
                            con.getCapContactModel().setPeople(peop);
                            editResult = aa.people.editCapContactWithAttribute(con.getCapContactModel());
                            if (editResult.getSuccess()) {
                                logDebug("Edited the contact successfully");
                            } else {
                                logDebug("Error updating CAP contact " + editResult.getErrorMessage());
                            }

                        }
                    }
                }
            }
        }
    }
	*/
}