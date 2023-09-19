import "dialog.scss";

import * as React from "react";
import * as ReactDOM from "react-dom";

import Spinner = require("react-spinkit");

import WIT_Client = require("TFS/WorkItemTracking/RestClient");
import WIT_Contracts = require("TFS/WorkItemTracking/Contracts");

import Q = require("q");

import { IWorkItem, IDialogInputData, IResultWorkItem } from "./interfaces";

import { WorkItemTypeService } from "./services/workItemTypeService";
import { WorkItemCreator } from "./services/workItemCreator";

import { MainComponent } from "./components/mainComponent";
import { ErrorComponent } from "./components/errorComponent";
import { GenericErrorComponent } from "./components/genericErrorComponent";

import { Store } from "./store";
import { ActionsCreator } from "./actionsCreator";

let inputData: IDialogInputData = VSS.getConfiguration();

let typeServiceInitPromise = WorkItemTypeService.getInstance().init();
let parentWorkItemPromise = WIT_Client.getClient().getWorkItem(
    inputData.workItemId, ["System.Id", "System.WorkItemType", "System.Title", "System.IterationPath", "System.AreaPath"]);

// Polyfill Object.Assign for Internet Explorer
if (typeof Object["assign"] != 'function') {
    Object["assign"] = function (target) {
        'use strict';
        if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        target = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source != null) {
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    };
}

Q.all<any>([typeServiceInitPromise, parentWorkItemPromise]).then<void>(values => {
    let workItem: WIT_Contracts.WorkItem = values[1];

    let parentLevel = WorkItemTypeService.getInstance().getLevelForTypeName(workItem.fields["System.WorkItemType"]);
    let types = WorkItemTypeService.getInstance().getBacklogForLevel(parentLevel).types;
    let typeIndex: number = null;
    types.forEach((type, idx) => {
        if (type.name === workItem.fields["System.WorkItemType"]) {
            typeIndex = idx;
        }
    });

    let parentWorkItem: IWorkItem = {
        id: workItem.fields["System.Id"],
        typeIndex: typeIndex,
        title: workItem.fields["System.Title"],
        level: parentLevel || 1,
        relativeLevel: 0
    };

    let parentIterationPath = workItem.fields["System.IterationPath"];
    let parentAreaPath = workItem.fields["System.AreaPath"];

    let store = new Store(parentWorkItem);
    let actionsCreator = new ActionsCreator(store);

    ReactDOM.render(<MainComponent
        store={store}
        actionsCreator={actionsCreator} />, document.getElementById("content"));

    store.addListener(() => {
        let isValid = store.getIsValid();
        inputData.onUpdate(isValid);
    });

    inputData.setSaveHandler(() => {
        // react-spinkit typings are not correct, work around by casting to any

        ReactDOM.render(<div className="saving-indicator">
            <div>Saving</div>
        </div>, document.getElementById("content"));

        let resultTree = store.getResult();
        let creator = new WorkItemCreator(store.getParentItem().id, parentIterationPath, parentAreaPath);
        return creator.createWorkItems(resultTree).then<void>(failedWorkItems => {
            if (Object.keys(failedWorkItems).length > 0) {
                // Some work items have failed to save, show error result
                ReactDOM.render(<ErrorComponent
                    result={failedWorkItems}
                    workItems={resultTree} />, document.getElementById("content"));

                throw "Decompose - Error";
            } else {
                // Saved successfully, close dialog
                return;
            }
        });
    });
}, (reason: Error) => {
    ReactDOM.render(<GenericErrorComponent
        message={reason && reason.message || "Something went wrong, please try again later."}
    />, document.getElementById("content"));
});