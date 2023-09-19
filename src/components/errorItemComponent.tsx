import "./items.scss";

import * as React from "react"


import { IResultWorkItem } from "../interfaces";
import { WorkItemTypeService } from "../services/workItemTypeService";

export interface IErrorItemProps {
    item: IResultWorkItem;
    
    error: string;
}

const INDENT_WIDTH = 16;

export class ErrorItemComponent extends React.Component<IErrorItemProps> {
    public render(): JSX.Element {
        let workItemType = WorkItemTypeService.getInstance().getBacklogForLevel(this.props.item.level).types[this.props.item.typeIndex];

        return <div className="work-item save-error" style={{ paddingLeft: this.props.item.relativeLevel * INDENT_WIDTH }}>
            <span className="type" style={{ borderColor: workItemType.color }}>{ workItemType.name }</span>
            <span className="title">{ this.props.item.title }</span>
            
            <div className="error-message">
                <i className="icon bowtie-icon bowtie-status-error"></i>&nbsp;{this.props.error}
            </div>
        </div>;
    }
}