function setExpirationDateForMlk(ID)
{
       logDebug("Inside setExpirationDate");
       //logDebug("Cap ID: " +ID);
       var pcapId=ID;
       var licNum=pcapId.getCustomID();
       logDebug("Custom ID: " + licNum);
       logDebug("Parent ID: " + pcapId);
       //var recID=aa.cap.getCapID(ID).getOutput();
              
       var currentDate=new Date(Date.parse(sysDateMMDDYYYY));
       
       var year=currentDate.getFullYear() + 1;
       var month=currentDate.getMonth();
       var expirationDate=new Date();

       expirationDate.setFullYear(year);
       expirationDate.setMonth(month);
       expirationDate.setDate(0); 

       var expDateString= expirationDate.getMonth() + 1+ "/" + expirationDate.getDate() + "/" + expirationDate.getFullYear();

       thisLic=new licenseObject(licNum,pcapId);
       thisLic.setExpiration(expDateString);
         
       b1ExpResult = aa.expiration.getLicensesByCapID(pcapId);

       if (b1ExpResult.getSuccess())
       {
               var b1Exp = b1ExpResult.getOutput();
               if(b1Exp)
               {
                   //b1Exp.setExpDate(sysDateMMDDYYYY);
                   //expResult = aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
                   //logDebug(expResult.getSuccess());
                   var expDate=b1Exp.getExpDate();
                   if(expDate)
                   {
                       var b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
                       logDebug("Updated Expiration Date: " + b1ExpDate);
                   }
                } 
           }
}