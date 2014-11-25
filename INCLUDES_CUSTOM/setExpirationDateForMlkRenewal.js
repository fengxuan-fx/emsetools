function setExpirationDateForMlkRenewal(ID)
{
       logDebug("Inside setExpirationDateRenewal");
       var pcapId=ID;
       var licNum=pcapId.getCustomID();
       logDebug("Custom ID: " + licNum);
       logDebug("Parent ID: " + pcapId);
       
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
                       b1ExpDate=Date.parse(b1ExpDate);
                       var newDate=new Date(b1ExpDate);
                       var month=newDate.getMonth();
                       var day=newDate.getDate();
                       var year=parseInt(newDate.getFullYear()) + 1;
                       newDate.setMonth(month);
                       newDate.setDate(day);
                       newDate.setFullYear(year);
                       var dateString= newDate.getMonth()+1 + "/" + newDate.getDate() + "/" + newDate.getFullYear();
                       logDebug("Updated expiration date: " + dateString);

                       thisLic=new licenseObject(licNum,pcapId);
                       thisLic.setExpiration(dateString);
                    }
                } 
           }

       b2ExpResult = aa.expiration.getLicensesByCapID(pcapId);

       if (b2ExpResult.getSuccess())
       {
               var b2Exp = b2ExpResult.getOutput();
               if(b2Exp)
               {
                   var expDate1=b2Exp.getExpDate();
                   if(expDate1)
                   {
                       var b2ExpDate = expDate1.getMonth() + "/" + expDate1.getDayOfMonth() + "/" + expDate1.getYear();
                       logDebug("Updated Expiration Date: " + b2ExpDate);
                   }
                } 
           }

}