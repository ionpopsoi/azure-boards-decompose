import * as React from "react"


import { ErrorItemComponent } from "../components/errorItemComponent";

import { IResultWorkItem } from "../interfaces";

export interface IErrorProps{
    workItems: IResultWorkItem[];
    result: IDictionaryNumberTo<string>;
}

export class ErrorComponent extends React.Component<IErrorProps> {
    constructor(props: IErrorProps) {
        super(props);
    }

    public render(): JSX.Element {
        let errorItems = this.props.workItems.map(wi => {
            if (!this.props.result[wi.id]) {
                // no error
                return null;
            }

            return <ErrorItemComponent key={wi.id} item={wi} error={this.props.result[wi.id]} />
        }).filter(e => !!e);

        return (<div>
            <h3>Unfortunately these work items could not be saved:</h3>
            {errorItems}
        </div>);
    }
}