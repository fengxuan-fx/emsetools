function setExpirationDateForFarmOrNursery(ID)
{
       logDebug("Inside setExpirationDateForFarm");
       var pcapId= ID
       logDebug("Parent ID: " + pcapId);
       var licNum=pcapId.getCustomID();
       logDebug("Custom ID: " + licNum);
      // logDebug("Parent ID: " + pcapId);       
       
	   var newExpDate = new Date();
	   var currentDate=new Date(Date.parse(sysDateMMDDYYYY));
	   //Renewal
		if(arguments.length==3)					
		{
			logDebug("Set exp date for renewal");
			b1ExpResult = aa.expiration.getLicensesByCapID(pcapId);
			if (b1ExpResult.getSuccess())
			{
               var b1Exp = b1ExpResult.getOutput();
               if(b1Exp)
			   {
					var expDate=b1Exp.getExpDate();
					if(expDate)
					{
						var month=expDate.getMonth();
						var day=expDate.getDayOfMonth();
						var year=expDate.getYear();
						
						if(arguments[1]=="Farm")
						{
							newExpDate.setDate(day);
							newExpDate.setMonth(month-1);
							newExpDate.setFullYear(year+1);		
						}
						
						if(arguments[1]=="Nursery")
						{
							/*newExpDate.setDate(day);
							newExpDate.setMonth(month-1);
							newExpDate.setFullYear(year+2);*/
							newExpDate.setFullYear(currentDate.getFullYear()+2);
							newExpDate.setMonth(currentDate.getMonth());
							newExpDate.setDate(currentDate.getDate()-1);
						}		
					}
			   }  
			}
		}
		//Application
		else						
		{
			logDebug("Set exp date for license");
			var year=currentDate.getFullYear();
			if(arguments[1]=="Farm")
			{
				logDebug("Inside Farm");
				newExpDate.setFullYear(year+1);
				newExpDate.setMonth(3);
				newExpDate.setDate(30); 	
			}
			
			if(arguments[1]=="Nursery")
			{
				logDebug("Inside nursery");
				/*newExpDate.setFullYear(year+2);
				newExpDate.setMonth(currentDate.getMonth());
				newExpDate.setDate(currentDate.getDate());*/
				
				newExpDate.setFullYear(year+2);
				newExpDate.setMonth(currentDate.getMonth());
				newExpDate.setDate(currentDate.getDate()-1);
				
			}	
		}
	  
		var expDateString= newExpDate.getMonth() + 1+ "/" + newExpDate.getDate() + "/" + newExpDate.getFullYear();

		thisLic=new licenseObject(licNum,pcapId);
		thisLic.setExpiration(expDateString);
		
       b1ExpResult = aa.expiration.getLicensesByCapID(pcapId);

       if (b1ExpResult.getSuccess())
       {
               var b1Exp = b1ExpResult.getOutput();
               if(b1Exp)
               {
                   var expDate=b1Exp.getExpDate();
                   if(expDate)
                   {
                       var b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
                       logDebug("Updated Expiration Date: " + b1ExpDate);
                   }
                } 
         }
		 
		 //getNextLicenseNumber(pcapId, licNum);
	/*
	
	var capContactResult = aa.people.getCapContactByCapID(pcapId);
    if (capContactResult.getSuccess()) {
        var Contacts = capContactResult.getOutput();
		var i = 1;
        for (yy = 0; yy < Contacts.length; yy++) {

            var con = Contacts[yy];
            if (con.getCapContactModel().getPeople().getContactType() == "Additional Location") {
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
                                    xx.setAttributeValue(licNum + "." + (i));
									i++;
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