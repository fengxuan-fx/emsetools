function asiTableValObj(columnName, fieldValue, readOnly) {
    this.columnName = columnName;
    this.fieldValue = fieldValue;
    this.readOnly = readOnly;

    asiTableValObj.prototype.toString = function () { return this.fieldValue; }
}