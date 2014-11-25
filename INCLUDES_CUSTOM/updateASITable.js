 function updateASITable(pFromCapID, tableName, sColName) {

    var itemCap = pFromCapID;
    //used for permit number
    var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
    var ta = gm.getTablesArray()
    var tai = ta.iterator();
    var maxPermtFX = 0;

    while (tai.hasNext()) {
        var tsm = tai.next();

        var tempObject = new Array();
        var tempArray = new Array();
        var tn = tsm.getTableName();
        var tblName = tn;

        if (!tn.equals(tableName)) {
            continue;
        }
        aa.print("Table Name:" + tn);

        var numrows = 0;
        tn = String(tn).replace(/[^a-zA-Z0-9]+/g, '');

        if (!isNaN(tn.substring(0, 1))) tn = "TBL" + tn  // prepend with TBL if it starts with a number

        if (!tsm.rowIndex.isEmpty()) {
            var tsmfldi = tsm.getTableField().iterator();
            var tsmcoli = tsm.getColumns().iterator();
            var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
            var numrows = 1;
            var blnAdd = false;
            if (!tsm.rowIndex.isEmpty()) {
                var tsmfldi = tsm.getTableField().iterator();
                var tsmcoli = tsm.getColumns().iterator();
                var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
                var numrows = 1;

                while (tsmfldi.hasNext())  // cycle through fields
                {
                    if (!tsmcoli.hasNext())  // cycle through columns
                    {
                        var tsmcoli = tsm.getColumns().iterator();
                        tempArray.push(tempObject);  // end of record
                        var tempObject = new Array();  // clear the temp obj
                        numrows++;
                    }
                    var tcol = tsmcoli.next();
                    var tval = tsmfldi.next();

                    //add license number
                    if (tcol.getColumnName().equals(sColName)) {
                        aa.print("tcol:" + tcol.getColumnName() + ":" + tval);
                        //aa.print("tval.length:" + tval.length());
                        if (isEmpty(tval) || isBlank(tval)) {
                            if (maxPermtFX != 0) {
                                maxPermtFX++;
                                tval = capId.getCustomID() + "-" + maxPermtFX;
                            } else {
                                maxPermtFX = parseInt(getNextNum(ta, tableName, sColName));
                                tval = capId.getCustomID() + "-" + maxPermtFX;
                            }
                            aa.print("Add Number::" + tval);
                        }
                    }
                    var readOnly = 'N';
                    if (readOnlyi.hasNext()) {
                        readOnly = readOnlyi.next();
                    }

                    var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
                    tempObject[tcol.getColumnName()] = fieldInfo;
                }

                tempArray.push(tempObject);  // end of record
            }
        }

        var copyStr = "" + tn + " = tempArray";

        if (tblName.equals(tableName)) {
            if (numrows > 0) {
                //remove table
                removeSingleASITable(tblName);

                //add table
                addSingleASITable(tblName, tempArray);
            }
        }
        eval(copyStr);  // move to table name
    }

}




