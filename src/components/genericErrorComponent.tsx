import * as React from "react"

export interface IGenericErrorProps {
    message: string;
}

export class GenericErrorComponent extends React.Component<IGenericErrorProps> {
    public render(): JSX.Element {
        return <div>
            <p>
                <b>An error has occured:</b>
            </p>
            <p style={{ marginLeft: 40 }}>
                <i>{this.props.message}</i>
            </p>
        </div>;
    }
}