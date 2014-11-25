function getMatchingParent(appGroup, appType, appSubtype, appCategory) {
    // returns the given type capId of parent cap
    var i = 1;
    while (true) {
        if (!(aa.cap.getProjectParents(capId, i).getSuccess()))
            break;

        i += 1;
    }
    i -= 1;

    aa.print("i:" + i);
    getCapResult = aa.cap.getProjectParents(capId, i);
    myArray = new Array();

    if (getCapResult.getSuccess()) {
        parentArray = getCapResult.getOutput();

        if (parentArray.length) {
            for (x in parentArray) {
                //get the app type
                matchCap = aa.cap.getCap(parentArray[x].getCapID()).getOutput();
                matchArray = matchCap.getCapType().toString().split("/");

                if (appGroup != "") {
                    strIfCond = matchArray[0].equals(appGroup);
                    aa.print("strIfCond1:" + strIfCond);
                }
                if (appType != "") {
                    if (!strIfCond == "") {
                        strIfCond += "&&";
                    }
                    strIfCond += matchArray[1].equals(appType);
                    aa.print("strIfCond2:" + strIfCond);
                }
                if (appSubtype != "") {
                    if (!strIfCond == "") {
                        strIfCond += "&&";
                    }
                    strIfCond += matchArray[2].equals(appSubtype);
                    aa.print("strIfCond3:" + strIfCond);
                }
                if (appCategory != "") {
                    if (!strIfCond == "") {
                        strIfCond += "&&";
                    }
                    strIfCond += matchArray[3].equals(appCategory);
                    aa.print("strIfCond4:" + strIfCond);
                }

                aa.print("strIfCond:" + strIfCond.toString());

                //If parent type matches appType return capid
                if (strIfCond) {
                    aa.print("parentArray[x].getCapID()" + parentArray[x].getCapID());
                    return parentArray[x].getCapID();
                }

            }

            return null;
        }
        else {
            aa.print("**WARNING: GetParent found no project parent for this application");
            return null;
        }
    }
    else {
        aa.print("**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
        return null;
    }
}