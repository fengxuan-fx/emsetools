/*------------------------------------------------------------------------------------------------------/
| Program : Payment Intake
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START Configurable Parameters
|   The following script code will attempt to read the assocaite event and invoker the proper standard choices
|    
/------------------------------------------------------------------------------------------------------*/

/*
aa.env.setValue("RECORD_ID","13CAP-00009");
aa.env.setValue("PAYMENT_AMOUNT","20");
aa.env.setValue("PAYMENT_COMMENT","comment test");
aa.env.setValue("PAYMENT_METHOD","Cash");
aa.env.setValue("CHECK_NUMBER","");
*/
var recordID = aa.env.getValue("RECORD_ID");
var paymentAmount = aa.env.getValue("PAYMENT_AMOUNT");
var paymentComment = aa.env.getValue("PAYMENT_COMMENT");
var paymentMethod = aa.env.getValue("PAYMENT_METHOD");
var checkNumber = aa.env.getValue("CHECK_NUMBER");
var ccRefNum = aa.env.getValue("CC_REF_NUMBER");
var payor = aa.env.getValue("PAYOR");
var currentUserID = aa.env.getValue("CurrentUserID");


try {
    var cashierSessionResult = aa.finance.getCashierSessionFromDB();

    if (cashierSessionResult.getSuccess()) {
        var cashierSession = cashierSessionResult.getOutput();

        if (cashierSession != null) {
            makePayment();
        } else {
            aa.env.setValue("InterfaceReturnCode","1");
            aa.env.setValue("InterfaceReturnMessage","No cashier sessions open, must open a cashier session prior to payment.");           
        }
    } else {
        aa.env.setValue("InterfaceReturnCode","1");
        aa.env.setValue("InterfaceReturnMessage","Could not retrieve cashier session: " + cashierSessionResult.getErrorMessage());
    }

 
} catch (err) {
    aa.env.setValue("InterfaceReturnCode","1");
    aa.env.setValue("InterfaceReturnMessage",err);
}

function makePayment() {
    var paymentError = false;
    var returnParameters = aa.util.newHashtable();
    var getCapResult = aa.cap.getCapID(recordID);
    if (getCapResult.getSuccess()) {
        itemCap = getCapResult.getOutput();
        
        //prepare payment
        //create paymentscriptmodel
        p = aa.finance.createPaymentScriptModel();
        p.setAuditDate(aa.date.getCurrentDate());
        p.setAuditStatus("A");
        p.setCapID(itemCap);
        p.setPayee(payor);
        p.setCashierID(p.getAuditID());
        p.setPaymentSeqNbr(p.getPaymentSeqNbr());
        p.setSessionNbr(aa.finance.getCashierSessionFromDB().getOutput() ? aa.finance.getCashierSessionFromDB().getOutput().getSessionNumber() : null);
        p.setPaymentAmount(paymentAmount);
        p.setAmountNotAllocated(paymentAmount);
        p.setPaymentChange(0);
        p.setPaymentComment(paymentComment);
        p.setPaymentDate(aa.date.getCurrentDate());
        p.setPaymentMethod(paymentMethod);
        p.setPaymentStatus("Paid");
        p.setCheckNbr(checkNumber);
        p.setPaymentRefNbr(ccRefNum);

     
        //create payment
        presult = aa.finance.makePayment(p);
        
        if (presult.getSuccess()) 
          {
            //get additional payment information
            pSeq = presult.getOutput();
            pReturn = aa.finance.getPaymentByPK(itemCap,pSeq,currentUserID);
            if (pReturn.getSuccess()) 
                {
                    pR = pReturn.getOutput();
                        //generate receipt
                    receiptResult = aa.finance.generateReceipt(itemCap,aa.date.getCurrentDate(),pR.getPaymentSeqNbr(),pR.getCashierID(),null);

                    if (receiptResult.getSuccess())
                      {
                         //everything committed successfully
                         receiptCResult = aa.finance.getReceiptByCapID(itemCap,null);
                         if (receiptCResult.getSuccess()) {
                            receipt = receiptCResult.getOutput();
                            receipt = receipt[0].getReceipt();
                            aa.env.setValue("RECEIPT_NUMBER",receipt.getReceiptCustomizedNBR());
                            aa.env.setValue("InterfaceReturnCode","0");
                            aa.env.setValue("InterfaceReturnMessage","Success");
                         }
                      }
                    else 
                      {
                        returnErrorMessage = "error generating receipt: " + receiptResult.getErrorMessage();
                        paymentError = true;
                      }
                }
            else
                {
                    returnErrorMessage = "Error retrieving payment, must apply payment manually: " + pReturn.getErrorMessage();
                    paymentError = true;
                }
            
          }
        else 
          {
            returnErrorMessage = "error making payment: " + presult.getErrorMessage();
            paymentError = true;
          }
    }  
    else
      { 
        returnErrorMessage = "**ERROR: getting cap id (" + recordID + "): " + getCapResult.getErrorMessage(); 
        paymentError = true;
      }

    if (paymentError) {
        aa.env.setValue("InterfaceReturnCode","1");
        aa.env.setValue("InterfaceReturnMessage",returnErrorMessage);
    }    
}

function setEnvironmentValues(params) {
    for(key_name in params) {
        aa.env.setValue(key_name,params[key_name]);
    }
}

function addParameter(pamaremeters, key, value)
{
    if(key != null)
    {
        if(value == null)
        {
            value = "";
        }
        pamaremeters.put(key, value);
    }
}
